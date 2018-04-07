import { AdminProvider } from './../../providers/admin/admin';
import { LocalStorageProvider } from './../../providers/local-storage/local-storage';
import { FlagsJoytickPage } from './../flags-joytick/flags-joytick';
import { WaitingPage } from './../waiting/waiting';
import { FAppOptions } from './../../models/f-app-options';
import { DataFAppsProvider } from './../../providers/data-f-apps/data-f-apps';
import { FApp } from './../../models/fapp';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-flags-options',
  templateUrl: 'flags-options.html',
})
export class FlagsOptionsPage {

  flag: FApp;
  parametersList: string[];
  selectedParameter: string = "french";
  isAdmin: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public dataFAppsProvider: DataFAppsProvider,
    public localStorageProvider: LocalStorageProvider,
    public adminProvider: AdminProvider) {

    //Check if the connected user is admin
    this.isAdmin = this.localStorageProvider.isAdmin();

    let fAppParams: FApp = navParams.get('selectedFapp');
    if (fAppParams) {
      this.parametersList = fAppParams.params_list.uapp;
    }
  }

  startFapp() {
    let options: FAppOptions = {
      name: "Flags",
      params: {
        uapp: this.selectedParameter
      }
    };

    this.dataFAppsProvider.launchFApp(options)
      .subscribe(response => this.goToNextPage(response));
  }

  goToNextPage(response) {
    this.navCtrl.pop();
    this.navCtrl.push(WaitingPage, { info: response, joystick: FlagsJoytickPage, joystickParams: { parametersList: this.parametersList, selectedParameter: this.selectedParameter } })
  }

  forceFapp() {
    let options: FAppOptions = {
      name: "Flags",
      params: {
        uapp: this.selectedParameter
      }
    };
    this.adminProvider.launchForcedFApp(options)
      .subscribe(response => response);
  }

  sendScheduledFappOptions() {
    let options: FAppOptions = {
      name: "Flags",
      params: {
        uapp: this.selectedParameter
      }
    };

    this.adminProvider.sendScheduledFAppOptions(options)
      .subscribe(response => this.goToNextPage(response));
  }
}
