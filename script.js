document.addEventListener("DOMContentLoaded", () => {
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
  const editorTableBody = document.querySelector("#editorTable tbody");

  const selectedSongHeading = document.createElement("h3");
  selectedSongHeading.id = "selectedSongHeading";
  reservationForm.prepend(selectedSongHeading);

  let maxPrenotazioni = 25;
  let prenotazioni = [];
  let canzoni = ["Wonderwall", "Zombie", "Bohemian Rhapsody", "Azzurro"];
  let selectedSong = null;
  let editorMode = false;
  let branoCorrente = 0;

  function updateCurrentSongIndexDisplay() {
    currentSongInput.value = branoCorrente;
  }

  function renderSongs() {
    songList.innerHTML = "";

    if (editorMode) {
      infoSection.classList.add("hidden");
      frontSign.classList.add("hidden");
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
          selectedSong = song;
          selectedSongHeading.textContent = `Stai prenotando: ${song}`;
          songSection.classList.add("hidden");
          frontSign.classList.add("hidden");
          reservationForm.classList.remove("hidden");

        });
      }

      li.appendChild(button);
      songList.appendChild(li);
    });
  }

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
      

      row.appendChild(indexCell);
      row.appendChild(songCell);
      row.appendChild(userCell);
      

      editorTableBody.appendChild(row);
    });
  }

  addSongBtn.addEventListener("click", () => {
    const newSong = newSongInput.value.trim();
    if (newSong && !canzoni.includes(newSong)) {
      canzoni.push(newSong);
      newSongInput.value = "";
      renderSongs();
    }
  });

  resetBtn.addEventListener("click", () => {
    prenotazioni = [];
    branoCorrente = 0;
    renderSongs();
    waitingSection.classList.add("hidden");
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
    renderSongs();
  });

  prevSongBtn.addEventListener("click", () => {
    if (branoCorrente > 0) branoCorrente--;
    renderSongs();
  });

  currentSongInput.addEventListener("change", () => {
    const val = parseInt(currentSongInput.value);
    if (!isNaN(val) && val >= 0) {
      branoCorrente = val;
      renderSongs();
    }
  });

  reservationForm.addEventListener("submit", e => {
    e.preventDefault();
    const userName = document.getElementById("userName").value.trim();
    if (!userName || !selectedSong) return;
    prenotazioni.push({ name: userName, song: selectedSong });
    selectedSong = null;
    document.getElementById("userName").value = "";
    showWaitingSection(userName);
  });

  cancelReservation.addEventListener("click", () => {
    selectedSong = null;
    reservationForm.classList.add("hidden");
    songSection.classList.remove("hidden");
  });

  function showWaitingSection(userName) {
    frontSign.classList.add("hidden");
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

          // Riposiziona la canzone nella parte "non prenotata"
          const indexToMove = canzoni.findIndex(c => c === songToRestore);
          if (indexToMove > -1) {
            const song = canzoni.splice(indexToMove, 1)[0];
            canzoni.push(song);
          }

          waitingSection.classList.add("hidden");
          renderSongs();
        }
      };
    } else {
      cancelSlotBtn.disabled = true;
      cancelSlotBtn.classList.add("btn-disabled");
      cancelSlotBtn.onclick = null;
    }
  }

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

    document.getElementById("resetBtn").addEventListener("click", () => {
    const conferma = confirm("Sei sicuro di voler resettare tutte le prenotazioni?");
    if (conferma) {
      alert("Prenotazioni resettate.");
      location.editorMode(); // ricarica semplice come placeholder
    }
  });

  renderSongs();
});
