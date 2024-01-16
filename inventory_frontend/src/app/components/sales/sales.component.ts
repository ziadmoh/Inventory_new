import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  constructor(private _inS:InvoiceService,private toastr:ToastrService) { }

  salesInvoices: any[] = []

  visibleReturnDialog: boolean = false

  selectedItemsToReturn :any [] =[];
  
  isAllReturned :any [] =[];

  actionList: any[] = [];

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
    //this.getTodaySales()
    this.actionList = [{
      label: 'الاجرائات',
      items: [
        {
          label: ' استرجاع عناصر ',
          icon: 'fa-solid fa-rotate-right',
          command: () => {
            this.showReturnItemsDialog()
          },
        }
        
      ]
    }]
  }  

  getAllSalesInvoices(page?){
    this._inS.getAllSales(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.salesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.salesInvoices = []
        this.totalSum = 0
      }
      
    })
  }

  getTodaySales(page?){
    this._inS.getTodaySales(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.salesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.salesInvoices = []
        this.totalSum = 0
      }
    })
  }

  getLast7DaySales(page?){
    this._inS.getLast7DaySales(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.salesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.salesInvoices = []
        this.totalSum = 0
      }
    })
  }

  getLast30Sales(page?){
    this._inS.getLast30Sales(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.salesInvoices = res.invoices;
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
      }else{
        this.salesInvoices = []
        this.totalSum = 0
      }
    })
  }

  filterInvoices(e){
    
    if(e.value != null){
      this.selectedFilterType = e.value 
        if(e.value.value == 'all'){
          this.getAllSalesInvoices(1);
        }else if (e.value.value == 'today'){
          this.getTodaySales(1);
        }else if(e.value.value == 'week'){
          this.getLast7DaySales(1);
        }else if(e.value.value == 'month'){
          this.getLast30Sales(1);
        }else{
          this.getTodaySales(1);
        }
    }else{
      this.selectedFilterType = ''
    }
  }

  cancelFilter(){
    this.getTodaySales();
    this.selectedFilterType = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}
  }

  showReturnItemsDialog() {
    this.visibleReturnDialog = true
    this.selectedItemsToReturn = []
    this.numberOfInvoceItems = []
    this.isAllReturned = []
    this.selectedInvoice.orderItems.forEach(item =>{
      this.numberOfInvoceItems.push(false)
    })

    this.isAllReturned = this.selectedInvoice.orderItems.filter(item =>{
      return item.isReturned == 0
    })

  

    
  }

  onSelectInvoiceItem(e,index){
    if(e.checked && e.checked.length){
      this.selectedItemsToReturn.push(e.checked[0])
    }else{
      this.selectedItemsToReturn.splice(index,1)
    }
  }

  returnItems(){
    if (this.selectedItemsToReturn.length) {
    
    for(let i=0; i<this.selectedItemsToReturn.length;i++){

      if(i == this.selectedItemsToReturn.length-1){
        this._inS.returnItemsFromInvoice(this.selectedItemsToReturn[i].orderItemId,"revenue").subscribe((res:any) =>{
          if(res.status == 'success'){
            this.visibleReturnDialog = false
            this.toastr.success(res.message, 'تم الاسترجاع بنجاح');
            setTimeout(() => {
              if(this.selectedFilterType.value == 'all'){
                this.getAllSalesInvoices(this.paginationOptions.current_page);
              }else if (this.selectedFilterType.value == 'today'){
                this.getTodaySales(this.paginationOptions.current_page);
              }else if(this.selectedFilterType.value == 'week'){
                this.getLast7DaySales(this.paginationOptions.current_page);
              }else if(this.selectedFilterType.value == 'month'){
                this.getLast30Sales(this.paginationOptions.current_page);
              }else{
                this.getTodaySales(this.paginationOptions.current_page);
              }
            }, 500);
          }else{
            this.toastr.error(res.message, this.selectedItemsToReturn[i].product.productName + ' ' + this.selectedItemsToReturn[i].product.manufacturerCountery);
          }
          
        })
      }else{
        this._inS.returnItemsFromInvoice(this.selectedItemsToReturn[i].orderItemId,"revenue").subscribe((res:any) =>{
          if(res.status == 'success'){
          }else{
            this.toastr.error(res.message, this.selectedItemsToReturn[i].product.productName + ' ' + this.selectedItemsToReturn[i].product.manufacturerCountery);
          }
          
        })
      }
      
      
    }
    
    } else {
      this.toastr.error('من فضلك اختر عناصر لاسترجاعها');
    }
  }

  loadData(event: LazyLoadEvent) {
    console.log(this.selectedFilterType)
    if(this.selectedFilterType.value == 'all'){
      this.getAllSalesInvoices(event.first/10 +1);
    }else if (this.selectedFilterType.value == 'today'){
      this.getTodaySales(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'week'){
      this.getLast7DaySales(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'month'){
      this.getLast30Sales(event.first/10 +1);
    }else{
      this.getTodaySales(event.first/10 +1);
    }
  }


}
