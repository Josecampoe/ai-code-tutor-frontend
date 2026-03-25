// ─── Stack ────────────────────────────────────────────────────────────────────
export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ─── Queue ────────────────────────────────────────────────────────────────────
export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  front(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

// ─── LinkedList ───────────────────────────────────────────────────────────────
export class LinkedListNode<T> {
  value: T;
  next: LinkedListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private _size = 0;

  append(value: T): void {
    const node = new LinkedListNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this._size++;
  }

  prepend(value: T): void {
    const node = new LinkedListNode(value);
    node.next = this.head;
    this.head = node;
    this._size++;
  }

  delete(value: T): void {
    if (!this.head) return;
    if (this.head.value === value) {
      this.head = this.head.next;
      this._size--;
      return;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this._size--;
        return;
      }
      current = current.next;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  size(): number {
    return this._size;
  }
}

// ─── HashMap ──────────────────────────────────────────────────────────────────
export class HashMap<K extends string, V> {
  private map: Record<string, V> = {};

  set(key: K, value: V): void {
    this.map[key] = value;
  }

  get(key: K): V | undefined {
    return this.map[key];
  }

  has(key: K): boolean {
    return Object.prototype.hasOwnProperty.call(this.map, key);
  }

  delete(key: K): void {
    delete this.map[key];
  }

  keys(): K[] {
    return Object.keys(this.map) as K[];
  }

  values(): V[] {
    return Object.values(this.map);
  }

  entries(): [K, V][] {
    return Object.entries(this.map) as [K, V][];
  }

  clear(): void {
    this.map = {};
  }
}

// ─── Trie ─────────────────────────────────────────────────────────────────────
export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd = false;
}

export class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char)!;
    }
    return node.isEnd;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char)!;
    }
    return true;
  }

  getWordsWithPrefix(prefix: string): string[] {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }
    const results: string[] = [];
    this._dfs(node, prefix, results);
    return results;
  }

  private _dfs(node: TrieNode, current: string, results: string[]): void {
    if (node.isEnd) results.push(current);
    for (const [char, child] of node.children) {
      this._dfs(child, current + char, results);
    }
  }
}

// ─── Language keyword preloaders ──────────────────────────────────────────────
const KEYWORDS: Record<string, string[]> = {
  javascript: ['const', 'let', 'var', 'function', 'arrow', 'async', 'await', 'class', 'return', 'if', 'else', 'for', 'while'],
  python: ['def', 'class', 'return', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'with', 'lambda'],
  java: ['public', 'private', 'class', 'void', 'int', 'String', 'return', 'if', 'else', 'for', 'while', 'new', 'this'],
  cpp: ['int', 'void', 'class', 'return', 'if', 'else', 'for', 'while', 'new', 'delete', 'include', 'namespace'],
};

export function buildTrieForLanguage(language: string): Trie {
  const trie = new Trie();
  const keywords = KEYWORDS[language] ?? KEYWORDS['javascript'];
  keywords.forEach((kw) => trie.insert(kw));
  return trie;
}
