import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor';
import { LocalStoreService } from './local-store.service';

const KEY = 'proveedores';
const KEY_COUNTER = 'proveedores_counter';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly _items$ = new BehaviorSubject<Proveedor[]>([]);

  constructor(private store: LocalStoreService) {
    const initial = this.store.getArray<Proveedor>(KEY);
    this._items$.next(initial);
  }

  list$(): Observable<Proveedor[]> { return this._items$.asObservable(); }
  getById$(idProveedor: number): Observable<Proveedor | undefined> {
    return this._items$.pipe(map(list => list.find(i => i.idProveedor === idProveedor)));
  }

  create(nombre: string): void {
    const list = [...this._items$.value];
    const nextId = this.store.getNumber(KEY_COUNTER, 0) + 1;
    list.push({ idProveedor: nextId, nombre: nombre.trim() });
    this.persist(list); this.store.setNumber(KEY_COUNTER, nextId);
  }

  update(item: Proveedor): void {
    const list = this._items$.value.map(i => i.idProveedor === item.idProveedor ? { ...item } : i);
    this.persist(list);
  }

  delete(idProveedor: number): void {
    const list = this._items$.value.filter(i => i.idProveedor !== idProveedor);
    this.persist(list);
  }

  private persist(list: Proveedor[]): void {
    this._items$.next(list);
    this.store.setArray(KEY, list);
  }
}