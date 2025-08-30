import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TurnosService } from '../../services/turnos.service';
import { ProductosService } from '../../services/productos.service';
import { ProveedoresService } from '../../services/proveedores.service';
import { JaulasService } from '../../services/jaulas.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { combineLatest, startWith, map } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-turnos-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, 
    MatSelectModule, MatTooltipModule, MatDialogModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './turnos-list.html',
  styleUrl: './turnos-list.css'
})
export class TurnosListComponent {
  private svc = inject(TurnosService);
  private productosService = inject(ProductosService);
  private proveedoresService = inject(ProveedoresService);
  private jaulasService = inject(JaulasService);
  private dialog = inject(MatDialog);

  filter = new FormControl('', { nonNullable: true });
  displayedColumns = ['idTurno', 'fecha', 'horario', 'proveedor', 'jaula', 'estado', 'horaInicioRecepcion', 'horaFinRecepcion', 'acciones', 'detalles'];

  // Para modal de jaula
  mostrandoModalJaula = false;
  turnoSeleccionado: number | null = null;
  jaulaSeleccionada = 0;
  jaulasLibres$ = this.jaulasService.getLibres$();

  // Para modal de detalles
  mostrandoModalDetalles = false;
  productos: { nombre: string; cantidad: number }[] = [];

  ngOnInit() {
  // Forzar recarga de datos desde localStorage
  const turnos = (this.svc as any).store.getArray('turnos');
  const detalles = (this.svc as any).store.getArray('turnos_detalle');
  (this.svc as any)._turnos$.next(turnos);
  (this.svc as any)._detalles$.next(detalles);
}

  items$ = combineLatest([
    this.svc.listTurnos$(),
    this.proveedoresService.list$(),
      this.jaulasService.list$(),
    this.filter.valueChanges.pipe(startWith('')),
  ]).pipe(
        map(([turnos, proveedores, jaulas, filterValue]) =>
          turnos
            .map(turno => ({
              ...turno,
              nombreProveedor: proveedores.find(p => p.idProveedor === turno.idProveedor)?.nombre || 'Sin nombre',
              nombreJaula: turno.idJaula ? (jaulas.find(j => j.idJaula === turno.idJaula)?.nombre || 'No asignada') : 'No asignada',
            }))
            .filter(item =>
              item.fecha.includes(filterValue)
            )
            .sort((a, b) => a.horaInicioAgendamiento.localeCompare(b.horaInicioAgendamiento))
        )
  );

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Está seguro que desea eliminar este turno?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.svc.delete(id);
      }
    });
  }

  getEstadoTurno(turno: any): String{
    if (turno.horaFinRecepcion) return 'completado';
    if (turno.horaInicioRecepcion) return 'en recepcion';
    return 'pendiente';
  }
  
  getEstadoClass(turno: any): string {
    const estado = this.getEstadoTurno(turno);
    return estado.toLowerCase().replace(/\s+/g, '-');
  }

  mostrarInicioRecepcion(idTurno: number): void {
    this.turnoSeleccionado = idTurno;
    this.mostrandoModalJaula = true;
    this.jaulaSeleccionada = 0;
  }

  iniciarRecepcion(): void {
    if (this.turnoSeleccionado && this.jaulaSeleccionada) {
      this.svc.iniciarRecepcion(this.turnoSeleccionado, this.jaulaSeleccionada);
      this.jaulasService.marcarEnUso(this.jaulaSeleccionada, 'S');
      this.mostrandoModalJaula = false;
      this.turnoSeleccionado = null;
    }
  }

  finalizarRecepcion(idTurno: number, idJaula?: number): void {
    this.svc.finalizarRecepcion(idTurno);
    if (idJaula) {
      this.jaulasService.marcarEnUso(idJaula, 'N');
    }
  }

  cancelarInicioRecepcion(): void {
    this.mostrandoModalJaula = false;
    this.turnoSeleccionado = null;
  }

  abrirModalDetalles(turno: any): void {
    const detalles = this.svc.getDetallesPorTurno(turno.idTurno);
    this.productosService.list$().subscribe(
      productosArr => {
        this.productos = detalles.map(det => {
          const prod = productosArr.find(p => p.idProducto === det.idProducto);
          return {
            nombre: prod ? prod.nombre : 'Desconocido',
            cantidad: det.cantidad
          };
      });
      this.mostrandoModalDetalles = true;
    });
  }

  cerrarModalDetalles(): void {
    this.mostrandoModalDetalles = false;
  }
}