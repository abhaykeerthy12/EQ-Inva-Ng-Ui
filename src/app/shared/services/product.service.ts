import { Injectable } from '@angular/core';
import { ProductModel } from '../models/product';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private _http: HttpClient, private _router: Router) { }

  readonly Root_URL = "https://localhost:44345";

  GetProducts():Observable<ProductModel[]>{
    return this._http.get<ProductModel[]>(this.Root_URL + '/api/products');
  }

  // register method 
  AddProduct(formData){
    
    let body: ProductModel = {
      "Name": formData.Name,
      "Type": formData.Type,
      "Quantity": formData.Quantity,
      "Price": formData.Price
    }

    return this._http.post(this.Root_URL + '/api/products', body);
}


ExcelAddToDB(file){


  const formData: FormData = new FormData();
  formData.append('file', file);
  return this._http.post(this.Root_URL + '/api/products/excelproducts', formData);
}

// update method 
UpdateProduct(formData){
    
  let body = {
    "Id": formData.Id,
    "Name": formData.Name,
    "Type": formData.Type,
    "Quantity": formData.Quantity,
    "Price": formData.Price
  }

  console.log(body);

  return this._http.put(this.Root_URL + '/api/products/' + formData.Id, body);
}

  // delete product
  DeleteFromDB(Id){
    return this._http.delete(this.Root_URL + '/api/products/' + Id);
  }

}
