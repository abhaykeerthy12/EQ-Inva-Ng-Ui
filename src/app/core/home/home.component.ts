import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { fade } from 'src/app/shared/animations/animations';
import { Sidebar } from 'ng-sidebar';
import { UserService } from '../../shared/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [ fade ]
})
export class HomeComponent implements OnInit, OnDestroy {

  // sidebar conf
  private _opened: boolean = true;
  private _shade: boolean = false;
  private _mode: string = 'push';
  private innerWidth: number ;
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

  private _subscription: Subscription;
  
  constructor(private _userService: UserService) { }

  ngOnInit() {
    if(window.innerWidth <= 1000){
      this._mode = 'over';
      this._shade = true;
    }else{
      this._mode = 'push';
      this._shade = false;
    }
  }


  // check is user logged in
  IsLoggedIn(){
    return this._userService.isUserLoggedIn();
  }

  // logout user
  Logout(){
    this._userService.UserLogout();
  }

  // check if user is admin
  IsAdmin(){
    return this._userService.IsAdmin();
  }

  // check if user is admin
  IsManager(){
    return this._userService.IsManager();
  }

  // check if user is admin
  IsCreator(){
    return this._userService.IsCreator();
  }

  ngOnDestroy(){
    if(this._subscription != null)
      this._subscription.unsubscribe();
  }
  
}
