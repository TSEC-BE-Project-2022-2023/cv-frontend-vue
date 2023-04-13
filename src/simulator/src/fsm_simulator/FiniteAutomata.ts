import { HashMap, Hashable } from './HashMap'

type TruthTableData = [BitSet, BitSet, BitSet, BitSet][]
type bitNamesConventions = {
    input: 'i'
    output: 'o'
    variable: 'b'
}

export enum FiniteAutomataType {
    DFA = 'DFA',
    NFA = 'NFA',
}

// 1, 2
export class BitSet implements Hashable {
    constructor(public value: number, public length: number) {
        this.value = value
        this.length = length
    }
    //1, 2 -> 01
    static concat(...bitSets: BitSet[]) {
        let combinedValue = 0
        let totalLength = 0
        for (let { value, length } of bitSets) {
            combinedValue = (combinedValue << length) | value
            totalLength += length
        }
        return new BitSet(combinedValue, totalLength)
    }

    getBitAt(position: number): Number {
        return (this.value >> position) & 1
    }

    identityString() {
        return this.toString()
    }

    toString() {
        return this.value.toString(2).padStart(this.length, '0')
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

    static bitNames: bitNamesConventions = {
        input: 'i',
        output: 'o',
        variable: 'b',
    }

    getState(stateId: string): FiniteAutomataState {
        let state = this.states.find(({ id }) => id == stateId)
        if (state == null) throw new Error(`no state with id ${stateId} found`)
        return state
    }

    generateCombinedTruthTable(): TruthTableData {
        let table: TruthTableData = []

        //3
        let bitLength = 1 + Math.floor(Math.log2(this.states.length - 1))
        // [A, B, C, D]
        this.states.sort((a, b) => a.id.localeCompare(b.id))

        let stateBitSetMap = new Map<string, BitSet>(
            this.states.map(({ id }, index) => [
                id,
                new BitSet(index, bitLength),
            ])
        )

        // [input, state, output, nextState]'=
        for (let { id, output, connections } of this.states)
            for (let [input, nextStates] of connections)
                for (let { id: nextId } of nextStates)
                    table.push([
                        input,
                        stateBitSetMap.get(id)!,
                        output,
                        stateBitSetMap.get(nextId)!,
                    ])
        return table
    }

    generateMinTermSets(): {
        outputBitsMinterms: Set<BitSet>[]
        newStateBitsMinterms: Set<BitSet>[]
    } {
        const truthTable = this.generateCombinedTruthTable()
        let minTermSets: {
            outputBitsMinterms: Set<BitSet>[]
            newStateBitsMinterms: Set<BitSet>[]
        } = {
            outputBitsMinterms: new Array(),
            newStateBitsMinterms: new Array(),
        }
        for (let i = 0; i < truthTable[0][2].length; i++) {
            minTermSets['outputBitsMinterms'].push(new Set())
        }

        for (let i = 0; i < truthTable[0][3].length; i++) {
            minTermSets['newStateBitsMinterms'].push(new Set())
        }
        for (let [input, state, output, nextState] of truthTable) {
            for (let i = 0; i < output.length; i++)
                if (output.getBitAt(output.length - i - 1) == 1)
                    minTermSets['outputBitsMinterms'][i].add(
                        BitSet.concat(state, input)
                    )
            for (let i = 0; i < nextState.length; i++)
                if (nextState.getBitAt(nextState.length - i - 1) == 1)
                    minTermSets['newStateBitsMinterms'][i].add(
                        BitSet.concat(state, input)
                    )
        }
        return minTermSets
    }

    formatTruthTable(): void {
        const truthTableData = this.generateCombinedTruthTable()

        const tempRow = truthTableData[0]
        let str = 'b'
        for (let i = 1; i < tempRow.length; ) {
            let len = tempRow[i].length
            for (let j = len - 1; j >= 0; j--) {
                process.stdout.write(`${str}${j}\t`)
            }
            if (i % 2 != 0) {
                i -= 1
                if (i == 0) str = 'input'
                else str = 'output'
            } else {
                i += 3
                str = 'b'
            }
        }
        process.stdout.write(`\n`)

        for (let row of truthTableData) {
            for (let i = 1; i < 4; ) {
                let len = row[i].length
                for (let j = len - 1; j >= 0; j--) {
                    process.stdout.write(`${row[i].getBitAt(j)}\t`)
                }
                if (i % 2 != 0) {
                    i -= 1
                } else {
                    i += 3
                }
            }
            process.stdout.write(`\n`)
        }
    }

    drawStateTransitionTable(): void {
        // console.log(this.states);
        const states = this.states
        let bitSets = this.alphabet
        // console.log(bitSets);
        let header = '|State/Input\t'
        const orders: BitSet[] = []
        for (let bit of bitSets) {
            orders.push(bit)
            header += `|${bit.toString()}\t`
        }
        header += '|'

        let dash = '----'
        for (let head of header) {
            if (dash)
                if (head === '\t') {
                    dash += '---'
                }
            dash += '-'
        }

        console.log(dash)
        console.log(header)
        console.log(dash)
        for (let state of states) {
            process.stdout.write(`|${state.id}/${state.output.toString()}\t\t`)
            for (let order of orders) {
                process.stdout.write(
                    `|${state.connections.get(order)![0].id}\t`
                )
            }
            process.stdout.write('|\n')
            console.log(dash)
        }
    }

    formatCanonicalExpression(): void {
        const expressions: string[] = new Array()

        const truthTableData = this.generateCombinedTruthTable()[0]
        const bitLength = truthTableData[1].length
        const { newStateBitsMinterms, outputBitsMinterms } =
            this.generateMinTermSets()

        let count = newStateBitsMinterms.length - 1

        for (let newStateBitMinterms of newStateBitsMinterms) {
            let expression = this.getExpression(
                newStateBitMinterms,
                bitLength,
                count,
                FiniteAutomata.bitNames.variable
            )
            expressions.push(expression.slice(0, expression.length - 3))
            count--
        }
        count = outputBitsMinterms.length - 1

        for (let outputBitMinterms of outputBitsMinterms) {
            let expression = this.getExpression(
                outputBitMinterms,
                bitLength,
                count,
                FiniteAutomata.bitNames.input
            )
            expressions.push(expression.slice(0, expression.length - 3))
            count--
        }
        console.log(expressions)
    }

    getExpression(
        minterms: Set<BitSet>,
        noOfVariables: number,
        count: number,
        temp: string
    ): string {
        let expression = ''
        expression += `${temp}${count} = `
        for (let minterm of minterms) {
            let variableBits = minterm.toString().split('')
            // 2 + 1;
            for (let i = 0; i < noOfVariables; i++) {
                let bit = variableBits[i]
                expression += `${FiniteAutomata.bitNames.variable}${
                    noOfVariables - i - 1
                }`
                if (bit === '0') {
                    expression += "'"
                }
            }

            for (let i = noOfVariables; i < variableBits.length; i++) {
                let bit = variableBits[i]
                expression += `${FiniteAutomata.bitNames.input}${
                    i - noOfVariables
                }`
                if (bit === '0') {
                    expression += "'"
                }
            }
            expression += ' + '
        }
        return expression
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
        let states = this.getNextStates(input)
        // <=0 && >1
        if (states.length != 1)
            throw new Error(
                `no transition found from ${this.id} with input ${input}`
            )
        return states[0]
    }

    getNextStates(input: BitSet): FiniteAutomataState[] {
        let nextStates = this.connections.get(input)
        if (nextStates == null)
            throw new Error(
                `no transition found from ${this.id} with input ${input}`
            )
        return nextStates
    }

    addConnection(bitSet: BitSet, state: FiniteAutomataState) {
        console.log("addcons:", bitSet)
        if (!this.connections.has(bitSet)) {
            this.connections.set(bitSet, [])
        }
        this.connections.get(bitSet)!.push(state)
    }
}
