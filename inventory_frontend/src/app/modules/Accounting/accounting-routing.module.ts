import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { longTermsInvoicesComponent } from 'src/app/components/long-terms-invoices/long-terms-invoices.component';
import { ReturnsComponent } from 'src/app/components/returns/returns.component';
import { ExpensesComponent } from '../../components/expenses/expenses.component';
import { SalesComponent } from '../../components/sales/sales.component';


const routes: Routes = [         
  {path:'',redirectTo:'sales',pathMatch:'full' },
  {path:'expenses',component:ExpensesComponent},
  {path:'sales',component:SalesComponent},
  {path:'returns',component:ReturnsComponent},
  {path:'long-terms-invoices',component:longTermsInvoicesComponent},
];

@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )

export class AccountingRoutingModule { };