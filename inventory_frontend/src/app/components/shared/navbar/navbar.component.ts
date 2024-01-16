import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { StoragesService } from 'src/app/services/storages.service';
import { AdminSharedService } from '../../../services/admin-shared.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	isAccounting:boolean = false

	isReports:boolean = false

	isEntriesManagement:boolean = false

	isAdmin:boolean = false

	storages:any[] = [
		{
			storageId: 0,
			storageName: "جميع المخازن",
			type: "inventory",
			address:"-",
			isDeleted: "0"
		}
	]

	selectedStorage:any

  constructor(private adminshared:AdminSharedService,
			  private authService:AuthService,
			  private ac:ActivatedRoute,
			  private storageService:StoragesService,
			  private cd:ChangeDetectorRef) { }

	ngOnInit(): void {
		
		this.ac.url.subscribe(u =>{
			if(u[0].path == 'accounting'){
				this.isAccounting = true;
				this.isEntriesManagement = false
				this.isReports = false
			}else if(u[0].path == 'reports'){
				this.isReports = true;
				this.isAccounting = false;
				this.isEntriesManagement = false
			} else if (u[0].path == 'system' && this.ac.snapshot['_routerState'].url.split('/')[2] == 'entries-management'){

				this.isEntriesManagement = true
				this.isAccounting = false
				this.isReports = false
			}else {
				this.isEntriesManagement = false
				this.isAccounting = false
				this.isReports = false
			}
		})
		this.authService.newUser.subscribe(user =>{
			if(user){
				if(user.type == 'admin'){
					this.isAdmin = true
				}else{
					this.isAdmin = false
				}
			}
		})

		this.getAllStorages();
    }
	
	toggleAside(){
		this.adminshared.isAsideExpanded = !this.adminshared.isAsideExpanded
	}

	logOut(){
		this.authService.logout();
	}

	getAllStorages(){
		this.storages = [
			{
				storageId: 0,
				storageName: "جميع المخازن",
				type: "inventory",
				address:"-",
				isDeleted: "0"
			}
		]
		this.storageService.getAllStorages().subscribe((res:any) =>{
			if(res.status == 'success'){
				for(let i=0;i<res.storages.length;i++){
					this.storages.push(res.storages[i])
				}
				this.storageService.selectedStorage.subscribe(res =>{
					if(res){
						this.selectedStorage = res
						
					}else{
						this.selectedStorage = {
							storageId: 0,
							storageName: "جميع المخازن",
							type: "inventory",
							address:"-",
							isDeleted: "0"
						}
					}
				})
			}else{
				this.storages = [
					{
						storageId: 0,
						storageName: "جميع المخازن",
						type: "inventory",
						address:"-",
						isDeleted: "0"
					}
				]
			}
		})
	}

	onChangeStorage(event){
		if(event.value){
			if(event.value.storageId == 0){
				this.storageService.onChangeStorage(null);
			}else{
				this.storageService.onChangeStorage(event.value);
			}
		}else{
			this.storageService.onChangeStorage(null);
			this.selectedStorage = {
				storageId: 0,
				storageName: "جميع المخازن",
				type: "inventory",
				address:"-",
				isDeleted: "0"
			}
			this.cd.detectChanges()
		}
		
	}



}
