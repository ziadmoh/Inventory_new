import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { InventoryProductsService } from 'src/app/services/inventory-products.service';
import {BarcodeScanner} from "@itexperts/barcode-scanner";



@Component({
  selector: 'app-system-initial',
  templateUrl: './system-initial.component.html',
  styleUrls: ['./system-initial.component.scss'],
  encapsulation:ViewEncapsulation.None,
})
export class SystemInitialComponent implements OnInit {

  constructor(private invProducts:InventoryProductsService,private toastrService:ToastrService) { }

  barCode:string = ''

  ngOnInit(): void {
    let options = {
      timeOut: 130,
     // characterCount: 13
    }
    
    // let barcodeScanner = new BarcodeScanner(options);
    // barcodeScanner.addEventListener('scan', function(e){
    //     let barcode = e.detail;
    //     console.log(barcode);
    // });
  }
    @HostListener('document:keypress', ['$event'])
    readBarCode(event: KeyboardEvent) { 
     
      let reading = false;
      if (event.key === 'Enter') {
        console.log( 'length = ' + this.barCode.length)
        if(this.barCode.length > 10) {
          this.handleBarcode(this.barCode);          
          this.barCode = "";
        }
      } else {
        this.barCode = this.barCode + event.key; //while this is not an 'enter' it stores the every key   
       
      }


      //run a timeout of 200ms at the first read and clear everything
      if(!reading) {
          reading = true;
          setTimeout(() => {
            this.barCode = "";
              reading = false;
          }, 400);  //200 works fine for me but you can adjust it
      }
    }
    
  
    handleBarcode(scanned_barcode) {
      // debugger
      // console.log(scanned_barcode)
      if(this.invProducts.selectedStorage.storageId !=0){
        if(scanned_barcode){
          if(scanned_barcode.split('-')[0] !='INV'){
            scanned_barcode = 'INV-' + scanned_barcode.split('-')[1]
          }
          this.invProducts.checkbarcode(scanned_barcode).subscribe((res:any) =>{
            if(res.status =="success"){ //barcode is valid
              res.product['toInvoiceQuantity'] = 1
              res.product['productNameWithCountry'] = res.product.productName + ' ' + res.product.manufacturerCountery
              this.invProducts.addToInvoice(res.product)
            }else{
              this.toastrService.error('خطأ في الباركود', 'هذا المنتج غير موجود بالمخزن');
            }
          })
        }
      }else{
        this.toastrService.error('لا يوجد مخزن مختار', ' من فضلك اختر مخزن اولا');
      }
      
    }

}
