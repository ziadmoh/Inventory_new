import { Component, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';
@Component({
  selector: 'app-returned-expenses',
  templateUrl: './returned-expenses.component.html',
  styleUrls: ['./returned-expenses.component.scss']
})
export class ReturnedExpensesComponent implements OnInit {

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

  selectedStorage:any = {}

  ngOnInit(): void {
    
  }

  getAllReturnedExpenses(page?){
    this._inS.getAllReturnedExpenses(page).subscribe((res:any) =>{
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




  getTodayReturnedExpenses(page?){
    this._inS.getTodayReturnedExpenses(page).subscribe((res:any) =>{
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

  getLast7DayReturnedExpenses(page?){
    this._inS.getLast7DayReturnedExpenses(page).subscribe((res:any) =>{
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

  getLast30ReturnedExpenses(page?){
    this._inS.getLast30ReturnedExpenses(page).subscribe((res:any) =>{
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
          this.getAllReturnedExpenses(1);
        }else if (e.value.value == 'today'){
          this.getTodayReturnedExpenses(1);
        }else if(e.value.value == 'week'){
          this.getLast7DayReturnedExpenses(1);
        }else if(e.value.value == 'month'){
          this.getLast30ReturnedExpenses(1);
        }else{
          this.getTodayReturnedExpenses(1);
        }
    }else{
      this.selectedFilterType = ''
    }
  }

  cancelFilter(){
    this.getTodayReturnedExpenses(1);
    this.selectedFilterType = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}
  }

  loadData(event: LazyLoadEvent) {
    if(this.selectedFilterType.value == 'all'){
      this.getAllReturnedExpenses(event.first/10 +1);
    }else if (this.selectedFilterType.value == 'today'){
      this.getTodayReturnedExpenses(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'week'){
      this.getLast7DayReturnedExpenses(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'month'){
      this.getLast30ReturnedExpenses(event.first/10 +1);
    }else{
      this.getTodayReturnedExpenses(event.first/10 +1);
    }
  }
}
