import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { safeError } from "./errors";

const credentialsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

const emailSchema = z.object({
  email: z.string().email().max(200),
  redirectTo: z.string().max(300),
});

/**
 * Server-side sign-in. Throttled per email and per IP with escalating delays,
 * on top of the platform's own protections. Errors are deliberately generic so
 * an attacker cannot tell an unknown email from a wrong password.
 */
export const adminSignIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentialsSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, throttle, resetThrottle } = await import("./admin.server");
    const email = data.email.trim().toLowerCase();
    const ip = clientIp();

    await throttle(`login:ip:${ip}`, 15, 600, 30);
    await throttle(`login:email:${email}`, 5, 600, 60);

    const { createPublicClient } = await import("./catalog.server");
    const client = createPublicClient();
    const { data: result, error } = await client.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (error || !result.session) {
      throw safeError("Email ou mot de passe incorrect.");
    }

    await resetThrottle(`login:email:${email}`);

    // Only accounts holding the admin role may use this entry point.
    const { data: isAdmin } = await client.rpc("has_role", {
      _user_id: result.user!.id,
      _role: "admin",
    });
    if (isAdmin !== true) {
      await client.auth.signOut();
      throw safeError("Ce compte n'a pas accès à l'administration.");
    }

    return {
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    };
  });

/**
 * Starts a password reset through the platform's own flow. We never store or
 * see the token. The response is identical whether the account exists or not.
 */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, throttle } = await import("./admin.server");
    const email = data.email.trim().toLowerCase();
    await throttle(`reset:ip:${clientIp()}`, 10, 900, 60);
    await throttle(`reset:email:${email}`, 3, 900, 120);

    try {
      const { createPublicClient } = await import("./catalog.server");
      await createPublicClient().auth.resetPasswordForEmail(email, {
        redirectTo: data.redirectTo,
      });
    } catch (error) {
      console.error("[auth] reset request failed", error);
    }
    return { ok: true };
  });
