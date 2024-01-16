import { Pipe, PipeTransform } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CarCountriesService } from "../services/car-countries.service";
@Pipe({name: 'countryName'})
export class CountryNamePipe implements PipeTransform {
    constructor (private http :HttpClient,private carCountriesService:CarCountriesService){

    }
    transform(value: number, exponent = 1) {
        return this.carCountriesService.getSingleCarCountry(value).subscribe(res =>{
           
        })
        
    }
}