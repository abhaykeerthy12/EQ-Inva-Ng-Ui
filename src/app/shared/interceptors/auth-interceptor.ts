import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpUserEvent, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private _router: Router) { }

  handleError(error: HttpErrorResponse){
    console.log('error occurred!');
    return throwError(error);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if(req.headers.get("No_Auth"))
      return next.handle(req.clone());

    if(localStorage.getItem('ACCESS_TOKEN') != null){

      const _headers = new HttpHeaders({
        "Authorization":  `Bearer  ${localStorage.getItem('ACCESS_TOKEN')}`
      });

      const clone = req.clone({
        headers: _headers
      });
      return next.handle(clone)
      .pipe(
        catchError(this.handleError)
      );
    }

  }

}
