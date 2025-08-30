export interface Turno {
  idTurno: number;
  fecha: string;
  horaInicioAgendamiento: string;
  horaFinAgendamiento: string;
  idProveedor: number;
  idJaula?: number;
  horaInicioRecepcion?: string;
  horaFinRecepcion?: string;
}

export interface TurnoDetalle {
  idTurno: number;
  idProducto: number;
  cantidad: number;
}
