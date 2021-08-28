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
- For the unit tests just run `npm run test`
- For the front-end integration tests you need to have a server running locally and run `npm run cy:run` or you can also run against another url by changing the base url variable in `cypress.json` file before running `npm run cy:run`

## CICD
- [Vercel](https://vercel.com/) has been setup for this repo and is used to deploy every new branch to a preview environment.
- A github action defined in `on_pull_request.yml` has been set to build, run unit and integration tests for every pull request.
- Vercel will create an url based on the branch name, and the integration tests will target that URL. A drawback of using the url based on the branch name is that we **cannot use non url friendly characters or underscores in the branch name**.

## How to play?

Rules can be found here <https://www.instructables.com/How-to-play-minesweeper/>.

## Link

<https://minesweeper.hashcode.dev>
