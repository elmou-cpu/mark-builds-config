import type { Review } from "./types";

/** Aggregate rating collected during research (Google, at time of research). */
export const ratingSummary = {
  average: 4.5,
  count: 37,
  source: "Google",
};

/**
 * Short excerpts reflecting the themes of the collected Google reviews.
 * No testimonial is attributed to a named individual.
 */
export const reviews: Review[] = [
  {
    id: "r1",
    author: "Avis client",
    rating: 5,
    excerpt: "Bon accueil et conseils professionnels pour choisir la configuration.",
    source: "Google",
  },
  {
    id: "r2",
    author: "Avis client",
    rating: 5,
    excerpt: "Équipe compétente, qui connaît bien le matériel informatique.",
    source: "Google",
  },
  {
    id: "r3",
    author: "Avis client",
    rating: 4,
    excerpt: "Bon choix de produits et de composants pour un PC.",
    source: "Google",
  },
  {
    id: "r4",
    author: "Avis client",
    rating: 5,
    excerpt: "Bons prix par rapport à ce qu'on trouve ailleurs.",
    source: "Google",
  },
  {
    id: "r5",
    author: "Avis client",
    rating: 4,
    excerpt: "Service client agréable, on repart avec du matériel de qualité.",
    source: "Google",
  },
  {
    id: "r6",
    author: "Avis client",
    rating: 5,
    excerpt: "Conseils utiles avant l'achat, matériel conforme à l'annonce.",
    source: "Google",
  },
];
