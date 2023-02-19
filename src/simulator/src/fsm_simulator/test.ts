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

let a = new FiniteAutomataState('A', new BitSet(0, 1))
let b = new FiniteAutomataState('B', new BitSet(1, 1))
let c = new FiniteAutomataState('C', new BitSet(1, 1))
let d = new FiniteAutomataState('D', new BitSet(0, 1))

a.addConnection(new BitSet(0, 1), a)
a.addConnection(new BitSet(1, 1), b)

// uncommenting this will give an error
// a.addConnection(new BitSet(1, 1), a);

b.addConnection(new BitSet(0, 1), c)

//commenting this will give an error.
b.addConnection(new BitSet(1, 1), b)

c.addConnection(new BitSet(0, 1), c)
c.addConnection(new BitSet(1, 1), d)

d.addConnection(new BitSet(0, 1), a)
d.addConnection(new BitSet(1, 1), d)

states.push(a, b, c, d)

//[a...z]

let finiteAutomata = new FiniteAutomata(
    FiniteAutomataType.DFA,
    inputVars,
    states
)

console.log(validateFiniteAutomata(finiteAutomata))
finiteAutomata.drawStateTransitionTable()
finiteAutomata.formatTruthTable()
console.log(finiteAutomata.generateCombinedTruthTable())
console.log(finiteAutomata.generateMinTermSets())
finiteAutomata.formatCanonicalExpression()

/*
Input			0		1
A/0		A				
B
C
D

*/
