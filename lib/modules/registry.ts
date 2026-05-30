import type { PoVModule, CriterionStatus } from "./types";
import type { PoV } from "@prisma/client";

class ModuleRegistry {
  private modules = new Map<string, PoVModule>();

  register(module: PoVModule) {
    this.modules.set(module.id, module);
  }

  get(id: string): PoVModule | undefined {
    return this.modules.get(id);
  }

  list(): PoVModule[] {
    return Array.from(this.modules.values());
  }

  byCategory(category: PoVModule["category"]): PoVModule[] {
    return this.list().filter((m) => m.category === category);
  }

  // ── Hook dispatchers ───────────────────────────────────────────────────────

  async dispatchPoVCreate(pov: PoV) {
    for (const mod of this.list()) {
      if (mod.onPoVCreate) {
        await mod.onPoVCreate(pov).catch((e) =>
          console.error(`[${mod.id}] onPoVCreate error:`, e)
        );
      }
    }
  }

  async dispatchPoVUpdate(pov: PoV, changed: Partial<PoV>) {
    for (const mod of this.list()) {
      if (mod.onPoVUpdate) {
        await mod.onPoVUpdate(pov, changed).catch((e) =>
          console.error(`[${mod.id}] onPoVUpdate error:`, e)
        );
      }
    }
  }

  async dispatchPoVComplete(pov: PoV) {
    for (const mod of this.list()) {
      if (mod.onPoVComplete) {
        await mod.onPoVComplete(pov).catch((e) =>
          console.error(`[${mod.id}] onPoVComplete error:`, e)
        );
      }
    }
  }

  async dispatchCriterionStatus(
    pov: PoV,
    criterionId: string,
    status: CriterionStatus
  ) {
    for (const mod of this.list()) {
      if (mod.onCriterionStatus) {
        await mod.onCriterionStatus(pov, criterionId, status).catch((e) =>
          console.error(`[${mod.id}] onCriterionStatus error:`, e)
        );
      }
    }
  }

  // UI slot helpers — used by React components
  getCriterionPanels() {
    return this.list()
      .map((m) => m.CriterionPanel)
      .filter(Boolean);
  }

  getExecuteSections() {
    return this.list()
      .map((m) => m.ExecuteSection)
      .filter(Boolean);
  }

  getDashboardWidgets() {
    return this.list()
      .map((m) => m.DashboardWidget)
      .filter(Boolean);
  }
}

export const registry = new ModuleRegistry();
