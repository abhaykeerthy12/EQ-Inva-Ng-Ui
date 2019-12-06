import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { process, SortDescriptor } from '@progress/kendo-data-query';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductModel } from 'src/app/shared/models/product';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.scss']
})
export class ManageProductsComponent implements OnInit, OnDestroy {

  @ViewChild('container', { read: ViewContainerRef, static: false }) public container: ViewContainerRef;
  @ViewChild('labelImport', { read: ViewContainerRef, static: false }) public labelImport: any;

  private _subscription: Subscription;

  public Excel: boolean =  false;

  
  public sort: SortDescriptor[] = [{
    field: 'Name',
    dir: 'asc'
  }];

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.LoadProducts();
}

  constructor(private _formBuilder: FormBuilder,
              private _productService: ProductService,
              private _notificationService: NotificationService) { 
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.LoadProducts();

    // file upload
    this.formImport = this._formBuilder.group({
      importFile: [null, Validators.required]
    });
  }

  rows = [];
  realArray = [];
  formGroup: FormGroup;
  formImport: FormGroup;
  fileToUpload: File = null;

  onFileChange(files: FileList) {
    this.labelImport._data.renderElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    this.fileToUpload = files.item(0);
  }

  Import(){
    this._productService.ExcelAddToDB(this.fileToUpload).subscribe((data) => {
        this.ShowAlert('Added Successfully!', 'success');
        this.Excel = false;
        this.LoadProducts();
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


  public allData(): ExcelExportData {
    const result: ExcelExportData =  {
        data: process(this.rows, { sort: [{ field: 'ProductID', dir: 'asc' }] }).data,
    };

    return result;
  }

  // get all products form the server
  LoadProducts(){
    this.rows = [];
    this._subscription =  this._productService.GetProducts().subscribe(
      (data) => {
        this.rows = data;
        this.realArray = data;
      }
    );
  }

  // add handeler
  protected addHandler({sender}) {
     // define all editable fields validators and default values
     this.formGroup = this._formBuilder.group({
      Id: [''],
      Name: ['', Validators.required],
      Type: ['', Validators.required],
      Quantity: ['', Validators.required ],
      Price: ['', Validators.required ]
    });


    // show the new row editor, with the `FormGroup` build above
    sender.addRow(this.formGroup);
}

  // edit handler
  editHandler({sender, rowIndex, dataItem}){

      // define all editable fields validators and default values
      this.formGroup = this._formBuilder.group({
        Id: [dataItem.Id],
        Name: [dataItem.Name, Validators.required],
        Type: [dataItem.Type, Validators.required],
        Quantity: [dataItem.Quantity, Validators.required ],
        Price: [dataItem.Price, Validators.required ]
      });

      // put the row in edit mode, with the `FormGroup` build above
     sender.editRow(rowIndex, this.formGroup);
  }

  // confirm action
  saveHandler({sender, rowIndex, formGroup, isNew}) {
    // collect the current state of the form
    // `formGroup` arguments is the same as was provided when calling `editRow`
    const product: ProductModel = formGroup.value;

    console.log(isNew)
    console.log(product)

    if(isNew){
      // add new product
      this._productService.AddProduct(product).subscribe((data) => {
        this.ShowAlert('Added Successfully!', 'success');
        this.LoadProducts();
      });

    }else{
       // update new product
       this._productService.UpdateProduct(product).subscribe((data) => {
        this.ShowAlert('Updated Successfully!', 'success');
         this.LoadProducts();
       });
    }

    // close the editor, that is, revert the row back into view mode
    sender.closeRow(rowIndex);
  }

  // delete product
  removeHandler({dataItem}) {
    this._productService.DeleteFromDB(dataItem.Id).subscribe((data) => { 
      this.ShowAlert('Deleted!', 'success');
      this.LoadProducts();
    });
}

  protected cancelHandler({sender, rowIndex}) {
      // close the editor for the given row
      sender.closeRow(rowIndex);
      this.LoadProducts();

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
      hideAfter: 500
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
