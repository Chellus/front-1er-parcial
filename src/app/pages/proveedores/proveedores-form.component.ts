import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProveedoresService } from '../../services/proveedores.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-proveedores-form',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  templateUrl: './proveedores-form.html',
  styleUrls: ['./proveedores-form.css'],
})
export class ProveedorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ProveedoresService);

  isEdit = false;
  id = 0;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id')) || 0),
      switchMap(id => {
        if (id) {
          this.isEdit = true; this.id = id;
          return this.svc.getById$(id);
        }
        return [undefined];
      })
    ).subscribe(item => { if (item) this.form.patchValue({ nombre: item.nombre }); });
  }

  onSubmit(): void {
    const nombre = this.form.value.nombre?.trim();
    if (!nombre) return;
    if (this.isEdit) this.svc.update({ idProveedor: this.id, nombre });
    else this.svc.create(nombre);
    this.router.navigate(['/proveedores']);
  }
}