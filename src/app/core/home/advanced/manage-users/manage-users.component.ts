import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { process, SortDescriptor } from '@progress/kendo-data-query';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserModel } from 'src/app/shared/models/user';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { UserService } from 'src/app/shared/services/user.service';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { NotificationService } from '@progress/kendo-angular-notification';


@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit, OnDestroy {

  // get notification container
  @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;
  // get upload box
  @ViewChild('labelImport', { read: ViewContainerRef, static: false }) public labelImport: any;

  private _subscription: Subscription;

  // grid stuff
  public Excel: boolean =  false;
  public selectableSettings: SelectableSettings;
  public sort: SortDescriptor[] = [{
    field: 'Name',
    dir: 'asc'
  }];
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.LoadUsers();
  }
  public setSelectableSettings(): void {
    this.selectableSettings = {
        checkboxOnly: true,
        mode: "single"
    };
  }

  constructor(private _formBuilder: FormBuilder, 
              private _userService: UserService,
              private _notificationService: NotificationService) 
  { 
    this.allData = this.allData.bind(this);
    this.setSelectableSettings();
  }

  ngOnInit() {
    this.LoadUsers();

    // file upload
    this.formImport = this._formBuilder.group({
      importFile: [null, Validators.required]
    });
  }

  users = [];
  userroles = [];
  userwithroles = [];
  roles = [];
  realroles = [];
  rows = [];
  realArray = [];
  formGroup: FormGroup;
  roleStatus: boolean;
  changePermissionTrigger: boolean = false;
  roleOfSelectedUser: string = '';
  SelectedUserId:string = "";
  formImport: FormGroup;
  fileToUpload: File = null;

  // get name of uploaded file to upload box
  onFileChange(files: FileList) {
    this.labelImport._data.renderElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    this.fileToUpload = files.item(0);
  }

  // import excel data to db
  Import(){
    this._userService.ExcelRegister(this.fileToUpload).subscribe((data) => {
        this.ShowAlert('Added Successfully!', 'success');
        this.Excel = false;
        this.LoadUsers();
    }, (error) => {
        if(error.error.Message == "Unsupported File")
          this.ShowAlert('Unsupported File!', 'error');
        else if(error.error.Message == "No File Found!")
          this.ShowAlert('No File Found!', 'error');
        else if(error.error.Message == "Invalid Data")
          this.ShowAlert('Invalid Datas!', 'error');
        else
          this.ShowAlert('Something Went Wrong', 'error');
    });
  }

  // configure export to excel
  allData(): ExcelExportData {
    const result: ExcelExportData =  {
        data: process(this.rows, { sort: [{ field: 'UserId', dir: 'asc' }] }).data,
    };

    return result;
  }

  // get all products form the server
  LoadUsers(){
    this.users = [];
    this._subscription =  this._userService.GetAllUserData().subscribe(
      (data) => {
          data.forEach(value => {
              this.users.push(value);
          });
          this.LoadUserRoles();
      });
  }

  // Get all user roles from the server
  LoadUserRoles(){
    this.userroles = [];
    this._subscription =  this._userService.GetUserRoles().subscribe(
      (data) => {
        for(var key in data) {
          if (data.hasOwnProperty(key)) {
              this.userroles.push(data[key]);
          }
        }
        this.ExtractRoles(this.userroles);
      });     
  }

   // extract role userroles array
   ExtractRoles(userroles){
    this.userwithroles = [];
      userroles.forEach(val => {
        if(val.Roles.length > 0){
          val.Roles.forEach(element => {
            this.userwithroles.push({
              "UserId": element.UserId,
              "RoleId": element.RoleId
            });
          });
        }
      });
      this.LoadRoles();
    }

    // Get all user roles from the server
   LoadRoles(){
    this.roles = [];
    this._subscription =  this._userService.GetRoles().subscribe(
      (data) => {
        for(var key in data) {
          if (data.hasOwnProperty(key)) {
              this.roles.push(data[key]);
          }
        }
        this.CombineArray(this.roles, this.userwithroles, this.users);
      });
  }

  // combine all arrays
  CombineArray(roles, userwithroles, users){

    this.rows = [];
    this.realArray = [];
    let roleOfUser = "User";
    this.realroles = [];

    // make an array or userid + rolename
    userwithroles.forEach(ur => {
      roles.forEach(role => {
        if(ur.RoleId == role.Id){
          this.realroles.push({
            "UserId": ur.UserId,
            "Role": role.Name
          });
        }
      });
    });

    let RoleOfUser = userId =>{   
     roleOfUser = "User";   
     this.realroles.forEach(role => {
        if(userId == role.UserId){
            return  roleOfUser = role.Role;
        }
      });
    }

    users.forEach(user => {
      // show user apart from app user
      if(user.Id != user.CurrentUserId){
        RoleOfUser(user.Id);
        this.rows.push({
          "UserId": user.Id,
          "Name": user.Name,
          "Email": user.Email,
          "Department": user.Department,
          "Is_Active": user.Is_Active,
          "Role": roleOfUser
          });
      }
    });

    this.realArray = this.rows;

  }

  // add handeler
  addHandler({sender}) {
    // define all editable fields validators and default values
    this.formGroup = this._formBuilder.group({
    Name: ['', Validators.required],
    Email: ['', [Validators.required, Validators.email]],
    Department: ['', Validators.required ]
    });
    // show the new row editor, with the `FormGroup` build above
    sender.addRow(this.formGroup);
  }

  // confirm action
  saveHandler({sender, rowIndex, formGroup}) {
    // collect the current state of the form
    // `formGroup` arguments is the same as was provided when calling `editRow`
    const user: UserModel = formGroup.value;
    // add new product
    this._userService.RegisterToDB(user).subscribe((data) => {
      this.LoadUsers();
    });
    // close the editor, that is, revert the row back into view mode
    sender.closeRow(rowIndex);
    this.ShowAlert('Added Successfully!', 'success');
  }

  cancelHandler({sender, rowIndex}) {
    // close the editor for the given row
    sender.closeRow(rowIndex);
    this.LoadUsers();
  }

   // delete product
   removeHandler({dataItem}) {
    this.formGroup = this._formBuilder.group({
      "UserId": [dataItem.UserId],
      "Is_Active": [!dataItem.Is_Active]
    });
    this._subscription = this._userService.UserActiveness(this.formGroup.value);
    this.ShowAlert('Changed!', 'success');
    setTimeout(()=>{ 
      this.ngOnInit();
    }, 500);
  }

  // select row data
  selectedKeysChange(rows) {
    if(rows.selectedRows.length > 0){
      let role = rows.selectedRows[0].dataItem.Role;
      this.SelectedUserId = rows.selectedRows[0].dataItem.UserId;
      this.changePermissionTrigger = true;
      if(role != "User"){
        this.roleStatus = false;
      }else{
        this.roleStatus = true;
      }
      this.roleOfSelectedUser = role;
    }else{
      this.changePermissionTrigger = false;
      this.roleOfSelectedUser = '';
      this.SelectedUserId = '';
      this.LoadUsers();
    }
  }

  // change permission of user
  Permission(role){
    this.formGroup = this._formBuilder.group({
      "UserId": [this.SelectedUserId],
      "Role": [role],
      "PreviousRole": [this.roleOfSelectedUser]
    });
    this._subscription = this._userService.UserPermission(this.formGroup.value);
    this.ShowAlert('Changed!', 'success');
    setTimeout(()=>{ 
      this.changePermissionTrigger = false;
      this.SelectedUserId = '';
      role = '';
      this.roleOfSelectedUser = '';
      this.LoadUsers();
    }, 500);
  }

  // alert
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

  
  // search products fn
  Search(SearchString){
    // fill the rows with full data at start
    this.rows = this.realArray;
    // convert to lowercase to avoid case sensitive issues
    SearchString = SearchString.toLowerCase();
    let tmpArray = [];
    // check if entered string is work searching i.e; !null
    if(( SearchString != null ) || ( SearchString != " " )){
      // if yes; loop through the whole array
      for (let i = 0; i < this.rows.length; i++) {
        // get name , type from each iteration and convert to lowercase
        let a = this.rows[i].Name.toLowerCase();
        let b = this.rows[i].Role.toLowerCase();
        let c = this.rows[i].Department.toLowerCase();
        // search the entered string is in any index of the name
        // if yes; it should return value > 0; so check it
        if((a.indexOf(SearchString) > -1) || (b.indexOf(SearchString) > -1) || (c.indexOf(SearchString) > -1)){
          // push the matching array to a temprary array
          tmpArray.push(this.rows[i]);
        }else{ this.rows = this.realArray;}
    } 
      // after loop; fill the rows with result array
      this.rows = tmpArray;
    }else{
      // if string is empty; just refill it
      this.rows = this.realArray;
    }
  }

  ngOnDestroy(){
    if(this._subscription != null)
      this._subscription.unsubscribe();
  }

}
