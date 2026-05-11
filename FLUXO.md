# Visão geral da arquitetura

O projeto é dividido em 3 partes principais:

| Camada            | Responsabilidade                                   |
| ----------------- | -------------------------------------------------- |
| `App` (`app.ts`)  | Interface, eventos do teclado e fluxo da aplicação |
| `AutomatoService` | Construção e validação do AFD                      |
| `models/state.ts` | Estruturas de dados do autômato                    |

# Estruturas de dados centrais

## 1. Estrutura de um estado

Estrutura:

```ts
export interface State {
  id: number;
  isFinal: boolean;
  transitions: Map<string, number>;
}
```

Exemplo:

```ts
{
  id: 0,
  isFinal: false,
  transitions: Map {
    'c' => 1,
    'd' => 5
  }
}
```

# Estruturas globais do autômato

## states

```ts
Map {
  0 => { ... },
  1 => { ... },
  2 => { ... }
}
```

## finalStates

```ts
Set { 3, 7, 10 }
```

## alphabet

```ts
Set { 'a', 'b', 'c' }
```

---

## validationHistory

```ts
[
  {
    symbol: 'c',
    fromState: 0,
    toState: 1
  },
  {
    symbol: 'a',
    fromState: 1,
    toState: 2
  }
]
```


# ETAPA 1 — Usuário adiciona token

# Estado inicial da aplicação

```ts
tokens = ['casa', 'cama']
```

# ETAPA 2 — buildAutomato()

```ts
buildAutomato()
```

# ETAPA 3 — initializeAutomato()

```ts
initializeAutomato()
```

# ETAPA 4 — createState(true)

```ts
this.createState(true);

const newState: State = {
  id,
  isFinal: false,
  transitions: new Map()
};

this.states.set(id, newState);
```

## states

```ts
Map {
  0 => {
    id: 0,
    isFinal: false,
    transitions: Map {}
  }
}
```

# ETAPA 5 — Processamento do token "casa"

# currentState começa em 0

```ts
let currentState = 0;
```

# Símbolo 1 — 'c'

```ts
const state = this.states.get(currentState);

states.get(0)

{
  id: 0,
  transitions: Map {}
}
```

# Verifica se já existe transição com 'c'

```ts
if (state.transitions.has(symbol))
```

# Cria novo estado

```ts
const nextState = this.createState();
state.transitions.set(symbol, nextState);
```

# Estrutura após 'c'

```ts
states = Map {
  0 => {
    id: 0,
    transitions: Map {
      'c' => 1
    }
  },

  1 => {
    id: 1,
    transitions: Map {}
  }
}
```

# Símbolo 2 — 'a'

# Estrutura agora

```ts
0 --c--> 1
1 --a--> 2
```

# Símbolo 3 — 's'
# Símbolo 4 — 'a'
# Final do token "casa"

Código:

```ts
this.finalStates.add(currentState);
finalStates = Set { 4 }
finalState.isFinal = true;

{
  id: 4,
  isFinal: true
}
```

# Grafo parcial do AFD

```text
(q0) --c--> (q1)
(q1) --a--> (q2)
(q2) --s--> (q3)
(q3) --a--> ((q4))
```

`(( ))` = estado final.

---

# ETAPA 6 — Processamento do token "cama"

# Símbolo 'c'

```ts
transitions.has('c')

true
```

Então NÃO cria novo estado.

# Símbolo 'a'
# Símbolo 's'
# Próximo 'a'

# Estrutura FINAL do autômato

```text
(q0)
  |
  c
  v
(q1)
  |
  a
  v
(q2)
 /   \
s     m
|     |
v     v
(q3) (q5)
 |      |
 a      a
 v      v
((q4)) ((q6))
```

# Estrutura real do Map

```ts
states = Map {

  0 => {
    transitions: Map {
      'c' => 1
    }
  },

  1 => {
    transitions: Map {
      'a' => 2
    }
  },

  2 => {
    transitions: Map {
      's' => 3,
      'm' => 5
    }
  },

  3 => {
    transitions: Map {
      'a' => 4
    }
  },

  4 => {
    isFinal: true,
    transitions: Map {}
  },

  5 => {
    transitions: Map {
      'a' => 6
    }
  },

  6 => {
    isFinal: true,
    transitions: Map {}
  }
}
```


# ETAPA 7 — Validação do token

```ts
processSymbol()
```

# Fluxo de digitação

Usuário digita

c

# Símbolo capturado

```ts
symbol = 'c'

const result = this.automatoService.processSymbol(
  this.currentValidationState,
  symbol
);
```

```ts
currentValidationState = 0
```

Então:

```ts
processSymbol(0, 'c')
```

# Dentro de processSymbol()

```ts
const state = this.states.get(currentState);

state = q0
```

# Busca transição

```ts
const nextState = state.transitions.get(symbol) ?? null;
q0.transitions.get('c')
```

# Registra histórico

```ts

this.validationHistory.push({
  symbol,
  fromState: currentState,
  toState: nextState,
});

[
  {
    symbol: 'c',
    fromState: 0,
    toState: 1
  }
]

return {
  nextState,
  isValid: true
}

{
  nextState: 1,
  isValid: true
}


this.currentValidationState = result.nextState;
```

```ts
this.validationPath.push(this.currentValidationState);

[0]
[0, 1]
```

# Digita próximo símbolo: 'a'
# Digita 's'
# Digita 'a'

```ts
[0,1,2,3,4]
```

# ETAPA 8 — finalizeValidation()

Quando usuário pressiona Enter:

```ts
finalizeValidation()
```

# Verifica se estado atual é final

```ts
const isFinalState = this.finalStates.has(this.currentValidationState);
finalStates.has(4)
true
```

# Resultado

```ts
this.validationResult =
  `✅ TOKEN VÁLIDO: "${this.tokenToValidate}"`;
q0 → q1 → q2 → q3 → q4
```


# Fluxo completo resumido

```text
Usuário cadastra token
        ↓
Token vai para array
        ↓
buildAutomato()
        ↓
createState()
        ↓
transitions.set()
        ↓
AFD fica montado em memória
        ↓
Usuário digita token
        ↓
processSymbol()
        ↓
transitions.get()
        ↓
validationPath.push()
        ↓
Cadeia de estados é formada
        ↓
finalStates.has()
        ↓
Token aceito/rejeitado
```
