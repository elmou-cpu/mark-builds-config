import { img } from "./images";
import type { CategoryId, Product, ProductCondition, ProductStatus } from "./types";

/**
 * DEMO CATALOG — all prices are research/demonstration data and can change.
 * Everything is centralized here so the UI never hardcodes product info.
 */

type Draft = {
  name: string;
  brand: string;
  category: CategoryId;
  price: number;
  oldPrice?: number;
  status?: ProductStatus;
  condition?: ProductCondition;
  badge?: string;
  image?: string;
  description?: string;
  specifications?: Record<string, string>;
  attributes?: Record<string, string | number>;
  stock?: number;
  tags?: string[];
  rating?: number;
  featured?: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const defaultImage: Record<CategoryId, string> = {
  "pc-gaming": img.rig,
  laptops: img.laptop,
  "cartes-graphiques": img.gpu,
  processeurs: img.cpu,
  "cartes-meres": img.parts,
  ram: img.storage,
  ssd: img.storage,
  ecrans: img.monitor,
  "peripheriques-gaming": img.peripherals,
  reseau: img.parts,
  imprimantes: img.parts,
  consoles: img.peripherals,
  alimentations: img.parts,
  refroidissement: img.parts,
  boitiers: img.rig,
};

let n = 0;
function make(d: Draft): Product {
  n += 1;
  const image = d.image ?? defaultImage[d.category];
  const status = d.status ?? "disponible";
  return {
    id: `p-${String(n).padStart(3, "0")}`,
    name: d.name,
    slug: slugify(`${d.brand} ${d.name}`),
    brand: d.brand,
    category: d.category,
    price: d.price,
    oldPrice: d.oldPrice,
    currency: "DZD",
    image,
    images: [image, defaultImage[d.category], img.parts],
    description:
      d.description ??
      `${d.brand} ${d.name} — matériel proposé par Mark Computer. Fiche de démonstration : contactez le magasin pour la disponibilité et les détails exacts.`,
    specifications: d.specifications ?? {},
    attributes: d.attributes,
    stock: d.stock ?? (status === "disponible" ? 5 : 0),
    status,
    condition: d.condition ?? "neuf",
    badge: d.badge,
    sku: `MC-${String(n).padStart(4, "0")}`,
    tags: d.tags ?? [],
    rating: d.rating ?? 4.5,
    featured: d.featured,
  };
}

const drafts: Draft[] = [
  // ————— PC Gaming
  {
    name: "PC Gaming Ryzen 5 7500F + RTX 5060 Ti",
    brand: "Mark Computer",
    category: "pc-gaming",
    price: 282000,
    status: "configuration",
    badge: "PC GAMING",
    featured: true,
    description:
      "Configuration gaming assemblée sur mesure autour d'un Ryzen 5 7500F et d'une RTX 5060 Ti. Composants ajustables selon votre budget.",
    specifications: {
      Processeur: "AMD Ryzen 5 7500F",
      "Carte graphique": "GeForce RTX 5060 Ti",
      Mémoire: "32 Go DDR5",
      Stockage: "1 To NVMe",
      Alimentation: "750 W 80+ Bronze",
    },
    attributes: { usage: "Gaming" },
    tags: ["gaming", "configuration", "ryzen", "rtx"],
  },
  {
    name: "PC Gaming Ryzen 7 + RX 9070 XT",
    brand: "Mark Computer",
    category: "pc-gaming",
    price: 398000,
    status: "configuration",
    badge: "PC GAMING",
    featured: true,
    specifications: {
      Processeur: "AMD Ryzen 7",
      "Carte graphique": "Radeon RX 9070 XT 16 Go",
      Mémoire: "32 Go DDR5",
      Stockage: "1 To NVMe",
    },
    tags: ["gaming", "amd", "configuration"],
  },
  {
    name: "PC Bureautique Ryzen 5 5600G",
    brand: "Mark Computer",
    category: "pc-gaming",
    price: 96000,
    status: "configuration",
    badge: "SUR MESURE",
    specifications: {
      Processeur: "AMD Ryzen 5 5600G",
      Mémoire: "16 Go DDR4",
      Stockage: "512 Go NVMe",
    },
    tags: ["bureautique", "configuration"],
  },

  // ————— GPU
  {
    name: "RTX 5090 Suprim SOC 32GB",
    brand: "MSI",
    category: "cartes-graphiques",
    price: 1040000,
    featured: true,
    specifications: {
      GPU: "GeForce RTX 5090",
      Mémoire: "32 Go GDDR7",
      Interface: "PCIe 5.0",
      Longueur: "358 mm",
      "Alim. conseillée": "1000 W",
    },
    attributes: { chipset: "NVIDIA", vram: 32, generation: "RTX 50", power: 575, length: 358 },
    tags: ["gpu", "rtx", "5090", "nvidia"],
  },
  {
    name: "ROG Astral RTX 5090 32GB",
    brand: "ASUS",
    category: "cartes-graphiques",
    price: 989000,
    featured: true,
    specifications: {
      GPU: "GeForce RTX 5090",
      Mémoire: "32 Go GDDR7",
      Interface: "PCIe 5.0",
      Longueur: "357 mm",
    },
    attributes: { chipset: "NVIDIA", vram: 32, generation: "RTX 50", power: 575, length: 357 },
    tags: ["gpu", "rtx", "5090", "nvidia"],
  },
  {
    name: "TUF RTX 4070 Ti SUPER 16GB",
    brand: "ASUS",
    category: "cartes-graphiques",
    price: 199000,
    oldPrice: 219000,
    featured: true,
    specifications: {
      GPU: "GeForce RTX 4070 Ti SUPER",
      Mémoire: "16 Go GDDR6X",
      Longueur: "305 mm",
    },
    attributes: { chipset: "NVIDIA", vram: 16, generation: "RTX 40", power: 285, length: 305 },
    tags: ["gpu", "rtx", "4070", "nvidia"],
  },
  {
    name: "RX 9070 XT Pulse 16GB",
    brand: "Sapphire",
    category: "cartes-graphiques",
    price: 209000,
    featured: true,
    specifications: { GPU: "Radeon RX 9070 XT", Mémoire: "16 Go GDDR6", Longueur: "320 mm" },
    attributes: { chipset: "AMD", vram: 16, generation: "RX 9000", power: 304, length: 320 },
    tags: ["gpu", "radeon", "amd"],
  },
  {
    name: "RTX 5060 Ti 16GB",
    brand: "Gigabyte",
    category: "cartes-graphiques",
    price: 158000,
    featured: true,
    specifications: { GPU: "GeForce RTX 5060 Ti", Mémoire: "16 Go GDDR7", Longueur: "281 mm" },
    attributes: { chipset: "NVIDIA", vram: 16, generation: "RTX 50", power: 180, length: 281 },
    tags: ["gpu", "rtx", "5060", "nvidia"],
  },
  {
    name: "RTX 5060 8GB",
    brand: "MSI",
    category: "cartes-graphiques",
    price: 99000,
    featured: true,
    specifications: { GPU: "GeForce RTX 5060", Mémoire: "8 Go GDDR7", Longueur: "242 mm" },
    attributes: { chipset: "NVIDIA", vram: 8, generation: "RTX 50", power: 145, length: 242 },
    tags: ["gpu", "rtx", "5060", "nvidia"],
  },
  {
    name: "RTX 5070 Gaming OC 12GB",
    brand: "Gigabyte",
    category: "cartes-graphiques",
    price: 189000,
    status: "sur-commande",
    specifications: { GPU: "GeForce RTX 5070", Mémoire: "12 Go GDDR7", Longueur: "300 mm" },
    attributes: { chipset: "NVIDIA", vram: 12, generation: "RTX 50", power: 250, length: 300 },
    tags: ["gpu", "rtx", "5070", "nvidia"],
  },
  {
    name: "RX 7600 Pulse 8GB",
    brand: "Sapphire",
    category: "cartes-graphiques",
    price: 62000,
    status: "rupture",
    specifications: { GPU: "Radeon RX 7600", Mémoire: "8 Go GDDR6", Longueur: "204 mm" },
    attributes: { chipset: "AMD", vram: 8, generation: "RX 7000", power: 165, length: 204 },
    tags: ["gpu", "radeon", "amd"],
  },

  // ————— CPU
  {
    name: "Ryzen 7 7500X3D",
    brand: "AMD",
    category: "processeurs",
    price: 63000,
    featured: true,
    specifications: { Socket: "AM5", Cœurs: "8", Threads: "16", TDP: "65 W" },
    attributes: { platform: "AMD", socket: "AM5", cores: 8, generation: "Ryzen 7000", power: 65 },
    tags: ["cpu", "amd", "ryzen", "x3d"],
  },
  {
    name: "Ryzen 5 8400F",
    brand: "AMD",
    category: "processeurs",
    price: 33500,
    specifications: { Socket: "AM5", Cœurs: "6", Threads: "12", TDP: "65 W" },
    attributes: { platform: "AMD", socket: "AM5", cores: 6, generation: "Ryzen 8000", power: 65 },
    tags: ["cpu", "amd", "ryzen"],
  },
  {
    name: "Ryzen 5 5600",
    brand: "AMD",
    category: "processeurs",
    price: 28900,
    specifications: { Socket: "AM4", Cœurs: "6", Threads: "12", TDP: "65 W" },
    attributes: { platform: "AMD", socket: "AM4", cores: 6, generation: "Ryzen 5000", power: 65 },
    tags: ["cpu", "amd", "ryzen"],
  },
  {
    name: "Ryzen 7 7800X3D",
    brand: "AMD",
    category: "processeurs",
    price: 89000,
    status: "sur-commande",
    specifications: { Socket: "AM5", Cœurs: "8", Threads: "16", TDP: "120 W" },
    attributes: { platform: "AMD", socket: "AM5", cores: 8, generation: "Ryzen 7000", power: 120 },
    tags: ["cpu", "amd", "ryzen", "x3d"],
  },
  {
    name: "Core i5-12400F",
    brand: "Intel",
    category: "processeurs",
    price: 26500,
    specifications: { Socket: "LGA1700", Cœurs: "6", Threads: "12", TDP: "65 W" },
    attributes: {
      platform: "Intel",
      socket: "LGA1700",
      cores: 6,
      generation: "12e Gen",
      power: 65,
    },
    tags: ["cpu", "intel", "core"],
  },
  {
    name: "Core i7-13700K",
    brand: "Intel",
    category: "processeurs",
    price: 72000,
    specifications: { Socket: "LGA1700", Cœurs: "16", Threads: "24", TDP: "125 W" },
    attributes: {
      platform: "Intel",
      socket: "LGA1700",
      cores: 16,
      generation: "13e Gen",
      power: 125,
    },
    tags: ["cpu", "intel", "core"],
  },

  // ————— Cartes mères
  {
    name: "TUF Gaming B650-Plus WiFi",
    brand: "ASUS",
    category: "cartes-meres",
    price: 46000,
    specifications: { Socket: "AM5", Format: "ATX", Mémoire: "DDR5", "Slots M.2": "3" },
    attributes: { socket: "AM5", format: "ATX", memoryType: "DDR5", m2: 3 },
    tags: ["carte mere", "am5", "b650"],
  },
  {
    name: "MAG B550 Tomahawk",
    brand: "MSI",
    category: "cartes-meres",
    price: 34000,
    specifications: { Socket: "AM4", Format: "ATX", Mémoire: "DDR4", "Slots M.2": "2" },
    attributes: { socket: "AM4", format: "ATX", memoryType: "DDR4", m2: 2 },
    tags: ["carte mere", "am4", "b550"],
  },
  {
    name: "B760M DS3H DDR4",
    brand: "Gigabyte",
    category: "cartes-meres",
    price: 29500,
    specifications: { Socket: "LGA1700", Format: "Micro-ATX", Mémoire: "DDR4", "Slots M.2": "2" },
    attributes: { socket: "LGA1700", format: "Micro-ATX", memoryType: "DDR4", m2: 2 },
    tags: ["carte mere", "intel", "b760"],
  },
  {
    name: "ROG Strix B850-F Gaming",
    brand: "ASUS",
    category: "cartes-meres",
    price: 68000,
    status: "sur-commande",
    specifications: { Socket: "AM5", Format: "ATX", Mémoire: "DDR5", "Slots M.2": "4" },
    attributes: { socket: "AM5", format: "ATX", memoryType: "DDR5", m2: 4 },
    tags: ["carte mere", "am5"],
  },

  // ————— RAM
  {
    name: "Fury Beast DDR5 32GB (2x16) 6000MHz",
    brand: "Kingston",
    category: "ram",
    price: 24500,
    specifications: { Type: "DDR5", Capacité: "32 Go", Fréquence: "6000 MHz", Kit: "2x16 Go" },
    attributes: { memoryType: "DDR5", capacity: 32, frequency: 6000 },
    tags: ["ram", "ddr5"],
  },
  {
    name: "Fury Beast DDR4 16GB (2x8) 3200MHz",
    brand: "Kingston",
    category: "ram",
    price: 11500,
    specifications: { Type: "DDR4", Capacité: "16 Go", Fréquence: "3200 MHz", Kit: "2x8 Go" },
    attributes: { memoryType: "DDR4", capacity: 16, frequency: 3200 },
    tags: ["ram", "ddr4"],
  },
  {
    name: "XPG Lancer DDR5 16GB 5600MHz",
    brand: "ADATA",
    category: "ram",
    price: 13900,
    specifications: { Type: "DDR5", Capacité: "16 Go", Fréquence: "5600 MHz" },
    attributes: { memoryType: "DDR5", capacity: 16, frequency: 5600 },
    tags: ["ram", "ddr5"],
  },
  {
    name: "DDR4 32GB (2x16) 3600MHz",
    brand: "ADATA",
    category: "ram",
    price: 21000,
    status: "sur-commande",
    specifications: { Type: "DDR4", Capacité: "32 Go", Fréquence: "3600 MHz" },
    attributes: { memoryType: "DDR4", capacity: 32, frequency: 3600 },
    tags: ["ram", "ddr4"],
  },

  // ————— SSD
  {
    name: "990 EVO NVMe 1TB",
    brand: "Samsung",
    category: "ssd",
    price: 19500,
    specifications: { Interface: "NVMe PCIe 4.0", Capacité: "1 To", Lecture: "5000 Mo/s" },
    attributes: { interface: "NVMe", capacity: 1000 },
    tags: ["ssd", "nvme"],
  },
  {
    name: "NV3 NVMe 500GB",
    brand: "Kingston",
    category: "ssd",
    price: 8900,
    specifications: { Interface: "NVMe PCIe 4.0", Capacité: "500 Go" },
    attributes: { interface: "NVMe", capacity: 500 },
    tags: ["ssd", "nvme"],
  },
  {
    name: "SATA SSD 480GB",
    brand: "Netac",
    category: "ssd",
    price: 6500,
    specifications: { Interface: "SATA III", Capacité: "480 Go" },
    attributes: { interface: "SATA", capacity: 480 },
    tags: ["ssd", "sata"],
  },
  {
    name: "Legend 800 NVMe 2TB",
    brand: "ADATA",
    category: "ssd",
    price: 33000,
    specifications: { Interface: "NVMe PCIe 4.0", Capacité: "2 To" },
    attributes: { interface: "NVMe", capacity: 2000 },
    tags: ["ssd", "nvme"],
  },

  // ————— Écrans
  {
    name: "VG249Q1A 24\" 165Hz",
    brand: "ASUS",
    category: "ecrans",
    price: 42000,
    specifications: { Taille: "23.8\"", Résolution: "1920x1080", Rafraîchissement: "165 Hz" },
    attributes: { size: 24, resolution: "FHD", refresh: 165 },
    tags: ["ecran", "gaming", "165hz"],
  },
  {
    name: "MAG 274QRF QD 27\" 180Hz",
    brand: "MSI",
    category: "ecrans",
    price: 78000,
    specifications: { Taille: "27\"", Résolution: "2560x1440", Rafraîchissement: "180 Hz" },
    attributes: { size: 27, resolution: "QHD", refresh: 180 },
    tags: ["ecran", "gaming", "qhd"],
  },
  {
    name: "Nitro 27\" 100Hz IPS",
    brand: "Acer",
    category: "ecrans",
    price: 39000,
    status: "sur-commande",
    specifications: { Taille: "27\"", Résolution: "1920x1080", Rafraîchissement: "100 Hz" },
    attributes: { size: 27, resolution: "FHD", refresh: 100 },
    tags: ["ecran"],
  },

  // ————— Périphériques gaming
  {
    name: "Cloud III",
    brand: "HyperX",
    category: "peripheriques-gaming",
    price: 23000,
    featured: true,
    specifications: { Type: "Casque filaire", Transducteurs: "53 mm", Micro: "Détachable" },
    attributes: { type: "Casque" },
    tags: ["casque", "headset", "gaming"],
  },
  {
    name: "Basilisk V3 X",
    brand: "Razer",
    category: "peripheriques-gaming",
    price: 19000,
    featured: true,
    specifications: { Type: "Souris", Capteur: "Optique", Boutons: "9" },
    attributes: { type: "Souris" },
    tags: ["souris", "mouse", "gaming"],
  },
  {
    name: "G502 HERO",
    brand: "Logitech",
    category: "peripheriques-gaming",
    price: 14500,
    specifications: { Type: "Souris", Capteur: "HERO 25K" },
    attributes: { type: "Souris" },
    tags: ["souris", "gaming"],
  },
  {
    name: "K552 Kumara RGB",
    brand: "Redragon",
    category: "peripheriques-gaming",
    price: 9500,
    specifications: { Type: "Clavier mécanique", Switchs: "Blue", Format: "TKL" },
    attributes: { type: "Clavier" },
    tags: ["clavier", "keyboard", "gaming"],
  },
  {
    name: "MK Pro Wireless",
    brand: "Mars Gaming",
    category: "peripheriques-gaming",
    price: 12500,
    status: "nous-contacter",
    specifications: { Type: "Clavier sans fil" },
    attributes: { type: "Clavier" },
    tags: ["clavier"],
  },
  {
    name: "Manette Xbox Series sans fil",
    brand: "Microsoft",
    category: "consoles",
    price: 16500,
    specifications: { Type: "Manette", Connexion: "Bluetooth / USB-C" },
    attributes: { type: "Manette" },
    tags: ["manette", "controller", "xbox"],
  },
  {
    name: "Intuos S Tablette graphique",
    brand: "Wacom",
    category: "peripheriques-gaming",
    price: 21000,
    specifications: { Type: "Tablette graphique", Surface: "152 x 95 mm" },
    tags: ["wacom", "tablette"],
  },

  // ————— Laptops
  {
    name: "Dell 15 DC15250",
    brand: "Dell",
    category: "laptops",
    price: 130000,
    featured: true,
    specifications: {
      Processeur: "Intel Core i5",
      Mémoire: "8 Go",
      Stockage: "512 Go SSD",
      Écran: "15.6\" Full HD",
    },
    attributes: {
      cpu: "Intel Core i5",
      ram: 8,
      storage: 512,
      screen: 15.6,
      resolution: "FHD",
      gpu: "Intégré",
    },
    tags: ["laptop", "dell", "portable"],
  },
  {
    name: "Vivobook X1407Q",
    brand: "ASUS",
    category: "laptops",
    price: 130000,
    featured: true,
    specifications: {
      Processeur: "Snapdragon / Intel",
      Mémoire: "16 Go",
      Stockage: "512 Go SSD",
      Écran: "14\" Full HD",
    },
    attributes: {
      cpu: "Intel Core i5",
      ram: 16,
      storage: 512,
      screen: 14,
      resolution: "FHD",
      gpu: "Intégré",
    },
    tags: ["laptop", "asus", "portable"],
  },
  {
    name: "TUF Gaming A15 RTX 4060",
    brand: "ASUS",
    category: "laptops",
    price: 265000,
    specifications: {
      Processeur: "AMD Ryzen 7",
      Mémoire: "16 Go",
      Stockage: "1 To SSD",
      Écran: "15.6\" 144 Hz",
      "Carte graphique": "RTX 4060",
    },
    attributes: {
      cpu: "AMD Ryzen 7",
      ram: 16,
      storage: 1000,
      screen: 15.6,
      resolution: "FHD",
      gpu: "RTX 4060",
    },
    tags: ["laptop", "gaming", "rtx"],
  },
  {
    name: "Nitro V 15 RTX 3050",
    brand: "Acer",
    category: "laptops",
    price: 189000,
    status: "sur-commande",
    specifications: {
      Processeur: "Intel Core i5",
      Mémoire: "16 Go",
      Stockage: "512 Go SSD",
      "Carte graphique": "RTX 3050",
    },
    attributes: {
      cpu: "Intel Core i5",
      ram: 16,
      storage: 512,
      screen: 15.6,
      resolution: "FHD",
      gpu: "RTX 3050",
    },
    tags: ["laptop", "gaming"],
  },
  {
    name: "RedmiBook 15",
    brand: "Xiaomi",
    category: "laptops",
    price: 112000,
    specifications: {
      Processeur: "Intel Core i3",
      Mémoire: "8 Go",
      Stockage: "256 Go SSD",
      Écran: "15.6\" Full HD",
    },
    attributes: {
      cpu: "Intel Core i3",
      ram: 8,
      storage: 256,
      screen: 15.6,
      resolution: "FHD",
      gpu: "Intégré",
    },
    tags: ["laptop", "bureautique"],
  },

  // ————— Occasion
  {
    name: "Latitude 5400 (Occasion)",
    brand: "Dell",
    category: "laptops",
    price: 50000,
    condition: "occasion",
    badge: "OCCASION",
    specifications: {
      Processeur: "Intel Core i5 8e Gen",
      Mémoire: "8 Go",
      Stockage: "256 Go SSD",
      Écran: "14\" Full HD",
      État: "Occasion vérifiée",
    },
    attributes: {
      cpu: "Intel Core i5",
      ram: 8,
      storage: 256,
      screen: 14,
      resolution: "FHD",
      gpu: "Intégré",
    },
    tags: ["occasion", "laptop", "pro"],
  },
  {
    name: "EliteDesk Mini (Occasion)",
    brand: "Dell",
    category: "pc-gaming",
    price: 38000,
    condition: "occasion",
    badge: "OCCASION",
    status: "nous-contacter",
    specifications: { Processeur: "Intel Core i5", Mémoire: "8 Go", Stockage: "256 Go SSD" },
    tags: ["occasion", "bureautique"],
  },
  {
    name: "RTX 3060 12GB (Occasion)",
    brand: "MSI",
    category: "cartes-graphiques",
    price: 68000,
    condition: "comme-neuf",
    badge: "COMME NEUF",
    specifications: { GPU: "GeForce RTX 3060", Mémoire: "12 Go GDDR6", État: "10/10" },
    attributes: { chipset: "NVIDIA", vram: 12, generation: "RTX 30", power: 170, length: 235 },
    tags: ["occasion", "gpu"],
  },
  {
    name: "Écran 24\" 75Hz (Occasion)",
    brand: "Acer",
    category: "ecrans",
    price: 17000,
    condition: "occasion",
    badge: "OCCASION",
    specifications: { Taille: "24\"", Résolution: "1920x1080", État: "Bon état" },
    attributes: { size: 24, resolution: "FHD", refresh: 75 },
    tags: ["occasion", "ecran"],
  },

  // ————— Alimentations / refroidissement / boîtiers
  {
    name: "NeoECO 750W 80+ Gold",
    brand: "Antec",
    category: "alimentations",
    price: 21000,
    specifications: { Puissance: "750 W", Certification: "80+ Gold", Modulaire: "Full" },
    attributes: { wattage: 750 },
    tags: ["alimentation", "psu"],
  },
  {
    name: "PK650 650W 80+ Bronze",
    brand: "DeepCool",
    category: "alimentations",
    price: 14500,
    specifications: { Puissance: "650 W", Certification: "80+ Bronze" },
    attributes: { wattage: 650 },
    tags: ["alimentation", "psu"],
  },
  {
    name: "1000W 80+ Gold Modulaire",
    brand: "Antec",
    category: "alimentations",
    price: 38000,
    status: "sur-commande",
    specifications: { Puissance: "1000 W", Certification: "80+ Gold" },
    attributes: { wattage: 1000 },
    tags: ["alimentation", "psu"],
  },
  {
    name: "Freezer 36 CO",
    brand: "Arctic",
    category: "refroidissement",
    price: 9500,
    specifications: { Type: "Air", Sockets: "AM4, AM5, LGA1700" },
    attributes: { sockets: "AM4,AM5,LGA1700", type: "Air", height: 159 },
    tags: ["refroidissement", "ventirad"],
  },
  {
    name: "AK620 Digital",
    brand: "DeepCool",
    category: "refroidissement",
    price: 16500,
    specifications: { Type: "Air double tour", Sockets: "AM4, AM5, LGA1700" },
    attributes: { sockets: "AM4,AM5,LGA1700", type: "Air", height: 162 },
    tags: ["refroidissement"],
  },
  {
    name: "AIO 240mm ARGB",
    brand: "DeepCool",
    category: "refroidissement",
    price: 24000,
    specifications: { Type: "Watercooling AIO 240 mm", Sockets: "AM5, LGA1700" },
    attributes: { sockets: "AM5,LGA1700", type: "AIO" },
    tags: ["refroidissement", "aio"],
  },
  {
    name: "CH560 Digital ATX",
    brand: "DeepCool",
    category: "boitiers",
    price: 18500,
    specifications: { Format: "ATX", "GPU max": "380 mm", Ventilateurs: "4 inclus" },
    attributes: { format: "ATX", gpuClearance: 380 },
    tags: ["boitier", "case"],
  },
  {
    name: "MC Micro-ATX Mesh",
    brand: "Mars Gaming",
    category: "boitiers",
    price: 11000,
    specifications: { Format: "Micro-ATX", "GPU max": "320 mm" },
    attributes: { format: "Micro-ATX", gpuClearance: 320 },
    tags: ["boitier", "case"],
  },

  // ————— Réseau / imprimantes
  {
    name: "AC1200 Routeur double bande",
    brand: "Tenda",
    category: "reseau",
    price: 7500,
    specifications: { WiFi: "AC1200", Ports: "4x Gigabit" },
    tags: ["reseau", "routeur", "wifi"],
  },
  {
    name: "Switch 8 ports Gigabit",
    brand: "UGREEN",
    category: "reseau",
    price: 6900,
    specifications: { Ports: "8x Gigabit", Alimentation: "Externe" },
    tags: ["reseau", "switch"],
  },
  {
    name: "Adaptateur USB-C Multiport",
    brand: "UGREEN",
    category: "reseau",
    price: 5400,
    specifications: { Ports: "HDMI, USB 3.0, RJ45, PD" },
    tags: ["adaptateur", "usb-c"],
  },
  {
    name: "Imprimante multifonction jet d'encre",
    brand: "Microsoft",
    category: "imprimantes",
    price: 32000,
    status: "nous-contacter",
    specifications: { Type: "Multifonction", Connexion: "USB / WiFi" },
    tags: ["imprimante"],
  },
];

export const products: Product[] = drafts.map(make);

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

export const featuredProducts = products.filter((p) => p.featured).slice(0, 8);

export const dealProducts = products.filter((p) => p.oldPrice && p.oldPrice > p.price);

export const usedProducts = products.filter((p) => p.condition !== "neuf");

export const productsByCategory = (id: string) => products.filter((p) => p.category === id);
