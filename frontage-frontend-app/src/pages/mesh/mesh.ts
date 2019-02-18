import { Vibration } from '@ionic-native/vibration';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { AdminHoursSettings } from './../../models/admin-hours-settings';
import { AdminProvider } from './../../providers/admin/admin';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-mesh',
  templateUrl: 'mesh.html',
})


export class MeshPage {


  lifetime: number;
  buildingWidth: number;
  buildingHeight: number;
  grid: Array<Array<number>>; //array of arrays
  markedPixels: Array<HTMLButtonElement> = new Array();

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public adminProvider: AdminProvider,
    public authentication: AuthenticationProvider,
    public translateService: TranslateService,
    public vibration: Vibration) {

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
  ngOnInit() {  }

  validateDimensions() {
      console.log(this.buildingHeight + ", " + this.buildingWidth);
      if (this.grid != null)
        this.grid = null
      this.grid = new Array(this.buildingHeight);
      for (let i = 0; i < this.buildingHeight; i++) {
          this.grid[i] = new Array(this.buildingWidth);
          for (let j = 0; j < this.buildingWidth; j++) {
              this.grid[i][j] = i*this.buildingWidth+j;
          }
      }

      let dimensions = {
          width: this.buildingWidth,
          height: this.buildingHeight
      }

      let inst = document.getElementById("instructions");
      inst.hidden = false;

      this.adminProvider.setBuildingDimensions(dimensions).subscribe(resp => {console.log(resp);});

  }

  matrixTouched(element: number, event: Event) {
      let targetElement : HTMLButtonElement = event.target as HTMLButtonElement;
      // need to change it, but for now it states that this position was already selected
      if (targetElement.style.background != '#299a29') {
          let row : number = Math.floor(element/this.buildingHeight);
          let column : number = Math.floor(element%this.buildingWidth);

          this.markedPixels.push(targetElement);
          targetElement.style.background = '#299a29';

          let position = {
              row: row,
              column: column,
          }

          this.adminProvider.setPixelPosition(position).subscribe();

      }
  }

  undoPixel() {
      if (this.markedPixels.length > 0) {
          let targetElement : HTMLButtonElement = this.markedPixels.pop();
          targetElement.style.background = '#ffffff';
          this.adminProvider.resetPixelPosition().subscribe();
      }
  }

  confirmPixels() {
      this.adminProvider.confirmPixelsPosition().subscribe();
      this.navCtrl.pop();
  }

  /**
   * Navigation
   */
  goToSettings() {
    this.navCtrl.pop();
  }

}
