import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { LocalStoreService } from './local-store.service';

const KEY = 'productos';
const KEY_COUNTER = 'productos_counter';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly _items$ = new BehaviorSubject<Producto[]>([]);

  constructor(private store: LocalStoreService) {
    const initial = this.store.getArray<Producto>(KEY);
    this._items$.next(initial);
  }

  list$(): Observable<Producto[]> { return this._items$.asObservable(); }
  getById$(idProducto: number): Observable<Producto | undefined> {
    return this._items$.pipe(map(list => list.find(i => i.idProducto === idProducto)));
  }

  create(nombre: string): void {
    const list = [...this._items$.value];
    const nextId = this.store.getNumber(KEY_COUNTER, 0) + 1;
    list.push({ idProducto: nextId, nombre: nombre.trim() });
    this.persist(list); this.store.setNumber(KEY_COUNTER, nextId);
  }

  update(item: Producto): void {
    const list = this._items$.value.map(i => i.idProducto === item.idProducto ? { ...item } : i);
    this.persist(list);
  }

  delete(idProducto: number): void {
    const list = this._items$.value.filter(i => i.idProducto !== idProducto);
    this.persist(list);
  }

  private persist(list: Producto[]): void {
    this._items$.next(list);
    this.store.setArray(KEY, list);
  }
}