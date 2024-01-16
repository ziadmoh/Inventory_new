import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'primeng/dropdown';
import { AuthService } from 'src/app/auth/auth.service';
import { AdminSharedService } from 'src/app/services/admin-shared.service';
import { InventoryProductsService } from 'src/app/services/inventory-products.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import printJS from 'print-js';


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  orderItems:any= []

  sessionId= -1

  subTotal= 0

  longTermWorkForm: UntypedFormGroup

  systemCompanies: any[] = []

  isLongTermInvoice:boolean = false

  isSubmittingInvoice:boolean = false

  @Output() refreshParent : EventEmitter<any> = new EventEmitter()


  constructor(public invS:InvoiceService,
    private invProductS:InventoryProductsService, 
    private toastr: ToastrService,
    private auth:AuthService,
    private adminService:AdminSharedService) { }

    invoiceTotal:number =0

  ngOnInit(): void {
    
    this.getInvoice()
    this.getAllCompanies();
    this.initLongTermWorkForm()

  }

  initLongTermWorkForm(){
    this.longTermWorkForm = new UntypedFormGroup({
      'company': new  UntypedFormControl(null,[Validators.required]),
      'deposite': new  UntypedFormControl(null,[Validators.required])
    })
  }

  

  getAllCompanies() {
    this.adminService.getAllCompanies().subscribe((res:any) => {
      if (res && res.allcompanies) {
        this.systemCompanies = []
        this.systemCompanies = res.allcompanies
      } else {
        this.systemCompanies = []
      }
    })
  }

  getInvoice(){
    this.invS.orderItems.subscribe(items =>{
			this.orderItems = items;
			this.orderItems.map(item =>{
        
        return item.product['toInvoiceQuantity'] = item.quantity
      })

			this.orderItems.map(item =>{
        return item.product['productNameWithCountry'] = item.product.productName + ' ' + item.product.manufacturerCountery

      })

		})

    this.invS.invoiceSubTotal.subscribe(sub =>{
			this.subTotal = sub
		})

    this.invS.userSessionId.subscribe(sessionId =>{
      this.sessionId = sessionId;
    })
  }

  calcOrderTotal(orderItems){
    let total = 0
    orderItems.forEach(order=>{
      total=total+order.fee
    })
    this.invoiceTotal = total;
    return total;
  }

  toggleInvBody(){
    this.invS.isInvoiceExpanded = !this.invS.isInvoiceExpanded
  }

  generateInvoice(){
      if(this.orderItems.length){
          if(this.sessionId){
            this.isSubmittingInvoice  = true
            this.invS.generateInvoice(this.sessionId).subscribe((res:any) =>{
              if(res.status == 'success'){
                this.printInvoice(res.invoice,this.orderItems);
                this.toastr.success(res.message)
                
                

                this.initLongTermWorkForm()
                this.auth.newUser.subscribe(user =>{
                  this.invS.getOpenedSession(user.userId).subscribe((session:any) =>{
                    
                    if(session.status == 'success'){
                      this.invS.getOrderItems(session.session.sessionId).subscribe(items =>{
                        
                      //  this.invS.userSessionId.next( session.session.sessionId)
                        if(items.orderItems){
                          this.invS.orderItems.next(items.orderItems);
                          this.orderItems =items.orderItems
                        }else{
                          this.invS.orderItems.next([]);
                          this.orderItems = []
                        }
                       
                      });
                    }else{
                      this.invS.openSession(user.userId).subscribe((session:any) =>{
                       
                        if(session.status == 'success'){
                          this.invS.getOrderItems(session.session.sessionId).subscribe(items =>{
                            this.invS.userSessionId.next( session.session.sessionId)
                            if(items.orderItems){
                              this.invS.orderItems.next(items.orderItems);
                              this.orderItems =items.orderItems
                            }else{
                              this.invS.orderItems.next([]);
                              this.orderItems = []
                            }
                            
                          });
                        }else{
                          this.toastr.error(session.message)
                        }
                      })
                    }
                  })
                })
                this.isSubmittingInvoice  = false
                setTimeout(() => {
                  this.refreshParent.emit()
                  
                }, 600);
              }else{
                this.toastr.error(res.message)
                this.isSubmittingInvoice  = false
              }
              
            },err =>{
              this.isSubmittingInvoice  = false
            })
          }
          
        
        
      }else{
        this.toastr.error('الفاتورة فارغة')
      }
   
    
    
  }
  //Logn term invoice
  generateInstallmentinvoice(){
    
      if(this.orderItems.length){
          if(this.longTermWorkForm.valid){
            if(this.longTermWorkForm.get('deposite').value <= this.invoiceTotal){
              if(this.sessionId){
                this.isSubmittingInvoice  = true
                
                this.invS.generateInstallmentinvoice(this.sessionId,
                  this.longTermWorkForm.get('company').value.companyId).subscribe((res:any) =>{
                  if(res.status == 'success'){
                    this.toastr.success(res.message)
                    
                    this.addInitialDeposite(
                      res.invoice.invoiceId,
                      this.longTermWorkForm.get('deposite').value,
                      this.orderItems
                      )
                    this.auth.newUser.subscribe(user =>{
                      this.invS.getOpenedSession(user.userId).subscribe((session:any) =>{
                        if(session.status == 'success'){
                          this.invS.getOrderItems(session.session.sessionId).subscribe(items =>{
                            
                          //  this.invS.userSessionId.next( session.session.sessionId)
                            if(items.orderItems){
                              this.invS.orderItems.next(items.orderItems);
                              this.orderItems =items.orderItems
                            }else{
                              this.invS.orderItems.next([]);
                              this.orderItems = []
                            }
                          });
                        }else{
                          this.invS.openSession(user.userId).subscribe((session:any) =>{
                           
                            if(session.status == 'success'){
                              this.invS.getOrderItems(session.session.sessionId).subscribe(items =>{
                                this.invS.userSessionId.next( session.session.sessionId)
                                if(items.orderItems){
                                  this.invS.orderItems.next(items.orderItems);
                                  this.orderItems =items.orderItems
                                }else{
                                  this.invS.orderItems.next([]);
                                  this.orderItems = []
                                }
                                
                              });
                            }else{
                              this.toastr.error(session.message)
                            }
                          })
                        }
                      })
                    })
                   
                    this.initLongTermWorkForm()
                    this.isSubmittingInvoice  = false
                    setTimeout(() => {
                      this.refreshParent.emit()
                      
                    }, 600);
                  }else{
                    this.toastr.error(res.message)
                    this.isSubmittingInvoice  = false
                  }
                },err =>{
                  this.isSubmittingInvoice  = false
                })
              }
            }else{
              this.toastr.error('مقدم الفاتورة لا يمكن ان يكون اكبر من الاجمالي');
            }
           
          }else{
            if(this.longTermWorkForm.get('company').invalid){
              this.toastr.error(' من فضلك اختر الشركة');
            }else if(this.longTermWorkForm.get('deposite').invalid){
              this.toastr.error(' من فضلك ادخل مقدم الفاتورة');
            }
          }
          
          
        
        
      }else{
        this.toastr.error('الفاتورة فارغة')
      }
   
    
    
  }

  addInitialDeposite(invoiceId,deposite,orderItems){
    this.invS.addNewDeposite(invoiceId,deposite).subscribe((res:any ) =>{
      if(res.status == 'success'){
        this.printInvoice(res.invoice,orderItems);

      }
    })
  }

  removeItem(orderItem){
    this.invS.deleteItemFromInvoice(orderItem.orderItemId).subscribe((res:any )=>{
      if(res.status =='success'){
        this.toastr.success('تمت الازالة بنجاح')
        this.invS.getOrderItems(this.sessionId).subscribe();
        setTimeout(() => {
          this.refreshParent.emit()
          
        }, 600);
      }else{
        this.toastr.error(res.message)
      }
    })
  }

  clearInvoice(){
    if(this.orderItems.length){
      if(this.sessionId){
        this.invS.clearInvoice(this.sessionId).subscribe((res:any )=>{
          if(res.status =='success'){
            this.toastr.success('تمت الازالة بنجاح')
            this.invS.getOrderItems(this.sessionId).subscribe();
            setTimeout(() => {
              this.refreshParent.emit()
              
            }, 600);
          }else{
            this.toastr.error(res.message)
          }
        })
      } 
    }else{
      this.toastr.error('الفاتورة فارغة بالفعل')
    }
    
    
  }


  onChangeOrderItemQuantity(product){
    this.invProductS.addToInvoice(product)
    setTimeout(() => {
      this.refreshParent.emit()
      
    }, 600);
  }

  printInvoice(invoice,orderItems){
    let renderedInvoice =( `
          <div style="direction:rtl" dir=" rtl">
          <div  style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;">
          <h3> عباد الرحمن </h3>
        </div>
        <hr>
        <div  style="color:#000;display:flex;flex-direction:row;justify-content:space-between;align-items:center;;padding:5px 0">
                <span>  <strong style="font-weight:600;font-size:12px;text-transform:uppercase;">التاريخ :</strong> `+ new Date(invoice.creationDate).toLocaleDateString("en-US") +`</span>
        </div>
        <div  style="color:#000;display:flex;flex-direction:row;padding: 5px 0;margin-bottom:10px">
                <span> <strong style="font-weight:600;font-size:12px;text-transform:uppercase;">رقم الفاتورة :</strong> `+ invoice.invoiceId+`</span>
        </div>
        <table class="table" style="color:#000;;" >
          <thead>
            <tr>
              <th>العدد</th>
              <th>الصنف</th>
              <th>سعر الوحدة</th>
              <th>الاجمالي</th>
            </tr>
          </thead>
          <tbody>
          ${
            orderItems.map(item =>{
            return  `
                <tr>
                <td> ${item.quantity }  </td>
                <td>  ${item.product.productName } </td>
                <td> ${ parseFloat(item.product.piecePrice ).toFixed(2)}  </td>
                <td>${  parseFloat(item.fee).toFixed(2) }</td>
              </tr>
              `
            }).join('')
          }

          </tbody>
        </table>

        <div style="color:#000;display:flex;flex-direction:column;justify-content:flex-start;align-items:start;padding:5px 0">
                <span> <strong style="font-weight:600;font-size:12px;">اجمالي المدفوع : </strong> ${  parseFloat(invoice.recievedFees).toFixed(2) }</span>
               <span> <strong style="font-weight:600;font-size:12px;">المتبقي : </strong>  ${  +parseFloat(invoice.totalFees).toFixed(2) - +parseFloat(invoice.recievedFees).toFixed(2) }</span>
        </div>
        <hr>
          </div>
         
          
          ` )
    let s:any = document.createElement('div');
    s.setAttribute("id","printedInvoice")
    s.id ="printedInvoice"
     s.style.padding = "30px 20px 30px 20px";
    s.innerHTML = renderedInvoice;
    document.body.appendChild(s);
    
    html2canvas(s).then(function (canvas) {
        let img = canvas.toDataURL("image/png");
        let doc = new jsPDF("portrait", "px", "letter");
                let width = doc.internal.pageSize.getWidth();
                let imgProps= doc.getImageProperties(img);
                let height = (imgProps.height * width) / imgProps.width;

                doc.addImage(img, 'JPEG', 0, 0,width,height);

        doc.save('فاتورة_مبيعات_'+invoice.invoiceId);
     // console.log(s)
       // printJS('printedInvoice', 'html')
        // let string = doc.output('datauristring');
        // let embed = "<embed width='100%' height='100%' src='" + string + "'/>"
        // let x = window.open();
        // x.document.open();
        // x.document.write(embed);
        // x.document.close();
    });
    document.body.removeChild(s);

  }

  
}
