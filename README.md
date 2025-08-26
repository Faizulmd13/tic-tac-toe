# Tic Tac Toe

A modern, interactive **Tic Tac Toe** web game built using **HTML, CSS, and JavaScript**. This project demonstrates the use of **Factory Functions** and **Immediately Invoked Function Expressions (IIFE)** to structure code in a modular and maintainable way.

This project is part of the top curriculum assignment to practice **JavaScript design patterns** like modular code organization and object creation.

---

## Live Demo

Check out the live version on GitHub Pages: [Faizulmd13/tic-tac-toe](https://Faizulmd13.github.io/tic-tac-toe/)

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Code Concepts](#code-concepts)
  - [Factory Function](#factory-function)
  - [IIFE (Immediately Invoked Function Expression)](#iife-immediately-invoked-function-expression)
- [How to Play](#how-to-play)
- [Future Updates](#future-updates)
- [License](#license)

---

## Features

- Create custom players with **names and avatars**.
- Select players from a dropdown menu before starting a game.
- Display current player with **active highlights**.
- Track **wins, losses, and winning streaks** for each player.
- Game detects **wins, ties, and invalid moves**.
- Responsive and visually appealing design with **hover effects and animations**.
- Data persistence using **localStorage**.

---

## Technologies Used

- **HTML5** – Game structure and elements
- **CSS3 / Flexbox & Grid** – Styling, layout, and responsiveness
- **JavaScript ES6** – Logic, event handling, and modular patterns

---

## Project Structure

```
tic-tac-toe/
│
├─ index.html           # Main HTML file
├─ style.css            # Stylesheet for layout and design
├─ script.js            # JavaScript logic for game, players, UI
├─ GIFS/                # Avatar images (Goku, Vegeta, Luffy)
└─ README.md            # Project documentation
```

---

## Code Concepts

### Factory Function

The project uses **Factory Functions** to create player objects with encapsulated data:

```javascript
const Player = (name, avatar) => {
  let wins = 0,
    losses = 0,
    streak = 0,
    marker = null;
  return {
    getName: () => name,
    getAvatar: () => avatar,
    getMarker: () => marker,
    setMarker: (value) => (marker = value),
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
    _restoreStats: (w, l, s) => {
      wins = w;
      losses = l;
      streak = s;
    },
  };
};
```

- Encapsulates each player’s **name, avatar, marker, and stats**.
- Provides methods to **update wins, losses, streaks**, and serialize data for storage.

---

### IIFE (Immediately Invoked Function Expression)

**IIFE** is used to encapsulate modules and avoid polluting the global namespace:

```javascript
const PlayerUIController = (() => {
  let players = loadPlayers();

  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const btnNewPlayer = document.querySelector(".btn-new-player");

  btnNewPlayer.addEventListener("click", () => {
    modal.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  return {
    getPlayers: () => [...players],
  };
})();
```

- The **PlayerUIController** module manages the UI for creating and selecting players.
- Using IIFE ensures that variables like `players`, `modal`, and event listeners remain **private**.
- Other modules like `GameBoard`, `GameController`, and `DisplayController` are also implemented as **IIFEs** for modularity.

---

## How to Play

1. Click **New Player** to create players with names and avatars.
2. Select two different players from the dropdown menus.
3. Click **Start** to begin the game.
4. Players take turns placing their markers (`X` or `O`) on the board.
5. The game detects wins, ties, and updates player stats automatically.
6. Player stats persist between sessions using **localStorage**.

---

## Future Updates

- Add **ghost hover effect** to show where a marker will be placed before clicking.
- Include **more avatar GIFs** for greater player customization.

---

## License

This project is **free to use and modify** for educational purposes.
