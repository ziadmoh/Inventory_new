import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CarCountriesComponent } from '../components/car-countries/car-countries.component';
import { PrimeNgModule } from './prime-ng.module';
import { SystemPagesRoutingModule } from './system-pages-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CarBrandsComponent } from '../components/car-brands/car-brands.component';
import { CountryNamePipe } from '../pipes/car-countries.pipe';
import { CarModelsComponent } from '../components/car-models/car-models.component';
import { ReleaseYearsComponent } from '../components/release-years/release-years.component';
import { SupplyTypeSComponent } from '../components/supply-types/supply-types.component';
import { SupplyNamesComponent } from '../components/supply-names/supply-names.component';
import { InventoryProductsComponent } from '../components/inventory-products/inventory-products.component';
import { InvoiceComponent } from '../components/invoice/invoice.component';
import { UsersComponent } from '../components/users/users.component';
import { SuppliersComponent } from '../components/suppliers/suppliers.component';
import { CompaniesComponent } from '../components/companies/companies.component';
import { ProductShortagesComponent } from '../components/products-shortages/products-shortages.component';
import { LongTermComponent } from '../components/long-term/long-term.component';
import { SalesToReturnComponent } from '../components/sales-to-return/sales-to-return.component';
import { StoragesComponent } from '../components/storages/storages.component';
import { ExpensesToReturnComponent } from '../components/expenses-to-return/expenses-to-return.component';
import { ToReturnInitialComponent } from '../components/to-return-initial/to-return-initial.component';
import { SharedModule } from './shared.module';

@NgModule({
  declarations: [
    CarCountriesComponent,
    CarBrandsComponent,
    CarModelsComponent,
    ReleaseYearsComponent,
    SupplyNamesComponent,
    SupplyTypeSComponent,
    InventoryProductsComponent,
    InvoiceComponent,
    UsersComponent,
    SuppliersComponent,
    CompaniesComponent,
    ProductShortagesComponent,
    LongTermComponent,
    SalesToReturnComponent,
    ExpensesToReturnComponent,
    ToReturnInitialComponent,
    
    StoragesComponent,
    //PIPES
    CountryNamePipe
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    SystemPagesRoutingModule,
    ReactiveFormsModule,
    SharedModule
	],
  exports: [
    HttpClientModule,
    CommonModule,
    PrimeNgModule,
    CountryNamePipe,
    InvoiceComponent
  ],
})
export class SystemPagesModule {}
