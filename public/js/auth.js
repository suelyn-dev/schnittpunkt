// Passowrteingabe
const passwortFeld = document.querySelector(".passwort-feld");
const passwortButton = document.querySelector(".passwort-button");
const anzeigenIcon = document.querySelector(".passwort-anzeigen-icon");
const versteckenIcon = document.querySelector(".passwort-verstecken-icon");

passwortButton.addEventListener("click", () => {
  const istVersteckt = passwortFeld.type === "password";

  passwortFeld.type = istVersteckt ? "text" : "password";
  anzeigenIcon.style.display = istVersteckt ? "none" : "inline-block";
  versteckenIcon.style.display = istVersteckt ? "inline-block" : "none";
});

// Funktion: Passwort ans Backend
async function sendPassword(password) {
  const resp = await fetch("http://localhost:8080/api/passwortcheck", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  const antwort = await resp.json();

  if (!resp.ok) {
    alert(antwort.message); 
    return;
  }

  window.location.href = "/intern.html";
}

//Passworteingabe abrufen und in Funktion
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await sendPassword(passwortFeld.value);
});