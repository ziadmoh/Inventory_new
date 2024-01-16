import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit,Input } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
    selector:"app-overlay-spinner",
    templateUrl: './overlay-spinner.component.html',
    styleUrls:['./overlay-spinner.component.scss'],
    animations: [
        trigger('fadeInOut', [
          transition(':enter', [   // :enter is alias to 'void => *'
            style({opacity:0}),
            animate(200, style({opacity:1})) 
          ]),
          transition(':leave', [   // :leave is alias to '* => void'
            animate(200, style({opacity:0})) 
          ])
        ])
      ]
})
export class OverlaySpinnerComponent implements OnInit {

    @Input() toggler: boolean;

    @Input() text?: string;

    windowSize:any = window.innerWidth

    resizeObservable$: Observable<Event>

    resizeSubscription$: Subscription


    ngOnInit(): void {
        this.resizeObservable$ = fromEvent(window, 'resize')
        this.resizeSubscription$ = this.resizeObservable$.subscribe( (evt:any) => {
            this.windowSize = evt.target.innerWidth
            
        })
    }

   



}
