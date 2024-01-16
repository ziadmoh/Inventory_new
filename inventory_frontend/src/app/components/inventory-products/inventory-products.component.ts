import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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

import { StoragesService } from 'src/app/services/storages.service';
import JsBarcode from 'jsbarcode';
import printJS from 'print-js'
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { LayoutService } from 'src/app/services/app.layout.service';

@Component({
  selector: 'app-inventory-products',
  templateUrl: './inventory-products.component.html',
  styleUrls: ['./inventory-products.component.scss']
})
export class InventoryProductsComponent implements OnInit {

  constructor(
    private _carModelsService: CarModelsService,
    private _carCountriesService: CarCountriesService,
    private _carBrandsService: CarBrandsService,
    private _supplyNamesService: SupplyNamesService,
    private _supplyTypesService: SupplyTypesService,
    private _releaseYearsService: ReleaseYearsService,
    private _InventoryProductsService: InventoryProductsService,
    private authService: AuthService,
    private toastr: ToastrService,
    private invS: InvoiceService,
    private adminService: AdminSharedService,
    private storageService: StoragesService,
    private _layoutS: LayoutService) { }

  paginationOptions: any = {}

  page: number = 1

  searchPage: number = 1

  supplyProducts: any[] = []

  allSupplyProducts: any[] = []

  selectedStorage: any = {}

  storages: any[] = []

  visibleAddDialog: boolean = false

  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleQuantityDialog: boolean = false

  visibleArchiveDialog: boolean = false

  visibleMultipleArchiveDialog: boolean = false

  selectedItem: any = {};

  selectedIndex: number = -1;

  actionList: any[] = []

  supplyProductsList: any[] = [];

  newProductForm: UntypedFormGroup;

  updateProductForm: UntypedFormGroup;

  newQuantityForm: UntypedFormGroup;

  selectedFilterItem: any

  selectedFilterItem2: any

  selectedFilterItem3: any = null

  selectedFilterItem4: any = null

  supplyCountries: any[] = []

  supplyBrands: any[] = []

  supplyModels: any[] = []

  filteredSupplyModels: any[] = []

  supplyReleaseYears: any[] = []

  supplyTypes: any[] = []

  supplyNames: any[] = []

  orderItems: any[] = [];

  suppliers: any[] = [];

  sessionId = -1

  isAdmin: boolean = false


  selectedProducts: any = []


  searchFilter: any = '';

  selectedBarcode: string = '';

  isPrintingDialogVisible: boolean = false

  isProductsLoading: boolean = true

  isLoadingPrinter: boolean = false

  isAddingquantities: boolean = false

  isAllQuantitySelected: boolean = false

  isAddingProduct: boolean = false

  isUpdatingProduct: boolean = false

  selectedStickersQuantity: number = null

  newProductStoragesForm: UntypedFormGroup;

  isGettingStorages: boolean = false

  isProductStoragesVisible: boolean = false

  pStorages: {
    id: number
    product_id: number
    quantity: number
    storage: {
      storageId: number,
      storageName: string,
      type: string,
      address: string | null,
      isDeleted: "0" | "1"
    }
    storage_id: number
  }[] = []

  total_product_quantity: number = 0

  scrollListener: any;

  isSearching: boolean = false

  isFiltering: boolean = false

  searchVal: string = ''

  // Filter and sort Actions
  isFiltersDialogVisisble: boolean = false

  windowSize: any = window.innerWidth

  orderBy: any = ''

  rowsOrder: any[] = [
    { name: '(من أ الى ي) ابجدي باسم المنتج', val: 'productName', type: 'ASC' },
    { name: 'ابجدي باسم المنتج (من ي الى أ)', val: 'productName', type: 'DESC' },
    { name: 'المضاف حديثا', val: 'addedAt', type: 'DESC' },
    { name: 'المضاف قديما', val: 'addedAt', type: 'ASC' },
    { name: 'سعر البيع الاقل', val: 'piecePrice', type: 'DESC' },
    { name: 'سعر البيع الاكثر', val: 'piecePrice', type: 'ASC' },
    { name: 'سعر الشراء الافل', val: 'piecePurchasePrice', type: 'DESC' },
    { name: 'سعر الشراء الاكثر', val: 'piecePurchasePrice', type: 'ASC' },
    { name: 'الاقل كمية', val: 'quantity', type: 'DESC' },
    { name: 'الاكثر كمية', val: 'quantity', type: 'ASC' },
    { name: 'ابجدي باسم بلد القطعة (من أ الى ي) ', val: 'manufacturerCountery', type: 'ASC' },
    { name: 'ابجدي باسم بلد القطعة (من ي الى أ) ', val: 'manufacturerCountery', type: 'DESC' },
    { name: 'ابجدي بالاسم المختصر للمنتج (من أ الى ي) ', val: 'shortName', type: 'ASC' },
    { name: 'ابجدي بالاسم المختصر للمنتج (من ي الى أ) ', val: 'shortName', type: 'DESC' },
  ]


  ngOnInit(): void {
    this.orderBy = { name: '(من أ الى ي) ابجدي باسم المنتج', val: 'productName', type: 'ASC' }
    this._layoutS.resizeObservable$.subscribe((evt: any) => {
      this.windowSize = evt.target.innerWidth

    })
    this.getAllSupplyData();
    this.getAllSuppliers();
    this.getAllStorages();
    this.getSelectedStorage();
    this.actionList = [{
      label: 'الاجرائات',
      items: [
        {
          label: 'المخازن',
          icon: 'fa-solid fa-warehouse',
          command: () => {
            this.showProductStoragesDialog()
          },
        },
        {
          label: 'ادخال دفعة',
          icon: 'fa-solid fa-rotate-right',
          command: () => {
            this.showQuantityDialog()
          },
        },
        {
          label: ' طباعة باركود',
          icon: 'pi pi-print',
          command: () => {
            this.doPrintStickers('single')
          },
        },

        {
          label: 'تعديل البيانات',
          icon: 'fa-solid fa-pen',
          command: () => {
            this.showUpdateDialog()
          },
        },

        {
          label: ' ارشفة',
          icon: 'pi pi-trash',
          command: () => {
            this.showArchiveDialog()
          }
        },

      ]
    },

    ];
    this.initAddingForm();
    this.initQuantityForm();
    this.initNewQuantityStoragesForm();
    this.invS.userSessionId.subscribe(sessionId => {
      this.sessionId = sessionId;
    })

    this.authService.newUser.subscribe(user => {
      if (user) {
        if (user.type == 'admin') {
          this.isAdmin = true
        } else {
          this.isAdmin = false
        }
      }
    })
  }

  refresh(){
    this.getAllSupplyProducts(this.paginationOptions.current_page,
      this.orderBy.val, this.orderBy.type)
  }

  loadData(event?: LazyLoadEvent) {
    if (this.isSearching) {

      this.isProductsLoading = true
      this._InventoryProductsService.searchProducts(
        this.searchFilter,
        event.first / 10 + 1,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false

          if (res.status == 'success') {
            let products = res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })

            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
            this.supplyProducts = products
            this.allSupplyProducts = products

            this.paginationOptions = res.paginationOptions
          } else {
            this.supplyProducts = []
            this.allSupplyProducts = []
          }



        }, err => {
          this.isProductsLoading = false
        })
    } else if (this.isFiltering) {
      if (this.selectedFilterItem3 && this.selectedFilterItem3.supplyNameId) {
        this.isProductsLoading = true
        this._InventoryProductsService.filterByCategory(
          this.selectedFilterItem3.supplyNameId,
          event.first / 10 + 1,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false

            if (res.status == 'success') {
              let products = res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })

              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
              this.supplyProducts = products
              this.allSupplyProducts = products

              this.paginationOptions = res.paginationOptions
            } else {
              this.supplyProducts = []
              this.allSupplyProducts = []
            }


          }, err => {
            this.isProductsLoading = false
          })

      } else if (this.selectedFilterItem4 && this.selectedFilterItem4.supplyTypeId) {
        this.isProductsLoading = true

        this._InventoryProductsService.filterByType(
          this.selectedFilterItem4.supplyTypeId,
          event.first / 10 + 1,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false

            if (res.status == 'success') {
              let products = res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })

              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
              this.supplyProducts = products
              this.allSupplyProducts = products

              this.paginationOptions = res.paginationOptions
            } else {
              this.supplyProducts = []
              this.allSupplyProducts = []
            }



          }, err => {
            this.isProductsLoading = false
          })
      }
    } else {
      //  debugger
      this.getAllSupplyProducts(event.first / 10 + 1, this.orderBy.val, this.orderBy.type)
    }
  }

  getAllSupplyProducts(page?, orderBy?, orderType?) {
    this.isProductsLoading = true
    //  this.searchFilter = ''
    // this.isSearching  = false
    if (this.isSearching) {
      this._InventoryProductsService.searchProducts(
        this.searchFilter,
        page,
        orderBy, orderType
      ).subscribe(
        res => {
          this.isProductsLoading = false

          if (res.status == 'success') {
            let products = res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })

            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
            this.supplyProducts = products
            this.allSupplyProducts = products

            this.paginationOptions = res.paginationOptions
          } else {
            this.supplyProducts = []
            this.allSupplyProducts = []
          }



        }, err => {
          this.isProductsLoading = false
        })
    } else if (this.isFiltering) {
      if (this.selectedFilterItem3 && this.selectedFilterItem3.supplyNameId) {

        this._InventoryProductsService.filterByCategory(
          this.selectedFilterItem3.supplyNameId,
          page,
          orderBy, orderType
        ).subscribe(
          res => {
            this.isProductsLoading = false

            if (res.status == 'success') {
              let products = res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })

              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
              this.supplyProducts = products
              this.allSupplyProducts = products

              this.paginationOptions = res.paginationOptions
            } else {
              this.supplyProducts = []
              this.allSupplyProducts = []
            }


          }, err => {
            this.isProductsLoading = false
          })

      } else if (this.selectedFilterItem4 && this.selectedFilterItem4.supplyTypeId) {

        this._InventoryProductsService.filterByType(
          this.selectedFilterItem4.supplyTypeId,
          page,
          orderBy, orderType
        ).subscribe(
          res => {
            this.isProductsLoading = false

            if (res.status == 'success') {
              let products = res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })

              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
              this.supplyProducts = products
              this.allSupplyProducts = products

              this.paginationOptions = res.paginationOptions
            } else {
              this.supplyProducts = []
              this.allSupplyProducts = []
            }



          }, err => {
            this.isProductsLoading = false
          })
      }
    } else {
      this._InventoryProductsService.getAllProducts(page, orderBy, orderType).subscribe(res => {
        this.isProductsLoading = false
        if (res.status == 'success') {
          let products = res.supplyProducts
          products.map(product => {
            return product['toInvoiceQuantity'] = 1
          })

          products.map(product => {
            return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
          })
          this.supplyProducts = products
          this.allSupplyProducts = products

          this.paginationOptions = res.paginationOptions
        }



      }, err => {
        this.isProductsLoading = false
      })
    }


  }

  initAddingForm() {
    this.newProductForm = new UntypedFormGroup({
      'manufacturerCountery': new UntypedFormControl(null, [Validators.required]),
      'carBrand': new UntypedFormControl(null),
      'carModel': new UntypedFormControl(null),
      'releaseYear': new UntypedFormControl(null),
      'supplier': new UntypedFormControl(null),
      'supplyName': new UntypedFormControl(null, [Validators.required]),
      'productStoragesValues': new UntypedFormControl(null, [Validators.required]),

      'productName': new UntypedFormControl(null, [Validators.required]),
      'shortName': new UntypedFormControl(null, [Validators.required]),
      'productDescription': new UntypedFormControl(null),
      'piecePrice': new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
      'piecePurchasePrice': new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
      'quantity': new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
      'criticalQuantity': new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
      'productStoragesArr': new UntypedFormArray([], [Validators.required]),
      'instanceBarCodes': new UntypedFormControl(null),
    })
    this.updateProductForm = new UntypedFormGroup({
      'manufacturerCountery': new UntypedFormControl(null, [Validators.required]),
      'carBrand': new UntypedFormControl(null),
      'carModel': new UntypedFormControl(null),
      'releaseYear': new UntypedFormControl(null),
      'supplier': new UntypedFormControl(null),
      'supplyName': new UntypedFormControl(null, [Validators.required]),

      'productName': new UntypedFormControl(null, [Validators.required]),
      'shortName': new UntypedFormControl(null, [Validators.required]),
      'productDescription': new UntypedFormControl(null),
      'piecePrice': new UntypedFormControl(null, [Validators.required]),
      'piecePurchasePrice': new UntypedFormControl(null, [Validators.required]),
      'quantity': new UntypedFormControl(null, [Validators.required]),
      'criticalQuantity': new UntypedFormControl(null, [Validators.required]),
      'instanceBarCodes': new UntypedFormControl(null),
    })
  }



  initUpdateingForm() {
    this.updateProductForm = new UntypedFormGroup({
      'manufacturerCountery': new UntypedFormControl(this.selectedItem.manufacturerCountery, [Validators.required]),
      'carBrand': new UntypedFormControl(this.selectedItem.carBrand),
      'carModel': new UntypedFormControl(this.selectedItem.carModel),
      'releaseYear': new UntypedFormControl(this.selectedItem.releaseYear),
      'supplier': new UntypedFormControl(this.selectedItem.supplier),
      'supplyName': new UntypedFormControl(this.selectedItem.supplyName, [Validators.required]),

      'productName': new UntypedFormControl(this.selectedItem.productName, [Validators.required]),
      'shortName': new UntypedFormControl(this.selectedItem.shortName, [Validators.required]),
      'productDescription': new UntypedFormControl(this.selectedItem.productDescription),
      'piecePrice': new UntypedFormControl(this.selectedItem.piecePrice, [Validators.required]),
      'piecePurchasePrice': new UntypedFormControl(this.selectedItem.piecePurchasePrice, [Validators.required]),
      'quantity': new UntypedFormControl(this.selectedItem.quantity, [Validators.required]),
      'criticalQuantity': new UntypedFormControl(this.selectedItem.criticalQuantity, [Validators.required]),
      'instanceBarCodes': new UntypedFormControl(this.selectedItem.instanceBarCodes),
    })
  }

  initQuantityForm() {
    this.newQuantityForm = new UntypedFormGroup({
      'quantity': new UntypedFormControl(null, [Validators.required]),

    })
  }

  initNewQuantityStoragesForm() {
    this.newProductStoragesForm = new UntypedFormGroup({
      'quantityProductStoragesValues': new UntypedFormControl(null, [Validators.required]),
      'quantityProductStoragesArr': new UntypedFormArray([], [Validators.required]),
    })
  }

  addToInvoice() {

    this.invS.orderItems.subscribe(items => {

      this.orderItems = items
    })

    if (this.orderItems.length) {
      let found = this.orderItems.find(item => {
        return item.product.productId == this.selectedItem.productId
      })

      if (found) {
        if (this.selectedItem.toInvoiceQuantity > 0) {
          this.invS.editOrderItemQuantity(
            found.orderItemId,
            this.selectedItem.toInvoiceQuantity
          ).subscribe((eddited: any) => {

            if (eddited && eddited.status == 'success') {
              this.invS.getOrderItems(eddited.orderItem.session_id).subscribe()
              this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            } else {
              this.toastr.error(eddited.message)
            }

          })
        } else {
          this.toastr.error('من فضلك ادخل كمية صحيحة')
        }

      } else {
        if (this.selectedItem.toInvoiceQuantity > 0) {
          this.invS.addorderitem(
            this.sessionId,
            this.selectedItem.toInvoiceQuantity,
            this.selectedItem.productId
          ).subscribe(res => {

            if (res && res.status == 'success') {
              this.invS.getOrderItems(this.sessionId).subscribe()
              this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
              
            } else {
              this.toastr.error(res.message)
            }
          })
        } else {
          this.toastr.error('من فضلك ادخل كمية صحيحة')
        }

      }
    } else {
      if (this.selectedItem.toInvoiceQuantity > 0) {
        this.invS.addorderitem(
          this.sessionId,
          this.selectedItem.toInvoiceQuantity,
          this.selectedItem.productId
        ).subscribe(res => {

          if (res && res.status == 'success') {
            this.invS.getOrderItems(this.sessionId).subscribe()
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          } else {
            this.toastr.error(res.message)
          }
        })
      } else {
        this.toastr.error('من فضلك ادخل كمية صحيحة')
      }

    }


  }



  getAllSuppliers() {
    this.adminService.getAllSuppliers().subscribe((res: any) => {
      if (res && res.allsuppliers) {
        this.suppliers = []
        this.suppliers = res.allsuppliers
      } else {
        this.suppliers = []
      }
    })
  }

  getAllSupplyData() {
    this._carCountriesService.getPartCountries().subscribe((res: any) => {
      if (res && res.data) {
        this.supplyCountries = []
        this.supplyCountries = res.data

      } else {
        this.supplyCountries = []
      }
    })

    this._carBrandsService.getAllBrands().subscribe(res => {
      if (res && res.allbrands) {
        this.supplyBrands = []
        this.supplyBrands = res.allbrands

      } else {
        this.supplyBrands = []
      }
    })

    this._carModelsService.getAllModels().subscribe(res => {
      if (res && res.models) {
        this.supplyModels = []
        this.supplyModels = res.models
        this.filteredSupplyModels = res.models

      } else {
        this.supplyModels = []
      }
    })

    this._releaseYearsService.getAllYears().subscribe(res => {
      if (res && res.years) {
        this.supplyReleaseYears = []
        this.supplyReleaseYears = res.years

      } else {
        this.supplyReleaseYears = []
      }
    })

    this._supplyTypesService.getAllSupplyTypes().subscribe(res => {
      if (res && res.supplyTypes) {
        this.supplyTypes = []
        this.supplyTypes = res.supplyTypes

      } else {
        this.supplyTypes = []
      }
    })

    this._supplyNamesService.getAllSupplyNames().subscribe(res => {
      if (res && res.supplyNames) {
        this.supplyNames = []
        this.supplyNames = res.supplyNames

      } else {
        this.supplyNames = []
      }
    })

  }

  showArchiveDialog() {
    this.visibleArchiveDialog = true
  }

  onArchiveProduct() {
    if (this.selectedStorage.storageId == 0) {
      this._InventoryProductsService.archiveProduct(this.selectedItem.productId).subscribe((res: any) => {
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تمت الارشفة بنجاح');
          setTimeout(() => {
            //  this.supplyProducts.splice(this.selectedIndex,1)
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          }, 1000);

          this.visibleArchiveDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      this._InventoryProductsService.archiveProductInStorage(this.selectedItem.productId).subscribe((res: any) => {
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تمت الارشفة بنجاح');
          setTimeout(() => {
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          }, 1000);

          this.visibleArchiveDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    }

  }

  showMultipleArchiveDialog() {
    if (this.selectedProducts.length) {
      this.visibleMultipleArchiveDialog = true
    }
  }

  onArchiveMultipleProducts() {
    const ids = []
    this.selectedProducts.forEach(element => {
      ids.push(element.productId)
    });

    if (this.selectedStorage.storageId == 0) {
      this._InventoryProductsService.archiveMultipleProducts(ids).subscribe((res: any) => {
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تمت الارشفة بنجاح');
          this.selectedProducts = []
          setTimeout(() => {
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          }, 1000);

          this.visibleMultipleArchiveDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      this._InventoryProductsService.archiveMultipleProductsFromStorage(ids).subscribe((res: any) => {
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تمت الارشفة بنجاح');
          this.selectedProducts = []
          setTimeout(() => {
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          }, 1000);

          this.visibleMultipleArchiveDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })

    }

  }


  setItemSelection(supplyProduct, index) {
    this.selectedItem = { ...supplyProduct }
    this.selectedIndex = index
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newProductForm.updateValueAndValidity();
  }

  showUpdateDialog() {
    console.log(this.supplyCountries)
    this.selectedItem.manufacturerCountery = this.supplyCountries.find(country => {
      return country.country == this.selectedItem.manufacturerCountery
    })

    this.visibleUpdateDialog = true
    this.initUpdateingForm();
    this.updateProductForm.updateValueAndValidity();
  }

  onAddSupplyProduct() {

    if (this.newProductForm.valid) {

      let totalStorageQuantites = 0

      let productStoragesArrValues = []

      for (let i = 0; i < this.getProductStoragesArr().length; i++) {
        productStoragesArrValues.push({
          storageId: this.getProductStoragesArr().controls[i].value.storageId,
          quantity: this.getProductStoragesArr().controls[i].value.quantity
        })
        totalStorageQuantites = totalStorageQuantites + this.getProductStoragesArr().controls[i].value.quantity
      }

      if (totalStorageQuantites == this.newProductForm.get('quantity').value) {

        let randomBarCode = 'INV-' + Math.floor(10000000 + Math.random() * 90000000);
        this.checkBarcodeToCreate(randomBarCode, productStoragesArrValues);



      } else {
        this.toastr.error(' الكمية المدخلة لا تساوي الكمية الموزعة')
      }

    } else {
      if (this.newProductForm.get('productName').invalid) {
        this.toastr.error(' من فضلك ادخل الاسم');
      } else if (this.newProductForm.get('quantity').invalid) {
        this.toastr.error(' من فضلك ادخل الكمية');
      } else if (this.newProductForm.get('piecePurchasePrice').invalid) {
        this.toastr.error(' من فضلك ادخل سعر الشراء للفطعة');
      } else if (this.newProductForm.get('piecePrice').invalid) {
        this.toastr.error(' من فضلك ادخل سعر البيع للقطعة');
      } else if (this.newProductForm.get('supplyName').invalid) {
        this.toastr.error(' من فضلك اختر التصنيف');
      } else if (this.newProductForm.get('manufacturerCountery').invalid) {
        this.toastr.error(' من فضلك ادخل البلد');
      } else if (this.newProductForm.get('criticalQuantity').invalid) {
        this.toastr.error(' من فضلك ادخل اقل كمية للنواقص');
      } else if (this.newProductForm.get('shortName').invalid) {
        this.toastr.error(' من فضلك ادخل الاسم المختصر  ');
      } else if (this.newProductForm.get('productStoragesArr').invalid) {
        this.toastr.error(' من فضلك ادخل توزيعة المخازن');
      } else {

      }

    }
  }

  checkBarcodeToCreate(barcode, productStoragesArrValues) {
    this._InventoryProductsService.checkbarcode(barcode).subscribe((res: any) => {
      if (res.status == "failed") { //barcode doesnot exist before
        this.submitAddProduct(barcode, productStoragesArrValues)
      } else {
        let randomBarCode = 'INV-' + Math.floor(10000000 + Math.random() * 90000000);
        this.checkBarcodeToCreate(randomBarCode, productStoragesArrValues);
      }
    })
  }

  submitAddProduct(barcode, productStoragesArrValues) {
    this.isAddingProduct = true
    this._InventoryProductsService.addProduct({
      supplyNameId: this.newProductForm.get('supplyName').value.supplyNameId,
      productName: this.newProductForm.get('productName').value,
      shortName: this.newProductForm.get('shortName').value,
      quantity: this.newProductForm.get('quantity').value,
      criticalQuantity: this.newProductForm.get('criticalQuantity').value,
      piecePrice: this.newProductForm.get('piecePrice').value,
      piecePurchasePrice: this.newProductForm.get('piecePurchasePrice').value,
      productDescription: this.newProductForm.get('productDescription').value ? this.newProductForm.get('productDescription').value : '-',
      manufacturerCountery: this.newProductForm.get('manufacturerCountery').value.country,
      barcode,
      productStoragesArr: productStoragesArrValues,
      releaseYear_id: this.newProductForm.get('releaseYear').value ? this.newProductForm.get('releaseYear').value.releaseYearId : '',
      supplierId: this.newProductForm.get('supplier').value ? this.newProductForm.get('supplier').value.companyId : '',
      carModel_id: this.newProductForm.get('carModel').value ? this.newProductForm.get('carModel').value.carModelId : '',
      instanceBarCodes: this.newProductForm.get('instanceBarCodes').value,

    }).subscribe((res: any) => {
      this.isAddingProduct = false
      if (res && res.product) {
        this.visibleAddDialog = false
        this.toastr.success(res.message, 'تمت الاضافة بنجاح');
        setTimeout(() => {
          this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
          
        }, 500);
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    }, err => {
      this.isAddingProduct = false
    })
  }

  onUpdateSupplyProduct() {
    if (this.updateProductForm.valid) {
      this.isUpdatingProduct = true
      this._InventoryProductsService.updateProduct({
        id: this.selectedItem.productId,
        supplyNameId: this.updateProductForm.get('supplyName').value.supplyNameId,
        productName: this.updateProductForm.get('productName').value,
        shortName: this.updateProductForm.get('shortName').value,
        quantity: this.updateProductForm.get('quantity').value,
        criticalQuantity: this.updateProductForm.get('criticalQuantity').value,
        piecePrice: this.updateProductForm.get('piecePrice').value,
        piecePurchasePrice: this.updateProductForm.get('piecePurchasePrice').value,
        productDescription: this.updateProductForm.get('productDescription').value ? this.updateProductForm.get('productDescription').value : '-',
        manufacturerCountery: this.updateProductForm.get('manufacturerCountery').value.country,

        releaseYear_id: this.updateProductForm.get('releaseYear').value ? this.updateProductForm.get('releaseYear').value.releaseYearId : '',
        supplierId: this.updateProductForm.get('supplier').value ? this.updateProductForm.get('supplier').value.companyId : '',
        carModel_id: this.updateProductForm.get('carModel').value ? this.updateProductForm.get('carModel').value.carModelId : '',
        instanceBarCodes: this.updateProductForm.get('instanceBarCodes').value,

      }



      ).subscribe((res: any) => {
        this.isUpdatingProduct = false
        if (res && res.status == "success") {
          this.visibleUpdateDialog = false
          this.toastr.success(res.message, 'تم التعديل بنجاح');
          setTimeout(() => {
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          }, 500);
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      }, err => {
        this.isUpdatingProduct = false
      })
    } else {
      if (this.updateProductForm.get('productName').invalid) {
        this.toastr.error(' من فضلك ادخل الاسم');
      } else if (this.updateProductForm.get('quantity').invalid) {
        this.toastr.error(' من فضلك ادخل الكمية');
      } else if (this.updateProductForm.get('piecePrice').invalid) {
        this.toastr.error(' من فضلك ادخل سعر البيع للقطعة');
      } else if (this.updateProductForm.get('piecePurchasePrice').invalid) {
        this.toastr.error(' من فضلك ادخل سعر الشراء للفطعة');
      } else if (this.updateProductForm.get('supplyName').invalid) {
        this.toastr.error(' من فضلك اختر التصنيف');
      } else if (this.updateProductForm.get('manufacturerCountery').invalid) {
        this.toastr.error(' من فضلك ادخل البلد');
      } else if (this.updateProductForm.get('criticalQuantity').invalid) {
        this.toastr.error(' من فضلك ادخل اقل كمية للنواقص');
      } else if (this.updateProductForm.get('shortName').invalid) {
        this.toastr.error(' من فضلك ادخل الاسم المختصر');
      }

    }
  }


  showDeleteDialog() {
    this.visibledeleteDialog = true
  }



  showQuantityDialog() {
    if (this.selectedStorage.storageId != 0) {
      this.visibleQuantityDialog = true
      this.initQuantityForm();
      this.newQuantityForm.updateValueAndValidity();
    } else {
      this.visibleQuantityDialog = true
      this.initNewQuantityStoragesForm();
      this.newProductStoragesForm.updateValueAndValidity();
      // this.toastr.error('لا يوجد مخزن مختار', ' من فضلك اختر مخزن اولا');
    }

  }

  onIncreaseQuantity() {
    if (this.newQuantityForm.valid) {
      this._InventoryProductsService.increaseQuantity(
        this.selectedItem.productId,
        this.newQuantityForm.get('quantity').value).subscribe((res: any) => {
          if (res.status == 'success') {
            this.visibleQuantityDialog = false
            this.toastr.success(res.message, 'تم زيادة الكمية بنجاح');
            this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
            
          } else {
            this.toastr.error(res.message, 'خطأ !');
          }
        })
    } else {
      this.toastr.error(' من فضلك ادخل الكمية');
    }

  }

  onIncreasestorageQuantity() {
    if (this.newProductStoragesForm.valid) {
      this.isAddingquantities = true

      let addQuantites: any[] = []


      console.log(this.getQuantityProductStoragesArr())
      this.storageService.addProductTostorages(
        this.getQuantityProductStoragesArr().value,
        this.selectedItem.productId
      ).subscribe((res: any) => {
        if (res.status == 'success') {
          this.isAddingquantities = false
          this.visibleQuantityDialog = false
          this.toastr.success(res.message, 'تم زيادة الكمية بنجاح');
          this.getAllSupplyProducts(this.paginationOptions.current_page, this.orderBy.val, this.orderBy.type);
          
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }

      })

      // forkJoin(addQuantites).subscribe((res:any) =>{
      //   console.log(res)
      //   let allSuccess = []
      //   res.forEach(res =>{
      //     if(res.status == 'success'){
      //       allSuccess.push(true)
      //     }
      //   })
      //   if (allSuccess.length == res.length) {
      //     this.isAddingquantities = false
      //     this.visibleQuantityDialog = false
      //     this.toastr.success(res.message, 'تم زيادة الكمية بنجاح');
      //     this.getAllSupplyProducts({
      //        first: this.supplyProducts.length,
      //        rows: 10,
      //        sortField: null,
      //        sortOrder: 1,
      //        filters: null
      //     });
      
      //   } else {
      //    
      //   }
      // })

    } else {
      this.toastr.error('امن فضلك ادخل الكميات للمخازن المختارة');
    }

  }


  filterByBrand(e) {
    if (e.value != null) {
      this.cancelFilter2()
      this.cancelFilter3()
      this.cancelFilter4()
      this._InventoryProductsService.filterByBrand(this.selectedFilterItem.carBrandId).subscribe((res: any) => {
        if (res && res.supplyProducts) {
          let products = res.supplyProducts
          products.map(product => {
            return product['toInvoiceQuantity'] = 1
          })

          products.map(product => {
            return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
          })
          this.supplyProducts = products
        } else {
          this.supplyProducts = []
        }

      })
    }
  }

  cancelFilter1() {
    this.supplyProducts = this.allSupplyProducts
    this.selectedFilterItem = null
  }

  filterByCountry(e) {
    if (e.value != null) {
      this.cancelFilter1();
      this.cancelFilter3();
      this.cancelFilter4();
      this._InventoryProductsService.filterByCountry(this.selectedFilterItem2.manufacturerCountryId).subscribe((res: any) => {
        if (res && res.supplyProducts) {
          this.supplyProducts = res.countryModels
        } else {
          this.supplyProducts = []
        }

      })
    }

  }


  cancelFilter2() {
    this.supplyProducts = this.allSupplyProducts
    this.selectedFilterItem2 = null
  }

  filterByCategory(e) {
    this.isFiltering = true
    this.paginationOptions['current_page'] = 1
    if (e.value != null) {
      this.isProductsLoading = true
      this.table.reset()
      this._InventoryProductsService.filterByCategory(
        this.selectedFilterItem3.supplyNameId,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false

          if (res.status == 'success') {
            let products = res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })

            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
            this.supplyProducts = products
            this.allSupplyProducts = products

            this.paginationOptions = res.paginationOptions
          } else {
            this.supplyProducts = []
            this.allSupplyProducts = []
          }



        }, err => {
          this.isProductsLoading = false
        })
    } else {
      // this.isFiltering  =false
      // this.paginationOptions = {}
      // this.table.reset()
      // this.getAllSupplyProducts(1)
      // this.selectedFilterItem3 = ''
    }







  }

  cancelFilter3() {
    this.isFiltering = false
    this.paginationOptions = {}
    this.table.reset()
    this.getAllSupplyProducts(1, this.orderBy.val, this.orderBy.type)
    this.selectedFilterItem3 = ''
  }

  filterByType(e) {

    this.isFiltering = true
    this.paginationOptions['current_page'] = 1
    if (e.value != null) {
      this.isProductsLoading = true
      this.table.reset()
      this._InventoryProductsService.filterByType(
        this.selectedFilterItem4.supplyTypeId,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false

          if (res.status == 'success') {
            let products = res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })

            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
            this.supplyProducts = products
            this.allSupplyProducts = products

            this.paginationOptions = res.paginationOptions
          } else {
            this.supplyProducts = []
            this.allSupplyProducts = []
          }



        }, err => {
          this.isProductsLoading = false
        })
    } else {
      // this.isFiltering  =false
      // this.paginationOptions = {}
      // this.table.reset()
      // this.getAllSupplyProducts(1)
      // this.selectedFilterItem4 = ''
    }






  }



  cancelFilter4() {
    this.isFiltering = false
    this.paginationOptions = {}
    this.table.reset()
    this.getAllSupplyProducts(1, this.orderBy.val, this.orderBy.type)
    this.selectedFilterItem4 = ''
  }


  onChangeBrand(e) {
    if (e.value != null) {
      this.filteredSupplyModels = this.supplyModels.filter(model => {
        return model.carBrand_id == e.value.carBrandId
      })
    } else {
      this.filteredSupplyModels = this.supplyModels
    }

  }

  getProductBrand(supplyProduct) {
    if (supplyProduct.carModel && supplyProduct.carModel.carBrand_id) {
      let brand = this.supplyBrands.find(brand => {
        return brand.carBrandId == supplyProduct.carModel?.carBrand_id
      })
      if (brand) {
        return brand.brand
      } else {
        return ''
      }
    } else {
      return ''
    }

  }

  applyFilterGlobal(event) {
    
    this.isSearching = true
    this.searchVal = event
    this.paginationOptions['current_page'] = 1
    if (event.target.value.length >= 3) {
      this.isProductsLoading = true
      this.table.reset()
      this._InventoryProductsService.searchProducts(
        event.target.value,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false

          if (res.status == 'success') {
            let products = res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })

            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
            this.supplyProducts = products
            this.allSupplyProducts = products

            this.paginationOptions = res.paginationOptions
          } else {
            this.supplyProducts = []
            this.allSupplyProducts = []
          }



        }, err => {
          this.isProductsLoading = false
        })
    } else if (event.target.value.length == 0) {
      this.isSearching = false
      this.paginationOptions = {}
      this.table.reset()
      this.getAllSupplyProducts(1, this.orderBy.val, this.orderBy.type)
    }
  }

  @ViewChild('productData') table: Table;
  clearSearch() {
    this.isFiltering = false
    this.isSearching = false
    this.paginationOptions = {}
    this.table.reset()
    this.getAllSupplyProducts(1, this.orderBy.val, this.orderBy.type)
    this.searchFilter = null
    this.selectedFilterItem3 = null
    this.selectedFilterItem4 = null

  }


  getSelectedStorage() {
    this.storageService.selectedStorage.subscribe(res => {
      if (res) {
        this.selectedStorage = res

      } else {
        this.selectedStorage = {
          storageId: 0,
          storageName: "جميع المخازن",
          type: "inventory",
          address: "-",
          isDeleted: "0"
        }
      }
    })
  }

  getAllStorages() {
    this.storageService.getAllStorages().subscribe((res: any) => {
      if (res.status == 'success') {
        this.storages = res.storages

      } else {
        this.storages = []
      }
    })
  }

  getProductStoragesArr() {
    return (this.newProductForm.get("productStoragesArr") as UntypedFormArray);
  }

  getQuantityProductStoragesArr() {
    return (this.newProductStoragesForm.get("quantityProductStoragesArr") as UntypedFormArray);
  }

  setProductStorages(event) {
    while (this.getProductStoragesArr().length !== 0) {
      this.getProductStoragesArr().removeAt(0)
    }
    if (event.value) {
      for (let i = 0; i < event.value.length; i++) {
        this.getProductStoragesArr().push(
          new UntypedFormGroup({
            "quantity": new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
            "storageId": new UntypedFormControl(event.value[i].storageId, [Validators.required]),
            "storageName": new UntypedFormControl(event.value[i].storageName, [Validators.required]),
          })
        )
      }

    }

  }

  setQuantiyProductStorages(event) {
    while (this.getQuantityProductStoragesArr().length !== 0) {
      this.getQuantityProductStoragesArr().removeAt(0)
    }
    if (event.value) {
      for (let i = 0; i < event.value.length; i++) {
        this.getQuantityProductStoragesArr().push(
          new UntypedFormGroup({
            "quantity": new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
            "storageId": new UntypedFormControl(event.value[i].storageId, [Validators.required]),
            "storageName": new UntypedFormControl(event.value[i].storageName, [Validators.required]),
          })
        )
      }

    }

  }

  openPrintDialog() {
    this.isPrintingDialogVisible = true

  }

  onPrintStickers() {
    if (this.selectedProducts.length) {
      this.doPrintStickers('all')
    } else {
      this.toastr.error('من فضلك حدد المنتجات');
    }
  }


  doPrintStickers(type) {
    this.isLoadingPrinter = true
    if (type == 'all') {
      //
    } else if (type == 'single') {
      JsBarcode('#barcode', this.selectedItem.barcode, {
        // fontOptions: "bold",
        font: "fantasy",
        fontSize: 20,
      });


      setTimeout(() => {
        this.isLoadingPrinter = false
        printJS('barcodeContainer', 'html')
      }, 1000);
    }
  }

  showProductStoragesDialog() {
    this.isGettingStorages = true
    this.storageService.getProductStorages(this.selectedItem.productId).subscribe((res: any) => {
      this.isGettingStorages = false
      this.isProductStoragesVisible = true
      this.pStorages = []
      if (res.status == 'success') {
        this.pStorages = res.productstorage;
        this.total_product_quantity = res.total_quantity;

        this.storages.forEach(storage => {
          let found = this.pStorages.find(pS => {
            return pS.storage_id === storage.storageId
          })
          if (!found) {
            this.pStorages.push({
              id: -1,
              quantity: 0,
              product_id: this.selectedItem.productId,
              storage_id: storage.storageId,
              storage: storage
            })
          }
        });

      } else {
        this.storages.forEach((storage) => {
          let found = this.pStorages.find(pS => {
            return pS.storage_id === storage.storageId
          })
          if (!found) {
            this.pStorages.push({
              id: -1,
              quantity: 0,
              product_id: this.selectedItem.productId,
              storage_id: storage.storageId,
              storage: storage
            })
          }
        });
      }
    }, err => {
      this.isGettingStorages = false
    })

  }

  updateStoragesQuantities() {
    let total_quantity = 0
    for (let i = 0; i < this.pStorages.length; i++) {
      if (this.pStorages[i].quantity == null) {
        this.pStorages[i].quantity = 0
      }
      total_quantity = total_quantity + this.pStorages[i].quantity
    }

    if (total_quantity === this.total_product_quantity) {
      this.isGettingStorages = true
      this.storageService.updateProductStorages(
        this.selectedItem.productId,
        this.pStorages
      ).subscribe((res: any) => {
        this.isGettingStorages = false
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تم النقل بنجاح');
          window.location.reload();
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      }, err => {
        this.isGettingStorages = false
      })
    } else {
      this.toastr.error("الحسبة خاطئة ", "الكمية الاجمالية لا تساوي الكمية الموزعة");
    }

  }

  hideProductStoragesDialog() {
    this.isGettingStorages = false
  }


  // Order
  changeOrder(event?: LazyLoadEvent) {
    if (this.isSearching) {

      this.isProductsLoading = true
      this._InventoryProductsService.searchProducts(
        this.searchFilter,
        this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type
      ).subscribe(
        res => {
          this.isProductsLoading = false

          if (res.status == 'success') {
            let products = res.supplyProducts
            products.map(product => {
              return product['toInvoiceQuantity'] = 1
            })

            products.map(product => {
              return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
            })
            this.supplyProducts = products
            this.allSupplyProducts = products

            this.paginationOptions = res.paginationOptions
          } else {
            this.supplyProducts = []
            this.allSupplyProducts = []
          }



        }, err => {
          this.isProductsLoading = false
        })
    } else if (this.isFiltering) {
      if (this.selectedFilterItem3 && this.selectedFilterItem3.supplyNameId) {
        this.isProductsLoading = true
        this._InventoryProductsService.filterByCategory(
          this.selectedFilterItem3.supplyNameId,
          this.paginationOptions.current_page,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false

            if (res.status == 'success') {
              let products = res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })

              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
              this.supplyProducts = products
              this.allSupplyProducts = products

              this.paginationOptions = res.paginationOptions
            } else {
              this.supplyProducts = []
              this.allSupplyProducts = []
            }


          }, err => {
            this.isProductsLoading = false
          })

      } else if (this.selectedFilterItem4 && this.selectedFilterItem4.supplyTypeId) {
        this.isProductsLoading = true

        this._InventoryProductsService.filterByType(
          this.selectedFilterItem4.supplyTypeId,
          this.paginationOptions.current_page,
          this.orderBy.val, this.orderBy.type
        ).subscribe(
          res => {
            this.isProductsLoading = false

            if (res.status == 'success') {
              let products = res.supplyProducts
              products.map(product => {
                return product['toInvoiceQuantity'] = 1
              })

              products.map(product => {
                return product['productNameWithCountry'] = product.productName + ' ' + product.manufacturerCountery
              })
              this.supplyProducts = products
              this.allSupplyProducts = products

              this.paginationOptions = res.paginationOptions
            } else {
              this.supplyProducts = []
              this.allSupplyProducts = []
            }



          }, err => {
            this.isProductsLoading = false
          })
      }
    } else {
      this.getAllSupplyProducts(this.paginationOptions.current_page,
        this.orderBy.val, this.orderBy.type)
    }
  }

}
