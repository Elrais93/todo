const BIN_ID = "687d55b6fdac391a2ff0fdd9";
const API_KEY = "$2a$10$O5ziGvcBKlunu.dj8NfqWumAgm6UGi8uyTPPEzPTqsaOWFr/CVHfq";
let loggedUser = null;
let dbData = {};

const login = async () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const utenti = {
    "Andrea": "p@ssw0rdA!",
    "Mauro": "p@ssw0rdM?"
  };

  if (utenti[user] === pass) {
    loggedUser = user;
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "block";
    document.getElementById("welcomeUser").innerText = `Benvenuto, ${user}`;
    await loadData();
    renderNotai();
  } else {
    document.getElementById("loginError").innerText = "Credenziali errate";
  }
};

const logout = () => {
  location.reload();
};

const loadData = async () => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { "X-Master-Key": API_KEY }
  });
  const json = await res.json();
  dbData = json.record;
};

const saveData = async () => {
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(dbData)
  });
};

const renderNotai = () => {
  const container = document.getElementById("notaiList");
  container.innerHTML = "";

  Object.entries(dbData.notai).forEach(([nomeNotaio, sezioni]) => {
    const div = document.createElement("div");
    div.className = "notaio";
    div.innerHTML = `<h3>${nomeNotaio}</h3>`;
    
    ["hardware", "software"].forEach(sezione => {
      const sDiv = document.createElement("div");
      sDiv.className = "sezione";
      sDiv.innerHTML = `<strong>${sezione.toUpperCase()}</strong><ul id="${nomeNotaio}-${sezione}"></ul>
        <input type="text" id="input-${nomeNotaio}-${sezione}" placeholder="Nuova attività..." />
        <button onclick="addTask('${nomeNotaio}', '${sezione}')">Aggiungi</button>`;
      
      sezioni[sezione].forEach((task, i) => {
        const li = document.createElement("li");
        li.className = task.completata ? "completed" : "";
        li.innerHTML = `
          <input type="checkbox" onchange="toggleTask('${nomeNotaio}', '${sezione}', ${i})" ${task.completata ? "checked" : ""} />
          ${task.attività}
          <span class="taskInfo"> – ${task.autore}</span>
          <button onclick="deleteTask('${nomeNotaio}', '${sezione}', ${i})">❌</button>
        `;
        sDiv.querySelector("ul").appendChild(li);
      });

      div.appendChild(sDiv);
    });

    container.appendChild(div);
  });
};

const addNotaio = async () => {
  const nome = document.getElementById("newNotaioName").value.trim();
  if (!nome || dbData.notai[nome]) return;
  dbData.notai[nome] = { hardware: [], software: [] };
  await saveData();
  renderNotai();
};

const addTask = async (notaio, sezione) => {
  const input = document.getElementById(`input-${notaio}-${sezione}`);
  const testo = input.value.trim();
  if (!testo) return;
  dbData.notai[notaio][sezione].push({
    attività: testo,
    completata: false,
    autore: loggedUser
  });
  input.value = "";
  await saveData();
  renderNotai();
};

const toggleTask = async (notaio, sezione, index) => {
  const task = dbData.notai[notaio][sezione][index];
  task.completata = !task.completata;
  await saveData();
  renderNotai();
};

const deleteTask = async (notaio, sezione, index) => {
  dbData.notai[notaio][sezione].splice(index, 1);
  await saveData();
  renderNotai();
};
