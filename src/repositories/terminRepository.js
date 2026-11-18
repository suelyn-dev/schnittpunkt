import { pool } from '../utilities/db.js';

//z.B. http://localhost:8080/api/terminbuchung?leistungId=5

// Leistungsdauer
export async function findLeistungDauer(leistungId) {
  const [rows] = await pool.query(
    'SELECT dauer FROM leistung WHERE leistung_id = ?',
    [leistungId]
  );
  /* console.log('Dauer aus DB:', rows[0].dauer); */
  return rows[0].dauer;
}

// Verfügbare Mitarbeiter, die diese Leistung anbieten
export async function findPassendeMitarbeiter(leistungId) {
  const [rows] = await pool.query(
    `SELECT m.mitarbeiter_id, m.vorname, m.nachname
     FROM mitarbeiter m
     JOIN mitarbeiter_leistung ml ON m.mitarbeiter_id = ml.mitarbeiter_id
     WHERE ml.leistung_id = ?
       AND m.status_verfuegbar = 'verfügbar'`,
    [leistungId]
  );
  /* console.log('Mitarbeiter aus DB:', rows); */
  return rows;
}

// Gebuchte Termine nächste 90 Tage
export async function findGebuchteTermine() {
  const [rows] = await pool.query(
    `SELECT mitarbeiter_id, datum, startzeit, endzeit
     FROM termin
     WHERE datum BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
       AND status != 'storniert'`
  );
  /* console.log('Gebuchte Termine aus DB:', rows); */
  return rows;
}
