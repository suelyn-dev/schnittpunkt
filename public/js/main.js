async function ladeMitarbeiter() {
  try {
    const resp = await fetch("http://localhost:8080/api/mitarbeiter")
    const mitarbeiter = await resp.json()

    const mitarbeiterSection = document.getElementById("mitarbeiterC");


    mitarbeiter.forEach(ma => {

      const maCard = document.createElement("div");
      maCard.className = "ma-card";

      maCard.innerHTML = `
        
        <div class="ma-info">
          <h2>${ma.vorname}</h2>
          <span class="status">${ma.nachname || 'Hat keinen Nachnamen'}</span>
          <p class="status"><strong>Verfügbar bei 1:</strong> ${ma.status_verfuegbar || 'Unbekannt'}</p>
        </div>
      `;

      mitarbeiterSection.appendChild(maCard);
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Mitarbeiter:", error);
  }
}

ladeMitarbeiter()

async function ladeUebersicht() {
  try {
    const response = await fetch("http://localhost:8080/api/uebersicht");
    const uebersicht = await response.json();

    const tbody = document.getElementById("uebersicht")
    tbody.innerHTML = "";

    uebersicht.forEach(item => {
      const row = document.createElement("tr");

      row.innerHTML = `
            <td>${item.LEISTUNG}</td>
            <td>${item.DAUER}</td>
            <td>${item.PREIS}</td>
            <td>${item.PERSONEN}</td>
        `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Mitarbeiter", error)
  }
}
ladeUebersicht()