import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-long-terms-invoices',
  templateUrl: './long-terms-invoices.component.html',
  styleUrls: ['./long-terms-invoices.component.scss']
})
export class longTermsInvoicesComponent implements OnInit {

  constructor(private _inS:InvoiceService,private toastr:ToastrService) { }

  longTermsInvoices: any[] = []




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

  getAllLongTermsInvoices(page?){
    this._inS.getAllLongTerms(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.longTermsInvoices = []
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
        res.companiesInvoices.forEach(company =>{
          company.invoices.forEach(invoice =>{
            this.longTermsInvoices.push(invoice)
          })
        })
        
      }else{
        this.longTermsInvoices = []
        this.totalSum = 0
      }
    })
  }

  getTodayLongTerms(page?){
    this._inS.getTodayLongTerms(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.longTermsInvoices = []
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
        res.companiesInvoices.forEach(company =>{
          
          company.invoices.forEach(invoice =>{
            
            this.longTermsInvoices.push(invoice)
          })
        })
        // this.longTermsInvoices.sort((a,b)=>{
        //   return a.creationDate - b.creationDate
        // })
      }else{
        this.longTermsInvoices = []
        this.totalSum = 0
      }
    })
  }

  getLast7DayLongTerms(page?){
    this._inS.getLast7DayLongTerms(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.longTermsInvoices = []
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
        res.companiesInvoices.forEach(company =>{
          company.invoices.forEach(invoice =>{
            this.longTermsInvoices.push(invoice)
          })
        })
      }else{
        this.longTermsInvoices = []
        this.totalSum = 0
      }
    })
  }

  getLast30LongTerms(page?){
    this._inS.getLast30LongTerms(page).subscribe((res:any) =>{
      if(res.status =='success'){
        this.longTermsInvoices = []
        this.totalSum = res.totalSum
        this.paginationOptions = res.paginationOptions
        res.companiesInvoices.forEach(company =>{
          company.invoices.forEach(invoice =>{
            this.longTermsInvoices.push(invoice)
          })
        })
      }else{
        this.longTermsInvoices = []
        this.totalSum = 0
      }
    })
  }

  filterInvoices(e){
    
    if(e.value != null){
      this.selectedFilterType = e.value 
        if(e.value.value == 'all'){
          this.getAllLongTermsInvoices(1);
        }else if (e.value.value == 'today'){
          this.getTodayLongTerms(1);
        }else if(e.value.value == 'week'){
          this.getLast7DayLongTerms(1);
        }else if(e.value.value == 'month'){
          this.getLast30LongTerms(1);
        }else{
          this.getTodayLongTerms(1);
        }
    }else{
      this.selectedFilterType = ''
    }
  }

  cancelFilter(){
    this.getTodayLongTerms();
    this.selectedFilterType = {name:'فواتير اليوم (من الساعة  7 ص حتى الان)',value:'today'}
  }

  countTotalFees(invoices){
    let total = 0
    for(let i=0;i<invoices.length ;i++){
      total = total + invoices[i].recievedFees
    }
    return total
  }

  loadData(event: LazyLoadEvent) {
    console.log(this.selectedFilterType)
    if(this.selectedFilterType.value == 'all'){
      this.getAllLongTermsInvoices(event.first/10 +1);
    }else if (this.selectedFilterType.value == 'today'){
      this.getTodayLongTerms(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'week'){
      this.getLast7DayLongTerms(event.first/10 +1);
    }else if(this.selectedFilterType.value == 'month'){
      this.getLast30LongTerms(event.first/10 +1);
    }else{
      this.getTodayLongTerms(event.first/10 +1);
    }
  }




}
