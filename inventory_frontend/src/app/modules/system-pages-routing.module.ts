import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../auth/admin-guard.service';
import { CarBrandsComponent } from '../components/car-brands/car-brands.component';
import { CarCountriesComponent } from '../components/car-countries/car-countries.component';
import { CarModelsComponent } from '../components/car-models/car-models.component';
import { CompaniesComponent } from '../components/companies/companies.component';
import { InventoryProductsComponent } from '../components/inventory-products/inventory-products.component';
import { InvoiceComponent } from '../components/invoice/invoice.component';
import { LongTermComponent } from '../components/long-term/long-term.component';
import { ProductShortagesComponent } from '../components/products-shortages/products-shortages.component';
import { ReleaseYearsComponent } from '../components/release-years/release-years.component';
import { SalesToReturnComponent } from '../components/sales-to-return/sales-to-return.component';
import { StoragesComponent } from '../components/storages/storages.component';
import { SuppliersComponent } from '../components/suppliers/suppliers.component';
import { SupplyNamesComponent } from '../components/supply-names/supply-names.component';
import { SupplyTypeSComponent } from '../components/supply-types/supply-types.component';
import { ToReturnInitialComponent } from '../components/to-return-initial/to-return-initial.component';
import { UsersComponent } from '../components/users/users.component';



const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'inventory', component: InventoryProductsComponent },
  { path: 'shortages', component: ProductShortagesComponent },
  { path: 'items-to-return', component: ToReturnInitialComponent },
  { path: 'long-term-work', component: LongTermComponent},
  {
    path: 'entries-management',canActivate: [AdminGuard], children: [
      { path: '', redirectTo:'manfacturer-countries',pathMatch:'full' },
      { path: 'manfacturer-countries', component: CarCountriesComponent },
      { path: 'car-brands', component: CarBrandsComponent },
      { path: 'car-models', component: CarModelsComponent },
      { path: 'release-years', component: ReleaseYearsComponent },
      { path: 'supply-types', component: SupplyTypeSComponent },
      { path: 'supply-names', component: SupplyNamesComponent },
      // {path:'invoice',component:InvoiceComponent},
    ]
  },

  { path: 'suppliers', component: SuppliersComponent, canActivate: [AdminGuard] },
  { path: 'companies', component: CompaniesComponent, canActivate: [AdminGuard] },
  { path: 'storages', component: StoragesComponent, canActivate: [AdminGuard] },
  { path: 'long-term-work', component: LongTermComponent, canActivate: [AdminGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SystemPagesRoutingModule { };