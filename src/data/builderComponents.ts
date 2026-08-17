import { products } from "./products";
import { img } from "./images";

export type StepId =
  | "cpu"
  | "motherboard"
  | "gpu"
  | "ram"
  | "ssd"
  | "hdd"
  | "psu"
  | "cooling"
  | "case"
  | "fans"
  | "os"
  | "peripherals";

export interface BuilderStep {
  id: StepId;
  label: string;
  optional?: boolean;
}

export const builderSteps: BuilderStep[] = [
  { id: "cpu", label: "Processeur" },
  { id: "motherboard", label: "Carte mère" },
  { id: "gpu", label: "Carte graphique" },
  { id: "ram", label: "Mémoire RAM" },
  { id: "ssd", label: "SSD" },
  { id: "hdd", label: "Disque dur", optional: true },
  { id: "psu", label: "Alimentation" },
  { id: "cooling", label: "Refroidissement" },
  { id: "case", label: "Boîtier" },
  { id: "fans", label: "Ventilateurs", optional: true },
  { id: "os", label: "Système d'exploitation", optional: true },
  { id: "peripherals", label: "Périphériques", optional: true },
];

export interface BuilderOption {
  id: string;
  step: StepId;
  name: string;
  brand: string;
  price: number;
  image: string;
  slug?: string;
  attributes: Record<string, string | number>;
  spec: string;
}

const fromCategory = (step: StepId, category: string, specKeys: string[]): BuilderOption[] =>
  products
    .filter((p) => p.category === category && p.condition === "neuf")
    .map((p) => ({
      id: `${step}-${p.id}`,
      step,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image,
      slug: p.slug,
      attributes: p.attributes ?? {},
      spec: specKeys
        .map((k) => p.specifications[k])
        .filter(Boolean)
        .join(" • "),
    }));

/** Builder-only demo options for parts not listed in the main catalog. */
const extras: BuilderOption[] = [
  {
    id: "hdd-1",
    step: "hdd",
    name: "Disque dur 1 To 7200 tr/min",
    brand: "Samsung",
    price: 9500,
    image: img.storage,
    attributes: { capacity: 1000 },
    spec: "3.5\" SATA • 1 To",
  },
  {
    id: "hdd-2",
    step: "hdd",
    name: "Disque dur 2 To 7200 tr/min",
    brand: "Samsung",
    price: 15500,
    image: img.storage,
    attributes: { capacity: 2000 },
    spec: "3.5\" SATA • 2 To",
  },
  {
    id: "fans-1",
    step: "fans",
    name: "Kit 3 ventilateurs 120 mm ARGB",
    brand: "DeepCool",
    price: 6500,
    image: img.parts,
    attributes: {},
    spec: "3x 120 mm • ARGB",
  },
  {
    id: "fans-2",
    step: "fans",
    name: "Ventilateur 140 mm silencieux",
    brand: "Arctic",
    price: 2200,
    image: img.parts,
    attributes: {},
    spec: "140 mm • PWM",
  },
  {
    id: "os-1",
    step: "os",
    name: "Installation Windows 11 + pilotes",
    brand: "Mark Computer",
    price: 3000,
    image: img.parts,
    attributes: {},
    spec: "Préparation logicielle",
  },
  {
    id: "os-2",
    step: "os",
    name: "Sans système d'exploitation",
    brand: "Mark Computer",
    price: 0,
    image: img.parts,
    attributes: {},
    spec: "Machine livrée nue",
  },
];

export const builderOptions: BuilderOption[] = [
  ...fromCategory("cpu", "processeurs", ["Socket", "Cœurs", "TDP"]),
  ...fromCategory("motherboard", "cartes-meres", ["Socket", "Format", "Mémoire"]),
  ...fromCategory("gpu", "cartes-graphiques", ["GPU", "Mémoire"]),
  ...fromCategory("ram", "ram", ["Type", "Capacité", "Fréquence"]),
  ...fromCategory("ssd", "ssd", ["Interface", "Capacité"]),
  ...fromCategory("psu", "alimentations", ["Puissance", "Certification"]),
  ...fromCategory("cooling", "refroidissement", ["Type", "Sockets"]),
  ...fromCategory("case", "boitiers", ["Format", "GPU max"]),
  ...fromCategory("peripherals", "peripheriques-gaming", ["Type"]),
  ...extras,
];

export const optionsForStep = (step: StepId) => builderOptions.filter((o) => o.step === step);
