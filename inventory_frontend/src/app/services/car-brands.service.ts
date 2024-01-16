import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';

export interface BrandsResponse {
  allbrands: [
    {
      manufacturerCountryId: number,
      carBrandId: number,
      brand: string,
      isDeleted: '0' | '1',
    }
  ]
}
export interface SingleBrandResponse {
  brand: {
    manufacturerCountryId: number,
    carBrandId: number,
    brand: string,
    isDeleted: '0' | '1',
  }
}

@Injectable({
  providedIn: 'root'
})
export class CarBrandsService {

  constructor(private http:HttpClient) { }


  getAllBrands(){
   return this.http.get<BrandsResponse>(environment.SERVER_URL + 'allbrands')
  }

  getSingleBrand(id:any){
   return this.http.get<SingleBrandResponse>(environment.SERVER_URL + 'brand/'+id)
  }

  archiveBrand(id:any){
   return this.http.patch(environment.SERVER_URL + 'deletebrand/'+id,{})
  }

  deleteBrand(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeletebrand/'+id,{})
  }

  addBrand(body:{brand:string},country_id){
   return this.http.post(environment.SERVER_URL + 'addbrand/'+country_id,body)
  }

  updateBrand(body:{brand:string,country_id:string},id){
   return this.http.put(environment.SERVER_URL + 'updatebrand/'+id,body)
  }

  filterByCountry(id:any){
   return this.http.get(environment.SERVER_URL + 'countrybrands/'+id)
  }
  
}
