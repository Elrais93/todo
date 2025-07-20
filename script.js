const BIN_ID = "687d17f67f9cfc0f6d150b08";
const MASTER_KEY = "$2a$10$LfpSWnHyxka5Db1sdFyCZuIJvzxxSiFUNTWhFBGC0615h//REHCZy";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
let currentUser = "";

const loginContainer = document.getElementById("login-container");
const app = document.getElementById("app");
const loginError = document.getElementById("login-error");

function login() {
  const user = document.getElementById("username").value.trim().toLowerCase();
  const pass = document.getElementById("password").value.trim().toLowerCase();

  fetch(API_URL + "/latest", {
    headers: { "X-Master-Key": MASTER_KEY }
  })
    .then(res => res.json())
    .then(data => {
      const utenti = data.record.utenti;
      if (utenti[user] && utenti[user].password === pass) {
        currentUser = capitalize(user);
        loginContainer.classList.add("hidden");
        app.classList.remove("hidden");
        loadNotai();
      } else {
        loginError.textContent = "Credenziali non valide.";
        app.classList.add("hidden"); // sicurezza extra
      }
    });
}

function logout() {
  currentUser = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  loginContainer.classList.remove("hidden");
  app.classList.add("hidden");
}

function loadNotai() {
  if (!currentUser) return; // impedisce anche richieste non loggate
  fetch(API_URL + "/latest", {
    headers: { "X-Master-Key": MASTER_KEY }
  })
    .then(res => res.json())
    .then(data => renderNotai(data.record.notai));
}

function renderNotai(notai) {
  const container = document.getElementById("notai-list");
  container.innerHTML = "";
  notai.forEach((notaio, index) => {
    const card = document.createElement("div");
    card.className = "notaio-card";
    card.innerHTML = `
      <h2>${notaio.nome}</h2>
      ${["hardware", "software"].map(tipo => `
        <div>
          <div class="section-title"><strong>${tipo.toUpperCase()}</strong></div>
          <ul>
            ${notaio[tipo].map((t, i) => `
              <li class="task-item">
                <input type="checkbox" ${t.completato ? "checked" : ""} onchange="toggleTask(${index}, '${tipo}', ${i})" />
                <span>${t.nome}</span>
                <small>${t.modificato_da ? `📝 ${t.modificato_da}` : ""}</small>
              </li>
            `).join("")}
          </ul>
          <input type="text" placeholder="Nuova attività" id="new-${tipo}-${index}" />
          <button onclick="addTask(${index}, '${tipo}')">Aggiungi</button>
        </div>
      `).join("")}
    `;
    container.appendChild(card);
  });
}

function addNotaio() {
  const nome = document.getElementById("new-notaio-name").value.trim();
  if (!nome || !currentUser) return;
  fetch(API_URL + "/latest", {
    headers: { "X-Master-Key": MASTER_KEY }
  })
    .then(res => res.json())
    .then(data => {
      data.record.notai.push({
        nome,
        hardware: [],
        software: []
      });
      updateBin(data.record);
    });
}

function addTask(notaioIndex, tipo) {
  const input = document.getElementById(`new-${tipo}-${notaioIndex}`);
  const nome = input.value.trim();
  if (!nome || !currentUser) return;
  fetch(API_URL + "/latest", {
    headers: { "X-Master-Key": MASTER_KEY }
  })
    .then(res => res.json())
    .then(data => {
      data.record.notai[notaioIndex][tipo].push({
        nome,
        completato: false,
        modificato_da: currentUser
      });
      updateBin(data.record);
    });
}

function toggleTask(notaioIndex, tipo, taskIndex) {
  if (!currentUser) return;
  fetch(API_URL + "/latest", {
    headers: { "X-Master-Key": MASTER_KEY }
  })
    .then(res => res.json())
    .then(data => {
      const task = data.record.notai[notaioIndex][tipo][taskIndex];
      task.completato = !task.completato;
      task.modificato_da = currentUser;
      updateBin(data.record);
    });
}

function updateBin(data) {
  fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": MASTER_KEY
    },
    body: JSON.stringify(data)
  }).then(loadNotai);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
