import { Injectable } from '@angular/core';
import { State } from '../models/state';

export interface GrammarRule {
  left: string;
  productions: string[];
  isStart: boolean;
  isFinal: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GrammarService {
  buildGrammarRules(states: Map<number, State>): GrammarRule[] {
    const stateIds = Array.from(states.keys()).sort((a, b) => a - b);

    if (stateIds.length === 0) {
      return [];
    }

    const ruleStateIds = stateIds.filter((stateId) => {
      const state = states.get(stateId)!;
      return stateId === 0 || state.transitions.size > 0;
    });
    const hasFinalLeaf = stateIds.some((stateId) => {
      const state = states.get(stateId)!;
      return stateId !== 0 && state.isFinal && state.transitions.size === 0;
    });
    const assignedNames = new Map<number, string>();

    ruleStateIds.forEach((stateId, index) => {
      assignedNames.set(stateId, this.getNonTerminalName(index));
    });

    const finalLeafName = hasFinalLeaf
      ? this.getNonTerminalName(ruleStateIds.length)
      : null;

    const rules = ruleStateIds.map((stateId) => {
      const state = states.get(stateId)!;
      const productions: string[] = [];

      for (const [symbol, destinationId] of state.transitions) {
        const destination = states.get(destinationId)!;

        const destinationName =
          destination.isFinal && destination.transitions.size === 0
            ? finalLeafName
            : assignedNames.get(destinationId);

        productions.push(`${symbol}${destinationName}`);
      }

      if (state.isFinal) {
        productions.push('ε');
      }

      return {
        left: assignedNames.get(stateId)!,
        productions,
        isStart: stateId === 0,
        isFinal: state.isFinal
      };
    });

    if (finalLeafName) {
      rules.push({
        left: finalLeafName,
        productions: ['ε'],
        isStart: false,
        isFinal: true
      });
    }

    return rules;
  }

  private getNonTerminalName(index: number): string {
    if (index === 0) {
      return 'S';
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRTUVWXYZ';
    const letterIndex = index - 1;

    if (letterIndex < alphabet.length) {
      return alphabet[letterIndex];
    }

    return `A${letterIndex - alphabet.length + 1}`;
  }
}
