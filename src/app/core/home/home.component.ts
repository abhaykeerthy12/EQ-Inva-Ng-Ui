import { Component, OnInit, HostListener } from '@angular/core';
import { fade } from 'src/app/shared/animations/animations';
import { Sidebar } from 'ng-sidebar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [ fade ]
})
export class HomeComponent implements OnInit {

  private _opened: boolean = true;
  private _shade: boolean = false;
  private _mode: string = 'push';
  private innerWidth: number = 0;
  private _toggleSidebar() {
    this._opened = !this._opened;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if(this.innerWidth <= 1000){
      this._mode = 'over';
      this._shade = true;
    }else{
      this._mode = 'push';
      this._shade = false;
    }
  }
  
  constructor() { }

  ngOnInit() {
  }

  
}
