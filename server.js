import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { pool } from './src/utilities/db.js'


const PORT = process.env.PORT || 8080
const app = express()


app.use(cors({
    origin: "http://127.0.0.1:5500", //spezifiziert, damit Cookies funktionieren
    credentials: true                
}));

app.use(express.json()) //damit Daten richtig umgewandelt werden
app.use(cookieParser()) //damit Backend Cookies lesen kann, die der Browser bei einer Anfrage mitsendet

// Erste Verbindung zur Datenbank:
app.get('/', async (req, res) => {
  try {
        const [rows] = await pool.query('SELECT * FROM mitarbeiter')
    
    console.log(rows);
    res.json(rows);    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => console.log("Der Salon geht an den Start auf Port: ", PORT))