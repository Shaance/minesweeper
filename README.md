# CLI Minesweeper

## Context

Small project written in TypeScript that was originally asked as an interview question. Found it interesting to put it on GitHub as coding this game was actually pretty fun! (Even though I failed 🤫)

## Setup

1. Install nvm if you do not have it already: <https://github.com/nvm-sh/nvm>
2. In the root of the repository run `nvm use`, if the required node version is not installed please follow the instructions to install it
3. Once the required node version is installed, run `npm i` to install dependencies
4. Run `npm run build` to transpile TS to JS
5. (optional) Run `node lib/index.js -h` to get help on the different args
6. Run `node lib/index.js [-option] [arg]`

## How to play?

First, rules can be found here <https://www.instructables.com/How-to-play-minesweeper/>.

## How to launch tests

Simply run `npm run test`

## Some visuals

![Minesweeper gif](https://github.com/Shaance/cli-minesweeper/blob/master/res/cli-minesweeper.gif "Minesweeper gif")
