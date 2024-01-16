import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {  UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { SortEvent } from 'primeng/api';
import { ReportsService } from 'src/app/services/reports.service';
import { LayoutService } from 'src/app/services/app.layout.service';
import { ExportService } from 'src/app/services/export.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';

@Component({
    selector: 'app-carModels-reports-reports',
    templateUrl: './carModels-reports.component.html',
    styleUrls:['./carModels-reports.component.scss']
})
export class CarModelsReportsComponent implements OnInit {


    report: any[] = [];

    exportedReport: any[] = [];
    
    cols: any[];

    exportColumns: any[];
    
    isLoadingReport:boolean = true

    isExporting:boolean = false;


    loadingIcon:string = ''

    selectedItem:any = {};

    currentPage:any = 0
   
    actionList: any[] = []

    isFiltersExpanded:boolean = false;

    isCopiyingId:boolean = false

    windowSize:any = window.innerWidth

    sortFieldAndOrder:{field:string,order:string} = {field:'',order:''}
 
    isFiltersDialogVisisble:boolean = false

    filtersForm:UntypedFormGroup;

    supplyCountries: any[] = []

    prespective_types:{name:string,value:string}[] = [
        {name:'الاكثر والاقل ربحا',value:'total_earn'},
        {name:'الاكثر والاقل مبيعات',value:'revenue'},
        {name:'الاكثر والاقل شراء',value:'expense'},
        {name:'الاكثر والاقل ارجاع للموردين',value:'returned_expenses'},
        {name:'الاكثر والاقل ارجاع من العملاء',value:'returned_sales'},
    ]


    constructor(
        private _reportS:ReportsService,
        private _clipboardS: ClipboardService,
        private _layoutS:LayoutService,
        private _exportS:ExportService,
        private _carCountriesService:CarCountriesService,
        private _cdR:ChangeDetectorRef,
        ) 
    {
        
    }

    ngOnInit() {
        this._layoutS.resizeObservable$.subscribe( (evt:any) => {
            this.windowSize = evt.target.innerWidth
            
        })

        this.getCarModels();
        this.initFiltersForm();
    }

    initFiltersForm(){
        this.filtersForm =  new UntypedFormGroup({
            
            date_from: new UntypedFormControl(null),
            date_to: new UntypedFormControl(null),
            prespective_type: new UntypedFormControl(null)
        })
    }


    getCarModels(
        date_from?,
        date_to?,
        order_by_column?,
        order_type?,
        prespective_type?
        ){
        this.isLoadingReport = true
        this.exportedReport = [];
        this._reportS.getCarModelsReport( 
            date_from,
            date_to,
            order_by_column,
            order_type,
            prespective_type,
        ).subscribe((res:any) =>{
            this.isLoadingReport = false;
            this.isFiltersDialogVisisble = false
            if(res.status == "success"){
                this.report = res.report
               
            }else{
                this.report = []
                this.exportedReport = []
            }
        },err =>{
            this.isFiltersDialogVisisble = false
            this.isLoadingReport = false;
        })
    }


    showFilterSDialog(){
        this.isFiltersDialogVisisble = true
    }



 
    copyId(text: string){
        this.isCopiyingId  = true;
        this._clipboardS.copy(text)
        setTimeout(() => {
            this.isCopiyingId  = false;
        }, 1000);
    }


    exportExcel() {
        this.isExporting = true
        
        this._exportS.exportExcel(this.report,"تقرير_موديلات",this.getColoumns())
        setTimeout(() => {
            this.isExporting = false
        }, 1500);
    }

    getColoumns(){
        if( this.filtersForm.get('prespective_type').value?.value && 
            this.filtersForm.get('prespective_type').value?.value != 'total_earn' ){

                return[
                    'رقم الموديل',
                    'اسم الموديل',
                    'عدد مرات الظهور في الفواتير',
                    'اجمالي مبلغ الظهور في الفواتير',
                ]

        }else if(this.filtersForm.get('prespective_type').value?.value && 
        this.filtersForm.get('prespective_type').value?.value == 'total_earn' ){
            return [
                'رقم الموديل',
                'اسم الموديل',
                'اجمالي الربح'
            ]
        }else{
            return [
                'رقم الموديل',
                'اسم الموديل',
            ]
        }
        
    }

    applyFilters(){
        
      //  console.log(this.filtersForm.value)
        this.getCarModels(
            this.filtersForm.get('date_from').value?this.filtersForm.get('date_from').value : '',
            this.filtersForm.get('date_to').value?this.filtersForm.get('date_to').value : '',
            this.sortFieldAndOrder.field,
            this.sortFieldAndOrder.order,
            this.filtersForm.get('prespective_type').value?.value,
        )

    }


    cancelAllFilters(){
        this.initFiltersForm();

        this._cdR.detectChanges()
        this.sortFieldAndOrder = {field:'',order:''}
        this.getCarModels(
        '', 
        '', 
        '',
        '',
        ''
        )
        
    }

    customSort(event: SortEvent) {
        let field = event.field
        console.log(event)


        this.sortFieldAndOrder = {
            field : field,
            order : event.order == 1 ? 'ASC':'DESC'
        }
 
        this.getCarModels( 
            this.filtersForm.get('date_from').value?this.filtersForm.get('date_from').value : '',
            this.filtersForm.get('date_to').value?this.filtersForm.get('date_to').value : '',
            field,
            this.sortFieldAndOrder.order,
            this.filtersForm.get('prespective_type').value?.value,
        )
        this._cdR.detectChanges()
    }


   
}
