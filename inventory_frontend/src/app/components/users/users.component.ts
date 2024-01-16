import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
// import { SystemUsersService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  constructor(
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

  systemUsers: any[] = []

  allSystemUsers: any[] = []

  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  carCountries :any[] =[]

  carBrands :any[] =[]

  newUserForm: UntypedFormGroup;

  selectedFilterItem:any

  selectedFilterItem2:any

  userTypes =[
    {name:'admin',arName:'ادمن'},
    {name:'cashier',arName:'كاشير'}
  ]

  ngOnInit(): void {
    this.getAllUsers();

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
    this.newUserForm = new UntypedFormGroup({
      'fullName': new UntypedFormControl(null, [Validators.required]),
      'userName': new UntypedFormControl(null, [Validators.required]),
      'email': new UntypedFormControl(null, [Validators.required,Validators.email]),
      'password': new UntypedFormControl(null, [Validators.required]),
      'phone': new UntypedFormControl(null, [Validators.required,Validators.pattern(/^(01)[0512][0-9]{8}$/)]),
      'type': new UntypedFormControl(null, [Validators.required]),
    })
  }



  getAllUsers() {
    this.adminService.getAllUsers().subscribe((res:any) => {
      if (res && res.allUsers) {
        this.systemUsers = []
        this.systemUsers = res.allUsers
        this.allSystemUsers = res.allUsers
      } else {
        this.systemUsers = []
      }
    })
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newUserForm.updateValueAndValidity();
  }

  onAddUser() {
    if (this.newUserForm.valid) {
      this.adminService.createUser({
        email:this.newUserForm.get('email').value,
        fullName:this.newUserForm.get('fullName').value,
        password:this.newUserForm.get('password').value,
        phone:this.newUserForm.get('phone').value,
        type:this.newUserForm.get('type').value.name,
        userName:this.newUserForm.get('userName').value,
       }).subscribe((res: any) => {
        if (res && res.status == 'success') {
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllUsers();
          }, 500);
        } else {
          this.toastr.error(res.message);
        }
      })
    } else {
      if(this.newUserForm.get('fullName').invalid){
				this.toastr.error('من فضلك ادخل الاسم ')
			}else if (this.newUserForm.get('userName').invalid){
        this.toastr.error('من فضلك ادخل اسم المستخدم')
      }else if (this.newUserForm.get('email').invalid){
        this.toastr.error(`
          الايميل يجب ان يكون على هذا النحو : 
          abc@exaple.com
        `)
      }else if (this.newUserForm.get('password').invalid){
        this.toastr.error(`
        من فضلك ادخل كلمة السر
        `)
      }else if (this.newUserForm.get('phone').invalid){
        this.toastr.error('من فضلك ادخل هاتف صحيح')
      }else if (this.newUserForm.get('type').invalid){
        this.toastr.error('من فضلك اختر الدور')
      }
    }
  }
  // showUpdateDialog() {
  //   this.visibleUpdateDialog = true;
  //   this.newUserForm.get('modelName').patchValue(this.selectedItem.model)
  //   this.newUserForm.get('brand').patchValue(
  
  //     this.carBrands.find(brand =>{
  //       return brand.carBrandId == this.selectedItem.carBrand_id
  //     })
  //   )
  // }

  // onUpdateModel() {
  //   if (this.newUserForm.valid) {
  //     this.adminService.updateModel({ model: this.newUserForm.get('modelName').value,brand_id :this.newUserForm.get('brand').value.carBrandId},this.selectedItem.carModelId).subscribe((res: any) => {
  //       if (res && res.carModel) {
  //         this.visibleUpdateDialog = false
  //         this.toastr.success(res.message, 'تم التعديل بنجاح');
  //         setTimeout(() => {
  //           this.getAllUsers();
  //         }, 500);
  //       } else {
  //         this.toastr.error(res.message, 'خطأ !');
  //       }
  //     })
  //   } else {
  //     if(this.newUserForm.get('modelName').invalid){
	// 			this.toastr.error('من فضلك ادخل النوع')
	// 		}
			
	// 		if(this.newUserForm.get('userName').invalid){
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

  onDeleteUser() {
    this.adminService.permDeleteUser(this.selectedItem.userId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllUsers();
        }, 1000);

        this.visibledeleteDialog = false
      } else {
        this.toastr.error(res.message);
      }
    })
  }
  onArchiveUser() {
    this.adminService.archiveUser(this.selectedItem.userId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllUsers();
        }, 1000);

        this.visibleArchiveDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }





  filterByUserType(e){
    if(e.value != null){
      if(e.value.name == 'admin'){
        this.adminService.getAllAdmins().subscribe((res:any) =>{
          if(res && res.allAdmins){
            this.systemUsers = res.allAdmins
          }else{
            this.systemUsers = []
          }
          
        })
      }else if (e.value.name == 'cashier'){
        this.adminService.getAllcashiers().subscribe((res:any) =>{
          if(res && res.allClients){
            this.systemUsers = res.allClients
          }else{
            this.systemUsers = []
          }
          
        })
      }
      
    }
    
  }

  cancelFilter1(){
    this.getAllUsers();
    this.selectedFilterItem = null
  }

  



}
