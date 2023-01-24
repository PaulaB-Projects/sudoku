import {count, log as print} from 'node:console';
import {readFile as read} from 'node:fs/promises';

const ENCODING = 'utf8';
const NEWLINE = '\n';
const PIPE = '|';
const LINE = '-';
const SUDOKU_LIMIT = 9;

//helper functions
async function read_data(path_to_json) {
	return JSON.parse(await read(path_to_json, ENCODING));
}

const puzzle_to_solve = await read_data('./puzzle.json');
const puzzle_solution = await read_data('./puzzle-solutions.json');

class Grid extends Array {
	constructor(grid = [[]]) {
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
	#reference = new Grid;

	constructor(puzzle = [[]]) {
		super([...puzzle.map(row => [...row])]);
		this.#reference = new Grid(puzzle);

		this.show();

	}

	guess(row = 0, col = 0, num = 1) {
		if (!this.can_guess(row, col))
			return false;

		const old_num = this.get(row, col);
		this.set(row, col, num);

		if(!this.is_valid(row, col)) {
			this.set(row, col, old_num);
			return false;
		}

		this.show();
		return true;
	}

	can_guess(row = 0, col = 0, num = 1) {
		return this.#reference.get(row, col) ===0;
	}

	is_valid(row = 0, col = 0) {
		return this.check_row(row) &&
					this.check_col(col) &&
					this.check_box(row, col);
	}

	check_row(row = 0) {
		return Sudoku.check_num_count(
			this.get_row(row)
		);
	}

	check_col(col = 0) {
		return Sudoku.check_num_count(
			this.get_col(col)
		);
	}

	check_box(row = 0, col= 0) {
		const [start_row, start_col] = [row, col].map(Sudoku.get_box_index);
		const [end_row, end_col] = [start_row, start_col].map(coord =>
			coord + Sudoku.BOX_SIZE);
		
		const box_as_array = [];

		for (let row = start_row; row < end_row; row++)
			for(let col = start_col; col < end_col; col++)
				box_as_array.push(this.get(row, col));
		
		return Sudoku.check_num_count(box_as_array);
	}

	show() {
		print(this.toString());
	}
	toString() {
		return [...this].map(
			row => row.map(
				num => ` ${num ? num : ' '} `
			).join(PIPE)
		).join(NEWLINE + LINE.repeat(4 * SUDOKU_LIMIT - 1) + NEWLINE) + NEWLINE;
	}

	static BOX_SIZE = 3;

	static in_range(coord) {
		return coord >= 0 && coord < 9;
	}

	static get_box_index(coord) {
		return coord - (coord % Sudoku.BOX_SIZE);
	}

	static check_num_count(array = []) {
		const counts = new Array(9).fill(0);

		array
			.filter(num => num > 0)
			.forEach(num => counts[num - 1] += 1);

		return counts.every(count => count <= 1);
	}
}

function sudoku(puzzle = [[]]) {
	const game = new Sudoku(puzzle_to_solve);

	let row = 0;
	let col = 0;
	let direction = 1; // -1 backwords

	while (Sudoku.in_range(row)) {
		while (Sudoku.in_range(col)) {

			print(`(${ row }, ${ col } ) ${direction > 0 ? '=>' : '<='}`);
			 if (game.can_guess(row, col)) {
				let guess = game.get(row, col) + 1 || 1;
				
				while (guess <= 9) {
					if (game.guess(row, col, guess)) {
						direction = 1;
						break;
					} else if (guess === 9) {
						direction = -1;
					}
					guess++;
				}
				if (direction < 0) 
					game.set(row, col, 0);
			 } 

			col += direction;
		}
		col = direction > 0 ? 0 : 8;
		row += direction;
	}
	

	return [[...game]];
}

const solved_puzzle = new Grid(sudoku(puzzle_to_solve));
const solution = new Grid(puzzle_solution);

print(
	solved_puzzle
	.every((row_array, row_num)=>
		row_array
			.every((num, col_num) =>
				num === solution.get(row_num, col_num)
			)
	)
);

