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

    const assignedNames = new Map<number, string>();

    stateIds.forEach((stateId, index) => {
      assignedNames.set(stateId, this.getNonTerminalName(index));
    });

    return stateIds.map((stateId) => {
      const state = states.get(stateId)!;
      const productions = Array.from(state.transitions.entries()).map(
        ([symbol, destinationId]) =>
          `${symbol}${assignedNames.get(destinationId)}`
      );

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
