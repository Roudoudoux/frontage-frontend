import { Vibration } from '@ionic-native/vibration';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { AdminHoursSettings } from './../../models/admin-hours-settings';
import { AdminProvider } from './../../providers/admin/admin';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DataFAppsProvider } from './../../providers/data-f-apps/data-f-apps';
import { WebsocketMessageHandlerProvider } from './../../providers/websocket-message-handler/websocket-message-handler';

import { MeshPage } from '../mesh/mesh';



@Component({
  selector: 'page-grid',
  templateUrl: 'grid.html',
})


export class GridPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public adminProvider: AdminProvider,
    public authentication: AuthenticationProvider,
    public translateService: TranslateService,
    public dataFAppsProvider: DataFAppsProvider,
    public meshPage: MeshPage,
    public websocketMessageHandler: WebsocketMessageHandlerProvider) {

    //Init the ama options to send to the back
    this.meshPage.fAppOptions = {
      name: "Ama"
    };


    this.meshPage.translateService.get("ON_MESSAGE").subscribe(res => {
      let on = {
        value: "on",
        label: res
      };
    });
    this.meshPage.translateService.get("OFF_MESSAGE").subscribe(res => {
      let off = {
        value: "off",
        label: res
      };
    });
    this.meshPage.translateService.get("SCHEDULER_MESSAGE").subscribe(res => {
      let scheduled = {
        value: "scheduled",
        label: res
      };
    });
    setTimeout(()=>
      {websocketMessageHandler.initSocket(navCtrl);
      this.meshPage.enableValidation = true;},
        5000
    );
  }

  ngOnInit() {
    this.meshPage.ngOnInit()
    }
    createGrid() {
          this.meshPage.createGrid();
    }

    matrixTouched(element: number, event: Event) {
        this.meshPage.matrixTouched(element, event)
    }

    confirmPixels() {
      this.meshPage.confirmPixels()
    }
    undoPixel() {
        this.meshPage.undoPixel()
    }



  /**
   * Navigation
   */
  goToMesh() {
    this.navCtrl.pop();
  }

}
