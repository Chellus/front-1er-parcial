import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

import { TurnosService } from '../../services/turnos.service';
import { ProductosService } from '../../services/productos.service';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-turnos-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatCardModule
  ],
  templateUrl: './turnos-form.html',
  styleUrl: './turnos-form.css'
})
export class TurnosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private svc = inject(TurnosService);
  private productosService = inject(ProductosService);
  private proveedoresService = inject(ProveedoresService);

  proveedores$ = this.proveedoresService.list$();
  productos$ = this.productosService.list$();
  horariosDisponibles = this.svc.horariosDisponibles;

  form = this.fb.group({
    idProveedor: [0, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    horaInicioAgendamiento: ['', Validators.required],
    horaFinAgendamiento: ['', Validators.required],
    productos: this.fb.array([])
  });

  get productos() {
    return this.form.get('productos') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      // Modo edición - cargar datos del turno
      this.svc.getTurnoCompleto$(Number(id)).subscribe(turno => {
        if (turno) {
          this.form.patchValue({
            idProveedor: turno.idProveedor,
            fecha: turno.fecha,
            horaInicioAgendamiento: turno.horaInicioAgendamiento,
            horaFinAgendamiento: turno.horaFinAgendamiento
          });
          
          // Cargar productos del turno
          turno.detalles.forEach(detalle => {
            this.agregarProducto(detalle.idProducto, detalle.cantidad);
          });
        }
      });
    } else {
      // Modo creación - agregar un producto inicial
      this.agregarProducto();
    }
  }

  agregarProducto(idProducto = 0, cantidad = 1): void {
    const productoForm = this.fb.group({
      idProducto: [idProducto, [Validators.required, Validators.min(1)]],
      cantidad: [cantidad, [Validators.required, Validators.min(1)]]
    });
    this.productos.push(productoForm);
  }

  eliminarProducto(index: number): void {
    this.productos.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const id = this.route.snapshot.paramMap.get('id');
      
      const turnoData = {
        fecha: formValue.fecha!,
        horaInicioAgendamiento: formValue.horaInicioAgendamiento!,
        horaFinAgendamiento: formValue.horaFinAgendamiento!,
        idProveedor: formValue.idProveedor!,
        productos: formValue.productos as { idProducto: number; cantidad: number }[]
      };
      
      if (id && id !== 'nuevo') {
        this.svc.update(Number(id), turnoData);
      } else {
        this.svc.create(turnoData);
      }
      
      this.router.navigate(['/turnos']);
    } else {
      console.log('Formulario inválido:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/turnos']);
  }
}
