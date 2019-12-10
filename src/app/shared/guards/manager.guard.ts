import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {
  constructor(private _router: Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
       // check if logged in user is manager or above
       if(localStorage.getItem('ACCESS_TOKEN') != null){
        if(localStorage.getItem('Manager') == "Manager" && localStorage.getItem('Manager') != ""){
          return true;
        }else if(localStorage.getItem('Admin') == "Admin" && localStorage.getItem('Admin') != ""){
          return true;
        }else if(localStorage.getItem('Creator') == "Creator" && localStorage.getItem('Creator') != ""){
          return true;
        }else{
          this._router.navigate(['/home']);
          return false;
        }       
      }else{
        this._router.navigate(['/home']);
        return false;
      }

  }
  
}
