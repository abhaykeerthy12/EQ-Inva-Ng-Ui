import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;

  private _subscription: Subscription;

  constructor(
    private _formBuilder: FormBuilder, 
    private _userService: UserService, 
    private _router: Router,
    private _notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.CreateForm();
  }

  LoginForm: FormGroup;

  CreateForm(){
    this.LoginForm = this._formBuilder.group({
      Email: ['', [ Validators.required, Validators.email]],
      Password: ['', [ Validators.required, Validators.minLength(6) ]],
      grant_type: ["password"]
    });
  }

  Login(){
    
          // check if form is empty
          if(this.LoginForm.invalid){
            this.ShowAlert('Fields Are Empty!', 'error');
            return false;
          }

          this._subscription = this._userService.LoginToDB(this.LoginForm.value).subscribe((data: any) => 
          {

              // if everything ok then add values to localstorage and redirect 
              localStorage.setItem('ACCESS_TOKEN', data['access_token']);
              localStorage.setItem('Department', data['Department']);
              localStorage.setItem('Name', data['Name']);
              if(data['roles'] != "[]")
              {
                if (data['roles'].includes('\"')) 
                { 
                  data['roles'] = JSON.parse(data['roles']);
                  let tmparray = data['roles'].toString().split(',');
                  tmparray.forEach(role => {
                  if(role == "Admin")
                      localStorage.setItem('Admin', 'Admin');
                  else if(role == "Manager")
                      localStorage.setItem('Manager', 'Manager');
                  else if(role == "Creator")
                      localStorage.setItem('Creator', 'Creator');
                  });
                }
              }
              this._router.navigate(['/home']);
          },
          // if there is error, check type of error and show error alert
          (error: HttpErrorResponse) => {
            if(error){
              if(error.status == 400){
                if(error.error.error == "User_Inactive"){
                  this.ShowAlert('Account Is Deactivated, Contact Admin!', 'error');

                }else{
                  this.ShowAlert('Invalid Credentials!', 'error');

                }
              }
            }
        });  
  }

  ShowAlert(msg, type){
      this._notificationService.show({
          content: msg,
          cssClass: 'kendo-notify',
          appendTo: this.container,
          animation: { type: 'fade', duration: 500 },
          position: { horizontal: 'center', vertical: 'top' },
          type: { style: type, icon: true },
          hideAfter: 500
      });
    }

  ngOnDestroy(){
    if(this._subscription != null)
      this._subscription.unsubscribe();
  }


}
