// Importação da Trindade (Certifique-se que os arquivos .ts existam na pasta daemons)
import { lucifer } from "./daemons/lucifer";
import { lilith } from "./daemons/lilith";
import { astarothTrindade } from "./daemons/astaroth"; // Nome do arquivo na imagem é astaroth.ts

// Importação da Goetia
import { bael } from "./daemons/bael";

// Definição da Interface
export interface Entity {
  slug: string;
  id: number;
  name: string;
  category: "Trindade" | "Reis" | "Duques" | "Príncipes" | "Marqueses" | "Presidentes" | "Condes" | "Cavaleiros";
  title: string;
  area: string;
  history: string;
  cultivation: string;
  bestDays: string;
  powers: string[];
  image: string;
}

// Exportação da lista completa
export const allEntities: Entity[] = [
  lucifer,
  lilith,
  astarothTrindade,
  bael,
  
];