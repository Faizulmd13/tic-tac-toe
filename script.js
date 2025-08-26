// --------------------- Player factory ---------------------
const Player = (name, avatar) => {
  let wins = 0;
  let losses = 0;
  let streak = 0;
  let marker = null;

  return {
    getName: () => name,
    getAvatar: () => avatar,
    getMarker: () => marker,
    setMarker: (value) => {
      marker = value;
    },
    getStats: () => ({ wins, losses, streak }),
    recordWin: () => {
      wins++;
      streak++;
    },
    recordLoss: () => {
      losses++;
      streak = 0;
    },
    serialize: () => ({ name, avatar, wins, losses, streak, marker }),
    _restoreStats: (savedWins, savedLosses, savedStreak) => {
      wins = savedWins;
      losses = savedLosses;
      streak = savedStreak;
    },
  };
};

// --------------------- Player UI Controller ---------------------
const PlayerUIController = (() => {
  let players = loadPlayers();
  if (players.length === 0) {
    players = [
      Player("Player1", "./GIFS/Goku.gif"),
      Player("Player2", "./GIFS/Vegeta.gif"),
    ];
  }

  const modal = document.querySelector(".modal");
  const createForm = modal.querySelector(".form-create-player");
  const nameInput = createForm.querySelector(".input-player-name");
  const avatarSelect = createForm.querySelector("#selectAvatar");
  const preview = createForm.querySelector("#avatarPreview");

  const selectPlayerDropdowns = document.querySelectorAll(
    ".player-selects .select-player"
  );
  const btnNewPlayer = document.querySelector(".btn-new-player");
  const overlay = document.querySelector(".overlay");

  // open new player modal
  btnNewPlayer.addEventListener("click", () => {
    modal.classList.toggle("active");
    overlay.classList.toggle("active");
    nameInput.focus();
  });

  // close modal when clicking overlay
  overlay.addEventListener("click", () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
  });

  // handle player creation
  createForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const avatar = avatarSelect.value;
    if (!name || !avatar) return;

    const createdPlayer = Player(name, avatar);
    players.push(createdPlayer);

    updateDropdowns();
    createForm.reset();
    preview.style.display = "none";
    modal.classList.remove("active");
    overlay.classList.remove("active");
    savePlayers(players);
  });

  // refresh options in all dropdowns
  function updateDropdowns() {
    selectPlayerDropdowns.forEach((dropdown) => {
      dropdown.innerHTML = "<option value=''>-- Choose Player --</option>";
      players.forEach((player, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = player.getName();
        dropdown.appendChild(option);
      });
    });
  }

  updateDropdowns();

  // avatar preview in modal
  avatarSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue) {
      preview.src = selectedValue;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
      preview.src = "";
    }
  });

  return {
    getPlayers: () => [...players],
  };
})();

// --------------------- Persistence ---------------------
function savePlayers(players) {
  const serialized = players.map((p) => p.serialize());
  localStorage.setItem("players", JSON.stringify(serialized));
}

function loadPlayers() {
  const stored = localStorage.getItem("players");
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.map((p) => {
      const newPlayer = Player(p.name, p.avatar);
      if (p.wins !== undefined)
        newPlayer._restoreStats(p.wins, p.losses, p.streak);
      return newPlayer;
    });
  }
  return [];
}

// --------------------- Game Board Module ---------------------
const GameBoard = (() => {
  const board = Array(9).fill("");

  const getBoard = () => [...board];

  const placeMark = (index, marker) => {
    if (!board[index]) {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const resetBoard = () => {
    for (let i = 0; i < board.length; i++) board[i] = "";
  };

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = () => {
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        return board[a];
    }
    return null;
  };

  const isTie = () => !board.includes("") && !checkWinner();

  return { getBoard, placeMark, resetBoard, checkWinner, isTie };
})();

// --------------------- Game Controller ---------------------
const GameController = (() => {
  let playerOne = null;
  let playerTwo = null;
  let currentPlayer = null;

  const setPlayers = (p1, p2) => {
    playerOne = p1;
    playerTwo = p2;
    playerOne.setMarker("X");
    playerTwo.setMarker("O");
    currentPlayer = playerOne;
  };

  const switchTurn = () => {
    currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
  };

  const playRound = (index) => {
    if (GameBoard.placeMark(index, currentPlayer.getMarker())) {
      const marker = currentPlayer.getMarker();
      const winner = GameBoard.checkWinner();

      if (winner) {
        const winningPlayer =
          winner === playerOne.getMarker() ? playerOne : playerTwo;
        winningPlayer.recordWin();
        const losingPlayer =
          winningPlayer === playerOne ? playerTwo : playerOne;
        losingPlayer.recordLoss();

        savePlayers(PlayerUIController.getPlayers());

        return {
          status: "win",
          marker,
          player: winningPlayer,
          message: `${winningPlayer.getName()} wins!`,
        };
      }

      if (GameBoard.isTie()) {
        return {
          status: "tie",
          marker,
          player: currentPlayer,
          message: "It's a tie!",
        };
      }

      switchTurn();
      return { status: "next", marker, player: getCurrentPlayer() };
    }

    return { status: "invalid", message: "Cell already taken!" };
  };

  const getCurrentPlayer = () => currentPlayer;

  return {
    playRound,
    getCurrentPlayer,
    reset: GameBoard.resetBoard,
    setPlayers,
  };
})();

// --------------------- Display Controller ---------------------
const DisplayController = (() => {
  const cellButtons = document.querySelectorAll(".cell-button");
  const message = document.querySelector("#gameMessage");
  const startBtn = document.querySelector("#btnStart");

  // FIX: match dropdown classes with HTML
  const player1Dropdown = document.querySelector(".select-player-x");
  const player2Dropdown = document.querySelector(".select-player-o");

  const leftPanel = document.querySelector(".player-card.left");
  const rightPanel = document.querySelector(".player-card.right");

  message.textContent = "Press Start to begin";

  cellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const playerMove = GameController.playRound(button.dataset.index);

      switch (playerMove.status) {
        case "invalid":
          message.textContent = playerMove.message;
          break;

        case "win":
        case "tie":
          button.textContent = playerMove.marker;
          button.disabled = true;
          message.textContent = playerMove.message;
          cellButtons.forEach((btn) => (btn.disabled = true));
          break;

        case "next":
          button.textContent = playerMove.marker;
          button.disabled = true;
          message.textContent = `${playerMove.player.getName()}'s Move`;

          if (playerMove.player.getMarker() === "X") {
            leftPanel.classList.add("active");
            rightPanel.classList.remove("active");
          } else {
            rightPanel.classList.add("active");
            leftPanel.classList.remove("active");
          }
          break;
      }
    });
  });

  startBtn.addEventListener("click", () => {
    const players = PlayerUIController.getPlayers();
    const p1Index = parseInt(player1Dropdown.value, 10);
    const p2Index = parseInt(player2Dropdown.value, 10);

    if (isNaN(p1Index) || isNaN(p2Index) || p1Index === p2Index) {
      message.textContent = "Please select two different players.";
      return;
    }

    const p1 = players[p1Index];
    const p2 = players[p2Index];

    GameController.setPlayers(p1, p2);

    // update UI panels
    const leftName = leftPanel.querySelector(".player-name");
    const leftAvatar = leftPanel.querySelector(".player-avatar");
    const leftWins = leftPanel.querySelector(".stat-wins");
    const leftLoss = leftPanel.querySelector(".stat-losses");
    const leftStreak = leftPanel.querySelector(".stat-streak");

    const rightName = rightPanel.querySelector(".player-name");
    const rightAvatar = rightPanel.querySelector(".player-avatar");
    const rightWins = rightPanel.querySelector(".stat-wins");
    const rightLoss = rightPanel.querySelector(".stat-losses");
    const rightStreak = rightPanel.querySelector(".stat-streak");

    leftName.textContent = p1.getName();
    leftAvatar.src = p1.getAvatar();
    leftWins.textContent = `Wins: ${p1.getStats().wins}`;
    leftLoss.textContent = `Losses: ${p1.getStats().losses}`;
    leftStreak.textContent = `Streak: ${p1.getStats().streak}`;

    rightName.textContent = p2.getName();
    rightAvatar.src = p2.getAvatar();
    rightWins.textContent = `Wins: ${p2.getStats().wins}`;
    rightLoss.textContent = `Losses: ${p2.getStats().losses}`;
    rightStreak.textContent = `Streak: ${p2.getStats().streak}`;

    GameBoard.resetBoard();
    cellButtons.forEach((btn) => {
      btn.textContent = "";
      btn.disabled = false;
    });

    leftPanel.classList.add("active");
    rightPanel.classList.remove("active");

    message.textContent = `${p1.getName()} (X) starts the game!`;
  });
})();
