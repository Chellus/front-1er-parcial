import { Routes } from '@angular/router';
import { ProveedoresListComponent } from './pages/proveedores/proveedores-list.component';
import { ProveedorFormComponent } from './pages/proveedores/proveedores-form.component';
import { ProductosListComponent } from './pages/productos/productos-list.component';
import { ProductoFormComponent } from './pages/productos/productos-form.component';
import { JaulasListComponent } from './pages/jaulas/jaulas-list.component';
import { JaulaFormComponent } from './pages/jaulas/jaulas-form.component';
import { TurnosListComponent } from './pages/turnos/turnos-list.component';
import { TurnosFormComponent } from './pages/turnos/turnos-form.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'proveedores' },
  
  // Módulo 1: Proveedores
  { path: 'proveedores', component: ProveedoresListComponent },
  { path: 'proveedores/nuevo', component: ProveedorFormComponent },
  { path: 'proveedores/:id', component: ProveedorFormComponent },
  
  // Módulo 2: Productos
  { path: 'productos', component: ProductosListComponent },
  { path: 'productos/nuevo', component: ProductoFormComponent },
  { path: 'productos/:id', component: ProductoFormComponent },
  
  // Módulo 3: Jaulas
  { path: 'jaulas', component: JaulasListComponent },
  { path: 'jaulas/nuevo', component: JaulaFormComponent },
  { path: 'jaulas/:id', component: JaulaFormComponent },
  
  // Módulo 4: Turnos
  { path: 'turnos', component: TurnosListComponent },
  { path: 'turnos/nuevo', component: TurnosFormComponent },
  { path: 'turnos/:id', component: TurnosFormComponent },
  
  { path: '**', redirectTo: 'proveedores' },
];
