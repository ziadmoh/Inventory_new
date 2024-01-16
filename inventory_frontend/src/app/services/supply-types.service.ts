import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';

export interface SupplyTypesResponse {
  supplyTypes: [
    {
      supplyTypeId: number,
      type: string,
      isDeleted: "0" | '1',
    }
  ]
}
export interface SingleSupplyTypesResponse {
  supplyType: {
    supplyTypeId: number,
    type: string,
    isDeleted: "0" | '1',
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupplyTypesService {

  constructor(private http:HttpClient) { }


  getAllSupplyTypes(){
   return this.http.get<SupplyTypesResponse>(environment.SERVER_URL + 'allsupplytypes')
  }

  getSingleSupplyType(id:any){
   return this.http.get<SingleSupplyTypesResponse>(environment.SERVER_URL + 'supplyType/'+id)
  }

  deleteSupplyType(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeletesupplyType/'+id,{})
  }

  addSupplyType(type:string){
   return this.http.post(environment.SERVER_URL + 'addsupplyType/',{type:type})
  }

  archiveSupplyType(id:any){
    return this.http.patch(environment.SERVER_URL + 'deletesupplytype/'+id,{})
  }

}
