async function ladeTagesplan() {
  const container = document.getElementById("tagesplan");
  container.innerHTML = "";

  // Tagesansicht
  const resHeute = await fetch("http://localhost:8080/api/mitarbeiter/heute");
  const heuteTermine = await resHeute.json();

  const mitarbeiterNamen = [...new Set(heuteTermine.map(t => t.mitarbeiter))];

  if (mitarbeiterNamen.length === 0) {
    container.innerHTML += "<p>Heute liegen keine Termine vor.</p>";
  }
  container.innerHTML += `<div id="kalender">`;
  mitarbeiterNamen.forEach(name => {
    let spalteHTML = `<div class="spalte"><h2>${name}</h2>`;

    const meineTermine = heuteTermine.filter(t => t.mitarbeiter === name);

    meineTermine.forEach(t => {
      const start = new Date(t.startzeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      const ende = new Date(t.endzeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

      spalteHTML += `
        <p>
          <b>${start} - ${ende} Uhr</b><br>
          <em><b>${t.leistung}</b></em><br>
          ${t.kunde_vorname} ${t.kunde_nachname}, Tel: ${t.telefon}<br>
          <button onclick="storniere(${t.termin_id})">Stornieren</button>
          <button onclick="noShow(${t.termin_id})">No-Show</button>
          <button onclick="erledigt(${t.termin_id})">Erledigt</button>
        </p>
      `;
    });
    spalteHTML += `</div>`; 
    container.querySelector("#kalender").innerHTML += spalteHTML;
  });

  // Alle Termine mit Stornooption
  container.innerHTML += "<h2>Alle Termine im Überblick</h2>";

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

// Termin löschen 
async function storniere(terminId) {
  const res = await fetch(`http://localhost:8080/api/mitarbeiter/termine/${terminId}`, {
    method: "DELETE"
  });
  const daten = await res.json();
  alert(daten.message);

  ladeTagesplan();
}

// Termin als no-show markieren
async function noShow(terminId) {
  const res = await fetch(`http://localhost:8080/api/mitarbeiter/termine/${terminId}/noshow`, {
    method: "PATCH"
  });
  const daten = await res.json();
  alert(daten.message);

  ladeTagesplan();
}

// Termin als erledigt markieren
async function erledigt(terminId) {
  const res = await fetch(`http://localhost:8080/api/mitarbeiter/termine/${terminId}/erledigt`, {
    method: "PATCH"
  });
  const daten = await res.json();
  alert(daten.message);

  ladeTagesplan();
}

ladeTagesplan();
ladeUebersicht()


// Übersicht anzeigen zum Bearbeiten
async function ladeUebersicht() {
  const res = await fetch("http://localhost:8080/api/uebersicht");
  const uebersicht = await res.json();
  const tbody = document.getElementById("leistungen");
  tbody.innerHTML = "";

  uebersicht.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td contenteditable="true" data-feld="LEISTUNG" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${item.LEISTUNG}</td>
      <td contenteditable="true" data-feld="DAUER" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${item.DAUER}</td>
      <td contenteditable="true" data-feld="PREIS" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${item.PREIS}</td>
      <td>${item.PERSONEN ?? ""}</td>
      <td><button onclick="loescheLeistung(${item.leistung_id})">Löschen</button></td>
    `;


    row.addEventListener("focusout", async (e) => {
      const feld = e.target.dataset.feld;
      if (!feld) return; // Falls auf Mitarbeiter geklickt wurde

      const neuerWert = e.target.textContent.trim();
      if (neuerWert == item[feld]) return;

      if (!confirm("Willst du das wirklich ändern?")) {
        e.target.textContent = item[feld];
        return;
      }

      item[feld] = neuerWert;

      await fetch(`http://localhost:8080/api/mitarbeiter/uebersicht/${item.leistung_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });

      ladeUebersicht(); // nue laden, wegen formatierung
    });

    tbody.appendChild(row);
  });
}

// Leistung löschen 
async function loescheLeistung(leistungId) {
  if (!confirm("Willst du diese Leistung wirklich löschen?")) return;

  const res = await fetch(`http://localhost:8080/api/mitarbeiter/uebersicht/${leistungId}`, {
    method: "DELETE"
  });
  const daten = await res.json();
  alert(daten.message || daten.error);

  ladeUebersicht();
}

//Neues Angebot
document.getElementById("btn-neu").addEventListener("click", async () => {
  const inputs = document.querySelectorAll("#neu input");

  await fetch("http://localhost:8080/api/mitarbeiter/uebersicht", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      LEISTUNG: inputs.item(0).value.trim(),
      DAUER: inputs.item(1).value.trim(),
      PREIS: inputs.item(2).value.replace(",", ".").trim(),
      VORNAME: inputs.item(3).value.trim()
    })
  });

  inputs.forEach(input => input.value = "");
  ladeUebersicht();
});




