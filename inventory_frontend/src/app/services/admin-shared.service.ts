import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})

export class AdminSharedService {

    isAsideExpanded:boolean = false;

	appShortenName:string =  environment.appName[0] + environment.appName[1];

	appName:string =  environment.appName;


	constructor(private http:HttpClient) {
		
	}

	geYearList(){
		return this.http.get('assets/data/yearList.json')
	}

	gePartTypes(){
		return this.http.get('assets/data/partTypes.json',{
			reportProgress: true, 
			observe:'events'
		})
	}

	getCarPartsList(){
		return this.http.get('assets/data/carParts.json')
	}

	getAllUsers(){
		return this.http.get(environment.SERVER_URL + 'allusers')
	}

	getAllSuppliers(){
		return this.http.get(environment.SERVER_URL + 'allsuppliers')
	}
	getAllCompanies(){
		return this.http.get(environment.SERVER_URL + 'allcompanies')
	}

	getAllAdmins(){
		return this.http.get(environment.SERVER_URL + 'alladmins')
	}

	getAllcashiers(){
		return this.http.get(environment.SERVER_URL + 'allcashiers')
	}

	createUser(body:{
		fullName:string , 
		userName:string , 
		password:string , 
		phone:string ,
		type:"admin" |"cashier" ,
		email:string
	}){
		return this.http.post(environment.SERVER_URL + 'createuser',body)
	}

	createSupplierOrCompany(body:{
		companyName:string , 
		personName:string , 
		type:"supplier" |"company" ,
		phone?:string ,
		address?:string
	}){
		return this.http.post(environment.SERVER_URL + 'addcompany',body)
	}

	archiveUser(id){
		return this.http.patch(environment.SERVER_URL + 'deleteuser/'+id,{})
	}

	archiveSupplierOrCompany(id){
		return this.http.patch(environment.SERVER_URL + 'deleteuser/'+id,{})
	}

	permDeleteUser(id){
		return this.http.delete(environment.SERVER_URL + 'permenantedeleteuser/'+id,{})
	}
	
	permDeleteSupplierOrCompany(id){
		return this.http.delete(environment.SERVER_URL + 'permenantedeleteuser/'+id,{})
	}

	getAllCompaniesinvoices(){
		return this.http.get(environment.SERVER_URL + 'companiesinvoices')
	}

} 