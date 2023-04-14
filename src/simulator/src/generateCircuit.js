// const input = [
//     ['State', 0, 1],
//     ['A', 'A', 'C'],
//     ['C', 'A', 'C'],
// ]
import {
    BitSet,
    FiniteAutomataState,
    FiniteAutomata,
} from './fsm_simulator/FiniteAutomata'


import { validateFiniteAutomata } from './fsm_simulator/validate'

import BooleanMinimize from './quinMcCluskey'
import Input from './modules/Input'
import Node from './node'

let drawCircuit = (finiteAutomata) => {
    return window.drawCircuit(finiteAutomata)
    const { outputBitsMinterms, newStateBitsMinterms } =
        finiteAutomata.generateMinTermSets()
    let numVarArgs = 0
    let newStateMinimizedExpressions = []
    let outputStateMinimizedExpressions = []
    for (let i = 0; i < newStateBitsMinterms.length; i++) {
        let set = newStateBitsMinterms[i]
        let minTermsArg = []
        for (let s of set) {
            numVarArgs = s.length
            minTermsArg.push(s.value)
        }
        newStateMinimizedExpressions.push(
            new BooleanMinimize(numVarArgs, minTermsArg).solve()
        )
    }

    for (let i = 0; i < outputBitsMinterms.length; i++) {
        let set = outputBitsMinterms[i]
        let numVarArgs = 0
        let minTermsArg = []
        for (let s of set) {
            numVarArgs = s.length
            minTermsArg.push(s.value)
        }
        outputStateMinimizedExpressions.push(
            new BooleanMinimize(numVarArgs, minTermsArg).solve()
        )
    }

    let inputs = []
    let InputStartX = 100
    let InputStartY = 100
    for (let i = 0; i < numVarArgs; i++) {
        inputs.push(new Input(InputStartX, InputStartY))
        inputs[i].newDirection('DOWN')
        const n1 = new Node(InputStartX, InputStartY + 30, 2, globalScope.root)
        inputs[i].output1.connect(n1)
        const n2 = new Node(
            InputStartX,
            InputStartY + 20 + 200,
            2,
            globalScope.root
        )
        n2.connect(n1)
        let n3 = new Node(
            InputStartX + 30,
            InputStartY + 30,
            2,
            globalScope.root
        )
        n3.connect(n1)
        let n4 = new Node(
            InputStartX + 30,
            InputStartY + 30 + 20,
            2,
            globalScope.root
        )
        n4.connect(n3)
        InputStartX = InputStartX + 100
    }
}
export default function generateCircuit() {
    const states = globalScope.State
    console.log("states:", states)
    const stateTransitionTable = states[0].getTransitionTable()
    for(let i = 1; i < stateTransitionTable[0].length; i++) {
        stateTransitionTable[0][i] = Number(stateTransitionTable[0][i]);
    }
    console.log("stateTransitionTable:", stateTransitionTable)
    let numOfBits =
        stateTransitionTable[0][stateTransitionTable[0].length - 1].toString(
            2
        ).length
    
    console.log("numOfBits:", numOfBits)
    let inputVars = new Set()
    for (let i = 1; i < stateTransitionTable[0].length; i++) {
        inputVars.add(new BitSet(stateTransitionTable[0][i], numOfBits))
    }
    
    const stateOutput = Object.fromEntries(
        states.map(({ label, output }) => [label, Number(output)])
    )
    console.log("stateOutput:", stateOutput)
    let maxOutputForState = -1
    for (let num of Object.values(stateOutput)) {
        maxOutputForState = Math.max(maxOutputForState, num)
    }
    maxOutputForState = maxOutputForState.toString(2).length
    console.log("maxOutputForState:", maxOutputForState)

    let finiteAutomataStates = {}
    for (let i = 1; i < stateTransitionTable.length; i++) {
        finiteAutomataStates[stateTransitionTable[i][0]] =
            new FiniteAutomataState(
                stateTransitionTable[i][0],
                new BitSet(
                    stateOutput[stateTransitionTable[i][0]],
                    maxOutputForState
                )
            )
    }
    console.log("finiteAutomataStates:", finiteAutomataStates)
    console.log("inputVars:", inputVars)

    for (let i = 1; i < stateTransitionTable.length; i++) {
        for (let j = 1; j < stateTransitionTable[0].length; j++) {
            finiteAutomataStates[stateTransitionTable[i][0]].addConnection(
                new BitSet(stateTransitionTable[0][j], numOfBits),
                finiteAutomataStates[stateTransitionTable[i][j]]
            )
        }
    }

    const statesList = Object.values(finiteAutomataStates)
    let finiteAutomata = new FiniteAutomata('DFA', inputVars, statesList)
    finiteAutomata.formatCanonicalExpression()

    drawCircuit(finiteAutomata)
}
