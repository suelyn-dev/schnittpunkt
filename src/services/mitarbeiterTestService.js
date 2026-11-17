import { findRawMitarbeiter } from '../repositories/mitarbeiterTestRepo.js';

export async function getRawMitarbeiter() {
  const mitarbeiter = await findRawMitarbeiter();
  const verfuegbareMitarbeiter = [];
  
  for (let i = 0; i < mitarbeiter.length; i++) {
    const aktuellerMitarbeiter = mitarbeiter[i];

    if (aktuellerMitarbeiter.status_verfuegbar === 'verfügbar') {
      verfuegbareMitarbeiter.push(aktuellerMitarbeiter);
    }
  }

  return verfuegbareMitarbeiter;
}