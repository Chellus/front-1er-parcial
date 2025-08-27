import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStoreService {
  getArray<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    try {
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch { return []; }
  }
  setArray<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  getNumber(key: string, fallback = 0): number {
    const raw = localStorage.getItem(key);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : fallback;
  }
  setNumber(key: string, value: number): void {
    localStorage.setItem(key, String(value));
  }
}