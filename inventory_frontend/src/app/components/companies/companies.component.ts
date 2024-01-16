import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
// import { SystemCompaniesService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {

  constructor(
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

  systemCompanies: any[] = []

  allSystemCompanies: any[] = []

  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  carCountries :any[] =[]

  carBrands :any[] =[]

  newCompanyForm: UntypedFormGroup;

  selectedFilterItem:any

  selectedFilterItem2:any


  ngOnInit(): void {
    this.getAllCompanies();

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
    this.newCompanyForm = new UntypedFormGroup({
      'companyName': new UntypedFormControl(null, [Validators.required]),
      'personName': new UntypedFormControl(null, [Validators.required]),
      'phone': new UntypedFormControl(null, [Validators.pattern(/^(01)[0512][0-9]{8}$/)]),
      'address': new UntypedFormControl(null),
      'type': new UntypedFormControl('customer', [Validators.required]),
    })
  }



  getAllCompanies() {
    this.adminService.getAllCompanies().subscribe((res:any) => {
      if (res && res.allcompanies) {
        this.systemCompanies = []
        this.systemCompanies = res.allcompanies
        this.allSystemCompanies = res.allcompanies
      } else {
        this.systemCompanies = []
      }
    })
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newCompanyForm.updateValueAndValidity();
  }

  onAddCompany() {
    if (this.newCompanyForm.valid) {
      this.adminService.createSupplierOrCompany({
        companyName:this.newCompanyForm.get('companyName').value,
        personName:this.newCompanyForm.get('personName').value,
        phone:this.newCompanyForm.get('phone').value,
        type:this.newCompanyForm.get('type').value,
        address:this.newCompanyForm.get('address').value,
       }).subscribe((res: any) => {
        if (res && res.status == 'success') {
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllCompanies();
          }, 500);
        } else {
          this.toastr.error(res.message);
        }
      })
    } else {
      if(this.newCompanyForm.get('companyName').invalid){
				this.toastr.error('من فضلك ادخل اسم الشركة')
			}else if (this.newCompanyForm.get('personName').invalid){
        this.toastr.error('من فضلك ادخل اسم المورد')
      }else if (this.newCompanyForm.get('phone').invalid){
        this.toastr.error(` من فضلك ادخل هاتف صحيح`)
      }
    }
  }
  // showUpdateDialog() {
  //   this.visibleUpdateDialog = true;
  //   this.newCompanyForm.get('modelName').patchValue(this.selectedItem.model)
  //   this.newCompanyForm.get('brand').patchValue(
  
  //     this.carBrands.find(brand =>{
  //       return brand.carBrandId == this.selectedItem.carBrand_id
  //     })
  //   )
  // }

  // onUpdateModel() {
  //   if (this.newCompanyForm.valid) {
  //     this.adminService.updateModel({ model: this.newCompanyForm.get('modelName').value,brand_id :this.newCompanyForm.get('brand').value.carBrandId},this.selectedItem.carModelId).subscribe((res: any) => {
  //       if (res && res.carModel) {
  //         this.visibleUpdateDialog = false
  //         this.toastr.success(res.message, 'تم التعديل بنجاح');
  //         setTimeout(() => {
  //           this.getAllCompanies();
  //         }, 500);
  //       } else {
  //         this.toastr.error(res.message, 'خطأ !');
  //       }
  //     })
  //   } else {
  //     if(this.newCompanyForm.get('modelName').invalid){
	// 			this.toastr.error('من فضلك ادخل النوع')
	// 		}
			
	// 		if(this.newCompanyForm.get('personName').invalid){
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

  onDeleteCompany() {
    this.adminService.permDeleteSupplierOrCompany(this.selectedItem.companyId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllCompanies();
        }, 1000);

        this.visibledeleteDialog = false
      } else {
        this.toastr.error(res.message);
      }
    })
  }
  onArchiveCompany() {
    this.adminService.archiveSupplierOrCompany(this.selectedItem.companyId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllCompanies();
        }, 1000);

        this.visibleArchiveDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }





  filterByCompanyType(e){
    if(e.value != null){
      if(e.value.name == 'admin'){
        this.adminService.getAllAdmins().subscribe((res:any) =>{
          if(res && res.allAdmins){
            this.systemCompanies = res.allAdmins
          }else{
            this.systemCompanies = []
          }
          
        })
      }else if (e.value.name == 'cashier'){
        this.adminService.getAllcashiers().subscribe((res:any) =>{
          if(res && res.allClients){
            this.systemCompanies = res.allClients
          }else{
            this.systemCompanies = []
          }
          
        })
      }
      
    }
    
  }

  cancelFilter1(){
    this.getAllCompanies();
    this.selectedFilterItem = null
  }

  



}
