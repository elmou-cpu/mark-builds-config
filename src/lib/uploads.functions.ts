import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe, safeError } from "./errors";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const uploadSchema = z.object({
  /** base64 payload without the data-URL prefix */
  base64: z.string().min(32).max(9_000_000),
});

type Sniffed = { ext: "jpg" | "png" | "webp"; mime: string };

/** Identifies the format from the file's real leading bytes, not its name. */
function sniff(bytes: Uint8Array): Sniffed | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

/**
 * Uploads a product image. The browser never talks to storage directly: the
 * bytes are validated here (real format, size) and the object key is generated
 * server-side, so a crafted name or path cannot escape the products/ prefix.
 */
export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, throttle } = await import("./admin.server");
    await assertAdmin(context);
    await throttle(`upload:${context.userId}`, 60, 600, 60);

    let bytes: Uint8Array;
    try {
      const binary = atob(data.base64);
      bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    } catch {
      throw safeError("Fichier illisible.");
    }

    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw safeError("Image trop lourde (5 Mo maximum).");
    }
    const kind = sniff(bytes);
    if (!kind) {
      throw safeError("Format d'image non supporté (JPEG, PNG ou WebP uniquement).");
    }

    const path = `products/${crypto.randomUUID()}.${kind.ext}`;
    const { PRODUCT_BUCKET, signPaths } = await import("./catalog.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from(PRODUCT_BUCKET)
      .upload(path, bytes, { contentType: kind.mime, upsert: false });
    if (error) rethrowSafe(error, "L'image n'a pas pu être envoyée.");

    const urls = await signPaths([path]);
    return { path, url: urls[path] ?? null };
  });

/** Removes a stored image when no product row still references it. */
export async function removeOrphanImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    const { PRODUCT_BUCKET } = await import("./catalog.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("image_path", path);
    if ((count ?? 0) > 0) return;
    await supabaseAdmin.storage.from(PRODUCT_BUCKET).remove([path]);
  } catch (error) {
    // A failed cleanup must never corrupt or roll back the product record.
    console.error("[storage] orphan cleanup failed", error);
  }
}
