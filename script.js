
//script.js

// IMPORTA Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// CONFIGURAZIONE
const firebaseConfig = {
  apiKey: "AIzaSyAbiGcVbznmRf0m-xPlIAtIkAQqMaCVHDk",
  authDomain: "karaoke-live.firebaseapp.com",
  databaseURL: "https://karaoke-live-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "karaoke-live",
  storageBucket: "karaoke-live.firebasestorage.app",
  messagingSenderId: "268291410744",
  appId: "1:268291410744:web:4cb66c45d586510b440fcd"
};

// INIZIALIZZA FIREBASE
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// REFERENZE AI DATI
const songsRef = ref(db, 'songs');
const reservationsRef = ref(db, 'reservations');
const configRef = ref(db, 'config');


document.addEventListener("DOMContentLoaded", () =>  {


  //implemento di firebase

  
  



  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");
  const loginEditor = document.getElementById("loginEditor");

  const reservationForm = document.getElementById("reservationForm");
  const songSection = document.getElementById("songSection");
  const songList = document.getElementById("songList");
  const cancelReservation = document.getElementById("cancelReservation");
  const infoSection = document.getElementById("infoSection");
  const frontSign = document.getElementById("prenotaLaTuaCanzone")
  const maxReached = document.getElementById("maxReached");

  const waitingSection = document.getElementById("waitingSection");
  const waitingMsg = document.getElementById("waitingMsg");
  const cancelSlotBtn = document.getElementById("cancelSlotBtn");

  const editorPanel = document.getElementById("editorPanel");
  const newSongInput = document.getElementById("newSongInput");
  const addSongBtn = document.getElementById("addSongBtn");
  const editableSongList = document.getElementById("editableSongList");
  const resetBtn = document.getElementById("resetBtn");
  const downloadCSVBtn = document.getElementById("downloadCSVBtn");

  const currentSongInput = document.getElementById("currentSongInput");
  const nextSongBtn = document.getElementById("nextSongBtn");
  const prevSongBtn = document.getElementById("prevSongBtn");
  const annullaLimiteInput = document.getElementById("annullaLimite");
  const maxPrenotazioniInput = document.getElementById("maxPrenotazioniInput");
  const editorTableBody = document.querySelector("#editorTable tbody");

 //cost search and filter bar
  const searchBar = document.getElementById("filterBars")
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");




  const selectedSongHeading = document.createElement("h3");
  selectedSongHeading.id = "selectedSongHeading";
  reservationForm.prepend(selectedSongHeading);

  let maxPrenotazioni = 25;
  let prenotazioni = [];
  
  let canzoni = JSON.parse(localStorage.getItem("canzoni")) || ["Wonderwall - Oasis", "Zombie - The Cranberries", "Bohemian Rhapsody - Queen", "Azzurro - Adriano Celentano"];
  let selectedSong = null;
  let editorMode = false;
  let branoCorrente = 0;
  //let reservations = JSON.parse(localStorage.getItem("reservations")) || {};
 
   /*  set(songsRef, [
       "Wonderwall - Oasis",
       "Zombie - The Cranberries",
       "Bohemian Rhapsody - Queen",
       "Azzurro - Adriano Celentano"
     ]);*/
     

  // DATI DA FIREBASE


     onValue(songsRef, snapshot => {
      if (snapshot.exists()) {
        canzoni = snapshot.val();
      } else {
        canzoni = [
          "Wonderwall - Oasis",
          "Zombie - The Cranberries",
          "Bohemian Rhapsody - Queen",
          "Azzurro - Adriano Celentano"
        ];
        set(songsRef, canzoni); // salva solo se vuoto
      }
      renderSongs();
     });
     
     


    onValue(reservationsRef, snapshot => {
       prenotazioni = snapshot.exists() ? snapshot.val() : [];
       renderSongs();
    });

     
     onValue(configRef, snapshot => {
  if (snapshot.exists()) {
    const config = snapshot.val();
    maxPrenotazioni = config.maxPrenotazioni || 25;
    branoCorrente = config.branoCorrente || 0;
    annullaLimiteInput.value = config.annullaLimite || 0;
    maxPrenotazioniInput.value = maxPrenotazioni;
    updateCurrentSongIndexDisplay();
    updateWaitingMsg();
  }
});
onValue(reservationsRef, snapshot => {
  prenotazioni = snapshot.exists() ? snapshot.val() : [];
  renderSongs();
  updateWaitingMsg();
});

     maxPrenotazioniInput.addEventListener("change", () => {
  save();
});




 

  function updateCurrentSongIndexDisplay() {
    currentSongInput.value = branoCorrente;
  }


function save() {
    const annullaLimite = parseInt(annullaLimiteInput.value) || 0;
    maxPrenotazioni = parseInt(maxPrenotazioniInput.value) || 25;
  set(songsRef, canzoni);
  set(reservationsRef, prenotazioni);
  set(configRef, {
  maxPrenotazioni,
  branoCorrente,
  annullaLimite
});
  
}




 /*function renderSongs() {
    songList.innerHTML = "";
    const search = searchInput.value.toLowerCase();

    if (editorMode) {
      infoSection.classList.add("hidden");
      frontSign.classList.add("hidden");
      searchBar.classList.add("hidden")
      songSection.classList.add("hidden");
      waitingSection.classList.add("hidden");
      editorPanel.classList.remove("hidden");
      renderEditorList();
    } else {
      infoSection.classList.remove("hidden");
      editorPanel.classList.add("hidden");
    }

    if (prenotazioni.length >= maxPrenotazioni) {
      songSection.classList.add("hidden");
      frontSign.classList.add("hidden");
      searchBar.classList.add("hidden")
      reservationForm.classList.add("hidden");
      maxReached.classList.remove("hidden");
      return;
    }



    //songSection.classList.remove("hidden");
    maxReached.classList.add("hidden");

      canzoni.forEach(song => {
      const li = document.createElement("li");
      li.textContent = song;
      const prenotato = prenotazioni.find(p => p.song === song);
      const button = document.createElement("button");

      if (prenotato) {
        button.textContent = "Prenotato";
        button.disabled = true;
        button.classList.add("btn-secondary");
      } else {
        button.textContent = "Prenota";
        button.classList.add("btn");
        button.addEventListener("click", () => {
          frontSign.classList.add("hidden");
          searchBar.classList.add("hidden")
          selectedSong = song;
          selectedSongHeading.textContent = `Stai prenotando: ${song}`;
          songSection.classList.add("hidden");
          reservationForm.classList.remove("hidden");

        });
      }

      li.appendChild(button);
      songList.appendChild(li);
    });
  }*/

// Search & Filter Integration
function renderSongs() {
  songList.innerHTML = "";
  const search = searchInput.value.toLowerCase();

  if (editorMode) {
    infoSection.classList.add("hidden");
    frontSign.classList.add("hidden");
    searchBar.classList.add("hidden");
    songSection.classList.add("hidden");
    waitingSection.classList.add("hidden");
    editorPanel.classList.remove("hidden");
    renderEditorList();
    return;
  } else {
    infoSection.classList.remove("hidden");
    editorPanel.classList.add("hidden");
  }

  if (prenotazioni.length >= maxPrenotazioni) {
    songSection.classList.add("hidden");
    frontSign.classList.add("hidden");
    searchBar.classList.add("hidden");
    reservationForm.classList.add("hidden");
    maxReached.classList.remove("hidden");
    return;
  }

  maxReached.classList.add("hidden");
  songSection.classList.remove("hidden");
  searchBar.classList.remove("hidden");
  frontSign.classList.remove("hidden");

  const sorted = [...canzoni].sort((a, b) => {
    const [aTitle, aArtist] = a.split(" - ");
    const [bTitle, bArtist] = b.split(" - ");
    if (sortSelect.value === "title") return aTitle.localeCompare(bTitle);
    if (sortSelect.value === "artist") return aArtist.localeCompare(bArtist);
    return 0;
  });

  let count = 0;
  for (const song of sorted) {
    if (!song.toLowerCase().includes(search)) continue;
    count++;
    const li = document.createElement("li");
    li.textContent = song;

    const prenotato = prenotazioni.find(p => p.song === song);
    const button = document.createElement("button");

    if (prenotato) {
      button.textContent = "Prenotato";
      button.disabled = true;
      button.classList.add("btn-secondary");
    } else {
      button.textContent = "Prenota";
      button.classList.add("btn");
      button.addEventListener("click", () => {
        frontSign.classList.add("hidden");
        searchBar.classList.add("hidden");
        selectedSong = song;
        selectedSongHeading.textContent = `Stai prenotando: ${song}`;
        songSection.classList.add("hidden");
        reservationForm.classList.remove("hidden");
      });
    }

    li.appendChild(button);
    songList.appendChild(li);
  }

  if (count === 0) {
    const li = document.createElement("li");
    li.textContent = "Ci scusiamo, ma il brano non è presente nella scaletta.";
    songList.appendChild(li);
  }
}

sortSelect.addEventListener("change", renderSongs);
searchInput.addEventListener("input", renderSongs);




  function renderEditorList() {
    editableSongList.innerHTML = "";

    // Ordina le canzoni: prenotate prima, non prenotate dopo
    const prenotate = prenotazioni.map(p => p.song);
    const nonPrenotate = canzoni.filter(song => !prenotate.includes(song));
    canzoni = prenotate.concat(nonPrenotate).filter((v, i, a) => a.indexOf(v) === i);

    canzoni.forEach((song, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${index + 1}.</strong> ${song}`;
      editableSongList.appendChild(li);
    });

    renderEditorTable();
    updateCurrentSongIndexDisplay();
  }

  function renderEditorTable() {
  editorTableBody.innerHTML = "";
  canzoni.forEach((song, index) => {
    const row = document.createElement('tr');

    const indexCell = document.createElement("td");
    indexCell.textContent = index + 1;

    const songCell = document.createElement("td");
    songCell.textContent = song;

    const userCell = document.createElement("td");
    const user = prenotazioni.find(p => p.song === song);
    userCell.textContent = user ? user.name : "";

    const removeCell = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.classList.add("btn", "btn-secondary");
    removeBtn.style.padding = "2px 8px";
    removeBtn.addEventListener("click", () => {
      if (confirm(`Rimuovere "${song}" dalla scaletta?`)) {
        canzoni.splice(index, 1);
        save();
        renderSongs();
      }
    });
    removeCell.appendChild(removeBtn);

    row.appendChild(indexCell);
    row.appendChild(songCell);
    row.appendChild(userCell);
    row.appendChild(removeCell);

    editorTableBody.appendChild(row);
  });
}

  /*function renderEditorTable() {
    editorTableBody.innerHTML = "";
    canzoni.forEach((song, index) => {
      
      const row = document.createElement('tr');
      

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1;

      const songCell = document.createElement("td");
      songCell.textContent = song;

      const userCell = document.createElement("td");
      const user = prenotazioni.find(p => p.song === song);
      userCell.textContent = user ? user.name : "";
      

      row.appendChild(indexCell);
      row.appendChild(songCell);
      row.appendChild(userCell);
      

      editorTableBody.appendChild(row);
    });
  }*/

  addSongBtn.addEventListener("click", () => {
    const newSong = newSongInput.value.trim();
    if (newSong && !canzoni.includes(newSong)) {
      canzoni.push(newSong);
      save();
      newSongInput.value = "";
      renderSongs();
    }
  });

resetBtn.addEventListener("click", () => {
  const conferma = confirm("Sei sicuro di voler resettare tutte le prenotazioni?");
  if (conferma) {
    prenotazioni = [];
    branoCorrente = 0;
    save();
    renderSongs();
    waitingSection.classList.add("hidden");
    alert("Prenotazioni resettate.");
  }
});

  downloadCSVBtn.addEventListener("click", () => {
    const rows = [["Nome", "Brano"]];
    prenotazioni.forEach(p => rows.push([p.name, p.song]));
    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prenotazioni.csv";
    a.click();
    URL.revokeObjectURL(url);
    
  });

  new Sortable(editableSongList, {
    animation: 150,
    onEnd: () => {
      const updated = Array.from(editableSongList.children).map(li => {
        const raw = li.textContent.trim();
        return raw.replace(/^\d+\.\s*/, ""); // rimuove index numerico
      });
      canzoni = updated;
      renderSongs();
    }
  });

  nextSongBtn.addEventListener("click", () => {
    branoCorrente++;
    save();
    renderSongs();
  });

  prevSongBtn.addEventListener("click", () => {
    if (branoCorrente > 0) branoCorrente--;
    save();
    renderSongs();
  });

  currentSongInput.addEventListener("change", () => {
    const val = parseInt(currentSongInput.value);
    if (!isNaN(val) && val >= 0) {
      branoCorrente = val;
      save();
      renderSongs();
    }
  });


  reservationForm.addEventListener("submit", e => {
    e.preventDefault();
    const userName = document.getElementById("userName").value.trim();
    if (!userName || !selectedSong) return;

    if (prenotazioni.length >= maxPrenotazioni) {
    alert("Limite massimo di prenotazioni raggiunto!");
    return;
  }
    prenotazioni.push({ name: userName, song: selectedSong });
    save();
    selectedSong = null;
    document.getElementById("userName").value = "";
    showWaitingSection(userName);
  });

  cancelReservation.addEventListener("click", () => {
    selectedSong = null;
    location.reload();
  });

  let currentUserName = null;
function showWaitingSection(userName) {
  currentUserName = userName;
  updateWaitingMsg();
  frontSign.classList.add("hidden");
  searchBar.classList.add("hidden");
  reservationForm.classList.add("hidden");
  songSection.classList.add("hidden");
  maxReached.classList.add("hidden");
  infoSection.classList.add("hidden");
  waitingSection.classList.remove("hidden");
}

function updateWaitingMsg() {
  if (!currentUserName) return;
  const user = prenotazioni.find(p => p.name === currentUserName);
  const pos = prenotazioni.findIndex(p => p.name === currentUserName);
  const diff = pos - branoCorrente;

  if (!user) return;

  const song = user.song;
  waitingMsg.innerHTML = `<strong>Preparati a cantare:</strong> ${song}<br>`;

  if (diff > 1) {
    waitingMsg.innerHTML += `Mancano ${diff} brani al tuo turno.`;
  } else if (diff === 1) {
    waitingMsg.innerHTML += `Manca 1 brano al tuo turno. Preparati!`;
  } else if (diff === 0) {
    waitingMsg.innerHTML += `✨ È il tuo turno! ✨`;
  } else {
    waitingMsg.innerHTML += `Hai già cantato!`;
    setTimeout(() => location.reload(), 3000);
  }
}

  /*function showWaitingSection(userName) {
    frontSign.classList.add("hidden");
    searchBar.classList.add("hidden")
    reservationForm.classList.add("hidden");
    songSection.classList.add("hidden");
    maxReached.classList.add("hidden");
    infoSection.classList.add("hidden");
    waitingSection.classList.remove("hidden");

    const user = prenotazioni.find(p => p.name === userName);
    const pos = prenotazioni.findIndex(p => p.name === userName);
    const diff = pos - branoCorrente;

    if (diff > 1) {
      waitingMsg.textContent = `Mancano ${diff} brani al tuo turno.`;
    } else if (diff === 1) {
      waitingMsg.textContent = "Manca 1 brano al tuo turno. Preparati!";
    } else {
      waitingMsg.textContent = "È il tuo turno!";
    }

  

    const limite = parseInt(annullaLimiteInput.value) || 0;
    if (diff >= limite) {
      cancelSlotBtn.disabled = false;
      cancelSlotBtn.classList.remove("btn-disabled");
      cancelSlotBtn.onclick = () => {
        const i = prenotazioni.findIndex(p => p.name === userName);
        if (i >= 0) {
          const songToRestore = prenotazioni[i].song;
          prenotazioni.splice(i, 1);
          save();


          // Riposiziona la canzone nella parte "non prenotata"
          const indexToMove = canzoni.findIndex(c => c === songToRestore);
          if (indexToMove > -1) {
            const song = canzoni.splice(indexToMove, 1)[0];
            canzoni.push(song);
          }

          waitingSection.classList.add("hidden");
          location.reload();
        }
      };
    } else {
      cancelSlotBtn.disabled = true;
      cancelSlotBtn.classList.add("btn-disabled");
      cancelSlotBtn.onclick = null;
    }
  }*/

  
  annullaLimiteInput.addEventListener("change", () => {
      save(); // ogni volta che l’input cambia, salva la nuova config
    });

    

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("visible");
  });

  closeMenu.addEventListener("click", () => {
    sideMenu.classList.remove("visible");
  });

  loginEditor.addEventListener("click", () => {
    const pwd = prompt("Password editor:");
    if (pwd === "1") {
      editorMode = true;
      alert("Modalità editor attivata");
      sideMenu.classList.remove("visible");
      editorPanel.classList.remove("hidden");
      songSection.classList.add("hidden");
      infoSection.classList.add("hidden");
      renderSongs();
    } else {
      alert("Password errata");
    }
  });

    document.querySelector("header h1").addEventListener("click", () => {
    location.reload();
  });

    /*document.getElementById("resetBtn").addEventListener("click", () => {
    const conferma = confirm("Sei sicuro di voler resettare tutte le prenotazioni?");
    if (conferma) {
      alert("Prenotazioni resettate.");
      location.editorMode(); // ricarica semplice come placeholder
    }
  });*/

  renderSongs();
  
});