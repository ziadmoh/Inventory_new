import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PrimeNgModule } from '../prime-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpensesComponent } from '../../components/expenses/expenses.component';
import { SalesComponent } from '../../components/sales/sales.component';
import { AccountingRoutingModule } from './accounting-routing.module';
import { ReturnsComponent } from 'src/app/components/returns/returns.component';
import { longTermsInvoicesComponent } from 'src/app/components/long-terms-invoices/long-terms-invoices.component';
import { SharedModule } from '../shared.module';
import { ReturnedExpensesComponent } from 'src/app/components/returned-expenses/returned-expenses.component';
import { ReturnedSalesComponent } from 'src/app/components/returned-sales/returned-sales.component';


@NgModule({
  declarations: [
    ExpensesComponent,
    SalesComponent,
    ReturnsComponent,
    longTermsInvoicesComponent,
    ReturnedExpensesComponent,
    ReturnedSalesComponent,
    
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    AccountingRoutingModule,
    ReactiveFormsModule ,
    SharedModule
	],
  exports: [
    HttpClientModule,
    CommonModule,
    PrimeNgModule,
  ],
})
export class AccountingModule {}
