import { HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LoaderService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptorService implements HttpInterceptor {

  constructor(public loaderService: LoaderService) { }

  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
      const clonedRequest = req.clone({ 
        reportProgress: true, 
        
        
      });

      return next.handle(clonedRequest ).pipe(
        tap((event: HttpEvent<any>) => {
          
          if (event.type === HttpEventType.DownloadProgress) {
            
            this.loaderService.isLoading.next(true);
            this.loaderService.progressValue.next(Math.round(event.loaded / event.total * 100));
            
          } else if (event instanceof  HttpResponse) {
            setTimeout( () => {     
              this.loaderService.isLoading.next(false);
              this.loaderService.progressValue.next(0);
             }, 500 );
            
          }
        }, error => {
          
          setTimeout( () => {     
            this.loaderService.isLoading.next(false);
            this.loaderService.progressValue.next(0);
           }, 500 );
        })
      );
    
  }
}
