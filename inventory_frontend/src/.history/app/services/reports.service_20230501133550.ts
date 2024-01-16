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
        order_by_column,
        order_type,
        prespective_type
    ){
        let query = '?'
        
        if(piecePrice_lt){
            if(query[query.length -1] == '?'){
                query.concat('piecePrice_lt='+piecePrice_lt)
            }else{
                query.concat('&piecePrice_lt='+piecePrice_lt)
            }
        }

        
        if(piecePrice_gt){
            if(query[query.length -1] == '?'){
                query.concat('piecePrice_gt='+piecePrice_gt)
            }else{
                query.concat('&piecePrice_gt='+piecePrice_gt)
            }
            
        }

        if(piecePurchasePrice_lt){
            if(query[query.length -1] == '?'){
                query.concat('piecePurchasePrice_lt='+piecePurchasePrice_lt)
            }else{
                query.concat('&piecePurchasePrice_lt='+piecePurchasePrice_lt)
            }
            
        }

        if(piecePurchasePrice_gt){
            if(query[query.length -1] == '?'){
                query.concat('piecePurchasePrice_gt='+piecePurchasePrice_gt)
            }else{
                query.concat('&piecePurchasePrice_gt='+piecePurchasePrice_gt)
            }
            
        }

        if(manufacturerCountery){
            if(query[query.length -1] == '?'){
                query.concat('manufacturerCountery='+manufacturerCountery)
            }else{
                query.concat('&manufacturerCountery='+manufacturerCountery)
            }
            
        }

        if(quantity_lt){
            if(query[query.length -1] == '?'){
                query.concat('quantity_lt='+quantity_lt)
            }else{
                query.concat('&quantity_lt='+quantity_lt)
            }
            
        }

        if(quantity_gt){
            if(query[query.length -1] == '?'){
                query.concat('quantity_gt='+quantity_gt)
            }else{
                query.concat('&quantity_gt='+quantity_gt)
            }
            
        }

        if(date_from){
            if(query[query.length -1] == '?'){
                query.concat('date_from='+date_from)
            }else{
                query.concat('&date_from='+date_from)
            }
            
        }

        if(date_to){
            if(query[query.length -1] == '?'){
                query.concat('date_to='+date_to)
            }else{
                query.concat('&date_to='+date_to)
            }
            
        }

        if(order_by_column){
            if(query[query.length -1] == '?'){
                query.concat('order_by_column='+order_by_column)
            }else{
                query.concat('&order_by_column='+order_by_column)
            }
            
        }

        if(order_type){
            if(query[query.length -1] == '?'){
                query.concat('order_type='+order_type)
            }else{
                query.concat('&order_type='+order_type)
            }
            
        }

        if(prespective_type){
            if(query[query.length -1] == '?'){
                query.concat('prespective_type='+prespective_type)
            }else{
                query.concat('&prespective_type='+prespective_type)
            }
            
        }

        if(query == '?'){
            query = ''
        }

        return this.http.get(environment.SERVER_URL + `productsReports${query}`)

    }





}