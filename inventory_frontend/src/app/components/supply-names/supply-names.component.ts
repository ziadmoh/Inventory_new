import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarModelsService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { SupplyNamesService } from 'src/app/services/supply-names.service';
import { SupplyTypesService } from 'src/app/services/supply-types.service';

@Component({
  selector: 'app-supply-names',
  templateUrl: './supply-names.component.html',
  styleUrls: ['./supply-names.component.scss']
})
export class SupplyNamesComponent implements OnInit {

  constructor(
    private _CarModelsService: CarModelsService,
    private _carCountriesService:CarCountriesService,
    private _SupplyTypesService:SupplyTypesService,
    private _SupplyNamesService:SupplyNamesService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

    supplyNames: any[] = []

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

    supplyNamesList:any[] =[];

    newNameForm: UntypedFormGroup;

    selectedFilterItem:any

    selectedFilterItem2:any

    selectedFilterItem3:any


    ngOnInit(): void {
      this.getAllSupplyNames();
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
      this.newNameForm = new UntypedFormGroup({
        'supplyName': new UntypedFormControl(null, [Validators.required]),
        'supplyType': new UntypedFormControl(null, [Validators.required]),
      })
    }



    getAllSupplyNames() {
      this._SupplyNamesService.getAllSupplyNames().subscribe(res => {
        if (res && res.supplyNames) {
          this.supplyNames = []
          this.supplyNames = res.supplyNames
          
        } else {
          this.supplyNames = []
        }
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

    onArchiveName() {
      this._SupplyNamesService.archiveSupplyName(this.selectedItem.supplyNameId).subscribe((res: any) => {
        if (res.status == 'success') {
          this.toastr.success(res.message, 'تمت الارشفة بنجاح');
          setTimeout(() => {
            this.getAllSupplyNames();
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
      this.newNameForm.updateValueAndValidity();
    }

    onAddSupplyName() {
      if (this.newNameForm.valid) {
          this._SupplyNamesService.addSupplyName(
            this.newNameForm.get('supplyName').value,
            this.newNameForm.get('supplyType').value.supplyTypeId,
          ).subscribe((res:any) =>{
            
            if (res && res.supplyName) {
              this.visibleAddDialog = false
              this.toastr.success(res.message, 'تمت الاضافة بنجاح');
              setTimeout(() => {
                this.getAllSupplyNames();
              }, 500);
            } else {
              this.toastr.error(res.message, 'خطأ !');
            }
          })
      } else {
        if(this.newNameForm.get('supplyType').invalid){
          this.toastr.error('من فضلك اختر الجزء ')
        }else if(this.newNameForm.get('supplyName').invalid){
          this.toastr.error('من فضلك ادخل الاسم')
        }        
    
      }
    }


    showDeleteDialog() {
      this.visibledeleteDialog = true
    }

    onDeleteSupplyName() {
      this._SupplyNamesService.deleteSupplyName(this.selectedItem.supplyNameId).subscribe((res: any) => {
        if (res.status =='success') {
          this.toastr.success(res.message, 'تم المسح بنجاح');
          setTimeout(() => {
            this.getAllSupplyNames();
          }, 1000);

          this.visibledeleteDialog = false
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    }


}
