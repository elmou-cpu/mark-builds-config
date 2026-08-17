import { img } from "./images";
import type { Category } from "./types";

export const categories: Category[] = [
  { id: "pc-gaming", name: "PC Gaming", label: "Configurations complètes", image: img.rig },
  { id: "laptops", name: "Laptops", label: "Portables & ultrabooks", image: img.laptop },
  { id: "cartes-graphiques", name: "Cartes graphiques", label: "NVIDIA & AMD", image: img.gpu },
  { id: "processeurs", name: "Processeurs", label: "AMD & Intel", image: img.cpu },
  { id: "cartes-meres", name: "Cartes mères", label: "AM4, AM5, LGA1700", image: img.parts },
  { id: "ram", name: "RAM", label: "DDR4 & DDR5", image: img.storage },
  { id: "ssd", name: "SSD", label: "NVMe & SATA", image: img.storage },
  { id: "ecrans", name: "Écrans", label: "Bureautique & gaming", image: img.monitor },
  {
    id: "peripheriques-gaming",
    name: "Périphériques Gaming",
    label: "Claviers, souris, casques",
    image: img.peripherals,
  },
  { id: "reseau", name: "Réseau", label: "Routeurs & switchs", image: img.parts },
  { id: "imprimantes", name: "Imprimantes", label: "Jet d'encre & laser", image: img.parts },
  { id: "consoles", name: "Consoles", label: "Consoles & manettes", image: img.peripherals },
  { id: "alimentations", name: "Alimentations", label: "80+ Bronze à Gold", image: img.parts },
  { id: "refroidissement", name: "Refroidissement", label: "Air & AIO", image: img.parts },
  { id: "boitiers", name: "Boîtiers", label: "ATX & mATX", image: img.rig },
];

/** Cards shown in the homepage category section, in order. */
export const homeCategoryIds = [
  "pc-gaming",
  "laptops",
  "cartes-graphiques",
  "processeurs",
  "cartes-meres",
  "ram",
  "ssd",
  "ecrans",
  "peripheriques-gaming",
  "reseau",
  "imprimantes",
  "consoles",
] as const;

export const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  Category["id"],
  Category
>;
