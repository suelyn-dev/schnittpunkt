import {
  findLeistungDauer,
  findPassendeMitarbeiter,
  findGebuchteTermine
} from '../repositories/terminRepository.js';

const OEFFNUNGSZEITEN = [
  null, // Sonntag
  null, // Montag
  { start: 9, ende: 18 },
  { start: 9, ende: 18 },
  { start: 9, ende: 20 },
  { start: 9, ende: 18 },
  { start: 9, ende: 14 }
];

export async function getFreieTermine(leistungId, mitarbeiterId) {
  const dauer = await findLeistungDauer(leistungId);
  let mitarbeiterListe = await findPassendeMitarbeiter(leistungId);
  const gebuchteTermine = await findGebuchteTermine();

  // Wenn ein bestimmter Mitarbeiter gewählt wurde und (nicht "egal"), nur diesen behalten
  if (mitarbeiterId && mitarbeiterId !== 'egal') {
    mitarbeiterListe = mitarbeiterListe.filter(
      (ma) => ma.mitarbeiter_id === Number(mitarbeiterId)
    );
  }

  /*   console.log('Aus dem Service Dauer:', dauer);
    console.log('Aus dem Service mitarbeiterListe:', mitarbeiterListe);
    console.log('Aus dem Service gebuchteTermine:', gebuchteTermine); */

  const ergebnis = [];
  const heute = new Date();

  // Nächste 90 Tage durchlaufen
  for (let tag = 0; tag <= 90; tag++) {
    const datum = new Date(heute); // heutiges Datum
    datum.setDate(heute.getDate() + tag); // Datum in Schleife umstellen

    const zeiten = OEFFNUNGSZEITEN[datum.getDay()]; // Index für entsprechenden Wochentag
    if (zeiten === null) continue; // Index 0 & 1: Geschlossen

    // Gebuchte Termine je Mitarbeiter
    for (const ma of mitarbeiterListe) {
      const freieSlots = [];

      const aktuell = new Date(datum);
      aktuell.setHours(zeiten.start, 0, 0, 0);

      const feierabend = new Date(datum);
      feierabend.setHours(zeiten.ende, 0, 0, 0);

      // Zeitslots im 15-Minuten-Takt testen
      while (true) {
        const slotEnde = new Date(aktuell);
        slotEnde.setMinutes(aktuell.getMinutes() + dauer);

        // Break wenn Termindauer zu lang
        if (slotEnde > feierabend) {
          break;
        }

        // Terminkollision prüfen
        let istBelegt = false;

        for (const t of gebuchteTermine) {
          if (
            t.mitarbeiter_id === ma.mitarbeiter_id &&
            new Date(t.datum).toDateString() === datum.toDateString() &&
            aktuell < new Date(t.endzeit) &&
            slotEnde > new Date(t.startzeit)
          ) {
            istBelegt = true;
            break;
          }
        }

        let text = aktuell.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        if (istBelegt) text += ' (belegt)';
        freieSlots.push(text);


        // 15 Minuten weiter springen
        aktuell.setMinutes(aktuell.getMinutes() + 15);
      }

      if (freieSlots.length > 0) {
        ergebnis.push({
          datum: datum.toLocaleDateString('sv-SE'), // Datum formatieren "YYYY-MM-DD"
          mitarbeiter_id: ma.mitarbeiter_id,
          mitarbeiter: (ma.vorname + ' ' + (ma.nachname || '')).trim(),
          freieSlots: freieSlots
        });
      }
    }
  }

  return ergebnis;
}
