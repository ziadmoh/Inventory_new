import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
// import { SystemStoragesService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { Dropdown } from 'primeng/dropdown';
import { StoragesService } from 'src/app/services/storages.service';

@Component({
  selector: 'app-storages',
  templateUrl: './storages.component.html',
  styleUrls: ['./storages.component.scss']
})
export class StoragesComponent implements OnInit {

  constructor(
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private storageService: StoragesService,
    private toastr: ToastrService) { }

  systemStorages: any[] = []

  allSystemStorages: any[] = []

  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  storageTypes=[
    {name:'محل',value:'shop'},
    {name:'مخزن',value:'inventory'},
  ]

  newStorageForm: UntypedFormGroup;

  selectedFilterItem:any

  selectedFilterItem2:any


  ngOnInit(): void {
    this.getAllStorages();

    this.actionList = [{
      label: 'الاجرائات',
      items: [

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
  }

  initAddingForm() {
    this.newStorageForm = new UntypedFormGroup({
      'storageName': new UntypedFormControl(null, [Validators.required]),
      'type': new UntypedFormControl(null, [Validators.required]),
      'address': new UntypedFormControl(null),
    })
  }



  getAllStorages() {
    this.storageService.getAllStorages().subscribe((res:any) => {
      if (res.status =='success') {
        this.systemStorages = []
        this.systemStorages = res.storages
        this.allSystemStorages = res.storages
      } else {
        this.systemStorages = []
      }
    })
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newStorageForm.updateValueAndValidity();
  }

  onAddStorage() {
    if (this.newStorageForm.valid) {
      this.storageService.addStorage({
        storageName:this.newStorageForm.get('storageName').value,
        type:this.newStorageForm.get('type').value.value,
        address:this.newStorageForm.get('address').value,
       }).subscribe((res: any) => {
        if (res && res.status == 'success') {
          window.location.reload()
          this.visibleAddDialog = false
          
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllStorages();
          }, 1000);
        } else {
          this.toastr.error(res.message);
        }
      })
    } else {
      if(this.newStorageForm.get('storageName').invalid){
				this.toastr.error('من فضلك ادخل اسم للمخزن')
			}else if (this.newStorageForm.get('type').invalid){
        this.toastr.error('من فضلك ادخل نوع للمخزن')
      }
    }
  }


  showDeleteDialog() {
    this.visibledeleteDialog = true

  }
  showArchiveDialog() {
    this.visibleArchiveDialog = true
  }

  onArchiveStorage() {
    this.storageService.archiveStorage(this.selectedItem.storageId).subscribe((res: any) => {
      if (res.status == 'success') {
        window.location.reload()
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllStorages();
        }, 1000);

        this.visibleArchiveDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }


  



}
