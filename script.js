// ====================== Player UI Controller ======================
const PlayerUIController = (() => {
  const players = [];

  const createForm = document.querySelector(".create-player");
  const nameInput = document.querySelector(".player-name");
  const avatarInput = document.querySelector("#avatar");
  const preview = document.querySelector("#preview");
  const selectPlayerDropdowns = document.querySelectorAll(
    "aside .select-player select"
  );

  createForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const avatar = avatarInput.value;

    if (!name || !avatar) return; // don’t allow empty fields

    const newPlayer = Player(name, avatar);
    players.push(newPlayer);

    // Clear the form
    nameInput.value = "";
    avatarInput.value = "";
    preview.src = "";
    preview.style.display = "none";

    // Update dropdowns
    updateDropdowns();
  });

  function updateDropdowns() {
    selectPlayerDropdowns.forEach((dropdown) => {
      // Clear old options
      dropdown.innerHTML = "<option value=''>-- Choose Player --</option>";

      // Add all players
      players.forEach((player, index) => {
        const option = document.createElement("option");
        option.value = index; // keep index as value
        option.textContent = player.getName();
        dropdown.appendChild(option);
      });
    });
  }

  // Preview avatar image when selected
  const select = document.getElementById("avatar");
  select.addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue) {
      preview.src = selectedValue;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  });

  return {
    getPlayers: () => [...players], // expose copy if needed
  };
})();

// ====================== Game Board Module ======================
const GameBoard = (() => {
  const board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => [...board];

  const placeMark = function (index, marker) {
    if (!board[index]) {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const resetBoard = () => {
    for (let index = 0; index < board.length; index++) {
      board[index] = "";
    }
  };

  const isTie = () => {
    return !board.includes("") && !checkWinner();
  };

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  const checkWinner = () => {
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  return { getBoard, placeMark, resetBoard, checkWinner, isTie };
})();

// ====================== Player Factory ======================
const Player = (name, avatar) => {
  let wins = 0;
  let losses = 0;
  let streak = 0;
  let marker = null; // assigned later

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
  };
};

// ====================== Game Controller ======================
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

// ====================== Display Controller ======================
const DisplayController = (() => {
  const cellButtons = document.querySelectorAll(".cell-btn");
  const message = document.querySelector("#message");
  const startBtn = document.querySelector("#start");
  const player1Dropdown = document.querySelector(".player1 select");
  const player2Dropdown = document.querySelector(".player2 select");
  const leftPanel = document.querySelector(".player-panel.left");
  const rightPanel = document.querySelector(".player-panel.right");

  message.textContent = "Press Start to begin";

  // Attach listeners once for board cells
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

  // Start new game
  startBtn.addEventListener("click", () => {
    const players = PlayerUIController.getPlayers();
    const p1Index = parseInt(player1Dropdown.value, 10);
    const p2Index = parseInt(player2Dropdown.value, 10);

    let p1 = players[p1Index] || Player("Player1", "avatar1.gif");
    let p2 = players[p2Index] || Player("Player2", "avatar2.gif");

    GameController.setPlayers(p1, p2);

    const leftName = leftPanel.querySelector(".player-name");
    const leftAvatar = leftPanel.querySelector(".avatar");
    const leftStats = leftPanel.querySelector(".stats");

    const rightName = rightPanel.querySelector(".player-name");
    const rightAvatar = rightPanel.querySelector(".avatar");
    const rightStats = rightPanel.querySelector(".stats");

    leftName.textContent = p1.getName();
    leftAvatar.src = p1.getAvatar();
    leftStats.textContent = `Wins: ${p1.getStats().wins} | Losses: ${
      p1.getStats().losses
    } | Streak: ${p1.getStats().streak}`;

    rightName.textContent = p2.getName();
    rightAvatar.src = p2.getAvatar();
    rightStats.textContent = `Wins: ${p2.getStats().wins} | Losses: ${
      p2.getStats().losses
    } | Streak: ${p2.getStats().streak}`;

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

DisplayController();
