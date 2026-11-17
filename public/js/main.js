async function ladeMitarbeiterTest() {
  try {
    const resp = await fetch("http://localhost:8080/api/mitarbeiter-test")
    const mitarbeiter = await resp.json()

    const mitarbeiterSection = document.getElementById("mitarbeiterC");


    mitarbeiter.forEach(ma => {

      const maCard = document.createElement("div");
      maCard.className = "ma-card";

      maCard.innerHTML = `
        
        <div class="ma-info">
          <h2>${ma.vorname}</h2>
          <span class="status">${ma.nachname || ''}</span>
          <p class="status"><strong>Verfügbarkeit:</strong> ${ma.status_verfuegbar || 'Unbekannt'}</p>
        </div>
      `;

      mitarbeiterSection.appendChild(maCard);
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Mitarbeiter:", error);
  }
}

ladeMitarbeiterTest()

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