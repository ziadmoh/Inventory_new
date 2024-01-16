import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from '@angular/common/http';
import { take, exhaustMap } from 'rxjs/operators';
import { StoragesService } from '../services/storages.service';


@Injectable()
export class StorageInterceptorService implements HttpInterceptor {
  constructor(private storageService: StoragesService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.storageService.selectedStorage.pipe(
      take(1),
      exhaustMap(storage => {
        if (!storage) {
          return next.handle(req);
        }

        const modifiedReq = req.clone({
          params: (req.params ? req.params : new HttpParams())
                     .set('storageId', storage.storageId) 
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
