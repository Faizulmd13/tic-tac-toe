// const players = {
//   player1: { name: "", value: 1 },
//   player2: { name: "", value: 2 },
// };

// const initiateBoard = () => {
//   for (let index = 0; index < board.length; index++) {
//     board[index] = 0;
//   }
// };

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

const Player = (name, marker) => {
  const getName = () => name;
  const getMarker = () => marker;

  return { getName, getMarker };
};

const GameController = (() => {
  const playerOne = Player("Faizul", "X");
  const playerTwo = Player("Kishore", "O");

  //   const firstPlayer = () => {
  //     if (playerOne.getMarker() === "X") {
  //       return playerOne;
  //     } else {
  //       return playerTwo;
  //     }
  //   };

  let currentPlayer = playerOne;

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

  return { playRound, getCurrentPlayer, reset: GameBoard.resetBoard };
})();

const DisplayController = () => {
  const cellButtons = document.querySelectorAll(".cell-btn");
  const message = document.querySelector("#message");
  const reset = document.querySelector("#reset");
  const start = document.querySelector("#start");

  // Attach listeners once
  cellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const playerMove = GameController.playRound(button.dataset.index);

      switch (playerMove.status) {
        case "invalid":
          message.textContent = playerMove.message; // "Cell already taken!"
          break;

        case "win":
          button.textContent = playerMove.marker;
          button.disabled = true;
          message.textContent = playerMove.message; // "X wins!"
          cellButtons.forEach((btn) => (btn.disabled = true)); // disable all
          break;

        case "tie":
          button.textContent = playerMove.marker;
          button.disabled = true;
          message.textContent = playerMove.message; // "It's a tie!"
          cellButtons.forEach((btn) => (btn.disabled = true));
          break;

        case "next":
          button.textContent = playerMove.marker;
          button.disabled = true;
          message.textContent = `${playerMove.player.getName()}'s Move`;
          break;
      }
    });
  });

  // Reset game
  reset.addEventListener("click", () => {
    GameBoard.resetBoard();
    cellButtons.forEach((btn) => {
      btn.textContent = "";
      btn.disabled = false;
    });
    message.textContent = "Game reset.";
  });
};

DisplayController();
