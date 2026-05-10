import { Injectable } from '@angular/core';
import { State, ValidationResult, TokenValidationStep } from '../models/state';

/**
 * SERVIÇO CORE DO ANALISADOR LÉXICO COM AFD
 * 
 * Este serviço encapsula toda a lógica do Autômato Finito Determinístico.
 * Responsável por:
 * - Construir o AFD a partir de tokens cadastrados
 * - Gerenciar estados e transições
 * - Validar novos tokens símbolo por símbolo
 * - Manter histórico de validações
 */
@Injectable({
  providedIn: 'root'
})
export class AutomatoService {
  private states: Map<number, State> = new Map();
  private stateCounter: number = 0;
  private finalStates: Set<number> = new Set();
  private alphabet: Set<string> = new Set();
  
  // Histórico de validações para fins didáticos
  private validationHistory: TokenValidationStep[] = [];

  constructor() {
    this.initializeAutomato();
  }

  /**
   * Inicializa o autômato com o estado inicial (q0)
   */
  private initializeAutomato(): void {
    this.states.clear();
    this.finalStates.clear();
    this.alphabet.clear();
    this.stateCounter = 0;
    this.validationHistory = [];
    
    // Criar estado inicial q0
    this.createState(true);
  }

  /**
   * Cria um novo estado no autômato
   * @param isInitial Se é o primeiro estado (q0)
   * @returns ID do novo estado
   */
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

  /**
   * CONSTRÓI AUTOMATICAMENTE O AFD A PARTIR DOS TOKENS
   * 
   * Algoritmo:
   * 1. Para cada token cadastrado:
   *    - Percorrer símbolo por símbolo
   *    - Seguir a transição existente se houver
   *    - Criar novo estado se não houver transição
   *    - Marcar último estado como final
   * 
   * Isso cria uma estrutura de árvore/trie otimizada
   */
  buildAutomato(tokens: string[]): void {
    this.initializeAutomato();
    
    if (tokens.length === 0) {
      return;
    }

    // Estado inicial q0 (já existe)
    let currentState = 0;

    // Processar cada token
    for (const token of tokens) {
      currentState = 0; // Sempre começar do q0
      
      // Processar cada símbolo do token
      for (const symbol of token) {
        this.alphabet.add(symbol); // Registrar símbolo no alfabeto
        
        const state = this.states.get(currentState);
        if (!state) continue;

        // Verificar se já existe transição para este símbolo
        if (state.transitions.has(symbol)) {
          // Seguir transição existente
          currentState = state.transitions.get(symbol)!;
        } else {
          // Criar novo estado e transição
          const nextState = this.createState();
          state.transitions.set(symbol, nextState);
          currentState = nextState;
        }
      }

      // Marcar o estado final como aceitação para este token
      if (currentState !== 0) {
        this.finalStates.add(currentState);
        const finalState = this.states.get(currentState);
        if (finalState) {
          finalState.isFinal = true;
        }
      }
    }
  }

  /**
   * VALIDA UM TOKEN SÍMBOLO POR SÍMBOLO
   * 
   * Implementa o funcionamento do AFD:
   * 1. Iniciar no estado q0
   * 2. Para cada símbolo:
   *    - Buscar a transição δ(estado_atual, símbolo)
   *    - Atualizar estado_atual
   *    - Se não houver transição, REJEITAR
   * 3. Ao final, verificar se está em estado final
   * 
   * @param symbol Símbolo a processar
   * @returns Novo estado ou null se inválido
   */
  processSymbol(currentState: number, symbol: string): { nextState: number | null; isValid: boolean } {
    const state = this.states.get(currentState);
    
    if (!state) {
      return { nextState: null, isValid: false };
    }

    // Buscar transição: δ(currentState, symbol)
    const nextState = state.transitions.get(symbol) ?? null;
    
    if (nextState === null) {
      // Não há transição para este símbolo
      return { nextState: null, isValid: false };
    }

    // Registrar a transição realizada
    this.validationHistory.push({
      symbol,
      fromState: currentState,
      toState: nextState,
      timestamp: Date.now()
    });

    return { nextState, isValid: true };
  }

  /**
   * VALIDA UM TOKEN COMPLETO
   * 
   * @param token Token a validar
   * @returns Resultado da validação
   */
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

    // Verificar se terminou em um estado final
    const isFinalState = this.finalStates.has(currentState);
    isValid = isValid && isFinalState;

    return {
      isValid,
      currentState,
      path
    };
  }

  /**
   * Retorna todos os estados do autômato
   */
  getStates(): Map<number, State> {
    return new Map(this.states);
  }

  /**
   * Retorna os IDs dos estados finais
   */
  getFinalStates(): Set<number> {
    return new Set(this.finalStates);
  }

  /**
   * Retorna o alfabeto detectado
   */
  getAlphabet(): string[] {
    return Array.from(this.alphabet).sort();
  }

  /**
   * Gera a tabela de transição para renderização
   * @returns Objeto com linhas (estados) e colunas (símbolos)
   */
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

  /**
   * Retorna o histórico de validações
   */
  getValidationHistory(): TokenValidationStep[] {
    return [...this.validationHistory];
  }

  /**
   * Reseta o histórico de validações
   */
  clearValidationHistory(): void {
    this.validationHistory = [];
  }

  /**
   * Retorna informações estatísticas sobre o autômato
   */
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
