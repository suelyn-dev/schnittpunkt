import { buchungErstellen, terminStornieren } from "../services/buchungsService.js";

export async function postTermin(req, res) {
  try {
    const { datum, uhrzeit, mitarbeiterId, leistungId, vorname, nachname, telefon } = req.body;

    // Kurzer Pflichtfeld-Check
    if (!datum || !uhrzeit || !mitarbeiterId || !leistungId || !vorname || !nachname || !telefon) {
      return res.status(400).json({ message: "Bitte alle Pflichtfelder ausfüllen." });
    }

    const ergebnis = await buchungErstellen(req.body);

    res.status(201).json({
      message: "Termin erfolgreich gebucht",
      ...ergebnis
    });
  } catch (err) {
    console.error("Fehler bei der Terminbuchung:", err);
    res.status(500).json({ message: "Termin konnte nicht angelegt werden." });
  }
}

//Termin absagen
export async function deleteTermin(req, res) {
  try {
    const geklappt = await terminStornieren(req.params.token);

    if (!geklappt) {
      return res.status(400).json({ 
        message: "Stornierung nicht mehr möglich (unter 24 Stunden vor Termin oder bereits storniert)." 
      });
    }

    res.status(200).json({ message: "Termin wurde erfolgreich storniert!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler beim Stornieren." });
  }
}
