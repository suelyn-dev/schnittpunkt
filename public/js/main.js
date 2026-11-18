// Übersicht anzeigen und leistung_id laden
async function ladeUebersicht() {
  const res = await fetch("http://localhost:8080/api/uebersicht");
  const uebersicht = await res.json();

  const tbody = document.getElementById("uebersicht");
  tbody.innerHTML = "";

  uebersicht.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.LEISTUNG}</td>
      <td>${item.DAUER}</td>
      <td>${item.PREIS}</td>
      <td>${item.PERSONEN}</td>
    `;

    row.addEventListener("click", () => ladeMitarbeiter(item.leistung_id));
    tbody.appendChild(row);
  });
}

// Mitarbeiter-Buttons laden
async function ladeMitarbeiter(leistungId) {
  const res = await fetch(`http://localhost:8080/api/terminbuchung/mitarbeiter?leistungId=${leistungId}`);
  const mitarbeiter = await res.json();

  const container = document.getElementById("freeSlots");
  container.innerHTML = "<h3>Mitarbeiter wählen:</h3>";

  // Zufallsgenerator
  const egalBtn = document.createElement("button");
  egalBtn.className = "t-button";
  egalBtn.textContent = "Egal";

  egalBtn.addEventListener("click", () => {
    const zufallsIndex = Math.floor(Math.random() * mitarbeiter.length);
    const zufallsMa = mitarbeiter[zufallsIndex];
    const name = `${zufallsMa.vorname} ${zufallsMa.nachname || ""}`.trim();

    ladeTage(leistungId, zufallsMa.mitarbeiter_id, name);
  });

  container.appendChild(egalBtn);

  mitarbeiter.forEach(ma => {
    const name = `${ma.vorname} ${ma.nachname || ""}`.trim();
    const btn = document.createElement("button");
    btn.className = "t-button";
    btn.textContent = name;

    btn.addEventListener("click", () => ladeTage(leistungId, ma.mitarbeiter_id, name));
    container.appendChild(btn);
  });
}

// Verfügbare Tage 
async function ladeTage(leistungId, mitarbeiterId, mitarbeiterName) {
  const res = await fetch(`http://localhost:8080/api/terminbuchung?leistungId=${leistungId}&mitarbeiterId=${mitarbeiterId}`);
  const termine = await res.json();

  const container = document.getElementById("freeSlots");
  container.innerHTML = `<h3>Verfügbare Tage (${mitarbeiterName}):</h3>`;

  const verfuegbareTage = [...new Set(termine.map(t => t.datum))];

  verfuegbareTage.forEach(datum => {
    const btn = document.createElement("button");
    btn.className = "t-button";
    btn.textContent = datum;

    btn.addEventListener("click", () => zeigeUhrzeiten(termine, datum, mitarbeiterName));
    container.appendChild(btn);
  });
}

// Uhrzeiten 
function zeigeUhrzeiten(termine, gewaehlterTag, mitarbeiterName) {
  const container = document.getElementById("freeSlots");
  container.innerHTML = `<h3>Freie Zeiten am ${gewaehlterTag} (${mitarbeiterName}):</h3>`;

  const tagesTermine = termine.filter(t => t.datum === gewaehlterTag);

  tagesTermine.forEach(t => {
    t.freieSlots.forEach(uhrzeit => {
      const btn = document.createElement("button");
      btn.className = "t-button";
      btn.textContent = uhrzeit;
      if (uhrzeit.includes("belegt")) btn.disabled = true;
      container.appendChild(btn);
    });
  });
}

ladeUebersicht();
