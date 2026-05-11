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
    let nextNameIndex = 0;

    const getNextNonTerminal = (): string => {
    if (nextNameIndex === 0) {
        nextNameIndex += 1;
        return 'S';
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRTUVWXYZ';
    const index = nextNameIndex - 1;
    nextNameIndex += 1;

    if (index < alphabet.length) {
        return alphabet[index];
    }

    return `A${index - alphabet.length + 1}`;
    };

    assignedNames.set(root, getNextNonTerminal());

    while (queue.length > 0) {
      const node = queue.shift()!;

      for (const child of node.children.values()) {
        if (!assignedNames.has(child)) {
          assignedNames.set(child, getNextNonTerminal());
          queue.push(child);
        }
      }
    }

    const rules: GrammarRule[] = [];
    const allNodes = [...assignedNames.keys()].sort((a, b) => {
    const leftA = assignedNames.get(a) ?? '';
    const leftB = assignedNames.get(b) ?? '';

    if (leftA === 'S') return -1;
    if (leftB === 'S') return 1;

    return leftA.localeCompare(leftB);
    });

    for (const node of allNodes) {
      const left = assignedNames.get(node)!;
      const productions = Array.from(node.children.entries()).map(([symbol, child]) => {
        return `${symbol}${assignedNames.get(child)}`;
      });

      if (node.isFinal) {
        productions.push('ε');
      }

      rules.push({
        left,
        productions,
        isStart: left === 'S',
        isFinal: node.isFinal
      });
    }

    return rules;
  }
}