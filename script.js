const players = {
  player1: { name: "", value: 1 },
  player2: { name: "", value: 2 },
};

const initiateBoard = () => {
  for (let index = 0; index < board.length; index++) {
    board[index] = 0;
  }
};

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

  return { getBoard, placeMark, resetBoard };
})();
