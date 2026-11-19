import { pool } from '../utilities/db.js';

// Nur Termine von HEUTE (für die Spaltenansicht pro Mitarbeiter)
export async function getTagesansicht() {
  const [rows] = await pool.query(`
    SELECT 
      m.vorname AS mitarbeiter,
      t.termin_id,
      t.startzeit,
      t.endzeit,
      l.bezeichnung AS leistung,
      k.vorname AS kunde_vorname,
      k.nachname AS kunde_nachname,
      k.telefon
    FROM termin t
    LEFT JOIN kunden k ON t.kunden_id = k.kunden_id
    LEFT JOIN leistung l ON t.leistung_id = l.leistung_id
    LEFT JOIN mitarbeiter m ON m.mitarbeiter_id = t.mitarbeiter_id
    WHERE DATE(t.startzeit) = CURRENT_DATE()
      AND (t.status IS NULL OR t.status != 'storniert')
    ORDER BY m.vorname, t.startzeit;
  `);
  return rows;
}

// Alle offenen Termine (ab heute)
export async function getAlleGebuchtenTermine() {
  const [rows] = await pool.query(`
    SELECT 
      m.vorname AS mitarbeiter,
      t.termin_id,
      t.datum,
      t.startzeit,
      t.endzeit,
      l.bezeichnung AS leistung,
      k.vorname AS kunde_vorname,
      k.nachname AS kunde_nachname,
      k.telefon
    FROM termin t
    LEFT JOIN kunden k ON t.kunden_id = k.kunden_id
    LEFT JOIN leistung l ON t.leistung_id = l.leistung_id
    LEFT JOIN mitarbeiter m ON m.mitarbeiter_id = t.mitarbeiter_id
    WHERE DATE(t.startzeit) >= CURRENT_DATE()
      AND (t.status IS NULL OR t.status = 'offen')
    ORDER BY t.startzeit;
  `);
  return rows;
}

// Termin löschen
export async function storniereTermin(termin_id) {
  const [stornoRes] = await pool.query(
    `DELETE FROM termin WHERE termin_id = ?;`, 
    [termin_id]
  );
  return stornoRes.affectedRows > 0;
}

// Termin markieren erledigt
export async function erledigt(termin_id) {
  const [stornoRes] = await pool.query(
    `UPDATE termin SET status = "erledigt" WHERE termin_id = ?;`, 
    [termin_id]
  );
  return stornoRes.affectedRows > 0;
}

//no-show
export async function noShow(termin_id) {
  const [stornoRes] = await pool.query(
    `UPDATE termin SET status = "no-show" WHERE termin_id = ?;`, 
    [termin_id]
  );
  return stornoRes.affectedRows > 0;
}