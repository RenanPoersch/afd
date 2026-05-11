import { Injectable } from '@angular/core';
import { State, ValidationResult, TokenValidationStep } from '../models/state';

@Injectable({
  providedIn: 'root'
})
export class AutomatoService {
  private states: Map<number, State> = new Map();
  private stateCounter: number = 0;
  private finalStates: Set<number> = new Set();
  private alphabet: Set<string> = new Set();
  
  private validationHistory: TokenValidationStep[] = [];

  constructor() {
    this.initializeAutomato();
  }

  private initializeAutomato(): void {
    this.states.clear();
    this.finalStates.clear();
    this.alphabet.clear();
    this.stateCounter = 0;
    this.validationHistory = [];
    
    this.createState(true);
  }

  private createState(isInitial: boolean = false): number {
    const id = this.stateCounter++;
    const newState: State = {
      id,
      isFinal: false,
      transitions: new Map()
    };
    this.states.set(id, newState);
    return id;
  }

  buildAutomato(tokens: string[]): void {
    this.initializeAutomato();

    if (tokens.length === 0) {
      return;
    }

    for (const token of tokens) {

      let currentState = 0;

      if (token.length === 0) {
        this.finalStates.add(0);
        const rootState = this.states.get(0);
        if (rootState) {
          rootState.isFinal = true;
        }
        continue;
      }

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

      this.finalStates.add(currentState);
      const finalState = this.states.get(currentState);
      if (finalState) {
        finalState.isFinal = true;
      }
    }
  }

  validateToken(token: string): ValidationResult {
    this.validationHistory = [];
    let currentState = 0;
    const path = [currentState];
    let isValid = true;

    for (const symbol of token) {
      const result = this.processSymbol(currentState, symbol);
      
      if (result.nextState === null) {
        isValid = false;
        break;
      }
      
      currentState = result.nextState;
      path.push(currentState);
    }

    const isFinalState = this.finalStates.has(currentState);
    isValid = isValid && isFinalState;

    return {
      isValid,
      currentState,
      path
    };
  }

  processSymbol(currentState: number, symbol: string): { nextState: number | null; isValid: boolean } {
    const state = this.states.get(currentState);
    
    if (!state) {
      return { nextState: null, isValid: false };
    }

    const nextState = state.transitions.get(symbol) ?? null;
    
    if (nextState === null) {
      return { nextState: null, isValid: false };
    }

    this.validationHistory.push({
      symbol,
      fromState: currentState,
      toState: nextState,
    });

    return { nextState, isValid: true };
  }

  getStates(): Map<number, State> {
    return new Map(this.states);
  }

  getFinalStates(): Set<number> {
    return new Set(this.finalStates);
  }

  getAlphabet(): string[] {
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

  getValidationHistory(): TokenValidationStep[] {
    return [...this.validationHistory];
  }

  clearValidationHistory(): void {
    this.validationHistory = [];
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
      totalFinalStates: this.finalStates.size,
      alphabetSize: this.alphabet.size,
      totalTransitions
    };
  }
}
