# Battleship Game

A classic Battleship game implementation in vanilla TypeScript with HTML and CSS.

This project was built with the aim of solidifying comprehension of OOP principles, design patterns, DOM manipulation knowledge, and TypeScript skills in general. The game offers interactive gameplay with a graphical user interface.

## Features

- **Animated Ship Placement + Validation:**
 - Hover animation indicates whether a position is valid for ship placement (There must be at least one-cell space between ships).
 - Ships can be placed both vertically and horizontally in any appropriate order.
 - Players can choose random placement.

- **Intelligent Computer Opponent with Advanced Targeting Strategy:**
 - The computer keeps choosing random positions until hitting a ship. After that, it starts analyzing current hits and calculating the most likely and optimal ship locations.

- **Utilization of State and Observer Design Patterns:**
 - **Observer Pattern:**
  - Used to achieve seamless communication and synchronization between different components of the application.
  - Particularly useful in ensuring that various parts of the game, such as game logic and the user interface, remain in sync.

 - **State Pattern:**
  - Especially useful for maintaining the state of each cell on the grid.
  - Each cell could exist in different states, such as 'empty', 'occupied', 'hit', or 'miss'. The State pattern helps encapsulate the logic associated with each state and establish proper transitions between them.



## Demo



## Technologies Used

- TypeScript
- HTML
- CSS
- Vite





