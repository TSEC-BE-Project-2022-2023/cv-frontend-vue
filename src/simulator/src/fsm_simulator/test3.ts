import {
    FiniteAutomata,
    FiniteAutomataState,
    BitSet,
    FiniteAutomataType,
} from './FiniteAutomata'

import { validateFiniteAutomata } from './validate'

let inputVars: Set<BitSet> = new Set()
for (let i = 0; i <= 1; i++) {
    inputVars.add(new BitSet(i, 1))
}

let states: FiniteAutomataState[] = new Array()

let a = new FiniteAutomataState('A', new BitSet(0, 2))
let b = new FiniteAutomataState('B', new BitSet(1, 2))
let c = new FiniteAutomataState('C', new BitSet(2, 2))

a.addConnection(new BitSet(0, 1), a)
a.addConnection(new BitSet(1, 1), b)

b.addConnection(new BitSet(0, 1), a)
b.addConnection(new BitSet(1, 1), c)

c.addConnection(new BitSet(0, 1), a)
c.addConnection(new BitSet(1, 1), c)

states.push(a, b, c)

let finiteAutomata = new FiniteAutomata(
    FiniteAutomataType.DFA,
    inputVars,
    states
)

console.log(validateFiniteAutomata(finiteAutomata))
console.log()
console.log(finiteAutomata.generateCombinedTruthTable())
console.log()
finiteAutomata.formatTruthTable()
console.log()

finiteAutomata.drawStateTransitionTable()
console.log()

console.log(finiteAutomata.generateMinTermSets())
console.log()

finiteAutomata.formatCanonicalExpression()
