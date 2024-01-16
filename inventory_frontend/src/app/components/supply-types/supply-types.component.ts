import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarModelsService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { SupplyTypesService } from 'src/app/services/supply-types.service';

@Component({
  selector: 'app-supply-types',
  templateUrl: './supply-types.component.html',
  styleUrls: ['./supply-types.component.scss']
})
export class SupplyTypeSComponent implements OnInit {

  constructor(
    private _CarModelsService: CarModelsService,
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private _SupplyTypesService:SupplyTypesService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

    supplyTypes: any[] = []

    visibleAddDialog: boolean = false
    
    visibleUpdateDialog: boolean = false

    visibledeleteDialog: boolean = false

    visibleArchiveDialog: boolean = false

    selectedItem: any = {};

    actionList: any[] = []

    carCountries :any[] =[]

    carBrands :any[] =[]

    carModels :any[] =[]

    supplyTypesList:any[] =[];

    newTypeForm: UntypedFormGroup;

    selectedFilterItem:any

    selectedFilterItem2:any

    selectedFilterItem3:any


    ngOnInit(): void {
      this.getAllSupplyTypes();
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
          // {
          //   label: ' حذف',
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
      this.newTypeForm = new UntypedFormGroup({
        'typeName': new UntypedFormControl(null, [Validators.required]),
      })
    }



    getAllSupplyTypes() {
      this._SupplyTypesService.getAllSupplyTypes().subscribe(res => {
        if (res && res.supplyTypes) {
          this.supplyTypes = []
          this.supplyTypes = res.supplyTypes
          
        } else {
          this.supplyTypes = []
        }
      })
    }

    showArchiveDialog() {
      this.visibleArchiveDialog = true
    }

    onArchiveType() {
      this._SupplyTypesService.archiveSupplyType(this.selectedItem.supplyTypeId).subscribe((res: any) => {
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تمت الارشفة بنجاح');
          setTimeout(() => {
            this.getAllSupplyTypes();
          }, 1000);
  
          this.visibleArchiveDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    }


    showAddDialog() {
      this.visibleAddDialog = true
      this.initAddingForm();
      this.newTypeForm.updateValueAndValidity();
    }

    onAddSupplyType() {
      if (this.newTypeForm.valid) {
          this._SupplyTypesService.addSupplyType(this.newTypeForm.get('typeName').value).subscribe((res:any) =>{
           
            if (res && res.supplyType) {
              this.visibleAddDialog = false
              this.toastr.success(res.message, 'تمت الاضافة بنجاح');
              setTimeout(() => {
                this.getAllSupplyTypes();
              }, 500);
            } else {
              this.toastr.error(res.message, 'خطأ !');
            }
          })
      } else {
        this.toastr.error('من فضلك ادخل الاسم')
    
      }
    }


    showDeleteDialog() {
      this.visibledeleteDialog = true
    }

    onDeleteSupplyType() {
      this._SupplyTypesService.deleteSupplyType(this.selectedItem.supplyTypeId).subscribe((res: any) => {
        if (res.message == 'supplyType permenantly deleted successfully') {
          this.toastr.success(res.message, 'تم المسح بنجاح');
          setTimeout(() => {
            this.getAllSupplyTypes();
          }, 1000);

          this.visibledeleteDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    }


}
