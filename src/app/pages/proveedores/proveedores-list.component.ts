import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProveedoresService } from '../../services/proveedores.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { combineLatest, startWith, map, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-proveedores-list',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule,
  ],
  templateUrl: './proveedores-list.html',
  styleUrls: ['./proveedores-list.css'],
})
export class ProveedoresListComponent {
  private svc = inject(ProveedoresService);
  private dialog = inject(MatDialog);

  filter = new FormControl('', { nonNullable: true });
  displayedColumns = ['idProveedor', 'nombre', 'acciones'];

  data$ = combineLatest([this.svc.list$(), this.filter.valueChanges.pipe(startWith(''))]).pipe(
    map(([list, q]) => list.filter(i => i.nombre.toLowerCase().includes((q || '').toLowerCase().trim())))
  );

  async onDelete(id: number) {
    const ok = await firstValueFrom(
      this.dialog.open(ConfirmDialogComponent, {
        data: { title: 'Eliminar proveedor', message: '¿Confirmás eliminar este proveedor?' },
      }).afterClosed()
    );
    if (ok) this.svc.delete(id);
  }
}