# 🔤 Analisador Léxico - Autômato Finito Determinístico (AFD)

Um projeto acadêmico completo em **Angular Standalone** que implementa um analisador léxico baseado em **Autômato Finito Determinístico**, totalmente em frontend, sem backend.

## 📚 Objetivo

Demonstrar de forma didática e visual como funciona:
- Construção automática de um AFD a partir de tokens
- Validação incremental de símbolos
- Transições de estados
- Reconhecimento de linguagens regulares

## 🚀 Funcionalidades Principais

### 1️⃣ Cadastro de Tokens
- Interface simples para adicionar tokens válidos
- Aceita apenas letras minúsculas (a-z)
- Impede duplicação de tokens
- Validação em tempo real

### 2️⃣ Construção Automática do AFD
- Gera automaticamente os estados do autômato
- Usa estrutura de trie otimizada
- Marca estados finais com indicador visual
- Exibe estatísticas do autômato

### 3️⃣ Tabela de Transição
- Renderiza tabela δ(q, σ) do autômato
- Mostra todos os estados e símbolos
- Destaca estados finais
- Dinâmica e responsiva

### 4️⃣ Validação de Tokens
- Processa símbolo por símbolo
- Mostra transições em tempo real
- Destaca estado atual com cores
- Timeline visual das transições
- Pressione **Enter** ou **Espaço** para finalizar

### 5️⃣ Visualização de Estados
- Estados representados como círculos
- Cores dinâmicas:
  - 🟢 Verde = Estado Final
  - 🔵 Azul = Estado Atual
  - ⚪ Cinza = Estado Normal
- Animações suaves

## 📦 Estrutura do Projeto

```
afd/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── state.ts              # Interfaces do AFD
│   │   ├── services/
│   │   │   └── automato.service.ts   # Core do AFD
│   │   ├── app.ts                    # Componente Principal
│   │   ├── app.html                  # Template
│   │   └── app.scss                  # Estilos
│   ├── main.ts                       # Entry point
│   ├── styles.scss                   # Estilos globais
│   └── index.html
├── angular.json                      # Configuração Angular
├── tsconfig.json                     # Configuração TypeScript
└── package.json
```

## 🔧 Arquitetura

### AutomatoService
Encapsula toda a lógica do AFD:
- `buildAutomato(tokens)` - Constrói o AFD
- `processSymbol(state, symbol)` - Processa um símbolo
- `validateToken(token)` - Valida um token completo
- `getTransitionTable()` - Retorna tabela de transição
- `getAutomatoStats()` - Retorna estatísticas

### Models
- **State** - Representa um estado (id, final, transições)
- **ValidationResult** - Resultado da validação
- **TokenValidationStep** - Passo na validação

### Componente App
Gerencia:
- Cadastro de tokens
- Construção do autômato
- Validação de tokens
- Interface do usuário

## 🎨 Design e UI

- **Moderna e Responsiva**: Funciona em desktop e mobile
- **Paleta de Cores Profissional**: Azul, Verde, Vermelho para feedback
- **Animações Suaves**: Transições e efeitos visuais
- **Cards Organizados**: Seções bem definidas
- **Timeline Visual**: Mostra o caminho percorrido

## 💻 Tecnologias

- **Framework**: Angular 18+ (Standalone)
- **Linguagem**: TypeScript 5.x
- **Estilos**: SCSS
- **Sem Backend**: Totalmente Frontend
- **Sem Dependências Externas**: Apenas Angular Core

## 🏃 Como Executar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm start
```

O servidor estará disponível em `http://localhost:4200`

### Build para Produção

```bash
npm run build
```

Output em `dist/afd-temp`

## 📖 Como Usar

### Passo 1: Cadastrar Tokens
1. Escreva um token no input (ex: "casa")
2. Clique em "➕ Adicionar Token" ou pressione Enter
3. Repita para vários tokens (ex: "carro", "gato", "moto")

### Passo 2: Construir o Autômato
1. Clique em "🔨 Construir Autômato"
2. O AFD será gerado automaticamente
3. Veja a tabela de transição δ(q, σ)
4. Estados finais estão marcados com *

### Passo 3: Validar Tokens
1. Clique em "✍️ Validar Novo Token"
2. Comece a digitar caracteres (a-z apenas)
3. Veja o estado atual: q0, q1, q2...
4. Pressione **Enter** ou **Espaço** para finalizar
5. Veja o resultado: ✅ VÁLIDO ou ❌ INVÁLIDO

### Passo 4: Analisar Transições
- Cada validação mostra o timeline de transições
- Veja q0 → (a) → q1 → (s) → q2, etc.
- Token é aceito se terminar em estado final

## 🧠 Conceitos Implementados

### Autômato Finito Determinístico (AFD)
- Estado inicial: **q0**
- Função de transição: **δ(q, σ) = q'**
- Estados finais: **F ⊆ Q**
- Aceitação: se estado_final ∈ F

### Análise Léxica
- Leitura incremental de símbolos
- Construção de árvore de prefixos (trie)
- Reconhecimento de padrões

### Estruturas de Dados
```typescript
// Representação de Estado
interface State {
  id: number;
  isFinal: boolean;
  transitions: Map<string, number>;
}

// Tabela de Transição
Map<stateId, Map<symbol, nextStateId>>
```

## 🎓 Valor Didático

Este projeto é ideal para apresentações em aula sobre:
- ✅ Autômatos Finitos
- ✅ Análise Léxica
- ✅ Máquinas de Estados
- ✅ Linguagens Formais
- ✅ Compiladores

## 📊 Exemplos

### Exemplo 1: Palavras em Português
**Tokens**: casa, carro, cão, moto
**Válidos**: casa, carro, cão, moto, casa, casa
**Inválidos**: casas, carros, gato, carro1

### Exemplo 2: Números Binários
**Tokens**: 0, 1, 00, 11, 01, 10
**Válidos**: 0, 1, 00, 11, 01, 10
**Inválidos**: 2, 0a, 1x

## 🐛 Debugging

Para ver as transições internas:
1. Abra DevTools (F12)
2. Console mostra o histórico de validação
3. Inspecione o estado do autômato em tempo real

## 📝 Notas Técnicas

- **Angular Standalone**: Sem NgModule
- **Tree-shaking**: Código otimizado
- **OnPush Detection**: Performance
- **TypeScript Strict**: Type safety total
- **SCSS**: Variáveis e mixins para reutilização

## 🔐 Requisitos Não-Funcionais

- ✅ Sem servidor backend
- ✅ Sem banco de dados
- ✅ Sem chamadas HTTP
- ✅ Código 100% Standalone
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Sem jQuery ou bibliotecas externas

## 🚀 Melhorias Futuras

- [ ] Exportar AFD como JSON
- [ ] Importar AFD do usuário
- [ ] Diagrama visual do autômato
- [ ] Suporte para NFA → DFA
- [ ] Minimização de autômato
- [ ] Testes unitários

## 📄 Licença

Projeto acadêmico - Livre para uso educacional

## 👨‍💼 Autor

Desenvolvido como projeto didático de **Linguagens Formais e Compiladores**

---

**Pronto para explorar o mundo dos Autômatos Finitos!** 🔤✨
