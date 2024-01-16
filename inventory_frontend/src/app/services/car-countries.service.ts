import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';

export interface CountriesResponse {
  countries: [
    {
      manufacturerCountryId: number,
      country: string,
      isDeleted: '0' | '1'
    }
  ]
}
export interface SingleCountryResponse {
  manufacturerCountry: {
    manufacturerCountryId: number,
      country: string,
      isDeleted: '0' | '1'
  }
}

@Injectable({
  providedIn: 'root'
})
export class CarCountriesService {

  constructor(private http:HttpClient) { }


  getAllCarCountreis(){
   return this.http.get<CountriesResponse>(environment.SERVER_URL + 'allcountries')
  }

  getSingleCarCountry(id:any){
   return this.http.get<SingleCountryResponse>(environment.SERVER_URL + 'country/'+id)
  }

  archiveCountry(id:any){
   return this.http.patch(environment.SERVER_URL + 'deletecountry/'+id,{})
  }

  deleteCountry(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeletecountry/'+id,{})
  }

  addCountry(body:{country:string}){
   return this.http.post(environment.SERVER_URL + 'addcountry/',body)
  }

  getPartCountries(){
		return this.http.get('assets/data/partCountry.json')
	}

  updateCountry(id,country){
    return this.http.put(environment.SERVER_URL + 'updatecountry',{id,country})
  }
  
}
