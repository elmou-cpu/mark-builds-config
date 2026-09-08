/**
 * Maps internal failures to safe French messages. Technical detail (SQL, schema,
 * infrastructure) is logged server-side and never returned to the browser.
 */

const CODE_MESSAGES: Record<string, string> = {
  INVALID_NAME: "Nom du client invalide.",
  INVALID_PHONE: "Numéro de téléphone invalide.",
  INVALID_WILAYA: "Wilaya invalide.",
  INVALID_ADDRESS: "Adresse invalide.",
  ADDRESS_REQUIRED: "Une adresse est requise pour la livraison.",
  INVALID_ITEMS: "Votre panier est vide ou invalide.",
  INVALID_QUANTITY: "Quantité invalide.",
  PRODUCT_NOT_FOUND: "Un produit de votre panier n'existe plus.",
  PRODUCT_UNAVAILABLE: "Un produit de votre panier n'est plus disponible",
  PRODUCT_OUT_OF_STOCK: "Un produit de votre panier est en rupture de stock",
  INSUFFICIENT_STOCK: "Stock insuffisant pour",
  ORDER_NOT_FOUND: "Commande introuvable.",
  ALREADY_CANCELLED: "Cette commande est déjà annulée.",
  FORBIDDEN: "Accès refusé.",
  RATE_LIMITED: "Trop de tentatives. Merci de patienter avant de réessayer.",
  UNSUPPORTED_IMAGE: "Format d'image non supporté (JPEG, PNG ou WebP uniquement).",
  IMAGE_TOO_LARGE: "Image trop lourde (5 Mo maximum).",
  CATEGORY_IN_USE: "Cette catégorie contient encore des produits.",
  LAST_ADMIN: "Impossible de retirer le dernier administrateur.",
  SELF_REVOKE: "Vous ne pouvez pas retirer votre propre accès.",
  DUPLICATE_SLUG: "Cette référence d'URL est déjà utilisée.",
};

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

/** Turns a thrown value into a message safe to show a user. */
export function toSafeMessage(error: unknown, fallback = "Une erreur est survenue."): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const [code, detail] = raw.split(":");
  const known = code ? CODE_MESSAGES[code.trim()] : undefined;
  if (known) return detail ? `${known} : ${detail.trim()}` : known;
  if (raw.startsWith("__SAFE__")) return raw.replace("__SAFE__", "").trim();
  return fallback;
}

/** Logs the real error server-side and throws a client-safe one. */
export function rethrowSafe(error: unknown, fallback = "Une erreur est survenue."): never {
  console.error("[app]", error);
  throw new AppError(`__SAFE__${toSafeMessage(error, fallback)}`);
}

/** Marks a message as already safe for the browser. */
export function safeError(message: string): AppError {
  return new AppError(`__SAFE__${message}`);
}
