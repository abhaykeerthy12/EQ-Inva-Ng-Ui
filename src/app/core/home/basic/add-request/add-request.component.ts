import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SortDescriptor } from '@progress/kendo-data-query';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/shared/services/product.service';
import { NotificationService } from '@progress/kendo-angular-notification';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { RequestService } from 'src/app/shared/services/request.service';

@Component({
  selector: 'app-add-request',
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.scss']
})
export class AddRequestComponent implements OnInit, OnDestroy {

  // get notification caontainer
  @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;

  private _subscription: Subscription;

  // grid stuff
  public selectableSettings: SelectableSettings;
  public sort: SortDescriptor[] = [{
    field: 'Name',
    dir: 'asc'
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
              private _notificationService: NotificationService) 
  {
    this.setSelectableSettings();
  }

  ngOnInit() {
    this.LoadProducts(); 
    this.CreateForm();
  }

  Tmprows = [];
  rows = [];
  realArray = [];
  formGroup: FormGroup;
  EmployeeID = "";
  ProductID = "";
  ProductQuantity:number;
  Selected: boolean = false;

  // create a form to get details to export to request table
  CreateForm(){
      return this.formGroup = this._formBuilder.group({
      EmployeeId: [''],
      ProductId: [''],
      Quantity: ['', [Validators.required]]
    });
  }
  
  // get all products form the server
  LoadProducts(){
    this.rows = [];
    this.Tmprows = [];
    this._subscription =  this._productService.GetProducts().subscribe(
      (data) => {
        data.forEach(val =>{
          if(val.Quantity > 0){
            this.Tmprows.push({
              'CurrentUserId': val.CurrentUserId,
              'Id': val.Id,
              'Name': val.Name,
              'Type': val.Type,
              'Quantity': val.Quantity,
              'Price': val.Price,
            });
          }
        });
        this.rows = this.Tmprows;
        this.realArray = this.rows;
      }
    );
  }


  // select row data
  selectedKeysChange(rows) 
  {
    if(rows.selectedRows.length > 0){
      this.ProductID= rows.selectedRows[0].dataItem.Id;
      this.EmployeeID= rows.selectedRows[0].dataItem.CurrentUserId;
      this.ProductQuantity =  rows.selectedRows[0].dataItem.Quantity;
      this.Selected = true;
    }else{
      this.EmployeeID = '';
      this.ProductID = '';
      this.ProductQuantity = 0;
      this.Selected = false;
    }
  }

  // add a new request
  AddRequest(){
      
    this.formGroup.value.EmployeeId = this.EmployeeID;
    this.formGroup.value.ProductId = this.ProductID;
    if(this.formGroup.invalid || this.formGroup.value.Quantity == ""){
      this.ShowAlert('Quantity is Required!', 'error');
      return false;
    }

    if(this.formGroup.value.Quantity > this.ProductQuantity){
      this.ShowAlert(`Quantity less than or equal to ${this.ProductQuantity} Required!`, 'error');
      return false;
    }

    this._requestService.SaveToDB(this.formGroup.value);
    this.ShowAlert('Requested', 'success');
    this.LoadProducts();
    this.formGroup.reset();
    this.Selected = false;
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
