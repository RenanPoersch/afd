import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutomatoService } from './services/automato.service';
import { State } from './models/state';

/**
 * COMPONENTE PRINCIPAL - ANALISADOR LÉXICO COM AFD
 * 
 * Responsável pela interface do usuário e orquestração do fluxo
 */
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
  duplicateTokenError: string = '';
  stats: {
    totalStates: number;
    totalFinalStates: number;
    alphabetSize: number;
    totalTransitions: number;
  } | null = null;

  constructor(private automatoService: AutomatoService) {}

  ngOnInit(): void {
    // Inicializar com alguns exemplos (opcional)
  }

  // ========== MÉTODOS DE CADASTRO DE TOKENS ==========

  /**
   * Adiciona um novo token à lista
   * 
   * Validações:
   * - Apenas letras minúsculas (a-z)
   * - Sem duplicatas
   * - Não vazio
   */
  addToken(): void {
    this.duplicateTokenError = '';

    if (!this.newToken.trim()) {
      this.duplicateTokenError = 'Token não pode estar vazio!';
      return;
    }

    // Filtrar apenas letras minúsculas
    const filteredToken = this.newToken.toLowerCase().replace(/[^a-z]/g, '');

    if (!filteredToken) {
      this.duplicateTokenError = 'Token deve conter pelo menos uma letra minúscula (a-z)!';
      return;
    }

    // Verificar duplicata
    if (this.tokens.includes(filteredToken)) {
      this.duplicateTokenError = `Token '${filteredToken}' já foi cadastrado!`;
      return;
    }

    // Adicionar token
    this.tokens.push(filteredToken);
    this.newToken = '';
    this.showAutomato = false;
  }

  /**
   * Handle do pressionamento de teclas no input de tokens
   */
  onTokenKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.addToken();
    }
  }

  /**
   * Remove um token da lista
   */
  removeToken(index: number): void {
    this.tokens.splice(index, 1);
    this.showAutomato = false;
    this.duplicateTokenError = '';
  }

  /**
   * Limpa todos os tokens e reseta o autômato
   */
  clearAllTokens(): void {
    this.tokens = [];
    this.validTokensRecognized = [];
    this.showAutomato = false;
    this.duplicateTokenError = '';
    this.states.clear();
    this.finalStates.clear();
    this.alphabet = [];
    this.stats = null;
  }

  // ========== MÉTODOS DE CONSTRUÇÃO DO AUTÔMATO ==========

  /**
   * CONSTRÓI O AUTÔMATO AUTOMATICAMENTE
   * 
   * Dispara a construção do AFD no serviço e atualiza a interface
   */
  buildAutomato(): void {
    if (this.tokens.length === 0) {
      alert('Adicione pelo menos um token antes de construir o autômato!');
      return;
    }

    // Construir AFD
    this.automatoService.buildAutomato(this.tokens);

    // Recuperar dados do autômato
    this.states = this.automatoService.getStates();
    this.finalStates = this.automatoService.getFinalStates();
    this.alphabet = this.automatoService.getAlphabet();
    this.transitionTable = this.automatoService.getTransitionTable();
    this.stats = this.automatoService.getAutomatoStats();

    this.showAutomato = true;
    this.resetValidation();
    this.isValidating = true;
  }

  /**
   * Retorna a label do estado (q0, q1, q2, etc)
   */
  getStateLabel(stateId: number): string {
    return `q${stateId}`;
  }

  /**
   * Verifica se um estado é final
   */
  isStateFinal(stateId: number): boolean {
    return this.finalStates.has(stateId);
  }

  // ========== MÉTODOS DE VALIDAÇÃO DE TOKENS ==========



  /**
   * Reseta o estado de validação
   */
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
   * 
   * Este é o coração do funcionamento do AFD:
   * 1. Ler o símbolo
   * 2. Buscar a transição no estado atual
   * 3. Atualizar o estado
   * 4. Se não houver transição, REJEITAR
   */
  private processValidationSymbol(symbol: string): boolean {
    const result = this.automatoService.processSymbol(
      this.currentValidationState,
      symbol
    );

    if (result.nextState === null) {
      return false; // Sem transição válida
    }

    // Atualizar estado e registrar o passo
    const fromState = this.currentValidationState;
    this.currentValidationState = result.nextState;
    this.validationPath.push(this.currentValidationState);

    this.validationSteps.push({
      symbol,
      from: fromState,
      to: this.currentValidationState
    });

    return true;
  }

  /**
   * Handle do pressionamento de teclas no input de validação
   * 
   * Enter ou Espaço finalizam a validação
   * Se houver resultado e o usuário digita novamente, inicia nova validação automaticamente
   */
  onValidationKeyPress(event: KeyboardEvent): void {
    // Se há um resultado anterior e o usuário começa a digitar, resetar automaticamente
    if (!this.isValidating && this.validationResult) {
      const symbol = event.key.toLowerCase();
      
      // Apenas letras minúsculas disparam novo reset
      if (/^[a-z]$/.test(symbol)) {
        event.preventDefault();
        this.resetValidation();
        this.isValidating = true;
        // Processar o primeiro caractere da nova validação
        this.processValidationSymbol(symbol);
        this.tokenToValidate += symbol;
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') {
        event.preventDefault();
        this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
        this.tokenToValidate = '';
        return;
      }
      return;
    }

    if (!this.isValidating) return;

    // Enter ou Espaço finalizam a validação
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.finalizeValidation();
      return;
    }

    // Qualquer outro caractere é processado
    const symbol = event.key.toLowerCase();
    
    // Aceitar apenas letras minúsculas
    if (!/^[a-z]$/.test(symbol)) {
      event.preventDefault();
      if (event.key !== 'Enter' && event.key !== ' ') {
        this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
        this.tokenToValidate = '';
        this.isValidating = false;
      }
      return;
    }

    // Processar o símbolo no autômato
    const isValid = this.processValidationSymbol(symbol);

    if (!isValid) {
      // Rejeitar token: nenhuma transição válida
      this.validationResult = '❌ TOKEN INVÁLIDO - Símbolo não reconhecido!';
      this.tokenToValidate = '';
      this.isValidating = false;
      return;
    }

    // Atualizar o input visualmente
    this.tokenToValidate += symbol;
    event.preventDefault();
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

  /**
   * Retorna ícone para estado final
   */
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
