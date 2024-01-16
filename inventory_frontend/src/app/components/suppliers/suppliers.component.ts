import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
// import { SystemSuppliersService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

  constructor(
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

  systemSuppliers: any[] = []

  allSystemSuppliers: any[] = []

  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  carCountries :any[] =[]

  carBrands :any[] =[]

  newSupplierForm: UntypedFormGroup;

  selectedFilterItem:any

  selectedFilterItem2:any


  ngOnInit(): void {
    this.getAllSuppliers();

    this.actionList = [{
      label: 'الاجرائات',
      items: [
        //   {
        //     label: 'تعديل',
        //     icon: 'pi pi-pencil',
        //     command: () => {
        //         this.showUpdateDialog()
        //     }
        //  },
        {
          label: ' ارشفة',
          icon: 'pi pi-trash',
          command: () => {
            this.showArchiveDialog()
          }
        },
        // {
        //   label: ' حذف نهائي',
        //   icon: 'pi pi-times',
        //   command: () => {
        //     this.showDeleteDialog()
        //   }
        // },
      ]
    },

    ];
    this.initAddingForm();
  }

  initAddingForm() {
    this.newSupplierForm = new UntypedFormGroup({
      'companyName': new UntypedFormControl(null, [Validators.required]),
      'personName': new UntypedFormControl(null, [Validators.required]),
      'phone': new UntypedFormControl(null, [Validators.pattern(/^(01)[0512][0-9]{8}$/)]),
      'address': new UntypedFormControl(null),
      'type': new UntypedFormControl('supplier', [Validators.required]),
    })
  }



  getAllSuppliers() {
    this.adminService.getAllSuppliers().subscribe((res:any) => {
      if (res && res.allsuppliers) {
        this.systemSuppliers = []
        this.systemSuppliers = res.allsuppliers
        this.allSystemSuppliers = res.allsuppliers
      } else {
        this.systemSuppliers = []
      }
    })
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newSupplierForm.updateValueAndValidity();
  }

  onAddSupplier() {
    if (this.newSupplierForm.valid) {
      this.adminService.createSupplierOrCompany({
        companyName:this.newSupplierForm.get('companyName').value,
        personName:this.newSupplierForm.get('personName').value,
        phone:this.newSupplierForm.get('phone').value,
        type:this.newSupplierForm.get('type').value,
        address:this.newSupplierForm.get('address').value,
       }).subscribe((res: any) => {
        if (res && res.status == 'success') {
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllSuppliers();
          }, 500);
        } else {
          this.toastr.error(res.message);
        }
      })
    } else {
      if(this.newSupplierForm.get('companyName').invalid){
				this.toastr.error('من فضلك ادخل اسم الشركة')
			}else if (this.newSupplierForm.get('personName').invalid){
        this.toastr.error('من فضلك ادخل اسم المورد')
      }else if (this.newSupplierForm.get('phone').invalid){
        this.toastr.error(` من فضلك ادخل هاتف صحيح`)
      }
    }
  }
  // showUpdateDialog() {
  //   this.visibleUpdateDialog = true;
  //   this.newSupplierForm.get('modelName').patchValue(this.selectedItem.model)
  //   this.newSupplierForm.get('brand').patchValue(
  
  //     this.carBrands.find(brand =>{
  //       return brand.carBrandId == this.selectedItem.carBrand_id
  //     })
  //   )
  // }

  // onUpdateModel() {
  //   if (this.newSupplierForm.valid) {
  //     this.adminService.updateModel({ model: this.newSupplierForm.get('modelName').value,brand_id :this.newSupplierForm.get('brand').value.carBrandId},this.selectedItem.carModelId).subscribe((res: any) => {
  //       if (res && res.carModel) {
  //         this.visibleUpdateDialog = false
  //         this.toastr.success(res.message, 'تم التعديل بنجاح');
  //         setTimeout(() => {
  //           this.getAllSuppliers();
  //         }, 500);
  //       } else {
  //         this.toastr.error(res.message, 'خطأ !');
  //       }
  //     })
  //   } else {
  //     if(this.newSupplierForm.get('modelName').invalid){
	// 			this.toastr.error('من فضلك ادخل النوع')
	// 		}
			
	// 		if(this.newSupplierForm.get('personName').invalid){
	// 			this.toastr.error('من فضلك اختر بلد المنشأ');
	// 		}
      
  //   }
  // }

  showDeleteDialog() {
    this.visibledeleteDialog = true

  }
  showArchiveDialog() {
    this.visibleArchiveDialog = true
  }

  onDeleteSupplier() {
    this.adminService.permDeleteSupplierOrCompany(this.selectedItem.supplierId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllSuppliers();
        }, 1000);

        this.visibledeleteDialog = false
      } else {
        this.toastr.error(res.message);
      }
    })
  }
  onArchiveSupplier() {
    this.adminService.archiveSupplierOrCompany(this.selectedItem.supplierId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllSuppliers();
        }, 1000);

        this.visibleArchiveDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }





  filterBySupplierType(e){
    if(e.value != null){
      if(e.value.name == 'admin'){
        this.adminService.getAllAdmins().subscribe((res:any) =>{
          if(res && res.allAdmins){
            this.systemSuppliers = res.allAdmins
          }else{
            this.systemSuppliers = []
          }
          
        })
      }else if (e.value.name == 'cashier'){
        this.adminService.getAllcashiers().subscribe((res:any) =>{
          if(res && res.allClients){
            this.systemSuppliers = res.allClients
          }else{
            this.systemSuppliers = []
          }
          
        })
      }
      
    }
    
  }

  cancelFilter1(){
    this.getAllSuppliers();
    this.selectedFilterItem = null
  }

  



}
