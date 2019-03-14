import { Vibration } from '@ionic-native/vibration';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { AdminHoursSettings } from './../../models/admin-hours-settings';
import { AdminProvider } from './../../providers/admin/admin';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DataFAppsProvider } from './../../providers/data-f-apps/data-f-apps';
import { WebsocketMessageHandlerProvider } from './../../providers/websocket-message-handler/websocket-message-handler';

import { GridPage } from '../grid/grid';


@Component({
  selector: 'page-mesh',
  templateUrl: 'mesh.html',
})


export class MeshPage {

  lifetime: number;
  totalAmount: number;
  addressedAmount: number;
  buildingWidth: number;
  buildingHeight: number;
  grid: Array<Array<number>>; //array of arrays
  markedPixel: HTMLButtonElement;
  fAppOptions: any;
  isRefused: Boolean = false;
  enableValidation:boolean=false;
  finished:boolean=false;



  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public adminProvider: AdminProvider,
    public authentication: AuthenticationProvider,
    public translateService: TranslateService,
    public dataFAppsProvider: DataFAppsProvider,
    public websocketMessageHandler: WebsocketMessageHandlerProvider) {

    //Init the ama options to send to the back
    this.fAppOptions = {
      name: "Ama"
    };

    this.totalAmount = 0;
    this.addressedAmount = 0;
    this.buildingWidth = 0;
    this.buildingHeight = 0;
    this.markedPixel = null;

    this.translateService.get("ON_MESSAGE").subscribe(res => {
      let on = {
        value: "on",
        label: res
      };
    });
    this.translateService.get("OFF_MESSAGE").subscribe(res => {
      let off = {
        value: "off",
        label: res
      };
    });
    this.translateService.get("SCHEDULER_MESSAGE").subscribe(res => {
      let scheduled = {
        value: "scheduled",
        label: res
      };
    });
    setTimeout(()=>
      {websocketMessageHandler.initSocket(navCtrl);
      this.enableValidation = true;},
        5000
    );
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
  createGrid() {
        this.grid = new Array(this.buildingWidth);
  
        for (let i = 0; i < this.buildingHeight; i++) {
            this.grid[i] = new Array(this.buildingWidth);
            for (let j = 0; j < this.buildingWidth; j++) {
                this.grid[i][j] = i*this.buildingWidth+j;
            }
        }
  
    }

  validateDimensions() {


      if (this.buildingHeight > 0 && this.buildingWidth > 0 && this.totalAmount > 0
      && this.totalAmount <= this.buildingHeight * this.buildingWidth) {

          let dimensions = {
              width: this.buildingWidth,
              height: this.buildingHeight,
              amount: this.totalAmount
          }

          this.adminProvider.setBuildingDimensions(dimensions).subscribe(resp => {console.log(resp);});
          this.enableValidation = false;
          this.isRefused = false;

          this.dataFAppsProvider.launchFApp(this.fAppOptions)
          .subscribe(response => this.navCtrl.push(GridPage), err => console.log(err));
      }

      else {
          this.isRefused = true;
      }
      console.log("coucou")
      this.goToGridPage()

  }

  matrixTouched(element: number, event: Event) {
      let targetElement : HTMLButtonElement = event.target as HTMLButtonElement;

      console.log(targetElement.style.backgroundColor);
      if (!this.finished && this.markedPixel == null && targetElement.style.backgroundColor != 'rgb(128, 128, 128)') { // i couldnt find where the default color is defined
          let row : number = Math.floor(element/this.buildingHeight);
          let column : number = Math.floor(element%this.buildingWidth);

          this.markedPixel = targetElement;
          targetElement.style.background = '#299a29';

          console.log(JSON.stringify({x:column, y:row}))
          console.log(this.websocketMessageHandler.send(JSON.stringify({x:column, y:row})));
      }
  }

  confirmPixels() {
     if (this.markedPixel) {
         this.websocketMessageHandler.send(JSON.stringify({action:1}));
         this.markedPixel.style.background = '#808080';
         this.markedPixel = null;
         this.addressedAmount++;

         if (this.addressedAmount == this.totalAmount)
            this.finished = true;
     }
  }
  undoPixel() {
      if (this.markedPixel) {
          this.websocketMessageHandler.send(JSON.stringify({action:-1}));
          this.markedPixel.style.background = '#ffffff';
          this.markedPixel = null;
      }
  }


  /**
   * Navigation
   */
  goToSettings() {
    this.navCtrl.pop();
  }

  goToGridPage() {
    //this.websocketMessageHandlerProvider.resetFlags();
    this.dataFAppsProvider.launchFApp(this.fAppOptions)
      .subscribe(response => this.navCtrl.push(GridPage), err => console.log(err));
    //this.navCtrl.push(MeshPage);
  }

}
