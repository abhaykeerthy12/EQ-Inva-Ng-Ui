import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild } from '@angular/core';
import { Subscription, from } from 'rxjs';
import { SortDescriptor } from '@progress/kendo-data-query';
import { ProductService } from 'src/app/shared/services/product.service';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { RequestService } from 'src/app/shared/services/request.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-request-history',
  templateUrl: './request-history.component.html',
  styleUrls: ['./request-history.component.scss']
})
export class RequestHistoryComponent implements OnInit {

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

  constructor(private _productService: ProductService,
              private _requestService: RequestService,) {}

  ngOnInit() {
    this.LoadRequest(); 
  }

  requests = [];
  products = [];
  productListArray = [];
  userFilteredArray = [];
  rows = [];
  realArray = [];

   // Get all requests from the server
   LoadRequest(){
    this.requests = [];
    this._subscription =  this._requestService.GetRequest().subscribe(
      (data) => {
          this.requests = data;
          this.FilterUser();
      });
  }

  // get requests of current user
  FilterUser(){
    this.userFilteredArray = [];
    const reqs = from(this.requests);
    const pendingRequests = reqs.pipe(filter( r => r.CurrentUserId.toLowerCase() == r.EmployeeId.toLowerCase()));
    this._subscription = pendingRequests.subscribe(
      (data) => {  
            this.userFilteredArray.push(data);
      });
    // if there is requests, get product details for it
    if(this.userFilteredArray)
      this.LoadProducts();          
  }

  // get all products form the server
  LoadProducts(){
    this.products = [];
    this._subscription =  this._productService.GetProducts().subscribe(
      (data) => {
        this.products = data;
        this.FilterProducts(this.products, this.userFilteredArray);
      }
    );
  }

  // check if a product id is equal to product id in request array 
  // if yes, just pussh the corresponding product to a separate array 
  FilterProducts(prodArray, reqArray){
    this.productListArray = [];
    reqArray.forEach(request => {
        prodArray.forEach(products => {
          if(request.ProductId.toLowerCase() == products.Id.toLowerCase()){
            this.productListArray.push(products);
          }
      });
    });
    this.CombineArray(this.productListArray, reqArray);
  }

  // combine the two arrays to get a easy ui frontly single array
  // this will simplify the ui part
  CombineArray(products, requests){
    this.rows = [];
    for(let i = 0; i < requests.length; i++){
      if(products[i].Id.toLowerCase() == requests[i].ProductId.toLowerCase()){
            this.rows.push({
                "Name": products[i].Name,
                "Type": products[i].Type,
                "Quantity": requests[i].Quantity,
                "Status": requests[i].Status,
                "Summary": requests[i].Summary,
                "Date": requests[i].RequestedDate
            });
      }
    }
    this.realArray = this.rows;
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
