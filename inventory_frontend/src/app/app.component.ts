import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LoaderService } from './services/loading.service';
import { StoragesService } from './services/storages.service';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'inventory';

  constructor(
    private authService: AuthService,
    public _loadingService: LoaderService,
    private storageService: StoragesService,
    private router: Router,
    private config: PrimeNGConfig
  ) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    })
   }

  public showOverlay = true;

  progressValue: number = 100

  isLoading: boolean = true

  ngOnInit() {

    this.authService.autoLogin()

    this.storageService.autoSelectStorage()

    this._loadingService.progressValue.subscribe(res => {
      this.progressValue = res
    })

    this._loadingService.isLoading.subscribe(res => {
      this.isLoading = res
    })

    this.config.setTranslation({
      dayNames: ["الاحد", "الاثنين", "الثلاثاء", "الاربعاء", "الخميس", "الجمعة", "السبت"],
      dayNamesShort :	["احد", "اثنين", "ثلاثاء", "اربعاء", "خميس", "جمعة", "سبت"],
      dayNamesMin :["اح","اث","ثل","اع","خم","جم","سب"],
      monthNames :["يناير","فبراير","مارس","ابريل","مايو","يونيو","يوليو","اغسطس","سبتمبر","اكتوبر","نوفمبر","ديسمبر"],
      monthNamesShort:["شهر 1","شهر 2","شهر 3","شهر 4","شهر 5","شهر 6","شهر 7","شهر 8","شهر 9","شهر 10","شهر 11","شهر 12"],

  });

  }


  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.showOverlay = true;
    }
    if (event instanceof NavigationEnd) {
      this.showOverlay = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.showOverlay = false;
    }
    if (event instanceof NavigationError) {
      this.showOverlay = false;
    }
  }
}
