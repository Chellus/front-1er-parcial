import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Turno, TurnoDetalle } from '../models/turno';
import { LocalStoreService } from './local-store.service';

const KEY_TURNOS = 'turnos';
const KEY_TURNOS_DETALLE = 'turnos_detalle';
const KEY_COUNTER = 'turnos_counter';

export interface TurnoCompleto extends Turno {
  detalles: TurnoDetalle[];
}

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private readonly _turnos$ = new BehaviorSubject<Turno[]>([]);
  private readonly _detalles$ = new BehaviorSubject<TurnoDetalle[]>([]);

  // Horarios disponibles para seleccionar
  readonly horariosDisponibles = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  constructor(private store: LocalStoreService) {
    const turnos = this.store.getArray<Turno>(KEY_TURNOS);
    const detalles = this.store.getArray<TurnoDetalle>(KEY_TURNOS_DETALLE);
    this._turnos$.next(turnos);
    this._detalles$.next(detalles);
  }

  listTurnos$(): Observable<Turno[]> { 
    return this._turnos$.asObservable(); 
  }

  getTurnoById$(idTurno: number): Observable<Turno | undefined> {
    return this._turnos$.pipe(map(list => list.find(t => t.idTurno === idTurno)));
  }

  getTurnoCompleto$(idTurno: number): Observable<TurnoCompleto | undefined> {
    return this._turnos$.pipe(
      map(turnos => {
        const turno = turnos.find(t => t.idTurno === idTurno);
        if (!turno) return undefined;
        
        const detalles = this._detalles$.value.filter(d => d.idTurno === idTurno);
        return { ...turno, detalles };
      })
    );
  }

  getDetallesPorTurno(idTurno: number): TurnoDetalle[] {
    return this._detalles$.value.filter(d => d.idTurno === idTurno);
  }

  create(turnoData: {
    fecha: string;
    horaInicioAgendamiento: string;
    horaFinAgendamiento: string;
    idProveedor: number;
    productos: { idProducto: number; cantidad: number }[];
  }): void {
    const turnos = [...this._turnos$.value];
    const detalles = [...this._detalles$.value];
    
    const nextId = this.store.getNumber(KEY_COUNTER, 0) + 1;
    
    // Crear turno
    const nuevoTurno: Turno = {
      idTurno: nextId,
      fecha: turnoData.fecha,
      horaInicioAgendamiento: turnoData.horaInicioAgendamiento,
      horaFinAgendamiento: turnoData.horaFinAgendamiento,
      idProveedor: turnoData.idProveedor
    };
    
    turnos.push(nuevoTurno);
    
    // Crear detalles
    turnoData.productos.forEach(producto => {
      detalles.push({
        idTurno: nextId,
        idProducto: producto.idProducto,
        cantidad: producto.cantidad
      });
    });
    
    this.persistTurnos(turnos);
    this.persistDetalles(detalles);
    this.store.setNumber(KEY_COUNTER, nextId);
  }

  iniciarRecepcion(idTurno: number, idJaula: number): void {
    const turnos = this._turnos$.value.map(t => 
      t.idTurno === idTurno ? {
        ...t,
        idJaula,
        horaInicioRecepcion: new Date().toLocaleTimeString('es-ES', { hour12: false })
      } : t
    );
    this.persistTurnos(turnos);
  }

  finalizarRecepcion(idTurno: number): void {
    const turnos = this._turnos$.value.map(t => 
      t.idTurno === idTurno ? {
        ...t,
        horaFinRecepcion: new Date().toLocaleTimeString('es-ES', { hour12: false })
      } : t
    );
    this.persistTurnos(turnos);
  }

  delete(idTurno: number): void {
    const turnos = this._turnos$.value.filter(t => t.idTurno !== idTurno);
    const detalles = this._detalles$.value.filter(d => d.idTurno !== idTurno);
    this.persistTurnos(turnos);
    this.persistDetalles(detalles);
  }

  update(idTurno: number, turnoData: {
    fecha: string;
    horaInicioAgendamiento: string;
    horaFinAgendamiento: string;
    idProveedor: number;
    productos: { idProducto: number; cantidad: number }[];
  }): void {
    // Actualizar turno
    const turnos = this._turnos$.value.map(t => 
      t.idTurno === idTurno ? {
        ...t,
        fecha: turnoData.fecha,
        horaInicioAgendamiento: turnoData.horaInicioAgendamiento,
        horaFinAgendamiento: turnoData.horaFinAgendamiento,
        idProveedor: turnoData.idProveedor
      } : t
    );
    
    // Actualizar detalles - eliminar los existentes y crear nuevos
    const detallesFiltrados = this._detalles$.value.filter(d => d.idTurno !== idTurno);
    const nuevosDetalles = turnoData.productos.map(producto => ({
      idTurno,
      idProducto: producto.idProducto,
      cantidad: producto.cantidad
    }));
    
    this.persistTurnos(turnos);
    this.persistDetalles([...detallesFiltrados, ...nuevosDetalles]);
  }

  private persistTurnos(list: Turno[]): void {
    this._turnos$.next(list);
    this.store.setArray(KEY_TURNOS, list);
  }

  private persistDetalles(list: TurnoDetalle[]): void {
    this._detalles$.next(list);
    this.store.setArray(KEY_TURNOS_DETALLE, list);
  }
}
