import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})

export class ReportsService {


    constructor(private http: HttpClient,){ }


    getProductsReport(
        piecePrice_lt ,
        piecePrice_gt,
        piecePurchasePrice_lt,
        piecePurchasePrice_gt,
        quantity_lt,
        quantity_gt,
        manufacturerCountery,
        date_from,
        date_to,
        prdouct_added_from,
        prdouct_added_to,
        order_by_column,
        order_type,
        prespective_type
    ){
        let query = '?'
        
        if(piecePrice_lt){
            if (query[query.length - 1] == '?') {
                query = query + 'piecePrice_lt=' + piecePrice_lt
            } else {
                query = query + '&piecePrice_lt=' + piecePrice_lt
            }
        }

        
        if(piecePrice_gt){
            if(query[query.length -1] == '?'){
                 query = query +'piecePrice_gt='+piecePrice_gt
            }else{
                 query = query +'&piecePrice_gt='+piecePrice_gt
            }
            
        }

        if(piecePurchasePrice_lt){
            if(query[query.length -1] == '?'){
                 query = query +'piecePurchasePrice_lt='+piecePurchasePrice_lt
            }else{
                 query = query +'&piecePurchasePrice_lt='+piecePurchasePrice_lt
            }
            
        }

        if(piecePurchasePrice_gt){
            if(query[query.length -1] == '?'){
                 query = query +'piecePurchasePrice_gt='+piecePurchasePrice_gt
            }else{
                 query = query +'&piecePurchasePrice_gt='+piecePurchasePrice_gt
            }
            
        }

        if(manufacturerCountery){
            if(query[query.length -1] == '?'){
                 query = query +'manufacturerCountery='+manufacturerCountery
            }else{
                 query = query +'&manufacturerCountery='+manufacturerCountery
            }
            
        }

        if(quantity_lt){
            if(query[query.length -1] == '?'){
                 query = query +'quantity_lt='+quantity_lt
            }else{
                 query = query +'&quantity_lt='+quantity_lt
            }
            
        }

        if(quantity_gt){
            if(query[query.length -1] == '?'){
                 query = query +'quantity_gt='+quantity_gt
            }else{
                 query = query +'&quantity_gt='+quantity_gt
            }
            
        }

        if(date_from){
            if(query[query.length -1] == '?'){
                 query = query +'date_from='+date_from
            }else{
                 query = query +'&date_from='+date_from
            }
            
        }

        if(date_to){
            if(query[query.length -1] == '?'){
                 query = query +'date_to='+date_to
            }else{
                 query = query +'&date_to='+date_to
            }
            
        }

        
     if(prdouct_added_from){
          if(query[query.length -1] == '?'){
               query = query +'prdouct_added_from='+prdouct_added_from
          }else{
               query = query +'&prdouct_added_from='+prdouct_added_from
          }
          
      }

      if(prdouct_added_to){
          if(query[query.length -1] == '?'){
               query = query +'prdouct_added_to='+prdouct_added_to
          }else{
               query = query +'&prdouct_added_to='+prdouct_added_to
          }
          
      }


        if(order_by_column){
            if(query[query.length -1] == '?'){
                 query = query +'order_by_column='+order_by_column
            }else{
                 query = query +'&order_by_column='+order_by_column
            }
            
        }

        if(order_type){
            if(query[query.length -1] == '?'){
                 query = query +'order_type='+order_type
            }else{
                 query = query +'&order_type='+order_type
            }
            
        }

        if(prespective_type){
            if(query[query.length -1] == '?'){
                 query = query +'prespective_type='+prespective_type
            }else{
                 query = query +'&prespective_type='+prespective_type
            }
            
        }

        if(query == '?'){
            query = null
        }

        return this.http.get(environment.SERVER_URL + `productsReports${query ? query :''}`)

    }


    getSupplyNamesReport(
     
     date_from,
     date_to,
     
     order_by_column,
     order_type,
     prespective_type
 ){
     let query = '?'
     


     if(date_from){
         if(query[query.length -1] == '?'){
              query = query +'date_from='+date_from
         }else{
              query = query +'&date_from='+date_from
         }
         
     }

     if(date_to){
         if(query[query.length -1] == '?'){
              query = query +'date_to='+date_to
         }else{
              query = query +'&date_to='+date_to
         }
         
     }



     if(order_by_column){
         if(query[query.length -1] == '?'){
              query = query +'order_by_column='+order_by_column
         }else{
              query = query +'&order_by_column='+order_by_column
         }
         
     }

     if(order_type){
         if(query[query.length -1] == '?'){
              query = query +'order_type='+order_type
         }else{
              query = query +'&order_type='+order_type
         }
         
     }

     if(prespective_type){
         if(query[query.length -1] == '?'){
              query = query +'prespective_type='+prespective_type
         }else{
              query = query +'&prespective_type='+prespective_type
         }
         
     }

     if(query == '?'){
         query = null
     }

     return this.http.get(environment.SERVER_URL + `supplyNamesReports${query ? query :''}`)

 }

    getSupplyTypesReport(
     
     date_from,
     date_to,
     
     order_by_column,
     order_type,
     prespective_type
 ){
     let query = '?'
     


     if(date_from){
         if(query[query.length -1] == '?'){
              query = query +'date_from='+date_from
         }else{
              query = query +'&date_from='+date_from
         }
         
     }

     if(date_to){
         if(query[query.length -1] == '?'){
              query = query +'date_to='+date_to
         }else{
              query = query +'&date_to='+date_to
         }
         
     }



     if(order_by_column){
         if(query[query.length -1] == '?'){
              query = query +'order_by_column='+order_by_column
         }else{
              query = query +'&order_by_column='+order_by_column
         }
         
     }

     if(order_type){
         if(query[query.length -1] == '?'){
              query = query +'order_type='+order_type
         }else{
              query = query +'&order_type='+order_type
         }
         
     }

     if(prespective_type){
         if(query[query.length -1] == '?'){
              query = query +'prespective_type='+prespective_type
         }else{
              query = query +'&prespective_type='+prespective_type
         }
         
     }

     if(query == '?'){
         query = null
     }

     return this.http.get(environment.SERVER_URL + `supplyTypesReports${query ? query :''}`)

 }

    getCarModelsReport(
     
     date_from,
     date_to,
     
     order_by_column,
     order_type,
     prespective_type
 ){
     let query = '?'
     


     if(date_from){
         if(query[query.length -1] == '?'){
              query = query +'date_from='+date_from
         }else{
              query = query +'&date_from='+date_from
         }
         
     }

     if(date_to){
         if(query[query.length -1] == '?'){
              query = query +'date_to='+date_to
         }else{
              query = query +'&date_to='+date_to
         }
         
     }



     if(order_by_column){
         if(query[query.length -1] == '?'){
              query = query +'order_by_column='+order_by_column
         }else{
              query = query +'&order_by_column='+order_by_column
         }
         
     }

     if(order_type){
         if(query[query.length -1] == '?'){
              query = query +'order_type='+order_type
         }else{
              query = query +'&order_type='+order_type
         }
         
     }

     if(prespective_type){
         if(query[query.length -1] == '?'){
              query = query +'prespective_type='+prespective_type
         }else{
              query = query +'&prespective_type='+prespective_type
         }
         
     }

     if(query == '?'){
         query = null
     }

     return this.http.get(environment.SERVER_URL + `carModelsReports${query ? query :''}`)

 }

    getCarBrandsReport(
     
     date_from,
     date_to,
     
     order_by_column,
     order_type,
     prespective_type
 ){
     let query = '?'
     


     if(date_from){
         if(query[query.length -1] == '?'){
              query = query +'date_from='+date_from
         }else{
              query = query +'&date_from='+date_from
         }
         
     }

     if(date_to){
         if(query[query.length -1] == '?'){
              query = query +'date_to='+date_to
         }else{
              query = query +'&date_to='+date_to
         }
         
     }



     if(order_by_column){
         if(query[query.length -1] == '?'){
              query = query +'order_by_column='+order_by_column
         }else{
              query = query +'&order_by_column='+order_by_column
         }
         
     }

     if(order_type){
         if(query[query.length -1] == '?'){
              query = query +'order_type='+order_type
         }else{
              query = query +'&order_type='+order_type
         }
         
     }

     if(prespective_type){
         if(query[query.length -1] == '?'){
              query = query +'prespective_type='+prespective_type
         }else{
              query = query +'&prespective_type='+prespective_type
         }
         
     }

     if(query == '?'){
         query = null
     }

     return this.http.get(environment.SERVER_URL + `carBrandsReports${query ? query :''}`)

 }





}