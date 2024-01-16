import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { InvoiceService } from 'src/app/services/invoice.service';
import { StoragesService } from 'src/app/services/storages.service';

@Component({
  selector: 'app-expenses-to-return',
  templateUrl: './expenses-to-return.component.html',
  styleUrls: ['./expenses-to-return.component.scss']
})
export class ExpensesToReturnComponent implements OnInit {

  constructor(private _inS:InvoiceService,private toastr:ToastrService,
    private _storages:StoragesService) { }

  expensesInvoices: any[] = []

  isLoadingStorages:boolean = false

  visibleReturnDialog: boolean = false

  selectedItemsToReturn :any [] =[];
  
  isAllReturned :any [] =[];

  actionList: any[] = [];

  productstorage:any[] = []

  toReturnQuantities:any[] = []

  selectedInvoice: any = {}

  numberOfInvoceItems :boolean [] =[];

  searchFilter:any = ''
  
  selectedFilterType:any = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}

  filterTypes:any[] = [
    {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'},
    {name:'اخر 7 ايام',value:'week'},
    {name:'احر 30 يوم',value:'month'},
    {name:'كل الفواتير',value:'all'},
  ]

  //Pagination
  paginationOptions: any ={}

  returnsForm:UntypedFormGroup

  ngOnInit(): void {
    this.actionList = [{
      label: 'الاجرائات',
      items: [
        {
          label: ' ارجاع عناصر ',
          icon: 'fa-solid fa-rotate-right',
          command: () => {
            this.showReturnItemsDialog()
          },
        }
        
      ]
    }]
    this.initReturnsForm();
  }  

  getAllExpensesInvoices(page?){
    this._inS.getAllExpenses(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.expensesInvoices = res.invoices;
        this.paginationOptions = res.paginationOptions
      }else{
        this.expensesInvoices = []
      }
    })
  }

  initReturnsForm(){
    this.returnsForm = new UntypedFormGroup({
      'storagesQuantity':new UntypedFormArray([], [Validators.required]),
    })
  }

  getProductStoragesArr() {
    return (this.returnsForm.get("storagesQuantity") as UntypedFormArray);
  }



  showReturnItemsDialog() {
    this.isLoadingStorages = true
    this.initReturnsForm()
    this._storages.getProductStorages(this.selectedInvoice?.product?.productId).subscribe((res:any) =>{
      this.isLoadingStorages = false
      if(res.status =="success"){
        this.visibleReturnDialog = true
        this.productstorage = res.productstorage

       // this.getProductStoragesArr().value([])
        res.productstorage.forEach((element,index) => {
          this.getProductStoragesArr().push(
            new UntypedFormGroup({
              "returnQuantity": new UntypedFormControl(null,[Validators.min(1),Validators.max(this.productstorage[index]?.quantity)]) ,
              "storageId": new UntypedFormControl(element.storage_id,[Validators.required]) ,
            })
          )
        });
      }
    },err =>{
      this.isLoadingStorages = false
      this.productstorage = []
    })
    
  }

  returnItems(){
    console.log(this.returnsForm.value)

    if(this.returnsForm.valid && !this.returnsForm.value?.storagesQuantity?.every(obj => obj.returnQuantity === null)){

      let storages = []
      storages = this.returnsForm.value?.storagesQuantity?.map(storage =>{
        return{
          id:storage.storageId,
          newQuantity:storage.returnQuantity
        }
      })

      console.log(this.returnsForm.value)
      console.log(storages)

      this._inS.returnExpenseInvoice(
        this.selectedInvoice.product.productId,
        storages,
        this.selectedInvoice.invoiceId
      ).subscribe((res:any) =>{
        if(res.status == 'success'){
          this.visibleReturnDialog = false
          this.getAllExpensesInvoices(this.paginationOptions.current_page)
          this.toastr.success("تم الاسترجاع بنجاح");

      
        }else{
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    }else{
      if(this.returnsForm.valid){
        this.toastr.error("خطأ","من فصلك ادخل على الاقل كمية لمخزن واحد");
      }else{
        this.toastr.error("خطأ","الكمية المدخلة لا يمكن ان تكون اكبر من الكمية الاجمالية في المخزن ولا ان تقل عن 1 قطعة");
      }
    }
    

    
  }

 

  applyFilterGlobal(event) {
    if(event.target.value){
      this._inS.searchCompaniesReturnInvoices(
        event.target.value,
        1
      ).subscribe((res:any) =>{
        if(res.status =='success'){
          this.expensesInvoices = res.invoices;
          this.paginationOptions = res.paginationOptions
        }else{
          this.expensesInvoices = []
        }
        
      })
    }else{
      this.getAllExpensesInvoices(1)
    }
  }

  clearSearch() {
    this.getAllExpensesInvoices(1)
    this.searchFilter = ''
  }

  loadData(event: LazyLoadEvent) {
    this.getAllExpensesInvoices(event.first/10 +1)
  }


}
