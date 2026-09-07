# Mark Computer — production readiness implementation

Turning the audit findings into working, server-enforced features. Your answers set the shape: guest orders (no customer accounts), no payment provider yet but an order model ready for one, notifications in the dashboard plus email to your business address, no product variants.

## Phase 1 — Admin security

- Delete the `claim_first_admin` database function and every reference to it; remove the "create administrator account" toggle from the login page.
- New `staff` management area in the dashboard: list administrators, invite a new one by email, revoke access. All of it runs through admin-only server functions that re-verify the caller's role in the database — never a role value sent by the browser.
- Safety check: an admin cannot revoke themselves, and the last remaining admin cannot be removed.
- New `admin_invitations` table (email, token hash, expiry, who invited, used-at) so invited staff set their own password; invitations expire.
- Role writes stay closed to the API: grants/revokes go through a `SECURITY DEFINER` function that verifies the caller is an admin, validates its arguments, and records who did it and when.
- "Forgot password" on the login page using the platform's reset flow (tokens never stored by us), with a deliberately generic message so an email address can't be probed. Resetting a password never grants any role.

## Phase 2 — Authentication hardening

- Public sign-ups turned off at the platform level; email confirmation and leaked-password checking turned on.
- Login throttling: failed attempts recorded server-side per email and IP with escalating delays, on top of the platform's own limits. Errors stay generic.
- Removed administrators lose access immediately: every protected call re-checks the role in the database on each request, so an old session becomes useless the moment the role row is gone. Plus a "sign out everywhere" action.
- Documented exactly what the browser stores (the session token only — no secrets, no personal data).

## Phase 3 — Database security

- Revoke insert/update/delete privileges from `anon` on every table (and from `authenticated` where policies don't need them), keeping RLS as the second layer.
- Re-audit and re-state every policy on `products`, `categories`, `user_roles`, and each new table.
- Keep `has_role` (needed by every policy) with its search path pinned; drop `claim_first_admin`; every new privileged function validates arguments and checks authorization inside itself.

## Phase 4 — Real orders

- New tables: `orders` (order number, customer name/phone/wilaya/address, pickup or delivery, subtotal, shipping, tax, discount, total, currency, payment status, order status, cancellation/refund fields, timestamps) and `order_items` (product id plus **snapshots** of name, SKU, unit price, quantity, line total) so history never changes when a price does.
- Order creation is a single database transaction that only accepts product ids and quantities: it locks the product rows, rejects inactive/hidden/out-of-stock items and quantities above stock, recalculates every price, the subtotal, shipping and the total server-side, decrements stock atomically, and writes the order. A browser-supplied total is ignored entirely. Two people buying the last unit at once: one succeeds, one gets a clear error, stock never goes negative.
- The cart page replaces the fake confirmation with a real submission and shows the real order number that was saved.
- Cart UI blocks out-of-stock and over-stock quantities; the server rejects them regardless.
- Admin orders screen: list, filter by status, open an order, change status, cancel — each change server-authorized and logged.
- Low-stock threshold per product plus a low-stock view in the dashboard.

## Phase 5 — Payment

No provider is configured and I will not fake one. Orders carry a payment status (`unpaid`, `paid`, `refunded`, `failed`) with the flow set to pay-on-pickup/on-delivery, and the schema plus a webhook-ready structure are laid out so a real provider can be added later without touching orders. The site will say plainly that payment happens in store or on delivery.

## Phase 6 — Notifications

- Order confirmation and status-change emails, plus a new-order and new-message alert to your business address — sent only after the database write actually succeeds, and only reporting success when the send succeeded.
- Contact form actually saves messages to a new `contact_messages` table with server-side validation and rate limiting, visible in the dashboard with new/read/resolved status.
- Email needs a sending domain you own; until that's verified the app still records everything and the dashboard remains the source of truth — no false "sent" messages.

## Phase 7 — Products, images, categories

- Replacing or deleting a product image deletes the old file from storage, but only when no other product references it; a failed deletion never corrupts the product record.
- Uploads move to a server function: allowed types (jpg/png/webp) checked against the file's actual leading bytes, size capped, script-like files rejected, object keys generated server-side, bucket stays private.
- Signed image links drop from 7 days to 1 hour, so hidden products stop being reachable quickly.
- Category management in the dashboard: create, rename, reorder, activate/deactivate, and deletion blocked while products still reference the category (with a reassign step).
- Variants intentionally omitted and documented — hardware here is sold as distinct SKUs.

## Phase 8 — Auditing

- New `audit_log` table recording actor, action, entity type and id, timestamp, and safe before/after values for: product create/edit/delete, price, stock and visibility changes, admin added/removed, category changes, order status changes, cancellations. No passwords, tokens or secrets.
- `created_by` / `updated_by` on products and categories, always taken from the verified server-side identity.
- Audit view in the dashboard, admin-only.

## Phase 9 — Security headers

Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, frame-ancestors and Permissions-Policy applied on every response, with the exact allowances the app needs (Google Fonts, the storage domain for signed images, the backend API). Tested page by page so nothing breaks.

## Phase 10 — Error handling

Every admin-facing failure becomes a safe French message; the technical detail goes to server logs only. No database, schema or infrastructure detail reaches the browser.

## Phase 11 — Environments, backups, monitoring, dependencies

- Preview and production currently share one database. I'll document the exact variables per environment and flag the separation as a configuration decision you must make with me — it can't be split from inside the code alone.
- Verify backups are actually enabled and document frequency and the restore procedure; I won't claim a restore was tested unless it was.
- Server-error, auth-failure and storage-failure logging with an admin-visible error view; uptime alerting documented as an external service you choose.
- Run a dependency vulnerability scan and report package, severity and upgrade risk. No silent major upgrades.

## Phase 12 — Legal and business information

- New pages: Privacy Policy, Terms/CGV, Cookie Policy, Shipping Policy, Return/Refund Policy — each with clearly marked placeholders, no invented legal claims and no compliance assertions.
- Every generated business detail (address, phone, hours, email, company name, About text) moves into one clearly-marked settings file with `TODO` markers, so nothing fictional ships by accident.

## Phase 13 — SEO

`Disallow: /admin` in robots.txt, and a sitemap covering only public catalogue and content pages.

## Phase 14 — Adversarial testing

Direct database and RPC tests, not UI clicking: unauthenticated reads/writes, an ordinary signed-in user attempting every admin function and role change, tampered prices and totals, excessive quantities, inactive/hidden/out-of-stock products, malformed ids and image paths, oversized and wrong-type uploads, a revoked admin's old session, and two simultaneous orders for one remaining unit. Results reported with evidence.

## Technical notes

- Migrations are additive; no existing table is dropped and no product data is deleted. Grant revocations and the `claim_first_admin` drop are the only removals, both explained before they run.
- Order creation, stock decrement and role changes run inside `SECURITY DEFINER` functions with pinned search paths and in-function authorization, called from `createServerFn` handlers behind `requireSupabaseAuth` — existing CSRF middleware and the bearer attacher stay as they are.
- No service key or secret reaches the browser; uploads and signing stay server-side.

## What you'll need to configure

Disabling sign-ups and enabling email confirmation and leaked-password checks (I'll do this via the platform), your real business details and legal text, a sending domain you own for email, your domain/DNS, and the admin accounts you want to exist.
