const resp = await fetch("http://localhost:8080/api/mitarbeiter")
const mitarbeiter = await resp.json()

console.log(mitarbeiter);

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


