import { Injectable } from '@angular/core';
import { State } from '../models/state';

@Injectable({
  providedIn: 'root'
})
export class AutomatoService {
  private states: Map<number, State> = new Map();
  private stateCounter: number = 0;
  private alphabet: Set<string> = new Set();

  constructor() {
    this.initializeAutomato();
  }

  private initializeAutomato(): void {
    this.states.clear();
    this.alphabet.clear();
    this.stateCounter = 0;
    
    this.createState();
  }

  private createState(): number {
    const id = this.stateCounter++;
    const newState: State = {
      isFinal: false,
      transitions: new Map()
    };
    this.states.set(id, newState);
    return id;
  }

  buildAutomato(tokens: string[]): void {
    this.initializeAutomato();

    for (const token of tokens) {

      let currentState = 0;

      for (const symbol of token) {
        this.alphabet.add(symbol);

        const state = this.states.get(currentState);
        if (!state) {
          break;
        }

        if (state.transitions.has(symbol)) {
          currentState = state.transitions.get(symbol)!;
        } else {
          const nextState = this.createState();
          state.transitions.set(symbol, nextState);
          currentState = nextState;
        }
      }

      this.states.get(currentState)!.isFinal = true;
    }
  }

  processSymbol(currentState: number, symbol: string): number | null {
    const state = this.states.get(currentState);

    if (!state) {
      return null;
    }

    return state.transitions.get(symbol) ?? null;
  }

  getStates(): Map<number, State> {
    return new Map(this.states);
  }

  private getAlphabet(): string[] {
    return Array.from(this.alphabet).sort();
  }

  getTransitionTable(): {
    states: number[];
    alphabet: string[];
    transitions: Map<string, Map<string, string>>;
  } {
    const alphabet = this.getAlphabet();
    const stateIds = Array.from(this.states.keys()).sort((a, b) => a - b);

    const transitions = new Map<string, Map<string, string>>();
    
    for (const stateId of stateIds) {
      const state = this.states.get(stateId);
      if (!state) continue;
      
      const row = new Map<string, string>();
      for (const symbol of alphabet) {
        const nextStateId = state.transitions.get(symbol);
        row.set(symbol, nextStateId !== undefined ? `q${nextStateId}` : '-');
      }
      
      transitions.set(`q${stateId}`, row);
    }

    return {
      states: stateIds,
      alphabet,
      transitions
    };
  }

  getAutomatoStats(): {
    totalStates: number;
    totalFinalStates: number;
    alphabetSize: number;
    totalTransitions: number;
  } {
    let totalTransitions = 0;
    for (const state of this.states.values()) {
      totalTransitions += state.transitions.size;
    }

    return {
      totalStates: this.states.size,
      totalFinalStates: Array.from(this.states.values()).filter(
        (state) => state.isFinal
      ).length,
      alphabetSize: this.alphabet.size,
      totalTransitions
    };
  }
}
