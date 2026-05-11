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
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const getNextNonTerminal = (): string => {
      if (nextNameIndex === 0) {
        nextNameIndex += 1;
        return 'S';
      }

      const index = nextNameIndex - 1;
      nextNameIndex += 1;

      if (index < letters.length) {
        return letters[index];
      }

      return `A${index - letters.length + 1}`;
    };

    assignedNames.set(root, 'S');
    nextNameIndex = 1;

    while (queue.length > 0) {
      const node = queue.shift()!;

      for (const child of node.children.values()) {
        if (!assignedNames.has(child)) {
          assignedNames.set(child, getNextNonTerminal());
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
          childName = getNextNonTerminal();
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

    const rules: GrammarRule[] = [];
    for (const left of names) {
      const prods = Array.from(rulesMap.get(left) ?? []).sort();
      rules.push({
        left,
        productions: prods,
        isStart: left === 'S',
        isFinal: finalMap.get(left) ?? false
      });
    }

    return rules;
  }
}