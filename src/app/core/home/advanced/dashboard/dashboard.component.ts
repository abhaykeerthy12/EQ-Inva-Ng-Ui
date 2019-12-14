import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/shared/services/product.service';
import { RequestService } from 'src/app/shared/services/request.service';
import { UserService } from 'src/app/shared/services/user.service';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

   // get notification caontainer
   @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;

   private _subscription: Subscription;
 

  constructor(private _productService: ProductService,
              private _requestService: RequestService,
              private _userService: UserService,
              private _notificationService: NotificationService) { }

  ngOnInit() {
    this.LoadRequest();
  }

  requests: any = [];
  products: any = [];
  users: any = [];
  topProducts = [];
  CombineReqProd = [];
  uniqueProducts = [];
  StockAlert = [];
  rows = [];
  realArray = [];

  // Get all requests from the server
 LoadRequest(){
  this.requests = [];
  this._subscription =  this._requestService.GetRequest().subscribe(
    (data) => {
        data.forEach(value => {     
              this.requests.push(value);        
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
      this.CombineArray(this.requests, this.products);
      this.LoadUsers();
    }
  );
}

// Get all requests from the server
LoadUsers(){
  this.users = [];
  this.rows = [];
  this._subscription =  this._userService.GetAllUserData().subscribe(
    (data) => {
        data.forEach(value => {
          if(value.CurrentUserId != value.Id){
            this.users.push({
              "UserId": value.Id,
              "Name": value.Name,
              "Email": value.Email,
              "Department": value.Department
              });
          }
        });
        this.rows = this.users;
        this.realArray = this.rows;
    });
}


CombineArray(requests, products){
  
  let tmpArray = [];
  let tmpStock = [];
  this.topProducts = [];
  this.CombineReqProd = [];
  this.uniqueProducts = [];

  // get most demanding products
  requests.forEach(req => {
    products.forEach(prod => {
      if(req.ProductId == prod.Id){
        this.uniqueProducts.push(prod.Name);
        this.CombineReqProd.push(prod.Id);
      }
    });
  });
  // get top 5 from them
  this.topProducts = this.CompressArray(this.uniqueProducts).sort(this.CountSort).slice(0, 5);

  // get popular products with lower quantity
  tmpArray = this.CompressArray(this.CombineReqProd);
  products.forEach(prod => {
    tmpArray.forEach(tmp => {
      if(prod.Id == tmp.value){
        tmpStock.push({
          'Name': prod.Name,
          'Quantity': prod.Quantity
        });
      }
    });
  });
  // get top 5 from them
  this.StockAlert = tmpStock.sort(this.QuantitySort).slice(0, 5);
}

CompressArray(original) {
	var compressed = [];
	// make a copy of the input array
	var copy = original.slice(0);
	// first loop goes over every element
	for (var i = 0; i < original.length; i++) {
		var myCount = 0;	
		// loop over every element in the copy and see if it's the same
		for (var w = 0; w < copy.length; w++) {
			if (original[i] == copy[w]) {
				// increase amount of times duplicate is found
				myCount++;
				// sets item to undefined
				delete copy[w];
			}
		}
		if (myCount > 0) {
      compressed.push({
        'value': original[i],
        'count': myCount
      });
		}
	}
	return compressed;
};

// sort counts of request
CountSort(a, b) {
  const bandA = a.count;
  const bandB = b.count;

  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison * -1;
}

// sort quantity of products
QuantitySort(a, b) {
  const bandA = a.Quantity;
  const bandB = b.Quantity;

  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison;
}

  // delete product
removeHandler({dataItem}) {
  this._subscription = this._userService.DeleteFromDB(dataItem.UserId).subscribe((data) => {
    this.ShowAlert('Deleted!', 'success');
    setTimeout(()=>{ 
      this.ngOnInit();
    }, 500);
  });
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
      let c = this.rows[i].Department.toLowerCase();
      // search the entered string is in any index of the name
      // if yes; it should return value > 0; so check it
      if(a.indexOf(SearchString) > -1 || c.indexOf(SearchString) > -1){
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

}
