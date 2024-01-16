import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarModelsService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { InventoryProductsService } from 'src/app/services/inventory-products.service';
import { SupplyNamesService } from 'src/app/services/supply-names.service';
import { SupplyTypesService } from 'src/app/services/supply-types.service';
import { ReleaseYearsService } from 'src/app/services/release-years.service';
import { Table } from 'primeng/table';
import { InvoiceService } from 'src/app/services/invoice.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuItem } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-long-term',
  templateUrl: './long-term.component.html',
  styleUrls: ['./long-term.component.scss']
})
export class LongTermComponent implements OnInit {

  constructor(
    private _carModelsService: CarModelsService,
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private _supplyNamesService:SupplyNamesService,
    private _supplyTypesService:SupplyTypesService,
    private _releaseYearsService:ReleaseYearsService,
    private _InventoryProductsService:InventoryProductsService,
    private authService: AuthService,
    private toastr: ToastrService,
    private invS:InvoiceService,
    private adminService:AdminSharedService,) { }

    companiesInvoices: any[] = []

    allCompaniesInvoices: any[] = []

    newPaymentForm: UntypedFormGroup;

    selectedInvoice: any = {}

    visiblePaymentDialog: boolean = false

    visibleReturnDialog: boolean = false

    selectedItemsToReturn :any [] =[];
    
    isAllReturned :any [] =[];

    numberOfInvoceItems :boolean [] =[];

    searchFilter:any = '';

    sessionId = -1

    isAdmin:boolean =false

    ngOnInit(): void {
      this.getAllCompaniesinvoices();
      this.initPaymentForm();

      this.invS.userSessionId.subscribe(sessionId =>{
        this.sessionId = sessionId;
      })

      this.authService.newUser.subscribe(user =>{
        if(user){
          if(user.type == 'admin'){
            this.isAdmin = true
          }else{
            this.isAdmin = false
          }
        }
      })
    }

    addPayment(){
      if (this.newPaymentForm.valid) {
        this.invS.addNewDeposite(this.selectedInvoice.invoiceId,
          this.newPaymentForm.get('deposite').value).subscribe((res:any ) =>{
          if(res.status == 'success'){
            this.getAllCompaniesinvoices();
            this.toastr.success('تم ادخال الدفعة بنجاح')
            this.visiblePaymentDialog = false;
          }else {
            this.toastr.error(res.message)
          }
        })
      } else {
        this.toastr.error(' من فضلك ادخل ثمن الدفعة');
      }
    }

    initPaymentForm() {
      this.newPaymentForm = new UntypedFormGroup({
        'deposite': new UntypedFormControl(null, [Validators.required]),
      })
    }

    showAddPaymentDialog(invoice) {
      this.selectedInvoice = invoice
      this.visiblePaymentDialog = true
      this.initPaymentForm();
      this.newPaymentForm.updateValueAndValidity();
    }

    showReturnItemsDialog(invoice) {
      this.selectedInvoice = invoice
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
          this.invS.returnItemsFromInvoice(this.selectedItemsToReturn[i].orderItemId,"revenue").subscribe((res:any) =>{
            if(res.status == 'success'){
              this.visibleReturnDialog = false
              this.toastr.success(res.message, 'تم الاسترجاع بنجاح');
              setTimeout(() => {
                this.getAllCompaniesinvoices();
              }, 500);
            }else{
              this.toastr.error(res.message, this.selectedItemsToReturn[i].product.productName + ' ' + this.selectedItemsToReturn[i].product.manufacturerCountery);
            }
            
          })
        }else{
          this.invS.returnItemsFromInvoice(this.selectedItemsToReturn[i].orderItemId,"revenue").subscribe((res:any) =>{
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


  

    



    getAllCompaniesinvoices() {
      this.adminService.getAllCompaniesinvoices().subscribe((res:any) =>{
        if(res && res.status == 'success'){
          this.companiesInvoices = res.companiesInvoices
          this.allCompaniesInvoices = res.companiesInvoices

        }else{
          this.allCompaniesInvoices = []
          this.companiesInvoices = []
        }
      })
    }


   

    applyFilterGlobal(event) {
      if(event.target.value){
        this.invS.searchcompanies(
          event.target.value
        ).subscribe((res:any) =>{
          if(res.status =='success'){
            this.companiesInvoices = res.companiesInvoices
          }else{
            this.companiesInvoices = []
          }
          
        })
      }else{
        this.getAllCompaniesinvoices()
      }
    }
  
    clearCompaniesSearch() {
      this.getAllCompaniesinvoices()
      this.searchFilter = ''
    }

    applyInvoiceFilterGlobal(el, $event, stringVal) {
      el.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }
  

    clearInvoiceFilter(table: Table) {
      table.clear();
  
    }

    
}
