import { getRawMitarbeiter } from "../services/MitarbeiterTestService.js";


export async function getMitarbeiterRaw(req, res) {
  try {
    const rows = await getRawMitarbeiter();
    res.json(rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); 
  }
}