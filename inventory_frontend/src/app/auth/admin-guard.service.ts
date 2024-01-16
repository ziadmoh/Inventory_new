import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
  } from '@angular/router';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { map, tap, take } from 'rxjs/operators';
  
  import { AuthService } from './auth.service';
  
  @Injectable({ providedIn: 'root' })
  export class AdminGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router,
      ) { }
  
    canActivate(
      route: ActivatedRouteSnapshot,
      router: RouterStateSnapshot
    ): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
      let user = JSON.parse(localStorage.getItem('user') as string)
      if(user && user.userId){
        if(user.type == 'admin'){
          return true;
        }else{
          return this.router.createUrlTree(['/system/inventory']);
        }
       
      }else{
        return this.router.createUrlTree(['/login']);
      }
    }
  }
  