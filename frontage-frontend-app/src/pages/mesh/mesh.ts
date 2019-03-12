import { Vibration } from '@ionic-native/vibration';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { AdminHoursSettings } from './../../models/admin-hours-settings';
import { AdminProvider } from './../../providers/admin/admin';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DataFAppsProvider } from './../../providers/data-f-apps/data-f-apps';
import { WebsocketMessageHandlerProvider } from './../../providers/websocket-message-handler/websocket-message-handler';



@Component({
  selector: 'page-mesh',
  templateUrl: 'mesh.html',
})


export class MeshPage {

  lifetime: number;
  buildingWidth: number;
  buildingHeight: number;
  grid: Array<Array<number>>; //array of arrays
  markedPixel: HTMLButtonElement;
  fAppOptions: any;
  isRefused: Boolean = false;
  enableValidation:boolean=true;



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

    websocketMessageHandler.initSocket(navCtrl);

    this.buildingWidth = 1;
    this.buildingHeight = 1;
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
  }
  /**
   * Init data
   */
  ngOnInit() {
      this.adminProvider.getBuildingDimensions().subscribe(resp => {
          this.buildingHeight = resp['height'];
          this.buildingWidth = resp['width'];
          this.grid = new Array(this.buildingHeight);

          this.createGrid();
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

      let inst = document.getElementById("instructions");
      let buttons = document.getElementById("pixel_buttons");
      inst.hidden = false;
      buttons.hidden = false;

  }

  validateDimensions() {


      if (this.buildingHeight > 0 && this.buildingWidth > 0) {
          if (this.grid != null) // if there was already a grid, we create another one
            this.grid = null

          this.createGrid();

          let dimensions = {
              width: this.buildingWidth,
              height: this.buildingHeight
          }

          this.adminProvider.setBuildingDimensions(dimensions).subscribe(resp => {console.log(resp);});
          this.enableValidation = false;
          // this.dataFAppsProvider.launchFApp(this.fAppOptions)
          // .subscribe(response => console.log(response), err => console.log(err));

          this.isRefused = false;
      }

      else {
          this.isRefused = true;
      }

  }

  matrixTouched(element: number, event: Event) {
      let targetElement : HTMLButtonElement = event.target as HTMLButtonElement;

      console.log(targetElement.style.backgroundColor);
      if (this.markedPixel == null && targetElement.style.backgroundColor != 'rgb(128, 128, 128)') { // i couldnt find where the default color is defined
          let row : number = Math.floor(element/this.buildingHeight);
          let column : number = Math.floor(element%this.buildingWidth);

          this.markedPixel = targetElement;
          targetElement.style.background = '#299a29';

          //this.websocketMessageHandler.send(JSON.stringify({x:column, y:row}));
      }
  }

  confirmPixels() {
     if (this.markedPixel) {
         //this.websocketMessageHandler.send(JSON.stringify({action:1}));
         this.markedPixel.style.background = '#808080';
         this.markedPixel = null;
     }
    }
  undoPixel() {
      if (this.markedPixel) {
          //this.websocketMessageHandler.send(JSON.stringify({action:-1}));
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

}

// le code suivant est le code du bouton "lancer application" sur options-page-button.ts
//
// startFapp() {
//   this.vibration.vibrate(50);
//   this.websocketMessageHandlerProvider.resetFlags();
//   this.dataFAppsProvider.launchFApp(this.fAppOptions)
//     .subscribe(response => this.goToNextPage(response), err => console.log(err));
// }
