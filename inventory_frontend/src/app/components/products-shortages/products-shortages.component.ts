import { Component, OnInit, ViewChild } from '@angular/core';
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

import { InvoiceService } from 'src/app/services/invoice.service';
import { AuthService } from 'src/app/auth/auth.service';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { LayoutService } from 'src/app/services/app.layout.service';

@Component({
  selector: 'app-products-shortages',
  templateUrl: './products-shortages.component.html',
  styleUrls: ['./products-shortages.component.scss']
})
export class ProductShortagesComponent implements OnInit {

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
    private adminService:AdminSharedService,
    private _layoutS:LayoutService) { }

    supplyProducts: any[] = []

    allSupplyProducts: any[] = []

    visibleAddDialog: boolean = false
    
    visibleUpdateDialog: boolean = false

    visibledeleteDialog: boolean = false

    visibleQuantityDialog: boolean = false

    visibleArchiveDialog: boolean = false

    selectedItem: any = {};

    actionList: any[] = []

    supplyProductsList:any[] =[];

    newProductForm: UntypedFormGroup;

    newQuantityForm: UntypedFormGroup;

    selectedFilterItem:any

    selectedFilterItem2:any

    selectedFilterItem3:any

    selectedFilterItem4:any

    supplyCountries: any[] = []

    supplyBrands: any[] = []

    supplyModels: any[] = []

    filteredSupplyModels: any[] = []

    supplyReleaseYears: any[] = []

    supplyTypes: any[] = []

    supplyNames: any[] = []

    orderItems:any[] = [];

    suppliers:any[] = [];

    sessionId = -1

    isAdmin:boolean =false

    paginationOptions: any ={}

    isProductsLoading:boolean = true

    searchFilter:any = '';

    isSearching:boolean = false

    isFiltering:boolean = false

    searchVal : string = ''

    // Filter and sort Actions
  isFiltersDialogVisisble:boolean = false

  windowSize:any = window.innerWidth

  orderBy:any = ''

  rowsOrder:any[] = [
    {name:'(من أ الى ي) ابجدي باسم المنتج',val:'productName',type:'ASC'},
    {name:'ابجدي باسم المنتج (من ي الى أ)',val:'productName',type:'DESC'},
    {name:'المضاف حديثا',val:'addedAt',type:'DESC'},
    {name:'المضاف قديما',val:'addedAt',type:'ASC'},
    {name:'سعر البيع الاقل',val:'piecePrice',type:'ASC'},
    {name:'سعر البيع الاكثر',val:'piecePrice',type:'DESC'},
    {name:'سعر الشراء الافل',val:'piecePurchasePrice',type:'ASC'},
    {name:'سعر الشراء الاكثر',val:'piecePurchasePrice',type:'DESC'},
    {name:'الاقل كمية',val:'quantity',type:'ASC'},
    {name:'الاكثر كمية',val:'quantity',type:'DESC'},
    {name:'ابجدي باسم بلد القطعة (من أ الى ي) ',val:'manufacturerCountery',type:'ASC'},
    {name:'ابجدي باسم بلد القطعة (من ي الى أ) ',val:'manufacturerCountery',type:'DESC'},
    {name:'ابجدي بالاسم المختصر للمنتج (من أ الى ي) ',val:'shortName',type:'ASC'},
    {name:'ابجدي بالاسم المختصر للمنتج (من ي الى أ) ',val:'shortName',type:'DESC'},
  ]

    ngOnInit(): void {
      this.orderBy = {name:'(من أ الى ي) ابجدي باسم المنتج',val:'productName',type:'ASC'}
      this._layoutS.resizeObservable$.subscribe( (evt:any) => {
        this.windowSize = evt.target.innerWidth
        
    })
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

    loadData(event: LazyLoadEvent) {

      if(this.isSearching){

        this.isProductsLoading = true
        this._InventoryProductsService.searchShortagesProducts(
          this.searchFilter,
          event.first/10 +1,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false
            
            if(res.status =='success'){
              let products= res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })
        
              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
                this.supplyProducts = products
                this.allSupplyProducts =  products
    
                this.paginationOptions = res.paginationOptions
            } else{
              this.supplyProducts = []
              this.allSupplyProducts = []
            }
            
            
            
          },err =>{
            this.isProductsLoading = false
          })
      }else if (this.isFiltering){
        if(this.selectedFilterItem3 && this.selectedFilterItem3.supplyNameId){
            this.isProductsLoading = true
            this._InventoryProductsService.filterByCategory(
              this.selectedFilterItem3.supplyNameId,
              event.first/10 +1,
              this.orderBy.val, this.orderBy.type
            ).subscribe(
              res => {
                this.isProductsLoading = false
                
                if(res.status =='success'){
                  let products= res.supplyProducts
                  products.map(product => {
                    return product['toInvoiceQuantity'] = 1
                  })
            
                  products.map(product => {
                    return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
                  })
                    this.supplyProducts = products
                    this.allSupplyProducts =  products
        
                    this.paginationOptions = res.paginationOptions
                } else{
                  this.supplyProducts = []
                  this.allSupplyProducts = []
                }
                
                
              },err =>{
                this.isProductsLoading = false
              })
          
        }else if(this.selectedFilterItem4 && this.selectedFilterItem4.supplyTypeId){
          this.isProductsLoading = true
          
          this._InventoryProductsService.filterByType(
            this.selectedFilterItem4.supplyTypeId,
            event.first/10 +1,
            this.orderBy.val, this.orderBy.type
          ).subscribe(
            res => {
              this.isProductsLoading = false
              
              if(res.status =='success'){
                let products= res.supplyProducts
                products.map(product => {
                  return product['toInvoiceQuantity'] = 1
                })
          
                products.map(product => {
                  return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
                })
                  this.supplyProducts = products
                  this.allSupplyProducts =  products
      
                  this.paginationOptions = res.paginationOptions
              } else{
                this.supplyProducts = []
                this.allSupplyProducts = []
              }
              
              
              
            },err =>{
              this.isProductsLoading = false
            })
        }
      }else{
        this.getAllProductsShortages(event.first/10 +1,this.orderBy.val, this.orderBy.type)
      }
    }
    



    getAllProductsShortages(page?,orderBy?,orderType?) {
      this.isProductsLoading = true
      this.searchFilter = ''
      this.isSearching  = false
      this._InventoryProductsService.getAllProductsShortages(page,orderBy,orderType).subscribe(res => {
        this.isProductsLoading = false
        if(res.status =='success'){
          let products= res.supplyProducts
          products.map(product => {
            return product['toInvoiceQuantity'] = 1
          })
    
          products.map(product => {
            return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
          })
            this.supplyProducts = products
            this.allSupplyProducts =  products

            this.paginationOptions = res.paginationOptions
        }
       
        
        
        
      },err =>{
        this.isProductsLoading = false
      })
    }

    applyFilterGlobal(event) {
      this.isSearching = true
      this.searchVal = event
      this.paginationOptions['current_page'] = 1
      if(event.target.value.length >= 3){
        this.isProductsLoading = true
        this.table.reset()
        this._InventoryProductsService.searchShortagesProducts(
          event.target.value,
          this.paginationOptions.current_page,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false
            
            if(res.status =='success'){
              let products= res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })
        
              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
                this.supplyProducts = products
                this.allSupplyProducts =  products
    
                this.paginationOptions = res.paginationOptions
            } else{
              this.supplyProducts = []
              this.allSupplyProducts = []
            }
            
            
            
          },err =>{
            this.isProductsLoading = false
          })
      }else if (event.target.value.length == 0){
        this.isSearching  =false
        this.paginationOptions = {}
        this.table.reset()
        this.getAllProductsShortages(1,this.orderBy.val, this.orderBy.type)
      }
    }

    @ViewChild('shortagesData') table: Table;
  clearSearch() {
    this.isFiltering  =false
    this.isSearching  =false
    this.paginationOptions = {}
    this.table.reset()
    this.getAllProductsShortages(1,this.orderBy.val, this.orderBy.type)
    this.searchFilter = null
    this.selectedFilterItem3 = null
    this.selectedFilterItem4 = null

  }

  filterByCategory(e) {
    this.isFiltering = true
    this.paginationOptions['current_page'] = 1
    if(e.value != null){
      this.isProductsLoading = true
      this.table.reset()
      this._InventoryProductsService.filterByCategory(
        this.selectedFilterItem3.supplyNameId,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false
          
          if(res.status =='success'){
            let products= res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })
      
            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
              this.supplyProducts = products
              this.allSupplyProducts =  products
  
              this.paginationOptions = res.paginationOptions
          } else{
            this.supplyProducts = []
            this.allSupplyProducts = []
          }
          
          
          
        },err =>{
          this.isProductsLoading = false
        })
    }else {
      // this.isFiltering  =false
      // this.paginationOptions = {}
      // this.table.reset()
      // this.getAllSupplyProducts(1)
      // this.selectedFilterItem3 = ''
    }

  }

  cancelFilter3() {
    this.isFiltering  =false
    this.paginationOptions = {}
    this.table.reset()
    this.getAllProductsShortages(1,this.orderBy.val, this.orderBy.type)
    this.selectedFilterItem3 = ''
  }

  filterByType(e) {
    
    this.isFiltering = true
    this.paginationOptions['current_page'] = 1
    if(e.value != null){
      this.isProductsLoading = true
      this.table.reset()
      this._InventoryProductsService.filterByType(
        this.selectedFilterItem4.supplyTypeId,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false
          
          if(res.status =='success'){
            let products= res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })
      
            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
              this.supplyProducts = products
              this.allSupplyProducts =  products
  
              this.paginationOptions = res.paginationOptions
          } else{
            this.supplyProducts = []
            this.allSupplyProducts = []
          }
          
          
          
        },err =>{
          this.isProductsLoading = false
        })
    }else {
      // this.isFiltering  =false
      // this.paginationOptions = {}
      // this.table.reset()
      // this.getAllSupplyProducts(1)
      // this.selectedFilterItem4 = ''
    }

    


    

  }



  cancelFilter4() {
    this.isFiltering  =false
    this.paginationOptions = {}
    this.table.reset()
    this.getAllProductsShortages(1,this.orderBy.val, this.orderBy.type)
    this.selectedFilterItem4 = ''
  }

  // Order
  changeOrder(event?: LazyLoadEvent) {
    if(this.isSearching){

      this.isProductsLoading = true
      this._InventoryProductsService.searchProducts(
        this.searchFilter,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false
          
          if(res.status =='success'){
            let products= res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })
      
            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
              this.supplyProducts = products
              this.allSupplyProducts =  products
  
              this.paginationOptions = res.paginationOptions
          } else{
            this.supplyProducts = []
            this.allSupplyProducts = []
          }
          
          
          
        },err =>{
          this.isProductsLoading = false
        })
    }else if (this.isFiltering){
      if(this.selectedFilterItem3 && this.selectedFilterItem3.supplyNameId){
          this.isProductsLoading = true
          this._InventoryProductsService.filterByCategory(
            this.selectedFilterItem3.supplyNameId,
            this.paginationOptions.current_page,
            this.orderBy.val, this.orderBy.type
          ).subscribe(
            res => {
              this.isProductsLoading = false
              
              if(res.status =='success'){
                let products= res.supplyProducts
                products.map(product => {
                  return product['toInvoiceQuantity'] = 1
                })
          
                products.map(product => {
                  return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
                })
                  this.supplyProducts = products
                  this.allSupplyProducts =  products
      
                  this.paginationOptions = res.paginationOptions
              } else{
                this.supplyProducts = []
                this.allSupplyProducts = []
              }
              
              
            },err =>{
              this.isProductsLoading = false
            })
        
      }else if(this.selectedFilterItem4 && this.selectedFilterItem4.supplyTypeId){
        this.isProductsLoading = true
        
        this._InventoryProductsService.filterByType(
          this.selectedFilterItem4.supplyTypeId,
          this.paginationOptions.current_page,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false
            
            if(res.status =='success'){
              let products= res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })
        
              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
                this.supplyProducts = products
                this.allSupplyProducts =  products
    
                this.paginationOptions = res.paginationOptions
            } else{
              this.supplyProducts = []
              this.allSupplyProducts = []
            }
            
            
            
          },err =>{
            this.isProductsLoading = false
          })
      }
    }else{
      this.getAllProductsShortages(this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type)
    }
}

    
}
