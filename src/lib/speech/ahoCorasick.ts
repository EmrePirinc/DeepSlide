// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Aho-Corasick multi-pattern string matching otomatı.
 *
 * Sıfır bağımlılık, O(n + m + z) zaman karmaşıklığı — text uzunluğu + pattern
 * toplam uzunluğu + bulunan eşleşme sayısı.
 *
 * DeepSlide kullanımı:
 *   - Sunum yüklenince her image'ın her keyword'ünün her varyasyonu (asciified +
 *     stemmed) pattern olarak eklenir
 *   - WebSpeech final transcript normalize edilip tek search çağrısıyla
 *     taranır, cümle içinde bulunan tüm keyword'ler geri döner
 *   - Hook en uzun pattern'ı kazanan seçer (longest match wins — en spesifik)
 *
 * Klasik Aho-Corasick 1975 — three-part automaton:
 *   goto()    — trie (pattern prefix graph)
 *   failure() — BFS ile kurulan düşme bağlantıları (backtrack yok)
 *   output()  — her node'da biten pattern'lar + ancestor output'ları
 */

export interface OutputMatch {
  keywordId: string;
  imageId: string;
  /** Pattern char uzunluğu — "longest wins" seçimi için */
  patternLength: number;
  /** Bulunan eşleşmenin text içindeki bitiş pozisyonu (debug) */
  endIndex: number;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  /** Failure link — mismatch'te düşülecek node. Root için self. */
  fail: TrieNode | null;
  /** Bu node'da biten pattern output'ları + ancestor output'ları (BFS merge sonrası) */
  outputs: OutputMatch[];
}

function createNode(): TrieNode {
  return {
    children: new Map(),
    fail: null,
    outputs: [],
  };
}

export class AhoCorasickAutomaton {
  private root: TrieNode;
  private built = false;

  constructor() {
    this.root = createNode();
    this.root.fail = this.root;
  }

  /**
   * Pattern'ı trie'ya ekler. `buildAutomaton` çağrılmadan search çalışmaz.
   * Aynı keywordId birden fazla pattern'a eklenebilir (synonym + stem).
   */
  addPattern(keywordId: string, imageId: string, pattern: string): void {
    if (!pattern) return;
    this.built = false;

    let node = this.root;
    for (const ch of pattern) {
      let child = node.children.get(ch);
      if (!child) {
        child = createNode();
        node.children.set(ch, child);
      }
      node = child;
    }
    // Terminal output — en uzun path'te duplike olmasın
    const existing = node.outputs.find(
      (o) => o.keywordId === keywordId && o.imageId === imageId && o.patternLength === pattern.length,
    );
    if (!existing) {
      node.outputs.push({
        keywordId,
        imageId,
        patternLength: pattern.length,
        endIndex: 0, // search sırasında doldurulur (copy)
      });
    }
  }

  /**
   * Failure link'leri BFS ile kur ve her node'a ancestor output'larını merge et.
   * Tüm pattern'lar eklendikten sonra bir kez çağrılmalıdır.
   */
  buildAutomaton(): void {
    const queue: TrieNode[] = [];

    // Depth 1 children'ın failure link'i root
    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const [ch, child] of current.children) {
        queue.push(child);

        // Failure link hesapla — parent.fail zincirinde bu char'ı ara
        let fallback = current.fail!;
        while (fallback !== this.root && !fallback.children.has(ch)) {
          fallback = fallback.fail!;
        }

        const fallbackChild = fallback.children.get(ch);
        child.fail = fallbackChild && fallbackChild !== child ? fallbackChild : this.root;

        // Ancestor output'larını merge et (overlapping pattern desteği)
        if (child.fail.outputs.length > 0) {
          child.outputs = [...child.outputs, ...child.fail.outputs];
        }
      }
    }

    this.built = true;
  }

  /**
   * Text içinde tüm pattern eşleşmelerini bul. O(n + z).
   * Çağrıldığında `buildAutomaton` çalışmışsa outputs döner, yoksa boş.
   */
  search(text: string): OutputMatch[] {
    if (!this.built || !text) return [];

    const matches: OutputMatch[] = [];
    let node = this.root;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      // Mismatch → failure link takip et
      while (node !== this.root && !node.children.has(ch)) {
        node = node.fail!;
      }

      const next = node.children.get(ch);
      if (next) {
        node = next;
      } else {
        // Root'ta da yoksa (first char mismatch)
        node = this.root;
      }

      // Bu node'daki tüm output'ları kaydet (endIndex = i)
      if (node.outputs.length > 0) {
        for (const output of node.outputs) {
          matches.push({ ...output, endIndex: i });
        }
      }
    }

    return matches;
  }

  /**
   * Trie node sayısı — debug / test için.
   */
  get size(): number {
    let count = 0;
    const stack: TrieNode[] = [this.root];
    while (stack.length > 0) {
      const n = stack.pop()!;
      count++;
      for (const child of n.children.values()) stack.push(child);
    }
    return count;
  }
}
