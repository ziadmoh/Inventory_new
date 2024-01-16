import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {  UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { SortEvent } from 'primeng/api';
import { ReportsService } from 'src/app/services/reports.service';
import { LayoutService } from 'src/app/services/app.layout.service';
import { ExportService } from 'src/app/services/export.service';
import { CarCountriesService } from 'src/app/services/car-countries.service';
@Component({
    selector: 'app-product-reports-reports',
    templateUrl: './product-reports.component.html',
    styleUrls:['./product-reports.component.scss']
})
export class ProductReportsComponent implements OnInit {


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
        private _cdR:ChangeDetectorRef
        ) 
    {
        
    }

    ngOnInit() {
        this._layoutS.resizeObservable$.subscribe( (evt:any) => {
            this.windowSize = evt.target.innerWidth
            
        })

        this.getProducts();
        this.getProductCountries();
        this.initFiltersForm();
    }

    initFiltersForm(){
        this.filtersForm =  new UntypedFormGroup({
            piecePrice_lt: new UntypedFormControl(null),
            piecePrice_gt: new UntypedFormControl(null),
            piecePurchasePrice_lt: new UntypedFormControl(null),
            piecePurchasePrice_gt: new UntypedFormControl(null),
            quantity_lt: new UntypedFormControl(null),
            quantity_gt: new UntypedFormControl(null),
            manufacturerCountery: new UntypedFormControl(null),
            date_from: new UntypedFormControl(null),
            date_to: new UntypedFormControl(null),
            prdouct_added_from: new UntypedFormControl(null),
            prdouct_added_to: new UntypedFormControl(null),
            prespective_type: new UntypedFormControl(null)
        })
    }


    getProducts(
        piecePrice_lt?,
        piecePrice_gt?,
        piecePurchasePrice_lt?,
        piecePurchasePrice_gt?,
        quantity_lt?,
        quantity_gt?,
        manufacturerCountery?,
        date_from?,
        date_to?,
        prdouct_added_from?,
        prdouct_added_to?,
        order_by_column?,
        order_type?,
        prespective_type?
        ){
        this.isLoadingReport = true
        this.exportedReport = [];
        this._reportS.getProductsReport( 
            piecePrice_lt,
            piecePrice_gt,
            piecePurchasePrice_lt,
            piecePurchasePrice_gt,
            quantity_lt,
            quantity_gt,
            manufacturerCountery,
            date_from,
            date_to,
            prdouct_added_from,
            prdouct_added_to,
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

    getProductCountries() {
        this._carCountriesService.getPartCountries().subscribe((res: any) => {
          if (res && res.data) {
            this.supplyCountries = []
            this.supplyCountries = res.data
    
          } else {
            this.supplyCountries = []
          }
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
        
        this._exportS.exportExcel(this.report,"تقرير_منتجات",this.getColoumns())
        setTimeout(() => {
            this.isExporting = false
        }, 1500);
    }

    getColoumns(){
        if( this.filtersForm.get('prespective_type').value?.value && 
            this.filtersForm.get('prespective_type').value?.value != 'total_earn' ){

                return [
                    'رقم المنتج',
                    'باركود المنتج',
                    'اسم المنتج',
                    'بلد المنتج',
                    'الكمية في المخزن',
                    'سعر الشراء',
                    'سعر البيع',
                    'تاريخ الاضافة',
                    'عدد مرات الظهور في الفواتير',
                    'اجمالي مبلغ الظهور في الفواتير',
                ]

        }else if(this.filtersForm.get('prespective_type').value?.value && 
        this.filtersForm.get('prespective_type').value?.value == 'total_earn' ){
            return [
                'رقم المنتج',
                'باركود المنتج',
                'اسم المنتج',
                'بلد المنتج',
                'الكمية في المخزن',
                'سعر الشراء',
                'سعر البيع',
                'تاريخ الاضافة',
                'اجمالي الربح'
            ]
        }else{
            return [
                'رقم المنتج',
                'باركود المنتج',
                'اسم المنتج',
                'بلد المنتج',
                'الكمية في المخزن',
                'سعر الشراء',
                'سعر البيع',
                'تاريخ الاضافة',
            ]
        }
        
    }

    applyFilters(){
        
      //  console.log(this.filtersForm.value)
        this.getProducts(
            this.filtersForm.get('piecePrice_lt').value,
            this.filtersForm.get('piecePrice_gt').value,
            this.filtersForm.get('piecePurchasePrice_lt').value,
            this.filtersForm.get('piecePurchasePrice_gt').value,
            this.filtersForm.get('quantity_lt').value,
            this.filtersForm.get('quantity_gt').value,
            this.filtersForm.get('manufacturerCountery').value?.country,
            this.filtersForm.get('date_from').value?this.filtersForm.get('date_from').value : '',
            this.filtersForm.get('date_to').value?this.filtersForm.get('date_to').value : '',
            this.filtersForm.get('prdouct_added_from').value?this.filtersForm.get('prdouct_added_from').value : '',
            this.filtersForm.get('prdouct_added_to').value?this.filtersForm.get('prdouct_added_to').value : '',
            this.sortFieldAndOrder.field,
            this.sortFieldAndOrder.order,
            this.filtersForm.get('prespective_type').value?.value,
        )

    }


    cancelAllFilters(){
        this.initFiltersForm();
        // this.filtersForm.patchValue({
        //     'piecePrice_lt': new UntypedFormControl(null),
        //     'piecePrice_gt': new UntypedFormControl(null),
        //     'piecePurchasePrice_lt': new UntypedFormControl(null),
        //     'piecePurchasePrice_gt': new UntypedFormControl(null),
        //     'quantity_lt': new UntypedFormControl(null),
        //     'quantity_gt': new UntypedFormControl(null),
        //     'manufacturerCountery': new UntypedFormControl(null),
        //     'date_from': new UntypedFormControl(null),
        //     'date_to': new UntypedFormControl(null),
        //     'prdouct_added_from': new UntypedFormControl(null),
        //     'prdouct_added_to': new UntypedFormControl(null),
        //     'prespective_type': new UntypedFormControl(null)
        // })
        // this.filtersForm.updateValueAndValidity()
        this._cdR.detectChanges()
        this.sortFieldAndOrder = {field:'',order:''}
        this.getProducts(
        '',
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
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
 
        this.getProducts( 
            this.filtersForm.get('piecePrice_lt').value,
            this.filtersForm.get('piecePrice_gt').value,
            this.filtersForm.get('piecePurchasePrice_lt').value,
            this.filtersForm.get('piecePurchasePrice_gt').value,
            this.filtersForm.get('quantity_lt').value,
            this.filtersForm.get('quantity_gt').value,
            this.filtersForm.get('manufacturerCountery').value?.country,
            this.filtersForm.get('date_from').value?this.filtersForm.get('date_from').value : '',
            this.filtersForm.get('date_to').value?this.filtersForm.get('date_to').value : '',
            this.filtersForm.get('prdouct_added_from').value?this.filtersForm.get('prdouct_added_from').value : '',
            this.filtersForm.get('prdouct_added_to').value?this.filtersForm.get('prdouct_added_to').value : '',
            field,
            this.sortFieldAndOrder.order,
            this.filtersForm.get('prespective_type').value?.value,
        )
        this._cdR.detectChanges()
    }


   
}
