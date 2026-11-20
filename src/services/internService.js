import { 
  getTagesansicht, 
  getAlleGebuchtenTermine, 
  storniereTermin, 
  erledigt,
  noShow,
  updateLeistung,
  insertLeistung
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

export async function aendereLeistung(leistungId, daten) {
  return await updateLeistung(leistungId, daten);
}

export async function insertLeistungService(daten) {
  return await insertLeistung(daten);
}
