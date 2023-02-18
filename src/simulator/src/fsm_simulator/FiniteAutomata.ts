import { HashMap, Hashable } from "./HashMap";

type TruthTableData = [BitSet, BitSet, BitSet, BitSet][];

export enum FiniteAutomataType {
	DFA = "DFA",
	NFA = "NFA",
}

// 1, 2
export class BitSet implements Hashable {
	constructor(public value: number, public length: number) {}

	//1, 2 -> 01
	static concat(...bitSets: BitSet[]) {
		let combinedValue = 0;
		let totalLength = 0;
		for (let { value, length } of bitSets) {
			combinedValue = (combinedValue << length) | value;
			totalLength += length;
		}

		return new BitSet(combinedValue, totalLength);
	}

	getBitAt(position: number): Number {
		return (this.value >> position) & 1;
	}

	identityString() {
		return this.toString();
	}

	toString() {
		return this.value.toString(2).padStart(this.length, "0");
	}
}

export class FiniteAutomata {
	constructor(
		// "DFA" | "NFA"
		public faType: FiniteAutomataType,
		// [1, 2, 3]
		public alphabet: Set<BitSet>,
		public states: FiniteAutomataState[]
	) {}

	getState(stateId: string): FiniteAutomataState {
		let state = this.states.find(({ id }) => id == stateId);
		if (state == null) throw new Error(`no state with id ${stateId} found`);
		return state;
	}

	generateCombinedTruthTable(): TruthTableData {
		let table: TruthTableData = [];

		//3
		let bitLength = 1 + Math.floor(Math.log2(this.states.length - 1));
		// [A, B, C, D]
		this.states.sort((a, b) => a.id.localeCompare(b.id));

		let stateBitSetMap = new Map<string, BitSet>(
			this.states.map(({ id }, index) => [
				id,
				new BitSet(index, bitLength),
			])
		);

		// [input, state, output, nextState]'=
		for (let { id, output, connections } of this.states)
			for (let [input, nextStates] of connections)
				for (let { id: nextId } of nextStates)
					table.push([
						input,
						stateBitSetMap.get(id)!,
						output,
						stateBitSetMap.get(nextId)!,
					]);
		return table;
	}

	generateMinTermSets(): Set<BitSet>[] {
		let minTermSets: Set<BitSet>[] = [];
		for (let i = 0; i < 20; i++) {
			minTermSets[i] = new Set();
		}
		for (let [
			input,
			state,
			output,
			nextState,
		] of this.generateCombinedTruthTable()) {
			for (let i = 0; i < output.length; i++)
				if (output.getBitAt(i) == 1)
					minTermSets[i].add(BitSet.concat(input, state));
			for (let i = 0; i < nextState.length; i++)
				if (nextState.getBitAt(i) == 1)
					minTermSets[i + output.length].add(
						BitSet.concat(input, state)
					);
		}
		return minTermSets;
	}

	formatTruthTable(): void {
		const truthTableData = this.generateCombinedTruthTable();

		const tempRow = truthTableData[0];
		let str = "b";
		for (let i = 1; i < tempRow.length; ) {
			let len = tempRow[i].length;
			for (let j = 0; j < len; j++) {
				process.stdout.write(`${str}${j}\t`);
			}
			if (i % 2 != 0) {
				i -= 1;
				if (i == 0) str = "input";
				else str = "output";
			} else {
				i += 3;
				str = "b";
			}
		}
		process.stdout.write(`\n`);

		for (let row of truthTableData) {
			for (let i = 1; i < 4; ) {
				let len = row[i].length;
				for (let j = len - 1; j >= 0; j--) {
					process.stdout.write(`${row[i].getBitAt(j)}\t`);
				}
				if (i % 2 != 0) {
					i -= 1;
				} else {
					i += 3;
				}
			}
			process.stdout.write(`\n`);
		}
	}

	drawStateTransitionTable(): void {
		// console.log(this.states);
		const states = this.states;
		let bitSets = this.alphabet;
		// console.log(bitSets);
		let header = "|State/Input\t";
		const orders: BitSet[] = [];
		for (let bit of bitSets) {
			orders.push(bit);
			header += `|${bit.toString()}\t`;
		}
		header+='|'

		let dash = "----"
		for (let head of header) {
			if(dash)
			if (head === "\t") {
				dash += "---";
			}
			dash += "-";
		}

		console.log(dash);
		console.log(header);
		console.log(dash);
		for (let state of states) {
			process.stdout.write(`|${state.id}/${state.output.toString()}\t\t`);
			for (let order of orders) {
				process.stdout.write(
					`|${state.connections.get(order)![0].id}\t`
				);
			}
			process.stdout.write("|\n");
			console.log(dash);

		}
	}
}

/*
state  | 0 | 1 | 2 | 3
a/00   | b | a | a | b
b/01   | a | b
*/

export class FiniteAutomataState {
	constructor(
		public id: string,
		public output: BitSet,
		// {1: Object("id")}, {input, finiteAutomataState}
		public connections: HashMap<
			BitSet,
			FiniteAutomataState[]
		> = new HashMap()
	) {}

	getNextState(input: BitSet): FiniteAutomataState {
		let states = this.getNextStates(input);
		// <=0 && >1
		if (states.length != 1)
			throw new Error(
				`no transition found from ${this.id} with input ${input}`
			);
		return states[0];
	}

	getNextStates(input: BitSet): FiniteAutomataState[] {
		let nextStates = this.connections.get(input);
		if (nextStates == null)
			throw new Error(
				`no transition found from ${this.id} with input ${input}`
			);
		return nextStates;
	}

	addConnection(bitSet: BitSet, state: FiniteAutomataState) {
		if (!this.connections.has(bitSet)) {
			this.connections.set(bitSet, []);
		}
		this.connections.get(bitSet)!.push(state);
	}
}
