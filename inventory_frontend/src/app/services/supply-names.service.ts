import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';

export interface SupplyNamesResponse {
  supplyNames: [
    {
      supplyNameId: number,
      supply: string,
      isDeleted: "0" | '1',
    }
  ]
}
export interface SingleSupplyNamesResponse {
  supplyName: {
    supplyNameId: number,
    supply: string,
    isDeleted: "0" | '1',
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupplyNamesService {

  constructor(private http:HttpClient) { }


  getAllSupplyNames(){
   return this.http.get<SupplyNamesResponse>(environment.SERVER_URL + 'allsupplynames')
  }

  getSingleSupplyName(id:any){
   return this.http.get<SingleSupplyNamesResponse>(environment.SERVER_URL + 'supplyName/'+id)
  }

  deleteSupplyName(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeletesupplyName/'+id,{})
  }

  addSupplyName(name:string,supplyTypeId:any){
   return this.http.post(environment.SERVER_URL + 'addsupplyName/'+ supplyTypeId,{supply:name})
  }

  archiveSupplyName(id:any){
    return this.http.patch(environment.SERVER_URL + 'deletesupplyname/'+id,{})
  }

}
