import { allEntities, type Entity } from "@/data/daemons/entities";

export type ManagedEntity = Omit<Entity, "category"> & { category: string };

const STORAGE_KEY = "domus_goetia_entities";

function isEntity(value: unknown): value is ManagedEntity {
  if (!value || typeof value !== "object") return false;
  const entity = value as Partial<ManagedEntity>;
  return (
    typeof entity.slug === "string" &&
    typeof entity.name === "string" &&
    typeof entity.category === "string" &&
    typeof entity.title === "string" &&
    typeof entity.area === "string" &&
    typeof entity.enn === "string" &&
    typeof entity.planeta === "string" &&
    typeof entity.elemento === "string" &&
    typeof entity.metal === "string" &&
    typeof entity.incenso === "string" &&
    typeof entity.melhoresDias === "string" &&
    typeof entity.legioes === "string" &&
    typeof entity.historia === "string" &&
    Array.isArray(entity.poderes) &&
    typeof entity.image === "string" &&
    typeof entity.sigil === "string"
  );
}

export function readManagedEntities(): ManagedEntity[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return allEntities;

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isEntity) ? parsed : allEntities;
  } catch {
    return allEntities;
  }
}

export function writeManagedEntities(entities: ManagedEntity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
}
