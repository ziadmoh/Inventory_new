import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from '@angular/common/http';
import { take, exhaustMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.newUser.pipe(
      take(1),
      exhaustMap(user => {
        if (!user) {
          return next.handle(req);
        }
          let modifiedReq;
          if (req.body instanceof FormData) {
              modifiedReq =  req.clone({
                body: req.body.append('token',user.token)
              })
          }else{
            modifiedReq =  req.clone({
              body:{token: user.token,...req.body} 
            })
          }
        
        return next.handle(modifiedReq);
      })
    );
  }
}
