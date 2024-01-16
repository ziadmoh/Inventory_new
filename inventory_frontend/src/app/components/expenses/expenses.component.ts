import { Component, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {

  constructor(private _inS:InvoiceService) { }

  selectedFilterType:any = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}

  filterTypes:any[] = [
    {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'},
    {name:'اخر 7 ايام',value:'week'},
    {name:'احر 30 يوم',value:'month'},
    {name:'كل الفواتير',value:'all'},
  ]

  expensesInvoices: any[] = [];

  totalSum = 0

  paginationOptions: any ={}

 

  ngOnInit(): void {
    
  }

  getAllExpensesInvoices(page?){
    this._inS.getAllExpenses(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.expensesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.expensesInvoices = []
        this.totalSum = 0
      }
    })
  }


  getTodayExpenses(page?){
    this._inS.getTodayExpenses(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.expensesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.expensesInvoices = []
        this.totalSum = 0
      }
    })
  }

  getLast7DayExpenses(page?){
    this._inS.getLast7DayExpenses(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.expensesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.expensesInvoices = []
        this.totalSum = 0
      }

    })
  }

  getLast30Expenses(page?){
    this._inS.getLast30Expenses(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.expensesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.expensesInvoices = []
        this.totalSum = 0
      }

    })
  }

  filterInvoices(e){
    if(e.value != null){
      this.selectedFilterType = e.value
        if(e.value.value == 'all'){
          this.getAllExpensesInvoices(1);
        }else if (e.value.value == 'today'){
          this.getTodayExpenses(1);
        }else if(e.value.value == 'week'){
          this.getLast7DayExpenses(1);
        }else if(e.value.value == 'month'){
          this.getLast30Expenses(1);
        }else{
          this.getTodayExpenses(1);
        }
    }else{
      this.selectedFilterType = ''
    }
  }

  cancelFilter(){
    this.getTodayExpenses();
    this.selectedFilterType = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}
  }

  loadData(event: LazyLoadEvent) {
    if(this.selectedFilterType.value == 'all'){
      this.getAllExpensesInvoices(event.first/10 +1);
    }else if (this.selectedFilterType.value == 'today'){
      this.getTodayExpenses(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'week'){
      this.getLast7DayExpenses(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'month'){
      this.getLast30Expenses(event.first/10 +1);
    }else{
      this.getTodayExpenses(event.first/10 +1);
    }
  }
}
