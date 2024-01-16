import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarBrandsReportsComponent } from 'src/app/components/reports/carBrands/carBrands-reports.component';
import { CarModelsReportsComponent } from 'src/app/components/reports/carModels/carModels-reports.component';
import { ProductReportsComponent } from 'src/app/components/reports/products/product-reports.component';
import { SupplyNamesReportsComponent } from 'src/app/components/reports/supplyNames/supplyNames-reports.component';
import { SupplyTypesReportsComponent } from 'src/app/components/reports/supplyTypes/supplyTypes-reports.component';


const routes: Routes = [         
  {path:'',redirectTo:'products',pathMatch:'full' },
  {path:'products',component:ProductReportsComponent},
  {path:'supply-names',component:SupplyNamesReportsComponent},
  {path:'supply-types',component:SupplyTypesReportsComponent},
  {path:'car-models',component:CarModelsReportsComponent},
  {path:'car-brands',component:CarBrandsReportsComponent},
];

@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )

export class ReportsRoutingModule { };