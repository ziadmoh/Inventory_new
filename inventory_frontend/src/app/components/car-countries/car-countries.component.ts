import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';

@Component({
  selector: 'app-car-countries',
  templateUrl: './car-countries.component.html',
  styleUrls: ['./car-countries.component.scss']
})
export class CarCountriesComponent implements OnInit {

  constructor(private _carCountriesService:CarCountriesService,
              private adminService:AdminSharedService,
              private toastr: ToastrService) { }

  carCountries :any[] =[]

  visibleAddDialog:boolean = false

  visibleUpdateDialog:boolean = false

  visibledeleteDialog:boolean = false
  
  visibleArchiveDialog:boolean = false

  selectedItem:any = {} ;

  actionList:any[] =[]

  newCountryForm :UntypedFormGroup

  updateCountryForm :UntypedFormGroup

  ngOnInit(): void {
    this.getAllCountries();
    this.actionList = [{
			label: 'الاجرائات',
            items: [
              {
                label: 'تعديل',
                icon: 'pi pi-pencil',
                command: () => {
                    this.shoUpdateDialog();
                }
             },
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
              //       this.showDeleteDialog()
              //   }
              // },
            ]},
           
        ];
    this.initAddingForm();
    this.initUpdateForm();
  }

  initAddingForm(){
		this.newCountryForm = new UntypedFormGroup({
			'countryName': new UntypedFormControl(null,[Validators.required]),
		})
	}

  initUpdateForm(){
		this.updateCountryForm = new UntypedFormGroup({
			'countryName': new UntypedFormControl(this.selectedItem.country,[Validators.required]),
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


  showAddDialog(){
    this.visibleAddDialog = true
    this.newCountryForm.get('countryName').patchValue(null)
  }

  shoUpdateDialog(){
    this.visibleUpdateDialog = true
    this.initUpdateForm();
  }

  onAddCountry(){
    if(this.newCountryForm.valid){
      this._carCountriesService.addCountry({country:this.newCountryForm.get('countryName').value}).subscribe((res:any) =>{
        if(res && res.manufacturerCountry){
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllCountries();
          }, 500);
        }else{
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    }else{
      this.toastr.error('من فضلك ادخل اسم البلد');
    }
  }

  showDeleteDialog(){
    this.visibledeleteDialog = true
  
  }
  showArchiveDialog(){
    this.visibleArchiveDialog = true
  }

   onDeleteCountry(){
    this._carCountriesService.deleteCountry(this.selectedItem.manufacturerCountryId).subscribe((res:any) =>{
      if(res.message.trim() =='Manufacturer country permenantly deleted successfully'.trim()  ){
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllCountries();
        }, 1000);
        
        this.visibledeleteDialog = false
      }else{
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }
  onArchiveCountry(){
    this._carCountriesService.archiveCountry(this.selectedItem.manufacturerCountryId).subscribe((res:any) =>{
      if(res.message.trim() =='manufacturer country deleted successfully'.trim()  ){
        this.toastr.success(res.message, 'تمت الارشفة بنجاح');
        setTimeout(() => {
          this.getAllCountries();
        }, 1000);
        
        this.visibleArchiveDialog = false
      }else{
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }

  test (){
    this.adminService.getCarPartsList().subscribe(res =>{
    })
  }

  onUpdateCountry(){
    if(this.updateCountryForm.valid){
      this._carCountriesService.updateCountry(
        this.selectedItem.manufacturerCountryId,
        this.updateCountryForm.get('countryName').value
        ).subscribe((res:any) =>{
          if(res.status == 'success'){
            this.toastr.success('تم الحفظ', 'تم !');
            this.getAllCountries();
            this.visibleUpdateDialog = false
          }
        })
    }else{
      this.toastr.error('من فضلك ادخل اسم البلد', 'خطأ !');
    }
  }


}
