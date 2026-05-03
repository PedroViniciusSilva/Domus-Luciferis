// Estrutura para garantir que você não esqueça nenhum campo ao editar
export interface Daemon {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  planet?: string;
  metal?: string;
}

export const goetiaData: Record<string, Daemon[]> = {
  "Entidades Maiores": [
    { id: 0, name: "Lúcifer", title: "Imperador", description: "O portador da luz e guia supremo.", image: "/images/lucifer.png" },
    { id: 0, name: "Lilith", title: "Rainha", description: "A força da independência e mistérios ocultos.", image: "/images/lilith.png" },
    { id: 0, name: "Astaroth", title: "Grão-Duque", description: "Conhecedor do passado, presente e futuro.", image: "/images/astaroth.png" },
  ],
  "Reis": [
    { id: 1, name: "Bael", title: "Rei", description: "Governa o leste, concede invisibilidade e sabedoria.", image: "/images/bael.png" },
    { id: 9, name: "Paimon", title: "Rei", description: "Ensina artes e ciências; muito fiel a Lúcifer.", image: "/images/paimon.png" },
    // Adicione os outros reis seguindo este padrão
  ],
  "Duques": [
    { id: 2, name: "Agares", title: "Duque", description: "Ensina idiomas e causa terremotos.", image: "/images/agares.png" },
    // Adicione os outros duques
  ],
  "Príncipes": [],
  "Marqueses": [],
  "Presidentes": [],
  "Condes": [],
  "Cavaleiros": [],
};