import type { BuilderOption, StepId } from "@/data/builderComponents";

export type Selection = Partial<Record<StepId, BuilderOption>>;

export interface CompatCheck {
  label: string;
  state: "ok" | "warn" | "idle";
  detail: string;
}

const str = (v: unknown) => (v === undefined ? "" : String(v));
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

/**
 * Basic compatibility assistance only — not a complete hardware
 * compatibility engine. Always confirm with Mark Computer.
 */
export function checkCompatibility(sel: Selection): CompatCheck[] {
  const { cpu, motherboard, gpu, ram, psu, cooling, case: pcCase, ssd } = sel;
  const checks: CompatCheck[] = [];

  checks.push(
    !cpu || !motherboard
      ? { label: "Socket CPU / carte mère", state: "idle", detail: "Sélectionnez les deux pièces." }
      : str(cpu.attributes['socket']) === str(motherboard.attributes['socket'])
        ? {
            label: "Socket CPU / carte mère",
            state: "ok",
            detail: `Socket ${str(cpu.attributes['socket'])}`,
          }
        : {
            label: "Socket CPU / carte mère",
            state: "warn",
            detail: `CPU ${str(cpu.attributes['socket'])} vs carte mère ${str(motherboard.attributes['socket'])}`,
          },
  );

  checks.push(
    !ram || !motherboard
      ? { label: "Type de mémoire", state: "idle", detail: "Sélectionnez RAM et carte mère." }
      : str(ram.attributes['memoryType']) === str(motherboard.attributes['memoryType'])
        ? {
            label: "Type de mémoire",
            state: "ok",
            detail: `${str(ram.attributes['memoryType'])} supportée`,
          }
        : {
            label: "Type de mémoire",
            state: "warn",
            detail: `RAM ${str(ram.attributes['memoryType'])} vs carte mère ${str(motherboard.attributes['memoryType'])}`,
          },
  );

  checks.push(
    !motherboard || !pcCase
      ? { label: "Format boîtier", state: "idle", detail: "Sélectionnez carte mère et boîtier." }
      : str(pcCase.attributes['format']) === "ATX" ||
          str(pcCase.attributes['format']) === str(motherboard.attributes['format'])
        ? {
            label: "Format boîtier",
            state: "ok",
            detail: `${str(motherboard.attributes['format'])} dans ${str(pcCase.attributes['format'])}`,
          }
        : {
            label: "Format boîtier",
            state: "warn",
            detail: `Carte mère ${str(motherboard.attributes['format'])} vs boîtier ${str(pcCase.attributes['format'])}`,
          },
  );

  checks.push(
    !gpu || !pcCase
      ? { label: "Longueur GPU", state: "idle", detail: "Sélectionnez GPU et boîtier." }
      : num(gpu.attributes['length']) <= num(pcCase.attributes['gpuClearance'])
        ? {
            label: "Longueur GPU",
            state: "ok",
            detail: `${num(gpu.attributes['length'])} mm / ${num(pcCase.attributes['gpuClearance'])} mm`,
          }
        : {
            label: "Longueur GPU",
            state: "warn",
            detail: `GPU ${num(gpu.attributes['length'])} mm > ${num(pcCase.attributes['gpuClearance'])} mm`,
          },
  );

  const estimated = estimatePower(sel);
  checks.push(
    !psu
      ? { label: "Alimentation", state: "idle", detail: "Sélectionnez une alimentation." }
      : num(psu.attributes['wattage']) >= estimated
        ? { label: "Alimentation", state: "ok", detail: `${num(psu.attributes['wattage'])} W pour ~${estimated} W estimés` }
        : {
            label: "Alimentation",
            state: "warn",
            detail: `${num(psu.attributes['wattage'])} W pour ~${estimated} W estimés`,
          },
  );

  checks.push(
    !cooling || !cpu
      ? { label: "Refroidissement CPU", state: "idle", detail: "Sélectionnez CPU et refroidissement." }
      : str(cooling.attributes['socket']s).includes(str(cpu.attributes['socket']))
        ? { label: "Refroidissement CPU", state: "ok", detail: `Compatible ${str(cpu.attributes['socket'])}` }
        : {
            label: "Refroidissement CPU",
            state: "warn",
            detail: `Vérifiez le kit de fixation ${str(cpu.attributes['socket'])}`,
          },
  );

  checks.push(
    !ssd || !motherboard
      ? { label: "Support M.2", state: "idle", detail: "Sélectionnez SSD et carte mère." }
      : str(ssd.attributes['interface']) !== "NVMe" || num(motherboard.attributes['m2']) > 0
        ? { label: "Support M.2", state: "ok", detail: `${num(motherboard.attributes['m2'])} slot(s) M.2` }
        : { label: "Support M.2", state: "warn", detail: "Aucun slot M.2 détecté" },
  );

  return checks;
}

export function estimatePower(sel: Selection): number {
  const base = 90;
  const cpu = sel.cpu ? num(sel.cpu.attributes['power']) || 90 : 0;
  const gpu = sel.gpu ? num(sel.gpu.attributes['power']) || 200 : 0;
  return Math.round((base + cpu + gpu) * 1.3);
}

export function selectionTotal(sel: Selection): number {
  return Object.values(sel).reduce((sum, o) => sum + (o ? o.price : 0), 0);
}
