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
import { JaulasService } from '../../services/jaulas.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { combineLatest, startWith, map } from 'rxjs';

@Component({
  selector: 'app-jaulas-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule,
  ],
  templateUrl: './jaulas-list.html',
  styleUrl: './jaulas-list.css'
})
export class JaulasListComponent {
  private svc = inject(JaulasService);
  private dialog = inject(MatDialog);

  filter = new FormControl('', { nonNullable: true });
  displayedColumns = ['idJaula', 'nombre', 'enUso', 'acciones'];

  items$ = combineLatest([
    this.svc.list$(),
    this.filter.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([items, filterValue]) =>
      items.filter(item =>
        item.nombre.toLowerCase().includes(filterValue.toLowerCase())
      )
    )
  );

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Está seguro que desea eliminar esta jaula?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.svc.delete(id);
    });
  }
}
