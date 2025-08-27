import { Routes } from '@angular/router';
import { ProveedoresListComponent } from './pages/proveedores/proveedores-list.component';
import { ProveedorFormComponent } from './pages/proveedores/proveedores-form.component';
import { ProductosListComponent } from './pages/productos/productos-list.component';
import { ProductoFormComponent } from './pages/productos/productos-form.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'proveedores' },
  { path: 'proveedores', component: ProveedoresListComponent },
  { path: 'proveedores/nuevo', component: ProveedorFormComponent },
  { path: 'proveedores/:id', component: ProveedorFormComponent },
  { path: 'productos', component: ProductosListComponent },
  { path: 'productos/nuevo', component: ProductoFormComponent },
  { path: 'productos/:id', component: ProductoFormComponent },
  { path: '**', redirectTo: 'proveedores' },
];
