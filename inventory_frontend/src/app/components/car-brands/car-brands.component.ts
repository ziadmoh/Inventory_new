import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';

@Component({
  selector: 'app-car-brands',
  templateUrl: './car-brands.component.html',
  styleUrls: ['./car-brands.component.scss']
})
export class CarBrandsComponent implements OnInit {

  constructor(private _carBrandsService: CarBrandsService,
    private _carCountriesService:CarCountriesService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

  carBrands: any[] = []

  allCarBrands: any[] = []

  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  carCountries :any[] =[]

  newBrandForm: UntypedFormGroup;

  selectedFilterItem:any

  ngOnInit(): void {
    this.getAllBrands();
    this.getAllCountries();
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
    this.newBrandForm = new UntypedFormGroup({
      'brandName': new UntypedFormControl(null, [Validators.required]),
      'country': new UntypedFormControl(null, [Validators.required]),
    })
  }



  getAllBrands() {
    this._carBrandsService.getAllBrands().subscribe(res => {
      if (res && res.allbrands) {
        this.carBrands = []
        this.carBrands = res.allbrands
        this.allCarBrands = res.allbrands
      } else {
        this.carBrands = []
      }
    })
  }


  showAddDialog() {
    this.visibleAddDialog = true
    this.initAddingForm();
    this.newBrandForm.updateValueAndValidity();
  }

  onAddBrand() {
    if (this.newBrandForm.valid) {
      this._carBrandsService.addBrand({ brand: this.newBrandForm.get('brandName').value },this.newBrandForm.get('country').value.manufacturerCountryId).subscribe((res: any) => {
        if (res && res.carBrand) {
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllBrands();
          }, 500);
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      if(this.newBrandForm.get('brandName').invalid){
				this.toastr.error('من فضلك ادخل النوع')
			}
			
			if(this.newBrandForm.get('country').invalid){
				this.toastr.error('من فضلك اختر بلد المنشأ');
			}
      
    }
  }
  showUpdateDialog() {
    this.visibleUpdateDialog = true;
    this.newBrandForm.get('brandName').patchValue(this.selectedItem.brand)
    this.newBrandForm.get('country').patchValue(
  
      this.carCountries.find(country =>{
        return country.manufacturerCountryId == this.selectedItem.manuFacturerCounter_id
      })
    )
  }

  onUpdateBrand() {
    if (this.newBrandForm.valid) {
      this._carBrandsService.updateBrand({ brand: this.newBrandForm.get('brandName').value,country_id :this.newBrandForm.get('country').value.manufacturerCountryId},this.selectedItem.carBrandId).subscribe((res: any) => {
        if (res && res.carBrand) {
          this.visibleUpdateDialog = false
          this.toastr.success(res.message, 'تم التعديل بنجاح');
          setTimeout(() => {
            this.getAllBrands();
          }, 500);
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      if(this.newBrandForm.get('brandName').invalid){
				this.toastr.error('من فضلك ادخل النوع')
			}
			
			if(this.newBrandForm.get('userName').invalid){
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

  onDeleteBrand() {
    this._carBrandsService.deleteBrand(this.selectedItem.carBrandId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllBrands();
        }, 1000);

        this.visibledeleteDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }
  onArchiveBrand() {
    this._carBrandsService.archiveBrand(this.selectedItem.carBrandId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تمت الارشفة بنجاح');
        setTimeout(() => {
          this.getAllBrands();
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

  filterByCountry(e){
    if(e.value != null){
      this._carBrandsService.filterByCountry(this.selectedFilterItem.manufacturerCountryId).subscribe((res:any) =>{
        if(res && res.brands){
          this.carBrands = res.brands
        }else{
          this.carBrands = []
        }
        
      })
    }
  }

  cancelFilter(){
    this.carBrands = this.allCarBrands
  }



}
