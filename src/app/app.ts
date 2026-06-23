import { Component } from '@angular/core';
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

export class App {
  // ========== GERENCIAMENTO DE TOKENS ==========
  newToken: string = '';
  tokens: string[] = [];
  validTokensRecognized: string[] = [];

  // ========== GERENCIAMENTO DO AUTÔMATO ==========
  states: Map<number, State> = new Map();
  transitionTable: {
    states: number[];
    alphabet: string[];
    transitions: Map<string, Map<string, string>>;
  } | null = null;
  grammarRules: GrammarRule[] = [];

  // ========== VALIDAÇÃO DE TOKENS ==========
  tokenToValidate: string = '';
  currentValidationState: number = 0;
  validationResult: string = '';
  isValidating: boolean = false;
  validationSteps: Array<{
    symbol: string;
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

  addToken(): void {
    this.tokenError = '';
    const filteredToken = this.newToken.toLowerCase().replace(/[^a-z]/g, '');

    if (this.tokens.includes(filteredToken)) {
      const tokenLabel = filteredToken || 'ε';
      this.tokenError = `Token '${tokenLabel}' já foi cadastrado!`;
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
    this.transitionTable = null;
    this.stats = null;
    this.grammarRules = [];
  }

  buildAutomato(): void {
    this.automatoService.buildAutomato(this.tokens);

    this.states = this.automatoService.getStates();
    this.transitionTable = this.automatoService.getTransitionTable();
    this.stats = this.automatoService.getAutomatoStats();
    this.grammarRules = this.grammarService.buildGrammarRules(this.states);

    this.showAutomato = true;
    this.resetValidation();
    this.isValidating = true;
  }

  isStateFinal(stateId: number): boolean {
    return this.states.get(stateId)?.isFinal ?? false;
  }

  resetValidation(): void {
    this.currentValidationState = 0;
    this.validationResult = '';
    this.tokenToValidate = '';
    this.validationSteps = [];
  }

  onValidationKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.resetValidation();
      this.isValidating = true;
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.finalizeValidation();
      return;
    }

    const symbol = event.key.toLowerCase();

    if (!/^[a-z]$/.test(symbol)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    // iniciar nova validation se a outra terminou
    if (!this.isValidating && this.validationResult) {
      this.resetValidation();
      this.isValidating = true;
    }

    if (!this.isValidating) {
      return;
    }

    const fromState = this.currentValidationState;

    const nextState = this.automatoService.processSymbol(
      fromState,
      symbol
    );

    if (nextState === null) {
      this.validationResult =
        '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';

      this.tokenToValidate = '';
      this.isValidating = false;
      return;
    }

    this.currentValidationState = nextState;

    this.validationSteps.push({
      symbol,
      to: this.currentValidationState
    });

    this.tokenToValidate += symbol;
  }

  finalizeValidation(): void {
    if (!this.tokenToValidate) {
      this.currentValidationState = 0;
      this.validationSteps = [];
    }

    const isFinalState = this.isStateFinal(this.currentValidationState);

    if (isFinalState) {
      const recognizedToken = this.tokenToValidate || 'ε';
      this.validationResult = `✅ TOKEN VÁLIDO: "${recognizedToken}"`;

      if (!this.validTokensRecognized.includes(recognizedToken)) {
        this.validTokensRecognized.push(recognizedToken);
      }
    } else {
      this.validationResult = `❌ TOKEN INVÁLIDO`;
    }

    this.isValidating = false;
    this.tokenToValidate = '';
  }

  getTransitionValue(stateId: number, symbol: string): string {
    if (!this.transitionTable) return '-';
    const stateLabel = `q${stateId}`;
    return this.transitionTable.transitions.get(stateLabel)?.get(symbol) || '-';
  }
}
