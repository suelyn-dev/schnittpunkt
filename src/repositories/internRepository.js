import { pool } from '../utilities/db.js';

// Tagesansicht
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

// Angebot bearbeiten
export async function updateLeistung(leistungId, daten) {
  const dauerZahl = parseInt(String(daten.DAUER).replace(" Min", "").trim(), 10);
  const preisZahl = parseFloat(String(daten.PREIS).replace(" €", "").replace(",", ".").trim());

  const [result] = await pool.query(
    `UPDATE leistung 
     SET bezeichnung = ?, dauer = ?, preis = ? 
     WHERE leistung_id = ?`,
    [daten.LEISTUNG, dauerZahl, preisZahl, leistungId]
  );
  return result.affectedRows > 0;
}

//Neues Angebot
export async function insertLeistung(daten) {
  const [leistungRes] = await pool.query(
    `INSERT INTO leistung (bezeichnung, dauer, preis) VALUES (?, ?, ?)`,
    [daten.LEISTUNG, daten.DAUER, daten.PREIS]
  );
  const leistungId = leistungRes.insertId;

  if (!daten.VORNAME) return leistungId;

  const [rows] = await pool.query(
    `SELECT mitarbeiter_id FROM mitarbeiter WHERE vorname = ?`,
    [daten.VORNAME]
  );

  let mitarbeiterId;
  if (rows.length > 0) {
    mitarbeiterId = rows[0].mitarbeiter_id;
  } else {
    const [maRes] = await pool.query(
      `INSERT INTO mitarbeiter (vorname) VALUES (?)`,
      [daten.VORNAME]
    );
    mitarbeiterId = maRes.insertId;
  }

  await pool.query(
    `INSERT INTO mitarbeiter_leistung (mitarbeiter_id, leistung_id) VALUES (?, ?)`,
    [mitarbeiterId, leistungId]
  );

  return leistungId;
}

export async function deleteLeistung(leistungId) {
  //Verknüpfungen in mitarbeiter_leistung löschen
  await pool.query(
    `DELETE FROM mitarbeiter_leistung WHERE leistung_id = ?`,
    [leistungId]
  );

  //Leistung löschen
  const [result] = await pool.query(
    `DELETE FROM leistung WHERE leistung_id = ?`,
    [leistungId]
  );
  return result.affectedRows > 0;
}
