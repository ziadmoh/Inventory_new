import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../auth/auth.service';

@Injectable({
	providedIn: 'root'
})

export class InvoiceService {

	isInvoiceExpanded:boolean = false;

	public invoiceStream: Subject<any> = new BehaviorSubject([]);
	public qtyTotal: Subject<number> = new BehaviorSubject(0);
	public priceTotal: Subject<number> = new BehaviorSubject(0);

    public orderItems = new BehaviorSubject<any[]>([]!);
    public numberOforderItems = new BehaviorSubject<number>(0!);
	
    public orderItemsList:any[] = [] 
    public shippingCost:any = '';

   // public userSessionId:number =0

    public userSessionId = new BehaviorSubject(0);

    public invoiceSubTotal = new BehaviorSubject<number>(0!);

    public shippingFees = new BehaviorSubject<{feeId:'',governorate:'',fee:0}[]>([]!);
    
    constructor(private http: HttpClient, 
        private toastrService: ToastrService,
        private authService:AuthService) {
        
        this.authService.newUser.subscribe(user =>{
            if(user && user.userId){
                this.getOpenedSession(user.userId).subscribe((res:any) =>{
                    
                    if(res && res.status == 'success' ){
                        
                        this.userSessionId.next(res.session.sessionId)
                        this.getOrderItems(res.session.sessionId).subscribe(items=>{
                           
                        })
                    }else{
                        
                        this.openSession(user.userId).subscribe((opened:any) =>{
                           
                            if(opened && opened.status == 'success' ){
                                this.userSessionId.next(opened.session.sessionId)
                                if(opened && opened.session){
                                    this.getOrderItems(opened.session.sessionId).subscribe(items=>{
                                        
                                    })
                                }
                            }
                            
                        })
                    }
                })
            }
        })
    
        
    }

    getOpenedSession(userId){
        return this.http.get(environment.SERVER_URL + 'usersessions/'+userId).pipe(
            tap(res =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }


    openSession(userId){
        return this.http.post(environment.SERVER_URL +'opensession/'+userId,{}).pipe(
            tap(next =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }

    addorderitem(sessionId,qty,productId){
        return this.http.post(environment.SERVER_URL +'addorderitem/'+sessionId,{
            quantity:qty,
            productId:productId
        }).pipe(tap((res:any)=>{

            

        },err=>{
            this.toastrService.error('خطأ من الخادم')
        }))
    }


    removeFromInvoice(userId,product,sessionId){
        return this.http.request('delete',environment.SERVER_URL +'deletecartitem/'+userId+'/'+product.productId,{
           body:{ sessionId:sessionId}
        })
        .pipe(tap((res:any)=>{
            if(res && res.status == 'failed'){
                this.toastrService.error(res.message);
            }
        },err=>{
            this.toastrService.error('خطأ من الخادم')
        }))
    }

    getOrderItems(sessionId){
        
        return this.http.get(environment.SERVER_URL + 'sessionorderItem/'+sessionId).pipe(
            tap((items:any) =>{
                if(items && items.status == 'success'){
                    this.orderItems.next(items.orderItems);
                    let itemsCount = 0
                    let subTotal = 0
                    for(let i=0 ; i<items.orderItems.length;i++){
                        itemsCount = itemsCount + items.orderItems[i].quantity
                        // this.numberOforderItems = this.numberOforderItems + items.orderItems[i].quantity
                        subTotal = subTotal + items.orderItems[i].fee
                    }
    
                    this.numberOforderItems.next(itemsCount)
    
                    this.invoiceSubTotal.next(subTotal)
    
                    this.invoiceStream.next(items.orderItems);
                    if(items.orderItems &&items.orderItems.length){
                        this.isInvoiceExpanded = true;
                    }
                    
                }else{
                    
                    this.orderItems.next([])
                    this.numberOforderItems.next(0)
                }
            },err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }


    editOrderItemQuantity(orderItemId,qty){
        return this.http.patch(environment.SERVER_URL + 'editorderitem/'+orderItemId,{
            quantity:qty,
        }).pipe(
            tap(next =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }

    generateInvoice(sessionId){
        return this.http.post(environment.SERVER_URL + 'generateinvoice/'+sessionId,{}).pipe(
            tap(next =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }

    addNewDeposite(invoiceId,deposite){
        return this.http.post(environment.SERVER_URL + 'payment/'+invoiceId,{deposite:deposite}).pipe(
            tap(next =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }

    generateInstallmentinvoice(sessionId,companyId){
        return this.http.post(environment.SERVER_URL + 'generateinstallmentinvoice/'+sessionId,{companyId:companyId}).pipe(
            tap(next =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }

    getAllSales(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'revenueInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'revenueInvoices')
        }
    }

    getAllReturns(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'allreturneditems?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'allreturneditems')
        }
    }

    getTodaySales(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'todayRevenueInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'todayRevenueInvoices')
        }
    }

    getLast7DaySales(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last7DaysRevenueInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last7DaysRevenueInvoices')
        }
    }

    getLast30Sales(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last30DaysRevenueInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last30DaysRevenueInvoices')
        }
    }

    getAllExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'expenseinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'expenseinvoices')
        }
    }

    getTodayExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'todayExpensesInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'todayExpensesInvoices')
        }
    }

    getLast7DayExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last7DaysExpenseInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last7DaysExpenseInvoices')
        }
    }

    getLast30Expenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last30DaysExpenseInvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last30DaysExpenseInvoices')
        }
    }


    getProductExpenseInvoices(productId){
        return this.http.get(environment.SERVER_URL + 'expenseinvoices/'+productId)
    }

    deleteItemFromInvoice(orderItemId){
        return this.http.delete(environment.SERVER_URL + 'deleteorderitem/'+orderItemId)
    }

    clearInvoice(session_id){
        return this.http.delete(environment.SERVER_URL + 'deletesessionorderitems/'+session_id)
    }

    returnItemsFromInvoice(orderItemId,type){
        return this.http.post(environment.SERVER_URL + 'returnitem/'+orderItemId,{type:type}).pipe(
            tap(next =>{},err=>{
                this.toastrService.error('خطأ من الخادم')
            })
        )
    }

    /////////////////////////////////////
    getTodayReturns(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'todayreturneditems?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'todayreturneditems')
        }
    }

    getLast7DayReturns(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last7DaysReturneditems?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last7DaysReturneditems')
        }
    }

    getLast30Returns(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last30DaysReturneditems?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last30DaysReturneditems')
        }
    }
    
    getAllLongTerms(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'companiesinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'companiesinvoices')
        }
    }

    getTodayLongTerms(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'todayCompaniesinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'todayCompaniesinvoices')
        }
    }

    getLast7DayLongTerms(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last7DaysCompaniesinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last7DaysCompaniesinvoices')
        }
    }

    getLast30LongTerms(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last30DaysCompaniesinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last30DaysCompaniesinvoices')
        }
    }

    searchReturnInvoices(searchquery,type,page?){
        if(page){
            return this.http.get(environment.SERVER_URL + `searchreturnedinvoices?searckquery=${searchquery}&type=${type}&page=${page}`)
        }else{
            return this.http.get(environment.SERVER_URL + `searchreturnedinvoices?searckquery=${searchquery}&type=${type}`)
        }
    }

    searchCompaniesReturnInvoices(searchquery,page?){
        if(page){
            return this.http.get(environment.SERVER_URL + `searchcompaniesreturnedinvoices?searckquery=${searchquery}&page=${page}`)
        }else{
            return this.http.get(environment.SERVER_URL + `searchcompaniesreturnedinvoices?searckquery=${searchquery}`)
        }
    }

    searchcompanies(searchquery){
        return this.http.get(environment.SERVER_URL + 'searchcompanies?searckquery='+searchquery)
    }

    returnExpenseInvoice(
        productId , 
        storages:{
        id:number,newQuantity:number
    }[], invoiceId){
        return this.http.put(environment.SERVER_URL + 'returnExpenseItems',{
            productId , storages, invoiceId
        })
    }

    getAllReturnedExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'returnedExpenseinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'returnedExpenseinvoices')
        }
    }

    getTodayReturnedExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'todayReturnedExpenseinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'todayReturnedExpenseinvoices')
        }
    }

    getLast7DayReturnedExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last7DaysReturnedExpenseinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last7DaysReturnedExpenseinvoices')
        }
    }

    getLast30ReturnedExpenses(page?){
        if(page){
            return this.http.get(environment.SERVER_URL + 'last30DaysReturnedExpenseinvoices?page='+page)
        }else{
            return this.http.get(environment.SERVER_URL + 'last30DaysReturnedExpenseinvoices')
        }
    }





}