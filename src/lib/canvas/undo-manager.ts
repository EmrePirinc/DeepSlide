// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * UndoManager — Command Pattern ile canvas düzenleme geçmişi.
 * Her işlem bir Command nesnesi olarak kaydedilir.
 * Maks 50 işlem saklanır, FIFO ile eski işlemler silinir.
 */

// ─── Command Arayüzü ──────────────────────────────────

export interface CanvasCommand {
  /** İşlemi uygula */
  execute(): void;
  /** İşlemi geri al */
  undo(): void;
  /** İşlem açıklaması (debug/tooltip için) */
  description: string;
}

// ─── Batch Command ────────────────────────────────────

/**
 * Birden fazla komutu tek bir undo/redo adımı olarak grupla.
 * Ör: "Slayt çoğalt" = N nesne ekleme + arka plan kopyalama
 */
export class BatchCommand implements CanvasCommand {
  description: string;
  private commands: CanvasCommand[];

  constructor(description: string, commands: CanvasCommand[]) {
    this.description = description;
    this.commands = commands;
  }

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo(): void {
    // Ters sırada geri al
    [...this.commands].reverse().forEach(cmd => cmd.undo());
  }
}

// ─── UndoManager ──────────────────────────────────────

const MAX_HISTORY = 50;

export class UndoManager {
  private undoStack: CanvasCommand[] = [];
  private redoStack: CanvasCommand[] = [];
  private listeners: Set<() => void> = new Set();

  /**
   * Yeni bir komutu çalıştır ve geçmişe ekle.
   * Yeni komut eklendiğinde redo stack temizlenir.
   */
  execute(command: CanvasCommand): void {
    command.execute();
    this.undoStack.push(command);

    // Maks geçmiş sınırı
    if (this.undoStack.length > MAX_HISTORY) {
      this.undoStack.shift();
    }

    // Yeni işlem yapıldığında redo geçersiz olur
    this.redoStack = [];
    this.notify();
  }

  /**
   * Son işlemi geri al.
   */
  undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) return false;

    command.undo();
    this.redoStack.push(command);
    this.notify();
    return true;
  }

  /**
   * Son geri alınan işlemi yeniden uygula.
   */
  redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) return false;

    command.execute();
    this.undoStack.push(command);
    this.notify();
    return true;
  }

  /** Geri alınabilir işlem var mı? */
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Yeniden yapılabilir işlem var mı? */
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Undo stack'teki işlem sayısı */
  get undoCount(): number {
    return this.undoStack.length;
  }

  /** Redo stack'teki işlem sayısı */
  get redoCount(): number {
    return this.redoStack.length;
  }

  /** Son işlemin açıklaması (tooltip için) */
  get lastUndoDescription(): string | null {
    const last = this.undoStack[this.undoStack.length - 1];
    return last?.description ?? null;
  }

  /** Son geri alınan işlemin açıklaması */
  get lastRedoDescription(): string | null {
    const last = this.redoStack[this.redoStack.length - 1];
    return last?.description ?? null;
  }

  /** Tüm geçmişi temizle */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  /** State değişikliği dinleyicisi ekle */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }
}

// ─── Singleton Instance ───────────────────────────────

let instance: UndoManager | null = null;

export function getUndoManager(): UndoManager {
  if (!instance) {
    instance = new UndoManager();
  }
  return instance;
}

// ─── Hazır Command Fabrikaları ─────────────────────────

import { useCanvasStore } from '@/stores/canvasStore';
import type { SlideObject } from '@/types/slide-object';

/**
 * Nesne ekleme komutu
 */
export function createAddObjectCommand(object: SlideObject): CanvasCommand {
  return {
    description: `${object.type} eklendi`,
    execute: () => useCanvasStore.getState().addObject(object),
    undo: () => useCanvasStore.getState().deleteObject(object.id),
  };
}

/**
 * Nesne silme komutu
 */
export function createDeleteObjectCommand(object: SlideObject): CanvasCommand {
  const snapshot = { ...object };
  return {
    description: `${object.type} silindi`,
    execute: () => useCanvasStore.getState().deleteObject(object.id),
    undo: () => useCanvasStore.getState().addObject(snapshot as SlideObject),
  };
}

/**
 * Nesne taşıma komutu
 */
export function createMoveCommand(objectId: string, fromX: number, fromY: number, toX: number, toY: number): CanvasCommand {
  return {
    description: 'Nesne taşındı',
    execute: () => useCanvasStore.getState().moveObject(objectId, toX, toY),
    undo: () => useCanvasStore.getState().moveObject(objectId, fromX, fromY),
  };
}

/**
 * Nesne boyutlandırma komutu
 */
export function createResizeCommand(objectId: string, fromW: number, fromH: number, toW: number, toH: number): CanvasCommand {
  return {
    description: 'Nesne boyutlandırıldı',
    execute: () => useCanvasStore.getState().resizeObject(objectId, toW, toH),
    undo: () => useCanvasStore.getState().resizeObject(objectId, fromW, fromH),
  };
}

/**
 * Nesne döndürme komutu
 */
export function createRotateCommand(objectId: string, fromAngle: number, toAngle: number): CanvasCommand {
  return {
    description: 'Nesne döndürüldü',
    execute: () => useCanvasStore.getState().rotateObject(objectId, toAngle),
    undo: () => useCanvasStore.getState().rotateObject(objectId, fromAngle),
  };
}

/**
 * Nesne stil güncelleme komutu
 */
export function createUpdateCommand(objectId: string, before: Partial<SlideObject>, after: Partial<SlideObject>): CanvasCommand {
  return {
    description: 'Nesne güncellendi',
    execute: () => useCanvasStore.getState().updateObject(objectId, after),
    undo: () => useCanvasStore.getState().updateObject(objectId, before),
  };
}
