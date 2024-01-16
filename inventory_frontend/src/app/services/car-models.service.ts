import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';

export interface ModelsResponse {
  models: [
    {
      carModelId: number,
      model: string,
      carBrand_id: number
      isDeleted: "0" | '1',
    }
  ]
}
export interface SingleModelResponse {
  model: {
    carModelId: number,
    model: string,
    carBrand_id: number
    isDeleted: "0" | '1',
  }
}

@Injectable({
  providedIn: 'root'
})
export class CarModelsService {

  constructor(private http:HttpClient) { }


  getAllModels(){
   return this.http.get<ModelsResponse>(environment.SERVER_URL + 'allmodels')
  }

  getSingleModel(id:any){
   return this.http.get<SingleModelResponse>(environment.SERVER_URL + 'model/'+id)
  }

  archiveModel(id:any){
   return this.http.patch(environment.SERVER_URL + 'deletemodel/'+id,{})
  }

  deleteModel(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeletemodel/'+id,{})
  }

  addModel(body:{model:string},brand_id){
   return this.http.post(environment.SERVER_URL + 'addmodel/'+brand_id,body)
  }

  updateModel(body:{model:string,brand_id:string},id){
   return this.http.put(environment.SERVER_URL + 'updatemodel/'+id,body)
  }

  filterByBrand(id:any){
   return this.http.get(environment.SERVER_URL + 'brandmodels/'+id)
  }
  filterByCountry(id:any){
   return this.http.get(environment.SERVER_URL + 'countrymodels/'+id)
  }
  
}
