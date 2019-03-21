import { Vibration } from '@ionic-native/vibration';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { AdminProvider } from './../../providers/admin/admin';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { DataFAppsProvider } from './../../providers/data-f-apps/data-f-apps';
import { WebsocketMessageHandlerProvider } from './../../providers/websocket-message-handler/websocket-message-handler';
import { GridPage } from '../grid/grid';
import { RacPage } from '../rac/rac';


@Component({
  selector: 'page-mesh',
  templateUrl: 'mesh.html',
})


export class MeshPage {

    fAppOptions: any;
    buildingWidth: number;
    buildingHeight: number;
    totalAmount: number;
    badDimensions: boolean = false;
    dimensionsAccepted: boolean = false;


    constructor(public navCtrl: NavController,
      public websocketMessageHandlerProvider: WebsocketMessageHandlerProvider,
      public navParams: NavParams,
      public adminProvider: AdminProvider,
      public authentication: AuthenticationProvider,
      public translateService: TranslateService,
      public dataFAppsProvider: DataFAppsProvider) {

      this.fAppOptions = {
        name: "Ama",
        ama: true
      };
    }
    /**
     * Init data
     */
    ngOnInit() {
        this.adminProvider.getBuildingDimensions().subscribe(resp => {
            if (resp['height'] > 0)
              this.buildingHeight = resp['height'];
            if (resp['width'] > 0)
              this.buildingWidth = resp['width'];
            if (resp['amount'] > 0)
              this.totalAmount = resp['amount'];
          });
    }

    /**
     * Navigation
     */
    goToSettings() {
      this.navCtrl.pop();
    }

    goToGridPage() {
        this.fAppOptions.ama = true;
      this.adminProvider.launchForcedFApp(this.fAppOptions)
          .subscribe(response => this.navCtrl.push(GridPage), err => console.log(err));
      }

    goToRacPage() {
        this.fAppOptions.ama = false;
        this.adminProvider.launchForcedFApp(this.fAppOptions)
            .subscribe(response => this.navCtrl.push(RacPage), err => console.log(err));
    }

    validateDimensions() {
        if (this.buildingHeight > 0 && this.buildingWidth > 0 && this.totalAmount > 0
        && this.totalAmount <= this.buildingHeight * this.buildingWidth) {

            let dimensions = {
                width: this.buildingWidth,
                height: this.buildingHeight,
                amount: this.totalAmount
            }

            this.adminProvider.setBuildingDimensions(dimensions).subscribe(resp => {
                this.badDimensions = false;
                this.dimensionsAccepted = true;
            });
        }
        else {
            this.badDimensions = true;
        }
    }
}
