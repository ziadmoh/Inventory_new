import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {  catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
//import { SocialAuthService,FacebookLoginProvider, GoogleLoginProvider ,SocialUser } from "angularx-social-login";
import {User} from '../models/user.model';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { StorageModel } from '../models/storage.model';



@Injectable({
  providedIn: 'root'
})
export class StoragesService {
 // user!: SocialUser;
  isLoggedIn: boolean = false;
  constructor(private http: HttpClient,
              ) {}
            

  selectedStorage = new BehaviorSubject<StorageModel>(null!);
  //errorSub = new Subject<string>();// FaceBook Sign in and Sign Out //////////////////////////////////////////////////////////////






  autoSelectStorage() {
    const selectedStorage: StorageModel = JSON.parse(localStorage.getItem('selectedStorage')!);
    if (!selectedStorage) {
      return;
    }

    const loadedStorage:StorageModel = {
      storageId : selectedStorage.storageId ,
      storageName :selectedStorage.storageName,
      type:selectedStorage.type,
      address:selectedStorage.address,
      isDeleted:selectedStorage.isDeleted
    }

    if (loadedStorage.storageId) {
      this.selectedStorage.next(loadedStorage);
    }
  }

  getAllStorages(){
    return this.http.get(environment.SERVER_URL + 'allStorages')
  }

  archiveStorage(id:any){
    return this.http.patch(environment.SERVER_URL + 'deletestorage/'+id,{})
  }
 
 
  addStorage(body:{storageName:string,type:string,address?:string}){
    return this.http.post(environment.SERVER_URL + 'addStorage/',body)
  }

  onChangeStorage(storage){
    if(storage){
      if(storage.storageId){
        this.selectedStorage.next(storage);
        localStorage.setItem(
          'selectedStorage', JSON.stringify(storage)
        );
       
      }else{
        this.selectedStorage.next(null!);
        localStorage.removeItem('selectedStorage');
      }
    }else{
      this.selectedStorage.next(null!);
      localStorage.removeItem('selectedStorage');
    }
    window.location.reload()
  }


  addProductTostorages(storageProducts:any[],product_id){

    let userId = JSON.parse(localStorage.getItem('user') as string).userId
    return this.http.post(environment.SERVER_URL + 'addProductStorages',{storageProducts,userId:userId,product_id})
  }

  getProductStorages(productId){
    return this.http.get(environment.SERVER_URL + 'showproductstorages/'+productId)
  }

  updateProductStorages(productId,productStoragesArr){
    
    return this.http.put(environment.SERVER_URL + 'updateproductstorages/'+productId,{productStoragesArr:productStoragesArr})
  }

}
 