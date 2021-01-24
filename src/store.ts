// eslint-disable-next-line import/no-extraneous-dependencies
import { writable } from 'svelte/store';
import { createBoard } from './minesweeper/BoardManager';
import Level from './minesweeper/Level';

const board = writable(createBoard(Level.EASY));

export default board;
