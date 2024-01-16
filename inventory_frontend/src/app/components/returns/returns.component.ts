import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  styleUrls: ['./returns.component.scss']
})
export class ReturnsComponent implements OnInit {

  constructor(private _inS:InvoiceService,private toastr:ToastrService) { }
  ngOnInit() {
    
  }

 


}
