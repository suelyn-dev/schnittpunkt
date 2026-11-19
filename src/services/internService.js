import { 
  getTagesansicht, 
  getAlleGebuchtenTermine, 
  storniereTermin, 
  erledigt,
  noShow
} from "../repositories/internRepository.js"; 

export async function holeTagesansicht() {
  return await getTagesansicht();
}

export async function holeAlleTermine() {
  return await getAlleGebuchtenTermine();
}

export async function loescheTermin(terminId) {
  return await storniereTermin(terminId);
}

export async function terminErledigt(terminId) {
  return await erledigt(terminId);
}

export async function noShowTermin(terminId) {
  return await noShow(terminId);
}