# liftoff mine sweeper

## Installation

## How to play?

## Random notes

- Board has a content array (populated by 0, -1 and numbers between 1 and 8. 0 Means no adjacent bomb, -1 means bomb and 1~8 is the adjacency number)
- Board has a visited array which will tell which cell has been visited or not.
- StandardIOHelper helps us print the board at every turn.
- StandardIOHelper will print H when not visited.
- BoardChecker will check if a game is won or lost
- BoardManager will have a method to place a new row / col onto the board
- When placing on the board will BFS / DFS from the position until we get to an ajcency number if not a bomb. If bomb, lose
