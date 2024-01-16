import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap, map } from 'rxjs/operators';

export interface ReleaseYearsResponse {
  years: [
    {
      releaseYearId: 2,
      year: "2010",
      carYear_id: 6
      isDeleted: "0" | '1',
    }
  ]
}
export interface SingleReleaseYearsResponse {
  year: {
    releaseYearId: 2,
    year: "2010",
    carYear_id: 6
    isDeleted: "0" | '1',
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReleaseYearsService {

  constructor(private http:HttpClient) { }


  getAllYears(){
   return this.http.get<ReleaseYearsResponse>(environment.SERVER_URL + 'allyears')
  }

  getSingleYear(id:any){
   return this.http.get<SingleReleaseYearsResponse>(environment.SERVER_URL + 'year/'+id)
  }

  deleteYear(id:any){
   return this.http.delete(environment.SERVER_URL + 'permenantdeleteyear/'+id,{})
  }

  addYear(year:string){
   return this.http.post(environment.SERVER_URL + 'addyear/',year)
  }

  geYearList(){
    return this.http.get('assets/data/yearList.json')
  }

  archiveYear(id:any){
    return this.http.patch(environment.SERVER_URL + 'deleteyear/'+id,{})
  }
  
}
