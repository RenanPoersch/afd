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

    const rulesMap = new Map<string, Set<string>>();
    const finalMap = new Map<string, boolean>();

    for (const [node, name] of assignedNames.entries()) {
      finalMap.set(name, node.isFinal || finalMap.get(name) === true);

      for (const [symbol, child] of node.children.entries()) {
        let childName = assignedNames.get(child);
        if (!childName) {
          childName = getNextChildNonTerminal();
          assignedNames.set(child, childName);
        }

        const prod = `${symbol}${childName}`;
        if (!rulesMap.has(name)) rulesMap.set(name, new Set());
        rulesMap.get(name)!.add(prod);
      }
    }

    for (const [node, name] of assignedNames.entries()) {
      if (node.isFinal) {
        if (!rulesMap.has(name)) rulesMap.set(name, new Set());
        rulesMap.get(name)!.add('ε');
      }
    }

    const names = Array.from(rulesMap.keys());
    if (!names.includes('S')) names.unshift('S');

    names.sort((a, b) => {
      if (a === 'S') return -1;
      if (b === 'S') return 1;
      return a.localeCompare(b);
    });

    const mergedRules = new Map<string, GrammarRule>();
    for (const left of names) {
      const productions = Array.from(rulesMap.get(left) ?? []).sort();
      const existing = mergedRules.get(left);

      if (existing) {
        existing.productions = Array.from(new Set([...existing.productions, ...productions])).sort();
        existing.isFinal = existing.isFinal || (finalMap.get(left) ?? false);
        continue;
      }

      mergedRules.set(left, {
        left,
        productions,
        isStart: left === 'S',
        isFinal: finalMap.get(left) ?? false
      });
    }

    return Array.from(mergedRules.values());
  }
}