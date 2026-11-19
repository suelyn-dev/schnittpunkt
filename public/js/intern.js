async function ladeTagesplan() {
  const container = document.getElementById("tagesplan");
  container.innerHTML = "";

  // 1. Heutige Termine pro Mitarbeiter laden
  const resHeute = await fetch("http://localhost:8080/api/mitarbeiter/heute");
  const heuteTermine = await resHeute.json();

  const mitarbeiterNamen = [...new Set(heuteTermine.map(t => t.mitarbeiter))];

  if (mitarbeiterNamen.length === 0) {
    container.innerHTML += "<p>Heute liegen keine Termine vor.</p>";
  }

  mitarbeiterNamen.forEach(name => {
    container.innerHTML += `<h2>${name}</h2>`;

    const meineTermine = heuteTermine.filter(t => t.mitarbeiter === name);

    meineTermine.forEach(t => {
      const start = new Date(t.startzeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      const ende = new Date(t.endzeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

      container.innerHTML += `
        <p>
          ${start} - ${ende} Uhr | ${t.leistung} | ${t.kunde_vorname} ${t.kunde_nachname} (${t.telefon})
          <button onclick="storniere(${t.termin_id})">Stornieren</button>
          <button onclick="noShow(${t.termin_id})">No-Show</button>
          <button onclick="erledigt(${t.termin_id})">Erledigt</button>
        </p>
      `;
    });
  });

  // 2. Alle gebuchten Termine darunter laden
  container.innerHTML += "<h1>Alle gebuchten Termine</h1>";

  const resAlle = await fetch("http://localhost:8080/api/mitarbeiter/alle");
  const alleTermine = await resAlle.json();

  alleTermine.forEach(t => {
    const tag = new Date(t.startzeit).toLocaleDateString("de-DE");
    const start = new Date(t.startzeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });


    container.innerHTML += `
      <p>
        ${tag} um ${start} Uhr | <b>${t.mitarbeiter}</b> | ${t.leistung} | ${t.kunde_vorname} ${t.kunde_nachname} (${t.telefon})
        <button onclick="storniere(${t.termin_id})">Stornieren</button>
      </p>
    `;
  });
}

// 3. Termin löschen und Seite aktualisieren
async function storniere(terminId) {
  const res = await fetch(`http://localhost:8080/api/mitarbeiter/termine/${terminId}`, {
    method: "DELETE"
  });
  const daten = await res.json();
  alert(daten.message);

  ladeTagesplan();
}

// 4. Termin als No-Show markieren
async function noShow(terminId) {
  const res = await fetch(`http://localhost:8080/api/mitarbeiter/termine/${terminId}/noshow`, {
    method: "PATCH"
  });
  const daten = await res.json();
  alert(daten.message);

  ladeTagesplan();
}

// 5. Termin als Erledigt markieren
async function erledigt(terminId) {
  const res = await fetch(`http://localhost:8080/api/mitarbeiter/termine/${terminId}/erledigt`, {
    method: "PATCH"
  });
  const daten = await res.json();
  alert(daten.message);

  ladeTagesplan();
}

ladeTagesplan();
