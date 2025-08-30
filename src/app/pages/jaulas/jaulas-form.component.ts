import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { JaulasService } from '../../services/jaulas.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-jaula-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule
  ],
  templateUrl: './jaulas-form.html',
  styleUrl: './jaulas-form.css'
})
export class JaulaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(JaulasService);

  isEdit = false;
  id = 0;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    enUso: ['N', [Validators.required]]
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id')) || 0),
      switchMap(id => {
        if (id) {
          this.isEdit = true; 
          this.id = id;
          return this.svc.getById$(id);
        }
        return [undefined];
      })
    ).subscribe(item => { 
      if (item) {
        this.form.patchValue({ 
          nombre: item.nombre,
          enUso: item.enUso 
        }); 
      }
    });
  }

  onSubmit(): void {
    const nombre = this.form.value.nombre?.trim();
    const enUso = this.form.value.enUso as 'S' | 'N';
    if (!nombre) return;
    
    if (this.isEdit) {
      this.svc.update({ idJaula: this.id, nombre, enUso: enUso || 'N' });
    } else {
      this.svc.create(nombre);
    }
    this.router.navigate(['/jaulas']);
  }
}
