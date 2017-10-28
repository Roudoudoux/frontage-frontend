import { FApp } from './../../models/fapp';
import { AuthenticationProvider } from './../authentication/authentication';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

/*
  Generated class for the DataFAppsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataFAppsProvider {

  baseUrl:string;

  constructor(public http: Http, public authentication: AuthenticationProvider) {
    this.baseUrl = "/server";

    console.log('Base URL : ' + this.baseUrl);
  }

  public getList() : Observable<FApp>{
    let token: string = 'Bearer ' + this.authentication.token;
    let headers= new Headers({'Content-Type':'application/json', 'Authorization': token});
    let options = new RequestOptions({ headers: headers });

    return this.http.get(this.baseUrl + "/b/admin/apps", options)
      .map((data:any) => JSON.parse(data._body))
      .map((data:any) => data as FApp);
  }
}