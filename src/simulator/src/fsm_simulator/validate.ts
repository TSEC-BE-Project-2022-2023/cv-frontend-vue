import { FiniteAutomata, FiniteAutomataType } from './FiniteAutomata'

export function validateFiniteAutomata({
    faType,
    alphabet,
    states,
}: FiniteAutomata): string | null {
    let errors: string[] = []

    switch (faType) {
        case FiniteAutomataType.NFA:
            break
        case FiniteAutomataType.DFA:
            for (let state of states)
                for (let character of alphabet)
                    if (!state.connections.has(character))
                        errors.push(
                            `DFA error: state ${state.id} does not define a transition for input ${character}`
                        )
                    // console.log(
                    // 	state.id,
                    // 	state.connections.set(character, []),
                    // 	state.connections,
                    // 	character,
                    // 	state.connections.get(character)
                    // );
                    else if (state.getNextStates(character).length != 1)
                        errors.push(
                            `DFA error: state ${state.id} defines more than one transition for input ${character}: ` +
                                state
                                    .getNextStates(character)
                                    .map(({ id }) => id)
                                    .join(', ')
                        )
            break
    }

    if (errors.length == 0) return null
    else return errors.join('\n')
}
