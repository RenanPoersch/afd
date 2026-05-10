/**
 * Interface para representar um estado no Autômato Finito Determinístico
 * 
 * Um estado é um nó no grafo do AFD que pode ter transições para outros estados
 * baseadas em símbolos do alfabeto
 */
export interface State {
  id: number;           // Identificador único do estado (ex: 0, 1, 2...)
  isFinal: boolean;     // Indica se é um estado final/aceitação
  transitions: Map<string, number>; // Mapa de símbolo -> ID do próximo estado
}

/**
 * Interface para representar uma transição no AFD
 * 
 * Uma transição é um arco que conecta dois estados através de um símbolo
 */
export interface Transition {
  fromState: number;    // ID do estado de origem
  toState: number;      // ID do estado destino
  symbol: string;       // Símbolo que causa essa transição
}

/**
 * Interface para representar o resultado da validação
 */
export interface ValidationResult {
  isValid: boolean;     // Token é válido ou não
  currentState: number; // Estado em que terminou
  path: number[];       // Caminho percorrido pelos estados
}

/**
 * Interface para rastrear o histórico de um token sendo validado
 */
export interface TokenValidationStep {
  symbol: string;       // Símbolo processado
  fromState: number;    // Estado anterior
  toState: number;      // Estado novo
  timestamp: number;    // Quando ocorreu
}
