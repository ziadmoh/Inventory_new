import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarModelsService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-car-models',
  templateUrl: './car-models.component.html',
  styleUrls: ['./car-models.component.scss']
})
export class CarModelsComponent implements OnInit {

  constructor(private _carModelsService: CarModelsService,
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

  carModels: any[] = []

  allCarModels: any[] = []

  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  carCountries :any[] =[]

  carBrands :any[] =[]

  newModelForm: UntypedFormGroup;

  selectedFilterItem:any

  selectedFilterItem2:any

  ngOnInit(): void {
    this.getAllModels();
    this.getAllCountries();
    this.getAllBrands();
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
    this.newModelForm = new UntypedFormGroup({
      'modelName': new UntypedFormControl(null, [Validators.required]),
      'brand': new UntypedFormControl(null, [Validators.required]),
    })
  }



  getAllModels() {
    this._carModelsService.getAllModels().subscribe(res => {
      if (res && res.models) {
        this.carModels = []
        this.carModels = res.models
        this.allCarModels = res.models
      } else {
        this.carModels = []
      }
    })
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newModelForm.updateValueAndValidity();
  }

  onAddModel() {
    if (this.newModelForm.valid) {
      this._carModelsService.addModel({ model: this.newModelForm.get('modelName').value },this.newModelForm.get('brand').value.carBrandId).subscribe((res: any) => {
        if (res && res.carModel) {
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllModels();
          }, 500);
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      if(this.newModelForm.get('modelName').invalid){
				this.toastr.error('من فضلك ادخل النوع')
			}
			
			if(this.newModelForm.get('brand').invalid){
				this.toastr.error('من فضلك اختر بلد المنشأ');
			}
      
    }
  }
  showUpdateDialog() {
    this.visibleUpdateDialog = true;
    this.newModelForm.get('modelName').patchValue(this.selectedItem.model)
    this.newModelForm.get('brand').patchValue(
  
      this.carBrands.find(brand =>{
        return brand.carBrandId == this.selectedItem.carBrand_id
      })
    )
  }

  onUpdateModel() {
    if (this.newModelForm.valid) {
      this._carModelsService.updateModel({ model: this.newModelForm.get('modelName').value,brand_id :this.newModelForm.get('brand').value.carBrandId},this.selectedItem.carModelId).subscribe((res: any) => {
        if (res && res.carModel) {
          this.visibleUpdateDialog = false
          this.toastr.success(res.message, 'تم التعديل بنجاح');
          setTimeout(() => {
            this.getAllModels();
          }, 500);
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      if(this.newModelForm.get('modelName').invalid){
				this.toastr.error('من فضلك ادخل النوع')
			}
			
			if(this.newModelForm.get('userName').invalid){
				this.toastr.error('من فضلك اختر بلد المنشأ');
			}
      
    }
  }

  showDeleteDialog() {
    this.visibledeleteDialog = true

  }
  showArchiveDialog() {
    this.visibleArchiveDialog = true
  }

  onDeleteModel() {
    this._carModelsService.deleteModel(this.selectedItem.carModelId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllModels();
        }, 1000);

        this.visibledeleteDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }
  onArchiveModel() {
    this._carModelsService.archiveModel(this.selectedItem.carModelId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllModels();
        }, 1000);

        this.visibleArchiveDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }

  getAllCountries(){
    this._carCountriesService.getAllCarCountreis().subscribe(res =>{
      if(res && res.countries){
        this.carCountries = []
        this.carCountries =res.countries
      }else{
        this.carCountries = []
      }
    })
  }
  
  getAllBrands(){
    this._carBrandsService.getAllBrands().subscribe(res =>{
      if(res && res.allbrands){
        this.carBrands = []
        this.carBrands =res.allbrands
      }else{
        this.carBrands = []
      }
    })
  }


  filterByBrand(e){
    if(e.value != null){
      this.cancelFilter2()
      this._carModelsService.filterByBrand(this.selectedFilterItem.carBrandId).subscribe((res:any) =>{
        if(res && res.models){
          this.carModels = res.models
        }else{
          this.carModels = []
        }
        
      })
    }
    
  }

  cancelFilter1(){
    this.carModels = this.allCarModels
    this.selectedFilterItem = null
  }

  filterByCountry(e){
    if(e.value != null){
      this.cancelFilter1();
      this._carModelsService.filterByCountry(this.selectedFilterItem2.manufacturerCountryId).subscribe((res:any) =>{
        if(res && res.countryModels){
          this.carModels = res.countryModels
        }else{
          this.carModels = []
        }
        
      })
    }
    
  }



  cancelFilter2(){
    this.carModels = this.allCarModels
    this.selectedFilterItem2 = null
  }



}
