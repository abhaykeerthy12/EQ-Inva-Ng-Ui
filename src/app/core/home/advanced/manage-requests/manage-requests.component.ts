import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ProductService } from 'src/app/shared/services/product.service';
import { RequestService } from 'src/app/shared/services/request.service';

@Component({
  selector: 'app-manage-requests',
  templateUrl: './manage-requests.component.html',
  styleUrls: ['./manage-requests.component.scss']
})
export class ManageRequestsComponent implements OnInit, OnDestroy {

  // get notification caontainer
  @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;

  private _subscription: Subscription;

  // grid stuff
  public selectableSettings: SelectableSettings;
  public sort: SortDescriptor[] = [{
    field: 'Date',
    dir: 'desc'
  }];
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.LoadProducts();
  }
  public setSelectableSettings(): void {
    this.selectableSettings = {
        checkboxOnly: true,
        mode: "single"
    };
  }

  constructor(private _formBuilder: FormBuilder,
              private _productService: ProductService,
              private _requestService: RequestService,
              private _userService: UserService,
              private _notificationService: NotificationService) 
  {
    this.setSelectableSettings();
  }

  ngOnInit() {
    this.LoadRequest(); 
    this.isManager = this._userService.IsManager();
  }

  requests = [];
  products = [];
  users = [];
  productListArray = [];
  userFilteredArray = [];
  rows = [];
  realArray = [];
  RequestForm: FormGroup;
  ProductForm: FormGroup;
  Selected: boolean = false;
  ConfirmReject:boolean = false;
  EmployeeID:string= "";
  RequestID:string= "";
  ProductID:string= "";
  ProductName:string= "";
  ProductType:string= "";
  RequestQuantity:number;
  ProductQuantity:number;
  ProductPrice:number;
  SummaryString:string = "";
  isManager:boolean = false;
  
 // Get all requests from the server
 LoadRequest(){
  this.requests = [];
  this._subscription =  this._requestService.GetRequest().subscribe(
    (data) => {
        data.forEach(value => {
          if(this.isManager){
            if(value.Status == "Pending"){
              this.requests.push(value);
            }
          }else{
            if(value.Status == "Proceed"){
              this.requests.push(value);
            }
          }
        });
        this.LoadProducts();
    });
}

// get all products form the server
LoadProducts(){
  this.products = [];
  this._subscription =  this._productService.GetProducts().subscribe(
    (data) => {
      this.products = data;
      this.LoadUsers();
    }
  );
}

// Get all requests from the server
LoadUsers(){
  this.users = [];
  this._subscription =  this._userService.GetAllUserData().subscribe(
    (data) => {
        data.forEach(value => {
          if(this.isManager){
            if(value.Department == localStorage.getItem('Department')){
              this.users.push(value);
           }
          }else{
            this.users.push(value);
          }
        });
        this.CombineArray(this.products, this.requests, this.users);
    });
}

// combine the two arrays to get a easy ui frontly single array
// this will simplify the ui part
CombineArray(products, requests, users){
  this.rows = [];
  let p = null;
  let u = null;

  let productsFilter = (pid) => {
    p = null;
    products.forEach(prod => {
      if(prod.Id == pid){
        return p = prod
      }
    });
  }

  let userFilter = (eid) => {
    u = null;
    users.forEach(user => {
      if(user.Id == eid){
        return u = user
      }
    });
  }

  requests.forEach(request => {

      productsFilter(request.ProductId);
      userFilter(request.EmployeeId);
      if(u.Is_Active == true){
        this.rows.push({

                "Id": request.RequestId,
                "ProductId": p.Id,
                "EmployeeId": request.EmployeeId,
                "EmployeeName": u.Name,
                "Department": u.Department,
                "Name": p.Name,
                "Type": p.Type,
                "Quantity": request.Quantity,
                "ProductQuantity": p.Quantity,
                "ProductPrice": p.Price,
                "Status": request.Status,
                "Date": request.RequestedDate
            });
      }

  });
     
  this.realArray = this.rows;
}


  // select row data
  selectedKeysChange(rows) 
  {
    if(rows.selectedRows.length > 0){
      this.RequestID= rows.selectedRows[0].dataItem.Id;
      this.ProductID= rows.selectedRows[0].dataItem.ProductId;
      this.EmployeeID= rows.selectedRows[0].dataItem.EmployeeId;
      this.RequestQuantity =  rows.selectedRows[0].dataItem.Quantity;
      this.ProductQuantity =  rows.selectedRows[0].dataItem.ProductQuantity;
      this.ProductName =  rows.selectedRows[0].dataItem.Name;
      this.ProductType =  rows.selectedRows[0].dataItem.Type;
      this.ProductPrice =  rows.selectedRows[0].dataItem.ProductPrice;
      this.Selected = true;
    }else{
      
      this.RequestID= "";
      this.ProductID= "";
      this.EmployeeID= "";
      this.RequestQuantity =  0;
      this.ProductQuantity =  0;
      this.ProductName =  "";
      this.ProductType =  "";
      this.ProductPrice =  0;
      this.Selected = false;
      this.ConfirmReject = false;
    }
  }

  // accept or reject
  Submit(status){
    let TmpQuantity = this.ProductQuantity - this.RequestQuantity;
    if(status == 'Approve'){
      if(TmpQuantity < 0){
        this.ShowAlert('Quantity Exceeded', 'error');
      }else{

      this.RequestForm = this._formBuilder.group({
          RequestId: [this.RequestID],
          EmployeeId: [this.EmployeeID],
          ProductId: [this.ProductID],
          Quantity: [this.RequestQuantity],
          Status: ['Approved'],
          Summary: ['Approved By Admin']
        });
        this._requestService.UpdateStatus(this.RequestForm.value.RequestId, this.RequestForm.value).subscribe();

        // we also need to update products quuantity
        this.ProductForm = this._formBuilder.group({
          Id: [this.ProductID],
          Name: [this.ProductName],
          Type: [this.ProductType],
          Quantity: [TmpQuantity],
          Price: [this.ProductPrice]
        });
        this._productService.UpdateProduct(this.ProductForm.value).subscribe(res => {
          this.ShowAlert('Approved', 'success');
          this.Selected = false;
          this.LoadRequest();
        });;
      }
    }else if(status == 'Proceed'){
      if(TmpQuantity < 0){
        this.ShowAlert('Quantity Exceeded', 'error');
      }else{

      this.RequestForm = this._formBuilder.group({
          RequestId: [this.RequestID],
          EmployeeId: [this.EmployeeID],
          ProductId: [this.ProductID],
          Quantity: [this.RequestQuantity],
          ManagerValidated: [true],
          Status: ['Proceed'],
          Summary: ['Validated By Manager']
        });
        this._requestService.UpdateStatus(this.RequestForm.value.RequestId, this.RequestForm.value).subscribe();

        // we also need to update products quuantity
        this.ProductForm = this._formBuilder.group({
          Id: [this.ProductID],
          Name: [this.ProductName],
          Type: [this.ProductType],
          Quantity: [TmpQuantity],
          Price: [this.ProductPrice]
        });
        this._productService.UpdateProduct(this.ProductForm.value).subscribe(res => {
          this.ShowAlert('Done', 'success');
          this.Selected = false;
          this.LoadRequest();
        });;
      }
    }else if(status == 'Reject'){
        if(this.isManager){
          this.RequestForm = this._formBuilder.group({
            RequestId: [this.RequestID],
            EmployeeId: [this.EmployeeID],
            ProductId: [this.ProductID],
            Quantity: [this.RequestQuantity],
            Status: ['Rejected'],
            ManagerValidated: [true],
            Summary: [this.SummaryString]
          });
      }else{
        this.RequestForm = this._formBuilder.group({
          RequestId: [this.RequestID],
          EmployeeId: [this.EmployeeID],
          ProductId: [this.ProductID],
          Quantity: [this.RequestQuantity],
          Status: ['Rejected'],
          Summary: [this.SummaryString]
        });
      }
      this.ConfirmReject = !this.ConfirmReject; 
      this.Selected = false;
      this._requestService.UpdateStatus(this.RequestForm.value.RequestId, this.RequestForm.value)
      .subscribe((data) => {
        this.ShowAlert('Rejected', 'error');
        this.LoadRequest();
      });
    }
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
        let b = this.rows[i].Type.toLowerCase();
        // search the entered string is in any index of the name
        // if yes; it should return value > 0; so check it
        if((a.indexOf(SearchString) > -1) || (b.indexOf(SearchString) > -1)){
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
