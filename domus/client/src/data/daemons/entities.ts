import { lucifer } from "./lucifer.ts";
import { lilith } from "./lilith.ts";
import { belzebub } from "./belzebub.ts";
import { bael } from "./bael.ts";
import { agares } from "./agares.ts";
import { vassago } from "./vassago.ts";
import { samigina } from "./samigina.ts";
import { marbas } from "./marbas.ts";
import { valefor } from "./valefor.ts";
import { amon } from "./amon.ts";
import { barbatos } from "./barbatos.ts";
import { paimon } from "./paimon.ts";
import { buer } from "./buer.ts";
import { gusion } from "./gusion.ts";
import { sitri } from "./sitri.ts";
import { beleth } from "./beleth.ts";
import { leraje } from "./leraje.ts";
import { eligos } from "./eligos.ts";
import { zepar } from "./zepar.ts";
import { botis } from "./botis.ts";
import { bathin } from "./bathin.ts";
import { saleos } from "./saleos.ts";
import { purson } from "./purson.ts";
import { marax } from "./marax.ts";
import { ipos } from "./ipos.ts";
import { aim } from "./aim.ts";
import { naberius } from "./naberius.ts";
import { glasyalabolas } from "./glasyaLabolas.ts";
import { bune } from "./bune.ts";
import { ronove } from "./ronove.ts";
import { berith } from "./berith.ts";
import { astaroth } from "./astaroth.ts";
import { forneus } from "./forneus.ts";
import { foras } from "./foras.ts";
import { asmoday } from "./asmoday.ts";
import { gaap } from "./gaap.ts";
import { furfur } from "./furfur.ts";
import { marchosias } from "./marchosias.ts";
import { stolas } from "./stolas.ts";
import { phenex } from "./phenex.ts";
import { halphas } from "./halphas.ts";
import { malphas } from "./malphas.ts";
import { raum } from "./raum.ts";
import { focalor } from "./focalor.ts";
import { vepar } from "./vepar.ts";
import { sabnock } from "./sabnock.ts";
import { shax } from "./shax.ts";
import { vine } from "./vine.ts";
import { bifrons } from "./bifrons.ts";
import { vual } from "./vual.ts";
import { hagenti } from "./hagenti.ts";
import { crocell } from "./crocell.ts";
import { furcas } from "./furcas.ts";
import { balam } from "./balam.ts";
import { alloces } from "./alloces.ts";
import { camio } from "./camio.ts";
import { murmur } from "./murmur.ts";
import { orobas } from "./orobas.ts";
import { gremory } from "./gremory.ts";
import { ose, } from "./ose.ts";
import { amy } from "./amy.ts";
import { orias } from "./orias.ts";
import { vapula } from "./vapula.ts";
import { zagan } from "./zagan.ts";
import { valac } from "./valac.ts";
import { andras } from "./andras.ts";
import { haures } from "./haures.ts";
import { andrealphus } from "./andrealphus.ts";
import { cimeies } from "./cimeies.ts";
import { amdusias } from "./amdusias.ts";
import { belial } from "./belial.ts";
import { decarabia } from "./decarabia.ts";
import { seere } from "./seere.ts";
import { dantalion } from "./dantalion.ts";
import { andromalius } from "./andromalius.ts";


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
  sigil: string;
}

export interface Entity {
  slug: string;
  id: number;
  name: string;
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
  sigil: string; 
}

const rawEntities = [
  lucifer, lilith, belzebub, bael, agares, vassago, samigina, marbas, valefor, amon,
  barbatos, paimon, buer, gusion, sitri, beleth, leraje, eligos, zepar, botis,
  bathin, saleos, purson, marax, ipos, aim, naberius, glasyalabolas, bune, ronove,
  berith, astaroth, forneus, foras, asmoday, gaap, furfur, marchosias, stolas, phenex,
  halphas, malphas, raum, focalor, vepar, sabnock, shax, vine, bifrons, vual,
  hagenti, crocell, furcas, balam, alloces, camio, murmur, orobas, gremory, ose,
  amy, orias, vapula, zagan, valac, andras, haures, andrealphus, cimeies, amdusias,
  belial, decarabia, seere, dantalion, andromalius
];

export const allEntities: Entity[] = rawEntities.map((daemon) => ({
  ...daemon,
  sigil: `/images/sigils/${daemon.slug}.png`
}));