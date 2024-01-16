import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-returned-sales',
  templateUrl: './returned-sales.component.html',
  styleUrls: ['./returned-sales.component.scss']
})
export class ReturnedSalesComponent implements OnInit {

  constructor(private _inS:InvoiceService,private toastr:ToastrService) { }

  returnsInvoices: any[] = []

  visibleReturnDialog: boolean = false

  selectedItemsToReturn :any [] =[];
  
  isAllReturned :any [] =[];


  selectedInvoice: any = {}

  numberOfInvoceItems :boolean [] =[];
  
  selectedFilterType:any = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}

  filterTypes:any[] = [
    {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'},
    {name:'اخر 7 ايام',value:'week'},
    {name:'احر 30 يوم',value:'month'},
    {name:'كل الفواتير',value:'all'},
  ]

  totalSum = 0

  paginationOptions: any ={}

  ngOnInit(): void {
    
   
  }  

  getAllReturnsInvoices(page?){
    this._inS.getAllReturns(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.returnsInvoices = res.orderItems;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.returnsInvoices = []
        this.totalSum = 0
      }
      
    })
  }

  getTodayReturns(page?){
    this._inS.getTodayReturns(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.returnsInvoices = res.orderItems;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.returnsInvoices = []
        this.totalSum = 0
      }
      
    })
  }

  getLast7DayReturns(page?){
    this._inS.getLast7DayReturns(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.returnsInvoices = res.orderItems;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.returnsInvoices = []
        this.totalSum = 0
      }
      
    })
  }

  getLast30Returns(page?){
    this._inS.getLast30Returns(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.returnsInvoices = res.orderItems;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.returnsInvoices = []
        this.totalSum = 0
      }
      
    })
  }

  filterInvoices(e){
    
    if(e.value != null){
      this.selectedFilterType = e.value 
        if(e.value.value == 'all'){
          this.getAllReturnsInvoices(1);
        }else if (e.value.value == 'today'){
          this.getTodayReturns(1);
        }else if(e.value.value == 'week'){
          this.getLast7DayReturns(1);
        }else if(e.value.value == 'month'){
          this.getLast30Returns(1);
        }else{
          this.getTodayReturns(1);
        }
    }else{
      this.selectedFilterType = ''
    }
  }

  cancelFilter(){
    this.getTodayReturns();
    this.selectedFilterType = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}
  }


  loadData(event: LazyLoadEvent) {
    console.log(this.selectedFilterType)
    if(this.selectedFilterType.value == 'all'){
      this.getAllReturnsInvoices(event.first/10 +1);
    }else if (this.selectedFilterType.value == 'today'){
      this.getTodayReturns(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'week'){
      this.getLast7DayReturns(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'month'){
      this.getLast30Returns(event.first/10 +1);
    }else{
      this.getTodayReturns(event.first/10 +1);
    }
  }




}
