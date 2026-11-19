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

ladeUebersicht();

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

// Verfügbare Tage laden
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

    btn.addEventListener("click", () => zeigeUhrzeiten(termine, datum, mitarbeiterName, leistungId, mitarbeiterId));
    container.appendChild(btn);
  });
}

// Uhrzeiten anzeigen
function zeigeUhrzeiten(termine, gewaehlterTag, mitarbeiterName, leistungId, mitarbeiterId) {
  const container = document.getElementById("freeSlots");
  container.innerHTML = `<h3>Freie Zeiten am ${gewaehlterTag} (${mitarbeiterName}):</h3>`;

  const tagesTermine = termine.filter(t => t.datum === gewaehlterTag);

  tagesTermine.forEach(t => {
    t.freieSlots.forEach(uhrzeit => {
      const btn = document.createElement("button");
      btn.className = "t-button";
      btn.textContent = uhrzeit;

      const uhrzeitSauber = uhrzeit.replace(" Uhr", "").trim();
      const slotZeit = new Date(`${gewaehlterTag}T${uhrzeitSauber}`);

      if (uhrzeit.includes("belegt") || slotZeit <= new Date()) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
          zeigeBuchungsformular(t.mitarbeiter, gewaehlterTag, uhrzeit, leistungId, mitarbeiterId);
        });
      }
      container.appendChild(btn);
    });
  });
}

// Buchungsformular anzeigen & vorausfüllen
function zeigeBuchungsformular(mitarbeiterName, datum, uhrzeit, leistungId, mitarbeiterId) {
  const container = document.getElementById("freeSlots");
  container.innerHTML = "<h3>Termin buchen:</h3>";

  const booking = document.createElement("form");

  booking.innerHTML = `
    <p>Mitarbeiter: <input type="text" name="mitarbeiter" value="${mitarbeiterName}" readonly></p>
    <p>Datum: <input type="text" name="datum" value="${datum}" readonly></p>
    <p>Uhrzeit: <input type="text" name="uhrzeit" value="${uhrzeit}" readonly></p>

    <p>Vorname: <input type="text" name="vorname" placeholder="Vorname *" required></p>
    <p>Nachname: <input type="text" name="nachname" placeholder="Nachname *" required></p>
    <p>Telefonnummer: <input type="tel" name="telefon" placeholder="Telefonnummer *" required></p>
    <p>E-Mail: <input type="email" name="email" placeholder="E-Mail (optional)"></p>

    <button type="submit" class="t-button">Verbindlich buchen</button>
  `;

  booking.addEventListener("submit", async (e) => {
    e.preventDefault();

    const terminDaten = {
      leistungId: leistungId,
      mitarbeiterId: mitarbeiterId,
      mitarbeiter: booking.mitarbeiter.value,
      datum: booking.datum.value,
      uhrzeit: booking.uhrzeit.value,
      vorname: booking.vorname.value,
      nachname: booking.nachname.value,
      telefon: booking.telefon.value,
      email: booking.email.value
    };

    await sendTermin(terminDaten);
  });

  container.appendChild(booking);
}

// Termin buchen & speichern
async function sendTermin(terminDaten) {
  const resp = await fetch("http://localhost:8080/api/terminbuchung", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(terminDaten)
  });

  if (!resp.ok) throw new Error("Termin konnte nicht angelegt werden");
  const antwort = await resp.json();

  const termine = JSON.parse(localStorage.getItem("meineTermine")) || [];
  termine.push({
    token: antwort.stornoToken,
    mitarbeiter: terminDaten.mitarbeiter,
    datum: terminDaten.datum,
    uhrzeit: terminDaten.uhrzeit.replace(" Uhr", "").trim()
  });
  localStorage.setItem("meineTermine", JSON.stringify(termine));

  document.getElementById("freeSlots").innerHTML = "<h3>Termin erfolgreich gebucht!</h3>";
  zeigeMeineTermine();
}

// Termin stornieren
async function terminAbsagen(token) {
  const resp = await fetch(`http://localhost:8080/api/terminbuchung/storno/${token}`, {
    method: "DELETE"
  });
  const daten = await resp.json();
  alert(daten.message);

  if (resp.ok) {
    const termine = JSON.parse(localStorage.getItem("meineTermine")) || [];
    const aktualisiert = termine.filter(termin => termin.token !== token);
    localStorage.setItem("meineTermine", JSON.stringify(aktualisiert));
    zeigeMeineTermine();
  }
}

// Alle kommenden Termine anzeigen
function zeigeMeineTermine() {
  document.getElementById("stornoBox")?.remove();

  const termine = JSON.parse(localStorage.getItem("meineTermine")) || [];
  const aktiveTermine = termine.filter(termin => new Date(`${termin.datum}T${termin.uhrzeit}`) > new Date());
  if (aktiveTermine.length === 0) return;

  const box = document.createElement("div");
  box.id = "stornoBox";
  box.innerHTML = "<h3>Ihre gebuchten Termine:</h3>";

  aktiveTermine.forEach(termin => {
    const terminStart = new Date(`${termin.datum}T${termin.uhrzeit}`);
    const stornierbar = (terminStart - new Date()) / (1000 * 60 * 60) > 24;

    const btn = document.createElement("button");
    btn.className = "t-button";
    btn.textContent = `Termin bei ${termin.mitarbeiter} am ${termin.datum} um ${termin.uhrzeit} Uhr` + (stornierbar ? " (Klick zum Stornieren)" : "");

    if (stornierbar) {
      btn.addEventListener("click", () => terminAbsagen(termin.token));
    } else {
      btn.disabled = true;
    }

    box.appendChild(btn);
  });

  document.body.appendChild(box);
}

zeigeMeineTermine();