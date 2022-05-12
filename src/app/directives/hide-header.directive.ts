import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, HostListener, Inject, Input, Renderer2 } from '@angular/core';
import { DomController, isPlatform } from '@ionic/angular';

enum Direction {
  downup = 1,
  down = 0
}

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements AfterViewInit{
  @Input('appHideHeader') header: any;
  content: any;
  previousY = 0;
  direction: Direction = Direction.down;
  saveY = 0;
  scrollDistance = isPlatform('ios') ? 88 : 112;

  constructor(
    private renderer: Renderer2,
    private domCtrl: DomController,
    private elRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) { }

  @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
    if($event.detail.currentY <= 0 || $event.detail.currentY === this.saveY) {
      return;
    }

    const scrollTop: number = $event.detail.scrollTop;
    let newDirection = Direction.down;

    let newPosition = -scrollTop + this.previousY;

    if(this.saveY > $event.detail.currentY) {
      newDirection = Direction.downup;
      newPosition -= this.scrollDistance;
    }

    if(newPosition < -this.scrollDistance){
      newPosition = -this.scrollDistance;
    }

    const contentPosition = this.scrollDistance + newPosition;

    this.domCtrl.write(() => {
      this.renderer.setStyle(
        this.header,
        'top',
        Math.min(0, newPosition) + 'px'
      );

      this.renderer.setStyle(
        this.content,
        'top',
        Math.min(this.scrollDistance, contentPosition) + 'px'
      );
    });

    this.saveY = $event.detail.currentY;

    if(newDirection !== this.direction) {
      this.direction= newDirection;
      this.previousY =scrollTop;
    }
  }

  ngAfterViewInit(): void {
    this.header = this.header.el;
    this.content = this.elRef.nativeElement;

    this.renderer.setStyle(this.content, 'position', 'absolute');
    this.renderer.setStyle(this.content, 'top', `${this.scrollDistance}`);

    const safeArea = getComputedStyle(
      this.document.documentElement
    ).getPropertyValue('--ion-safe-area-top');

    const safeAreaValue = +safeArea.split('px')[0];
    this.scrollDistance = this.scrollDistance + safeAreaValue;
  }

}
