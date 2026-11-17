import express from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { pool } from './src/utilities/db.js'


const PORT = process.env.PORT || 8080
const app = express()


app.use(express.static("./public", {
  extensions: ['html']
}));

app.use(express.json()) 
app.use(cookieParser()) 

// Erste Verbindung zur Datenbank:
app.get('/api/mitarbeiter', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mitarbeiter')

    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/uebersicht', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.bezeichnung AS LEISTUNG,
      CONCAT(l.dauer, ' Min') AS DAUER,
      CONCAT(REPLACE(l.preis, '.', ','), ' €') AS PREIS,
      GROUP_CONCAT(m.vorname ORDER BY m.mitarbeiter_id SEPARATOR ', ') AS  PERSONEN 
      FROM leistung l
      LEFT JOIN mitarbeiter_leistung ml ON l.leistung_id = ml.leistung_id
      LEFT JOIN mitarbeiter m ON ml.mitarbeiter_id = m.mitarbeiter_id 
        AND m.status_verfuegbar = 1
      GROUP BY l.leistung_id, l.bezeichnung, l.dauer, l.preis
      ORDER BY l.leistung_id;`)
      res.json(rows)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  
  
app.listen(PORT, () => console.log("Der Salon geht an den Start auf Port: ", PORT))
