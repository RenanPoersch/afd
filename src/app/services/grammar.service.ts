import { Injectable } from '@angular/core';

export interface GrammarRule {
  left: string;
  productions: string[];
  isStart: boolean;
  isFinal: boolean;
}

type GrammarNode = {
  children: Map<string, GrammarNode>;
  isFinal: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class GrammarService {
  buildGrammarRules(tokens: string[]): GrammarRule[] {
    if (tokens.length === 0) {
      return [];
    }

    const root: GrammarNode = {
      children: new Map(),
      isFinal: false
    };

    for (const token of tokens) {
      let currentNode = root;

      for (const symbol of token) {
        if (!currentNode.children.has(symbol)) {
          currentNode.children.set(symbol, {
            children: new Map(),
            isFinal: false
          });
        }

        currentNode = currentNode.children.get(symbol)!;
      }

      currentNode.isFinal = true;
    }

    const assignedNames = new Map<GrammarNode, string>();
    const queue: GrammarNode[] = [root];
    let nextChildIndex = 0;

    const childLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const getNextChildNonTerminal = (): string => {
      const index = nextChildIndex;
      nextChildIndex += 1;

      if (index < childLetters.length) {
        const letter = childLetters[index];
        return letter === 'S' ? `A${index + 1}` : letter;
      }

      return `A${index - childLetters.length + 1}`;
    };

    assignedNames.set(root, 'S');

    while (queue.length > 0) {
      const node = queue.shift()!;

      for (const child of node.children.values()) {
        if (!assignedNames.has(child)) {
          assignedNames.set(child, getNextChildNonTerminal());
          queue.push(child);
        }
      }
    }

    // Consolidate rules by left-hand side to avoid duplicates
    const rulesMap = new Map<string, Set<string>>();
    const finalMap = new Map<string, boolean>();

    for (const [node, name] of assignedNames.entries()) {
      finalMap.set(name, node.isFinal || finalMap.get(name) === true);

      for (const [symbol, child] of node.children.entries()) {
        const childName = assignedNames.get(child);
        if (!childName) continue;

        const prod = `${symbol}${childName}`;
        if (!rulesMap.has(name)) rulesMap.set(name, new Set());
        rulesMap.get(name)!.add(prod);
      }
    }

    // Add epsilon only once per rule
    for (const [name, isFinal] of finalMap.entries()) {
      if (isFinal) {
        if (!rulesMap.has(name)) rulesMap.set(name, new Set());
        rulesMap.get(name)!.add('ε');
      }
    }

    // Build final rules sorted with S first
    const names = Array.from(rulesMap.keys()).sort((a, b) => {
      if (a === 'S') return -1;
      if (b === 'S') return 1;
      return a.localeCompare(b);
    });

    const rules: GrammarRule[] = [];
    for (const left of names) {
      const productions = Array.from(rulesMap.get(left) ?? []).sort();
      rules.push({
        left,
        productions,
        isStart: left === 'S',
        isFinal: finalMap.get(left) ?? false
      });
    }

    return rules;
  }
}