# Minesweeper

## Context

The CLI minesweeper project was originally asked as an interview question. Found it interesting to put it on GitHub as coding this game was actually pretty fun! (Even though I failed 🤫).
Then wanted to try out Svelte framework so created a web app out from it. You can still find the original CLI version version here <https://github.com/Shaance/minesweeper/releases/tag/v1.0.0>

## Setup

If you have Docker simply run `docker-compose up` from the root of the repository and connect to `localhost:5000`. Else follow the instructions below:

1. Install nvm if you do not have it already: <https://github.com/nvm-sh/nvm>
2. In the root of the repository run `nvm use`, if the required node version is not installed please follow the instructions to install it
3. Once the required node version is installed, run `npm i` to install dependencies
4. Run `npm run build` to transpile TS to JS
5. Run `npm start` and connect to `localhost:5000`

## How to launch tests

Simply run `npm run test`

## How to play?

Rules can be found here <https://www.instructables.com/How-to-play-minesweeper/>.

## Link

<https://minesweeper.hashcode.dev>
