import { pool } from '../utilities/db.js';

export async function createNewTermin(kunde, termin) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Kunden-ID checken anhand von Tel
    const [kunden] = await conn.execute(
      "SELECT kunden_id FROM kunden WHERE telefon = ?",
      [kunde.telefon]
    );

    let kundenId;
    // Bestandskunden pürfen
    if (kunden.length > 0) {
      kundenId = kunden[0].kunden_id;
    } else {
      const [kundeRes] = await conn.execute(
        "INSERT INTO kunden (vorname, nachname, email, telefon) VALUES (?, ?, ?, ?)",
        [kunde.vorname, kunde.nachname, kunde.email, kunde.telefon]
      );
      kundenId = kundeRes.insertId;
    }

    // Termin speichern (endzeit = startzeit + Leistungsdauer)
    const [terminRes] = await conn.execute(
      `INSERT INTO termin (datum, startzeit, endzeit, kunden_id, mitarbeiter_id, leistung_id, storno_token)
       SELECT ?, ?, DATE_ADD(?, INTERVAL dauer MINUTE), ?, ?, ?, ?
       FROM leistung WHERE leistung_id = ?`,
      [
        termin.datum,
        termin.startzeit,
        termin.startzeit,
        kundenId,
        termin.mitarbeiterId,
        termin.leistungId,
        termin.stornoToken,
        termin.leistungId
      ]
    );

    await conn.commit();
    return { terminId: terminRes.insertId, kundenId };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Termin absagen
export async function cancelTerminByToken(token) {
  const [result] = await pool.execute(
    `UPDATE termin 
     SET status = 'storniert' 
     WHERE storno_token = ? 
       AND status != 'storniert' 
       AND startzeit > NOW() + INTERVAL 24 HOUR`,
    [token]
  );

  return result.affectedRows > 0;
}