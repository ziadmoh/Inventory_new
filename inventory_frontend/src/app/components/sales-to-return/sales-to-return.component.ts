import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-sales-to-return',
  templateUrl: './sales-to-return.component.html',
  styleUrls: ['./sales-to-return.component.scss']
})
export class SalesToReturnComponent implements OnInit {

  constructor(private _inS:InvoiceService,private toastr:ToastrService) { }

  salesInvoices: any[] = []

  visibleReturnDialog: boolean = false

  selectedItemsToReturn :any [] =[];
  
  isAllReturned :any [] =[];

  actionList: any[] = [];

  selectedInvoice: any = {}

  numberOfInvoceItems :boolean [] =[];

  searchFilter:any = ''
  

  //Pagination
  paginationOptions: any ={}

  ngOnInit(): void {
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
        this.paginationOptions = res.paginationOptions
      }else{
        this.salesInvoices = []
      }
    })
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
              this.getAllSalesInvoices(this.paginationOptions.current_page);
              
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

 

  applyFilterGlobal(event) {
    if(event.target.value){
      this._inS.searchReturnInvoices(
        event.target.value,
        "revenue",
        1
      ).subscribe((res:any) =>{
        if(res.status =='success'){
          this.salesInvoices = res.invoices;
          this.paginationOptions = res.paginationOptions
        }else{
          this.salesInvoices = []
        }
        
      })
    }else{
      this.getAllSalesInvoices(1)
    }
  }

  clearSearch() {
    this.getAllSalesInvoices(1)
    this.searchFilter = ''
  }

  loadData(event: LazyLoadEvent) {
    this.getAllSalesInvoices(event.first/10 +1)
  }



}
