import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PrimeNgModule } from '../prime-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportsRoutingModule } from './reports-routing.module';
import { SharedModule } from '../shared.module';
import { ProductReportsComponent } from 'src/app/components/reports/products/product-reports.component';
import { SupplyNamesReportsComponent } from 'src/app/components/reports/supplyNames/supplyNames-reports.component';
import { SupplyTypesReportsComponent } from 'src/app/components/reports/supplyTypes/supplyTypes-reports.component';
import { CarModelsReportsComponent } from 'src/app/components/reports/carModels/carModels-reports.component';
import { CarBrandsReportsComponent } from 'src/app/components/reports/carBrands/carBrands-reports.component';
@NgModule({
  declarations: [
    ProductReportsComponent,
    SupplyNamesReportsComponent,
    SupplyTypesReportsComponent,
    CarBrandsReportsComponent,
    CarModelsReportsComponent
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    ReportsRoutingModule,
    ReactiveFormsModule ,
    SharedModule
	],
  exports: [
    HttpClientModule,
    CommonModule,
    PrimeNgModule,
  ],
})
export class ReportsModule {}
