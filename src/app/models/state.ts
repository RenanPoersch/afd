/**
 * Representa um estado do Autômato Finito Determinístico.
 */
export interface State {
  isFinal: boolean;
  transitions: Map<string, number>;
}
