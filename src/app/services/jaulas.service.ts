import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Jaula } from '../models/jaula';
import { LocalStoreService } from './local-store.service';

const KEY = 'jaulas';
const KEY_COUNTER = 'jaulas_counter';

@Injectable({ providedIn: 'root' })
export class JaulasService {
  private readonly _items$ = new BehaviorSubject<Jaula[]>([]);

  constructor(private store: LocalStoreService) {
    const initial = this.store.getArray<Jaula>(KEY);
    this._items$.next(initial);
  }

  list$(): Observable<Jaula[]> { return this._items$.asObservable(); }
  
  getById$(idJaula: number): Observable<Jaula | undefined> {
    return this._items$.pipe(map(list => list.find(i => i.idJaula === idJaula)));
  }

  getLibres$(): Observable<Jaula[]> {
    return this._items$.pipe(map(list => list.filter(j => j.enUso === 'N')));
  }

  create(nombre: string): void {
    const list = [...this._items$.value];
    const nextId = this.store.getNumber(KEY_COUNTER, 0) + 1;
    list.push({ idJaula: nextId, nombre: nombre.trim(), enUso: 'N' });
    this.persist(list); 
    this.store.setNumber(KEY_COUNTER, nextId);
  }

  update(item: Jaula): void {
    const list = this._items$.value.map(i => i.idJaula === item.idJaula ? { ...item } : i);
    this.persist(list);
  }

  delete(idJaula: number): void {
    const list = this._items$.value.filter(i => i.idJaula !== idJaula);
    this.persist(list);
  }

  marcarEnUso(idJaula: number, enUso: 'S' | 'N'): void {
    const list = this._items$.value.map(i => 
      i.idJaula === idJaula ? { ...i, enUso } : i
    );
    this.persist(list);
  }

  private persist(list: Jaula[]): void {
    this._items$.next(list);
    this.store.setArray(KEY, list);
  }
}
