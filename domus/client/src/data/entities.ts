import { lucifer } from "./daemons/lucifer";

// 1. A Interface deve bater exatamente com os campos do lucifer.ts
export interface Entity {
  slug: string;
  id: number;
  name: string;
  // Ajustei a categoria para "Entidade Maior" conforme você mudou
  category: "Entidade Maior" | "Reis" | "Duques" | "Príncipes" | "Marqueses" | "Presidentes" | "Condes" | "Cavaleiros";
  title: string;
  area: string;
  enn: string;
  planeta: string;
  elemento: string;
  metal: string;
  incenso: string;
  melhoresDias: string;
  legioes: string;
  historia: string;
  poderes: string[];
  image: string;
}

// 2. Como você deletou os outros, a lista deve conter APENAS o lucifer agora
export const allEntities: Entity[] = [
  lucifer
];