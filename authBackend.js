import express from "express";
import bcrypt from "bcrypt";
import { pool } from "./src/utilities/db.js"; 

export const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Bitte ein Passwort eingeben." });
    }

    // Hash-Passwort aus mitarbeiter holen
    const [rows] = await pool.execute(
      "SELECT passwort FROM mitarbeiter WHERE mitarbeiter_id = 1" // Alle Passwörter gleich, Chefin hat id = 1 und wird daher immer in der Mitabeitertabelle stehen
    );
    let hash = rows[0]?.passwort;

    // Falls noch kein Passwort
    if (!hash) {
      hash = await bcrypt.hash(process.env.MA_PASSWORD, 10);
      await pool.execute("UPDATE mitarbeiter SET passwort = ?", [hash]);
    }

    // Eingegebenes Passwort mit Hash vergleichen
    const isMatch = await bcrypt.compare(password, hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Falsches Passwort!" });
    }
  // Cookie setzen, wenn Mitarbeiter eingeloggt ist
    res.cookie("ma_auth", "true", { httpOnly: true });
    res.status(200).json({ message: "Login erfolgreich!" });

  } catch (err) {
    console.error("Fehler beim Login:", err);
    res.status(500).json({ message: "Serverfehler beim Login." });
  }
});
