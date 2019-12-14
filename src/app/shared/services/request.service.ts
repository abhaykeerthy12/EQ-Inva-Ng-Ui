import { Injectable } from '@angular/core';
import { RequestModel } from '../models/request';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private _http: HttpClient, private _router: Router) { }

  readonly Root_URL = "https://localhost:44345";

  // get data from server
  GetRequest():Observable<RequestModel[]>{
    return this._http.get<RequestModel[]>(this.Root_URL + '/api/requests');
  }

  // register method 
  SaveToDB(formData){
    
    let body: RequestModel = {
      "EmployeeId": formData.EmployeeId,
      "ProductId": formData.ProductId,
      "Quantity": formData.Quantity
    }

    return this._http.post(this.Root_URL + '/api/requests', body).subscribe(res => {
      console.log(res);
    });
}

// update method 
UpdateStatus(reqid, formData){
    
  let body = {
    "Id": formData.RequestId,
    "EmployeeId": formData.EmployeeId,
    "ProductId": formData.ProductId,
    "Quantity": formData.Quantity,
    "ManagerValidated": formData.ManagerValidated,
    "Status": formData.Status,
    "Summary": formData.Summary
  }

  return this._http.put(this.Root_URL + '/api/requests/' + reqid, body);
}

 // delete request
 DeleteFromDB(Id){
  this._http.delete(this.Root_URL + '/api/requests/' + Id).subscribe();
}

}
