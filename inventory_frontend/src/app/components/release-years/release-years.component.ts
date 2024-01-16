import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { CarModelsService } from 'src/app/services/car-models.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
import { CarBrandsService } from 'src/app/services/car-brands.service';
import { Dropdown } from 'primeng/dropdown';
import { ReleaseYearsResponse, ReleaseYearsService } from 'src/app/services/release-years.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-release-years',
  templateUrl: './release-years.component.html',
  styleUrls: ['./release-years.component.scss']
})
export class ReleaseYearsComponent implements OnInit {

  constructor(
     private _CarModelsService: CarModelsService,
    private _carCountriesService:CarCountriesService,
    private _carBrandsService:CarBrandsService,
    private _YearsService:ReleaseYearsService,
    private adminService: AdminSharedService,
    private toastr: ToastrService) { }

  years: any[] = []


  visibleAddDialog: boolean = false
  
  visibleUpdateDialog: boolean = false

  visibledeleteDialog: boolean = false

  visibleArchiveDialog: boolean = false

  selectedItem: any = {};

  actionList: any[] = []

  carCountries :any[] =[]

  carBrands :any[] =[]

  carModels :any[] =[]

  yearsList:any[] =[];

  newYearForm: UntypedFormGroup;

  selectedFilterItem:any

  selectedFilterItem2:any

  selectedFilterItem3:any


  ngOnInit(): void {
    this.getAllYears();
    this.getYearsList();
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
    this.newYearForm = new UntypedFormGroup({
      'yearName': new UntypedFormControl(null, [Validators.required]),
    })
  }



  getAllYears() {
    this._YearsService.getAllYears().subscribe(res => {
      if (res && res.years) {
        this.years = []
        this.years = res.years
        this.years.sort((a,b)=>{
          return b.year - a.year
        })
        
      } else {
        this.years = []
      }
    })
  }

  showArchiveDialog() {
    this.visibleArchiveDialog = true
  }

  onArchiveYear() {
    this._YearsService.archiveYear(this.selectedItem.releaseYearId).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success(res.message, 'تمت الارشفة بنجاح');
        setTimeout(() => {
          this.getAllYears();
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
    this.newYearForm.updateValueAndValidity();
  }

  onAddYear() {
    if (this.newYearForm.valid) {
      let addedYears:any[] =[]
      
      for(let i=0; i<this.newYearForm.get('yearName').value.length;i++){
        addedYears.push(
          this._YearsService.addYear( this.newYearForm.get('yearName').value[i] )
        )
        
      }
      forkJoin(addedYears).subscribe((res:any) =>{

        if (res && res.length == addedYears.length) {
          this.visibleAddDialog = false
          this.toastr.success(res.message, 'تمت الاضافة بنجاح');
          setTimeout(() => {
            this.getAllYears();
          }, 500);
        } else {
          this.toastr.error(res.message, 'خطأ !');
        }
      })
    } else {
      this.toastr.error('من فضلك ادخل السنوات')
  
    }
  }


  showDeleteDialog() {
    this.visibledeleteDialog = true

  }

  onDeleteYear() {
    this._YearsService.deleteYear(this.selectedItem.releaseYearId).subscribe((res: any) => {
      if (res.status =='success') {
        this.toastr.success(res.message, 'تم المسح بنجاح');
        setTimeout(() => {
          this.getAllYears();
        }, 1000);

        this.visibledeleteDialog = false
      } else {
        this.toastr.error(res.message, 'خطأ !');
      }
    })
  }



  getYearsList(){
    this._YearsService.geYearList().subscribe((res:{data:{year:number}[]}) =>{
       this.yearsList = res.data.filter(year =>{
          return year.year <= (new Date().getFullYear())
       }).reverse()
    })
  }

}
