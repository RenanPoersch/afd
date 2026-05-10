import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutomatoService } from './services/automato.service';
import { GrammarRule, GrammarService } from './services/grammar.service';
import { State } from './models/state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit {
  // ========== GERENCIAMENTO DE TOKENS ==========
  newToken: string = '';
  tokens: string[] = [];
  validTokensRecognized: string[] = [];

  // ========== GERENCIAMENTO DO AUTÔMATO ==========
  states: Map<number, State> = new Map();
  finalStates: Set<number> = new Set();
  alphabet: string[] = [];
  transitionTable: {
    states: number[];
    alphabet: string[];
    transitions: Map<string, Map<string, string>>;
  } | null = null;
  grammarRules: GrammarRule[] = [];

  // ========== VALIDAÇÃO DE TOKENS ==========
  tokenToValidate: string = '';
  currentValidationState: number = 0;
  validationPath: number[] = [0];
  validationResult: string = '';
  isValidating: boolean = false;
  validationSteps: Array<{
    symbol: string;
    from: number;
    to: number;
  }> = [];

  // ========== UI STATE ==========
  showAutomato: boolean = false;
  tokenError: string = '';
  stats: {
    totalStates: number;
    totalFinalStates: number;
    alphabetSize: number;
    totalTransitions: number;
  } | null = null;

  constructor(
    private automatoService: AutomatoService,
    private grammarService: GrammarService
  ) {}

  ngOnInit(): void {}

  addToken(): void {
    this.tokenError = '';

    if (!this.newToken.trim()) {
      this.tokenError = 'Token não pode estar vazio!';
      return;
    }

    const filteredToken = this.newToken.toLowerCase().replace(/[^a-z]/g, '');

    if (!filteredToken) {
      this.tokenError = 'Token deve conter pelo menos uma letra minúscula (a-z)!';
      return;
    }

    if (this.tokens.includes(filteredToken)) {
      this.tokenError = `Token '${filteredToken}' já foi cadastrado!`;
      return;
    }

    this.tokens.push(filteredToken);
    this.newToken = '';
    this.showAutomato = false;
  }

  onTokenKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.addToken();
    }
  }

  removeToken(index: number): void {
    this.tokens.splice(index, 1);
    this.showAutomato = false;
    this.tokenError = '';
  }

  clearAllTokens(): void {
    this.tokens = [];
    this.validTokensRecognized = [];
    this.showAutomato = false;
    this.tokenError = '';
    this.states.clear();
    this.finalStates.clear();
    this.alphabet = [];
    this.stats = null;
    this.grammarRules = [];
  }

  buildAutomato(): void {

    this.automatoService.buildAutomato(this.tokens);

    this.states = this.automatoService.getStates();
    this.finalStates = this.automatoService.getFinalStates();
    this.alphabet = this.automatoService.getAlphabet();
    this.transitionTable = this.automatoService.getTransitionTable();
    this.stats = this.automatoService.getAutomatoStats();
    this.grammarRules = this.grammarService.buildGrammarRules(this.tokens);

    this.showAutomato = true;
    this.resetValidation();
    this.isValidating = true;
  }

  isStateFinal(stateId: number): boolean {
    return this.finalStates.has(stateId);
  }

  resetValidation(): void {
    this.currentValidationState = 0;
    this.validationPath = [0];
    this.validationResult = '';
    this.tokenToValidate = '';
    this.validationSteps = [];
    this.automatoService.clearValidationHistory();
  }

  /**
   * PROCESSA UM SÍMBOLO DURANTE A VALIDAÇÃO
  /**
   * Valida caracteres inseridos no input em tempo real
   */
  onValidationInput(): void {
    // Se não está validando e há um resultado anterior, resetar para nova validação
    if (!this.isValidating && this.validationResult && this.tokenToValidate.length > 0) {
      this.resetValidation();
      this.isValidating = true;
    }

    // Filtrar apenas letras minúsculas
    const filtered = this.tokenToValidate.replace(/[^a-z]/g, '');
    
    // Se houver caracteres inválidos, remover e mostrar erro
    if (filtered !== this.tokenToValidate) {
      this.tokenToValidate = filtered;
      if (this.tokenToValidate.length === 0) {
        this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
        this.isValidating = false;
      }
      return;
    }

    // Se está vazio, limpar estado
    if (this.tokenToValidate.length === 0) {
      if (this.isValidating) {
        this.resetValidation();
      }
      return;
    }

    if (!this.isValidating) {
      return;
    }

    // Validar toda a sequência desde o início
    this.resetValidation();
    this.isValidating = true;

    for (const char of this.tokenToValidate) {
      const result = this.automatoService.processSymbol(this.currentValidationState, char);
      
      if (result.nextState === null) {
        // Transição inválida encontrada
        this.tokenToValidate = this.tokenToValidate.slice(0, this.validationSteps.length);
        this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
        this.isValidating = false;
        return;
      }

      // Atualizar estado
      const fromState = this.currentValidationState;
      this.currentValidationState = result.nextState;
      this.validationPath.push(this.currentValidationState);

      this.validationSteps.push({
        symbol: char,
        from: fromState,
        to: this.currentValidationState
      });
    }
  }

  /**
   * Handle do pressionamento de teclas no input de validação
   * 
   * Valida antes de adicionar ao campo
   */
  onValidationKeyPress(event: KeyboardEvent): void {
    // Enter ou Espaço finalizam a validação
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.finalizeValidation();
      return;
    }

    // Se há resultado anterior e digita nova letra, resetar
    if (!this.isValidating && this.validationResult) {
      const symbol = event.key.toLowerCase();
      if (/^[a-z]$/.test(symbol)) {
        event.preventDefault();
        this.resetValidation();
        this.isValidating = true;
        
        // Validar primeira letra
        const result = this.automatoService.processSymbol(0, symbol);
        if (result.nextState === null) {
          this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
          this.tokenToValidate = '';
          return;
        }
        
        // Adicionar ao campo apenas se válido
        this.currentValidationState = result.nextState;
        this.validationPath.push(this.currentValidationState);
        this.validationSteps.push({
          symbol,
          from: 0,
          to: this.currentValidationState
        });
        this.tokenToValidate += symbol;
      }
      return;
    }

    if (!this.isValidating) return;

    // Processar letra normal
    const symbol = event.key.toLowerCase();
    
    // Apenas letras minúsculas
    if (!/^[a-z]$/.test(symbol)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    // Validar transição
    const result = this.automatoService.processSymbol(this.currentValidationState, symbol);
    
    if (result.nextState === null) {
      // Transição inválida
      this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
      this.tokenToValidate = '';
      this.isValidating = false;
      return;
    }

    // Adicionar ao campo apenas se transição é válida
    const fromState = this.currentValidationState;
    this.currentValidationState = result.nextState;
    this.validationPath.push(this.currentValidationState);
    this.validationSteps.push({
      symbol,
      from: fromState,
      to: this.currentValidationState
    });
    this.tokenToValidate += symbol;
  }

  /**
   * FINALIZA A VALIDAÇÃO
   * 
   * Verifica:
   * 1. Se terminou em um estado final
   * 2. Se o token é válido
   * 3. Registra tokens válidos reconhecidos
   */
  finalizeValidation(): void {
    if (this.tokenToValidate.trim().length === 0) {
      this.validationResult = '';
      return;
    }

    // Verificar se está em um estado final
    const isFinalState = this.finalStates.has(this.currentValidationState);

    if (isFinalState) {
      this.validationResult = `✅ TOKEN VÁLIDO: "${this.tokenToValidate}"`;
      
      // Registrar token válido reconhecido
      if (!this.validTokensRecognized.includes(this.tokenToValidate)) {
        this.validTokensRecognized.push(this.tokenToValidate);
      }
    } else {
      this.validationResult = `❌ TOKEN INVÁLIDO`;
    }

    this.isValidating = false;
    this.tokenToValidate = '';
  }

  /**
   * Retorna a cor CSS para um estado baseado no seu status
   */
  getStateStyle(stateId: number): { [key: string]: string } {
    const isCurrentState = stateId === this.currentValidationState && this.isValidating;
    const isFinal = this.isStateFinal(stateId);

    if (isCurrentState) {
      return { 'background-color': '#3498db', color: 'white' }; // Azul - estado atual
    } else if (isFinal) {
      return { 'background-color': '#27ae60', color: 'white' }; // Verde - estado final
    } else {
      return { 'background-color': '#ecf0f1', color: '#333' }; // Cinza - estado normal
    }
  }

  getFinalStateIcon(stateId: number): string {
    return this.isStateFinal(stateId) ? ' ✓' : '';
  }

  /**
   * Obtém o valor da transição da tabela
   */
  getTransitionValue(stateId: number, symbol: string): string {
    if (!this.transitionTable) return '-';
    const stateLabel = `q${stateId}`;
    return this.transitionTable.transitions.get(stateLabel)?.get(symbol) || '-';
  }
}
