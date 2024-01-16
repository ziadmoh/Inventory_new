import { HttpClient } from '@angular/common/http';
import { HostListener, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { StoragesService } from './storages.service';
import { InvoiceService } from './invoice.service';

export interface SupplyProductsResponse {
  supplyProducts: [
      {
        productId: number,
        productName: string,
        shortName:string , 
        productDescription: string,
        productSerial: string,
        quantity: number,
        piecePrice: number,
        piecePurchasePrice: number,
        manufacturerCountery: string,
        isDeleted: string,
        addedAt: string,
        modifiedAt: string
    },
  ]
}
export interface SingleSupplyProductsResponse {
  supplyProduct:   {
    productId: number,
    productName: string,
    shortName:string , 
    productDescription: string,
    productSerial: string,
    quantity: number,
    piecePrice: number,
    piecePurchasePrice: number,
    manufacturerCountery: string,
    isDeleted: string,
    addedAt: string,
    modifiedAt: string
},
}

@Injectable({
  providedIn: 'root'
})
export class InventoryProductsService {

  public allProducts = new BehaviorSubject<any[]>([]!);

  public allProductsShortages = new BehaviorSubject<any[]>([]!);

  selectedStorage:any = {}

  sessionId:number = -1

  constructor(private http:HttpClient,private invS:InvoiceService, private toastrService: ToastrService,private storageService:StoragesService) { 
   // this.getAllProducts().subscribe()
    //this.getAllProductsShortages().subscribe()
    this.storageService.selectedStorage.subscribe(res =>{
      if(res){
        this.selectedStorage = res
        
      }else{
        this.selectedStorage = {
          storageId: 0,
          storageName: "جميع المخازن",
          type: "inventory",
          address:"-",
          isDeleted: "0"
        }
      }
    })

    this.invS.userSessionId.subscribe(sessionId => {
      this.sessionId = sessionId;
    })
  }


  getAllProducts(page?,orderBy?, orderType?){
    if(page){
      
        return this.http.get<SupplyProductsResponse>(environment.SERVER_URL + 'allsupplyproducts?page='+page+`&orderBy=${orderBy}&orderType=${orderType}`).pipe(
          tap((products:any) =>{},err=>{
              this.toastrService.error('خطأ من الخادم')
          })
      )

    }else{
      return this.http.get<SupplyProductsResponse>(environment.SERVER_URL + 'allsupplyproducts?orderBy='+orderBy+`&orderType=${orderType}`).pipe(
        tap((products:any) =>{},err=>{
            this.toastrService.error('خطأ من الخادم')
        })
    )

    }
   
  }

  getAllProductsShortages(page?,orderBy?, orderType?){
    if(page){
      return this.http.get<SupplyProductsResponse>(environment.SERVER_URL + 'criticalquantityproducts?page='+page+'&orderBy='+orderBy+'&orderType='+orderType).pipe(
          tap((products:any) =>{},err=>{
              this.toastrService.error('خطأ من الخادم')
          })
      )

    }else{
      return this.http.get<SupplyProductsResponse>(environment.SERVER_URL + 'criticalquantityproducts?orderBy='+orderBy+`&orderType=${orderType}`).pipe(
          tap((products:any) =>{},err=>{
              this.toastrService.error('خطأ من الخادم')
          })
      )

    }
  }

  getSingleProduct(id:any){
   return this.http.get<SingleSupplyProductsResponse>(environment.SERVER_URL + 'product/'+id)
  }

  deleteProduct(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeletesupplyProduct/'+id,{})
  }

  addProduct(product:{
    supplyNameId:number,
    productName:string , 
    shortName:string , 
    quantity:number , 
    criticalQuantity:number , 
    piecePrice:number,
    piecePurchasePrice:number , 
    productDescription:string,
    manufacturerCountery:string,
    barcode:string,
    productStoragesArr:{storageId:string,quantity:number}[]
    releaseYear_id?:number,
    carModel_id?:number,
    instanceBarCodes?:[],
    supplierId?:number,
  }){
    product['userId'] = JSON.parse(localStorage.getItem('user') as string).userId
   return this.http.post(environment.SERVER_URL + 'addsupplyProduct/'+product.supplyNameId,product)
  }

  updateProduct(product:{
    id:number,
    supplyNameId:number,
    productName:string , 
    shortName:string , 
    quantity:number , 
    criticalQuantity:number , 
    piecePrice:number,
    piecePurchasePrice:number , 
    productDescription:string,
    manufacturerCountery:string,
    releaseYear_id?:number,
    carModel_id?:number,
    instanceBarCodes?:[],
    supplierId?:number,
  }){
    console.log(product)
    product['userId'] = JSON.parse(localStorage.getItem('user') as string).userId
   return this.http.put(environment.SERVER_URL + 'editproduct/'+product.id,product)
  }

  archiveProduct(id:any){
    return this.http.patch(environment.SERVER_URL + 'deletesupplyproduct/'+id,{})
  }

  archiveProductInStorage(id:any){
    return this.http.patch(environment.SERVER_URL + 'deletesupplyproductFromStorage/'+id,{})
  }

  archiveMultipleProducts(ids:any[]){
    const form = new FormData()

    ids.forEach((id,index) =>{
      form.append(`product_id[${index}]`,id)
    })

    return this.http.patch(environment.SERVER_URL + 'deleteMultiplesupplyproducts',{products:ids})
  }

  archiveMultipleProductsFromStorage(ids:any[]){
    const form = new FormData()

    ids.forEach((id,index) =>{
      form.append(`product_id[${index}]`,id)
    })

    return this.http.patch(environment.SERVER_URL + 'deleteMultiplesupplyproductsFromStorage',{products:ids})
  }

  increaseQuantity(id:any,quantity){
    let userId = JSON.parse(localStorage.getItem('user') as string).userId
    return this.http.patch(environment.SERVER_URL + 'increaseproductquantity/'+id,{quantity:quantity,userId:userId})
  }

  filterByBrand(id:any){
    return this.http.get(environment.SERVER_URL + 'brandproducts/'+id)
   }

   filterByCountry(id:any){
    return this.http.get(environment.SERVER_URL + 'countryproducts/'+id)
   }

   filterByModel(id:any){
    return this.http.get(environment.SERVER_URL + 'modelproducts/'+id)
   }

   filterByType(id:any,page?,orderBy?, orderType?){
    if(page){
      return this.http.get<any>(environment.SERVER_URL + `supplytypeproducts/${id}?page=${page}&orderBy=${orderBy}&orderType=${orderType}`)

    }else{
      return this.http.get<any>(environment.SERVER_URL + `supplytypeproducts/${id}?orderBy=${orderBy}&orderType=${orderType}`)

    }
   }

   filterByCategory(id:any,page?,orderBy?, orderType?){
    if(page){
      return this.http.get<any>(environment.SERVER_URL + `supplynameproducts/${id}?page=${page}&orderBy=${orderBy}&orderType=${orderType}`)

    }else{
      return this.http.get<any>(environment.SERVER_URL + `supplynameproducts/${id}?orderBy=${orderBy}&orderType=${orderType}`)

    }
   }

   filterByYear(id:any){
    return this.http.get(environment.SERVER_URL + 'yearproducts/'+id)
   }

   searchProducts(searchquery,page?,orderBy?, orderType?){
    if(page){
      return this.http.get<any>(environment.SERVER_URL + `searchproducts?searckquery=${searchquery}&page=${page}&orderBy=${orderBy}&orderType=${orderType}`)

    }else{
      return this.http.get<any>(environment.SERVER_URL + `searchproducts?searckquery=${searchquery}&orderBy=${orderBy}&orderType=${orderType}`)

    }
   }

   searchShortagesProducts(searchquery,page?,orderBy?, orderType?){
    if(page){
      return this.http.get<any>(environment.SERVER_URL + `searchShortagesProducts?searckquery=${searchquery}&page=${page}&orderBy=${orderBy}&orderType=${orderType}`)

    }else{
      return this.http.get<any>(environment.SERVER_URL + `searchShortagesProducts?searckquery=${searchquery}&orderBy=${orderBy}&orderType=${orderType}`)

    }
   }
   
   checkbarcode(barcode){
    return this.http.get(environment.SERVER_URL + 'checkbarcode/'+barcode)
   }


   addToInvoice(product) {
    let selectedItem;
    if(product && product.productId){
      selectedItem = product
    }

    let orderItems;

    this.invS.orderItems.subscribe(items => {

      orderItems = items
    })

    if (orderItems.length) {
      let found = orderItems.find(item => {
        return item.product.productId == selectedItem.productId
      })

      if (found) {
        if (selectedItem.toInvoiceQuantity > 0) {
          this.invS.editOrderItemQuantity(
            found.orderItemId,
            selectedItem.toInvoiceQuantity
          ).subscribe((eddited: any) => {

            if (eddited && eddited.status == 'success') {
              this.invS.getOrderItems(eddited.orderItem.session_id).subscribe()
              
            } else {
              this.toastrService.error(eddited.message)
              product["toInvoiceQuantity"] = eddited.orderItem.quantity
            }

          })
        } else {
          this.toastrService.error('من فضلك ادخل كمية صحيحة')
        }

      } else {
        if (selectedItem.toInvoiceQuantity > 0) {
          this.invS.addorderitem(
            this.sessionId,
            selectedItem.toInvoiceQuantity,
            selectedItem.productId
          ).subscribe(res => {

            if (res && res.status == 'success') {
              this.invS.getOrderItems(this.sessionId).subscribe()
            
            } else {
              this.toastrService.error(res.message)
            }
          })
        } else {
          this.toastrService.error('من فضلك ادخل كمية صحيحة')
        }

      }
    } else {
      if (selectedItem.toInvoiceQuantity > 0) {
        this.invS.addorderitem(
          this.sessionId,
          selectedItem.toInvoiceQuantity,
          selectedItem.productId
        ).subscribe(res => {

          if (res && res.status == 'success') {
            this.invS.getOrderItems(this.sessionId).subscribe()
            
          } else {
            this.toastrService.error(res.message)
          }
        })
      } else {
        this.toastrService.error('من فضلك ادخل كمية صحيحة')
      }

    }


  }

   

 

}
