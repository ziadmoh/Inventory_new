import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AdminSharedService } from '../../../services/admin-shared.service';
import { AuthService } from '../../../auth/auth.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  appShortenName:string = environment.appName[0] + environment.appName[1]

  appName:string =  environment.appName;

  isAdmin :boolean = false

	constructor(private adminshared:AdminSharedService,
		private authService:AuthService) { }

	ngOnInit(): void {
		this.authService.newUser.subscribe(user =>{
			if(user){
				if(user.type == 'admin'){
					this.isAdmin = true
				}else{
					this.isAdmin = false
				}
			}
		})
    }

	isExpanded(){
		return this.adminshared.isAsideExpanded
	}

}
