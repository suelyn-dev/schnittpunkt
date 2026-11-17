import { pool } from '../utilities/db.js'; 

export async function findRawMitarbeiter() {
  const [rows] = await pool.query('SELECT * FROM mitarbeiter');
  return rows;
}