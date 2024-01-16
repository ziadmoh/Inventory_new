import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {  catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
//import { SocialAuthService,FacebookLoginProvider, GoogleLoginProvider ,SocialUser } from "angularx-social-login";
import {User} from '../models/user.model';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

export interface AuthResponseData {
  error:boolean,
  message:string,
  user:User
  //User_Type:string,
  //User_Name:string,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 // user!: SocialUser;
  isLoggedIn: boolean = false;
  constructor(private http: HttpClient,
              private router:Router,
              private toast: ToastrService,
              private acRoute:ActivatedRoute
              ) { }
            

  newUser = new BehaviorSubject<User>(null!);
  //errorSub = new Subject<string>();// FaceBook Sign in and Sign Out //////////////////////////////////////////////////////////////


/// Handle Auth ///////////////////////////////////////////////////////////////////////
  private handleUserAuth(
    user:User,
    token:string
  ) {
    const userNew :User = {
      userId : user.userId ,
      fullName :user.fullName, 
      userName:user.userName,
      email:user.email ? user.email :'',
      password:'',
      type:user.type,
      token:token,
      joinDate:user.joinDate,
      phone:user.phone
    }
    //= new User(userId,'','','','','','',false,0,'','');
    this.newUser.next(userNew);
    localStorage.setItem(
      'user', JSON.stringify(userNew)
    );

      this.router.navigate(['/system'])
  
    
  }


  
  login(credentials:{
    userName:string,
    password:string
  }) {
    return this.http
      .post(
        environment.SERVER_URL +'signin',{...credentials}
      )
      .pipe(
        tap((res:any) => {
          if(res.userInfo && res.userInfo.userId){
            this.isLoggedIn = true;
            this.handleUserAuth(
              res.userInfo,
              res.token
            );
          }else{
            this.toast.error(res.status,res.message)
          }
          
        },err=>{
          this.toast.error('خطأ من السيرفر!')
        })
      );
  }

  autoLogin() {
    const user: User = JSON.parse(localStorage.getItem('user')!);
    if (!user) {
      return;
    }

    const loadedUser:User = {
      userId : user.userId ,
      fullName :user.fullName, 
      userName:user.userName,
      email:user.email ? user.email :'',
      password:'',
      type:user.type,
      token:user.token,
      joinDate:user.joinDate,
      phone:user.phone
    }

    if (loadedUser.token) {
      this.newUser.next(loadedUser);
      this.isLoggedIn = true;
    }
  }

  logout() {
    this.newUser.next(null!);
    this.isLoggedIn = false;
    localStorage.removeItem('user');
    window.location.reload()
    
  }


}
 