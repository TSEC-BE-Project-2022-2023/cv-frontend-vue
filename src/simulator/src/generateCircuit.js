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
}
