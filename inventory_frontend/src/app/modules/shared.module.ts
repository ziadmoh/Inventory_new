import { NgModule } from '@angular/core';
import { OverlaySpinnerComponent } from '../components/shared/overlay-spinner/overlay-spinner.component';
import { PrimeNgModule } from './prime-ng.module';
import { SuffixPrefixInputDirective } from '../directives/suffix-prefix.directive';
import { NumberGroupPipe } from '../pipes/number-group.pipe';


@NgModule({
  declarations: [OverlaySpinnerComponent,SuffixPrefixInputDirective,
    NumberGroupPipe],
  imports: [
    PrimeNgModule
  ],
  exports:[
    PrimeNgModule,
    OverlaySpinnerComponent,
    NumberGroupPipe
  ],
  providers: [],
})
export class SharedModule {}
