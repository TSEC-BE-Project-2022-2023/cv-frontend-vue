import {
    FiniteAutomata,
    FiniteAutomataState,
    BitSet,
    FiniteAutomataType,
} from './FiniteAutomata'

import { validateFiniteAutomata } from './validate'

let inputVars: Set<BitSet> = new Set()
for (let i = 0; i <= 0; i++) {
    inputVars.add(new BitSet(i, 1))
}

let states: FiniteAutomataState[] = new Array()

let a = new FiniteAutomataState('A', new BitSet(0, 3))
let b = new FiniteAutomataState('B', new BitSet(1, 3))
let c = new FiniteAutomataState('C', new BitSet(2, 3))
let d = new FiniteAutomataState('D', new BitSet(3, 3))
let e = new FiniteAutomataState('E', new BitSet(4, 3))
let f = new FiniteAutomataState('F', new BitSet(5, 3))
let g = new FiniteAutomataState('G', new BitSet(6, 3))
let h = new FiniteAutomataState('H', new BitSet(7, 3))

a.addConnection(new BitSet(0, 1), b)

b.addConnection(new BitSet(0, 1), c)

c.addConnection(new BitSet(0, 1), d)

d.addConnection(new BitSet(0, 1), e)

e.addConnection(new BitSet(0, 1), f)

f.addConnection(new BitSet(0, 1), g)

g.addConnection(new BitSet(0, 1), h)

h.addConnection(new BitSet(0, 1), a)

states.push(a, b, c, d, e, f, g, h)

let finiteAutomata = new FiniteAutomata(
    FiniteAutomataType.DFA,
    inputVars,
    states
)

console.log(validateFiniteAutomata(finiteAutomata))
console.log(finiteAutomata.generateCombinedTruthTable())
finiteAutomata.formatTruthTable()
finiteAutomata.drawStateTransitionTable()
console.log(finiteAutomata.generateMinTermSets())
finiteAutomata.formatCanonicalExpression()
