import crypto from "crypto";
import { createNewTermin, cancelTerminByToken } from "../repositories/buchungsRepository.js";

export async function buchungErstellen(daten) {
  // 1. Kundendaten für das Repo vorbereiten
  const kunde = {
    vorname: daten.vorname,
    nachname: daten.nachname,
    email: daten.email || null,
    telefon: daten.telefon
  };

  // 2. Termindaten vorbereiten (startzeit bauen + Zufalls-Token erzeugen)
  const saubereUhrzeit = daten.uhrzeit.replace(" Uhr", "").trim();

  const termin = {
    datum: daten.datum,
    startzeit: `${daten.datum} ${saubereUhrzeit}`,
    mitarbeiterId: daten.mitarbeiterId,
    leistungId: daten.leistungId,
    stornoToken: crypto.randomUUID()
  };

  // 3. Ans Repository übergeben und Ergebnis zurückgeben
  const ergebnis = await createNewTermin(kunde, termin);
  return { ...ergebnis, stornoToken: termin.stornoToken };
}

//Termin absagen

export async function terminStornieren(token) {
  return await cancelTerminByToken(token);
}