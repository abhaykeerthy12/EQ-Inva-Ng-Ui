import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;


  private _subscription: Subscription;
  constructor(private _formBuilder: FormBuilder, 
              private _userService: UserService, 
              private _notificationService: NotificationService,
              private _router: Router) { }

  ngOnInit() {
    this.LoadUser();  
  }

  EditFlag:boolean = false;
  ChPwdFlag:boolean = false;
  EditForm: FormGroup;
  ChangePwdForm: FormGroup;

  Id: string;
  Name: string;
  Email: string;
  Is_Active: boolean;

  LoadUser(){
    this._subscription = this._userService.GetAllUserData().subscribe((data) => {
      data.forEach(value => {
        if(value.Id == value.CurrentUserId){
            this.Id = value.CurrentUserId;
            this.Name = value.Name;
            this.Email = value.Email;
            this.Is_Active = value.IsActive;
            this.CreateForm();
         }
       });
    });
  }

  CreateForm(){
    this.EditForm = this._formBuilder.group({
      Id: [this.Id],
      Name: [this.Name, Validators.required],
      Email: [this.Email, [ Validators.required, Validators.email]]
    });

    this.ChangePwdForm = this._formBuilder.group({
      OldPassword: ['', [ Validators.required, Validators.minLength(6)]],
      NewPassword: ['', [ Validators.required, Validators.minLength(6)]],
      ConfirmPassword: ['', [ Validators.required, Validators.minLength(6)]]
    });
  }

  Update(){

    // check if form is empty
    if(this.EditForm.invalid){
      this.ShowAlert('Fields are empty', 'error');
      return false;
    }

    this._subscription = this._userService.UpdateUser(this.EditForm.value).subscribe((res) => {
      this.ShowAlert('Updated', 'success');
      this.EditFlag = false;
      this.ChPwdFlag = false;
      this.ngOnInit();
    });

  }

  ChangePassword(){

    // check if form is empty
    if(this.ChangePwdForm.value.NewPassword.invalid || this.ChangePwdForm.value.OldPassword.invalid){
      this.ShowAlert('Minimum of 6 alphanumeric characters required', 'error');
      return false;
    }

    // check if form is empty
    if(this.ChangePwdForm.invalid){
      this.ShowAlert('Fields are empty', 'error');
      return false;
    }

  // check if passwords match
  if(this.ChangePwdForm.value.ConfirmPassword != this.ChangePwdForm.value.NewPassword){
    this.ShowAlert('Passwords Should Match', 'error');
    return false;
  }

  this._subscription = this._userService.ChangePassword(this.ChangePwdForm.value).subscribe((res) => {
    this.ShowAlert('Changed', 'success');
    this.EditFlag = false;
    this.ChPwdFlag = false;
    this.ngOnInit();
  }, (error) => {
      this.ShowAlert('Password Is Incorrect', 'error');
      return false;
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
      hideAfter: 1000
  });
}

ngOnDestroy(){
  if(this._subscription != null)
    this._subscription.unsubscribe();
}


}
