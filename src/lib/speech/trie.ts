// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Karakter düzeyinde trie (prefix ağacı) — streaming keyword matching için.
 *
 * Amaç: Kullanıcı bir keyword'ü henüz söyleyip bitirmeden, eğer konuştuğu
 * karakter dizisi (prefix) sahnedeki sadece bir tek görseli benzersiz olarak
 * tanımlıyorsa, o görsel için tetikleme yap.
 *
 * Örnek:
 *   Sahne keyword'leri: "yürüyüş yolu", "saman balyası", "sis"
 *   User: "yürü..."  (prefix "yürü", uzunluk 4)
 *     → "yürü" başka keyword'ü tanımlamıyor → benzersiz, img-path tetikle
 *   User: "sam..."   (prefix "sam", uzunluk 3)
 *     → sadece "saman balyası" bu prefix'e sahip → img-hay tetikle
 *   User: "si..."    (prefix "si", uzunluk 2)
 *     → minimum derinlik 3'ten az → null
 *
 * Akademik temel:
 *   - Aho & Corasick 1975 (multi-pattern streaming match)
 *   - CTC Prefix Beam Search with Early Termination (Hannun 2014+)
 *   - Trie + unique descendant count (klasik veri yapısı)
 */

export interface TrieEntry {
  /** Trie'ya yazılacak metin — normalize + asciify edilmiş olmalıdır. */
  text: string;
  /** Bu metnin ait olduğu görselin ID'si. */
  imageId: string;
}

export interface PrefixMatch {
  /** Eşleşen görselin ID'si. */
  imageId: string;
  /** Benzersizliğin tespit edildiği node derinliği (kaç karakter okuduk?). */
  depth: number;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  /**
   * Bu node'dan aşağı giden TÜM yollar aynı image ID'sine aitse o ID,
   * aksi halde null (dallanma veya birden fazla image).
   */
  uniqueImageId: string | null;
  /** Bu node bir terminal mi (bir keyword tam olarak burada bitiyor mu). */
  terminalImageIds: Set<string>;
}

const MIN_UNIQUE_DEPTH = 3;

function createNode(): TrieNode {
  return {
    children: new Map(),
    uniqueImageId: null,
    terminalImageIds: new Set(),
  };
}

/**
 * Karakter düzeyinde trie.
 *
 * Kullanım:
 *   const t = new KeywordTrie();
 *   t.build([{ text: 'yuruyus yolu', imageId: 'img-1' }, ...]);
 *   const m = t.findUniquePrefix('yuruyus');
 *   if (m) orchestrator.focusImage(m.imageId, 0.85);
 */
export class KeywordTrie {
  private root: TrieNode = createNode();

  /**
   * Trie'yı baştan kurar. Mevcut içerik silinir.
   * Build sonrasında her iç node için `uniqueImageId` post-order DFS ile hesaplanır.
   *
   * Performans: O(toplam karakter sayısı). 50 keyword × 15 char ≈ 750 node → <3 ms.
   */
  build(entries: TrieEntry[]): void {
    this.root = createNode();

    for (const entry of entries) {
      if (!entry.text) continue;
      this.insert(entry.text, entry.imageId);
    }

    this.computeUniqueImageIds(this.root);
  }

  private insert(text: string, imageId: string): void {
    let node = this.root;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      let child = node.children.get(ch);
      if (!child) {
        child = createNode();
        node.children.set(ch, child);
      }
      node = child;
    }
    node.terminalImageIds.add(imageId);
  }

  /**
   * Post-order DFS ile her node için uniqueImageId değerini hesaplar.
   *
   * Bir node'un uniqueImageId'si:
   *   - Terminal'iyse (bir keyword burada bitiyorsa) VE children boşsa → terminal image
   *   - Children varsa: tüm children'ın uniqueImageId'si aynı ve null değilse → o ID
   *   - Aksi halde → null
   *
   * Terminal + non-empty children karışımı: eğer bütün terminal image'lar ve
   * tüm children'ın unique ID'leri aynıysa yine unique sayılır.
   */
  private computeUniqueImageIds(node: TrieNode): string | null {
    // Önce tüm children'ı recursive hesapla
    const childIds = new Set<string>();
    let hasNullChild = false;

    for (const child of node.children.values()) {
      const childUniqueId = this.computeUniqueImageIds(child);
      if (childUniqueId === null) {
        hasNullChild = true;
      } else {
        childIds.add(childUniqueId);
      }
    }

    // Terminal image'ları da dahil et
    for (const termId of node.terminalImageIds) {
      childIds.add(termId);
    }

    // Eğer null child varsa → mixed → unique değil
    // Eğer birden fazla ID varsa → unique değil
    if (hasNullChild || childIds.size !== 1) {
      node.uniqueImageId = null;
      return null;
    }

    node.uniqueImageId = [...childIds][0];
    return node.uniqueImageId;
  }

  /**
   * Verilen prefix (karakter dizisi) için trie'da yürür ve benzersiz bir
   * image ID'ye ulaşıldığı EN SIĞ (minimum derinlik) node'u bulur.
   *
   * Minimum derinlik = 3 (çok kısa prefix'ler spekülatif, gürültü üretir).
   *
   * @param prefix Normalize edilmiş (asciified) arama prefix'i
   * @returns Bulunan ise { imageId, depth }, aksi halde null
   */
  findUniquePrefix(prefix: string): PrefixMatch | null {
    if (!prefix || prefix.length < MIN_UNIQUE_DEPTH) return null;

    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i];
      const child = node.children.get(ch);
      if (!child) {
        // Trie'da bu prefix yok — hiç eşleşme yok
        return null;
      }
      node = child;

      // Minimum derinlikten sonra ve uniqueImageId hesaplıysa dön
      const depth = i + 1;
      if (depth >= MIN_UNIQUE_DEPTH && node.uniqueImageId !== null) {
        return { imageId: node.uniqueImageId, depth };
      }
    }

    return null;
  }

  /**
   * Debug / test için: trie'da bulunan toplam node sayısını döndürür.
   */
  get nodeCount(): number {
    let count = 0;
    const stack: TrieNode[] = [this.root];
    while (stack.length > 0) {
      const n = stack.pop()!;
      count++;
      for (const child of n.children.values()) {
        stack.push(child);
      }
    }
    return count;
  }
}
