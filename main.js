import {log as print} from 'node:console';
import {readFile as read} from 'node:fs/promises';

const ENCODING = 'utf8';

//helper functions
async function read_data(path_to_json) {
	return JSON.parse(await read(path_to_json, ENCODING));
}

const puzzle_to_solve = await read_data('./puzzle.json');
const puzzle_solution = await read_data('./puzzle-solutions.json');

class Grid extends Array {
	constructor(grid) {
		super(...grid);
	}

	get(row = 0, col = 0) {
		return this[row][col]
	}
	set(row = 0, col = 0, value) {
		return this[row][col] = value;
	}

	get_row(row = 0) {
		return [...this[row]];
	}

	get_col(col = 0 ) {
		return [...this].map(row => row[col]);
	}
}

const grid = new Grid(puzzle_to_solve);
// print(grid);
// print(grid.get_col(0));

class Sudoku extends Grid {
	#reference = [[]];

	constructor(puzzle = [[]]) {
		super([...puzzle.map(row => [...row])]);
		this.#reference = puzzle;

		this.show();

	}

	show() {
		print(this.toString());
	}
	toString() {
		return [...this].map(
			row => row.map(
				num => ` ${num} `
			).join('')
		).join('\n');
	}
}

const sudoku = new Sudoku(puzzle_to_solve);
