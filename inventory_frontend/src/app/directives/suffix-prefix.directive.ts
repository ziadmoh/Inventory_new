import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[suffixPrefixInput]'
})
export class SuffixPrefixInputDirective implements OnInit {
  @Input('suffixPrefixInput') suffix: string;
  @Input() prefix: string;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    const inputElement = this.el.nativeElement;
    const container = document.createElement('div');
    container.className = 'input-container';

    if (this.prefix) {
      const prefixElement = document.createElement('span');
      prefixElement.className = 'input-prefix';
      prefixElement.innerHTML = this.prefix;
      container.appendChild(prefixElement);
    }

    container.appendChild(inputElement);

    if (this.suffix) {
      const suffixElement = document.createElement('span');
      suffixElement.className = 'input-suffix';
      suffixElement.innerHTML = this.suffix;
      container.appendChild(suffixElement);
    }

    this.el.nativeElement.parentNode.replaceChild(container, this.el.nativeElement);
  }
}
