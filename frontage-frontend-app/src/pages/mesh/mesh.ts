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

  selectedFrontageState: boolean = false;
  openingHourList: String[] = [];
  closingHourList: String[] = [];
  frontageStateList: any[] = [];
  selectedOpeningHour: String;
  selectedClosingHour: String;

  lifetime: number;

  buildingWidth: number;
  buildingHeight: number;
  grid: Array<Array<string>>; //array of arrays
  markedPixels: Array<event> = new Array();

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public adminProvider: AdminProvider,
    public authentication: AuthenticationProvider,
    public translateService: TranslateService,
    public vibration: Vibration) {

    this.initHourList("sunset+", this.openingHourList);
    this.initHourList("sunrise-", this.closingHourList);
    this.translateService.get("ON_MESSAGE").subscribe(res => {
      let on = {
        value: "on",
        label: res
      };
      this.frontageStateList.push(on);
    });
    this.translateService.get("OFF_MESSAGE").subscribe(res => {
      let off = {
        value: "off",
        label: res
      };
      this.frontageStateList.push(off);
    });
    this.translateService.get("SCHEDULER_MESSAGE").subscribe(res => {
      let scheduled = {
        value: "scheduled",
        label: res
      };
      this.frontageStateList.push(scheduled);
    });
  }
  /**
   * Init data
   */
  ngOnInit() {
    this.adminProvider.getCurrentSunsetAndSunDown()
      .subscribe((hoursSettings: AdminHoursSettings) => {
        if(hoursSettings.on)
            this.selectedOpeningHour = this.initHoursFormat(hoursSettings.on);
        else
            this.selectedOpeningHour = "sunset+" + hoursSettings.on_offset;

        if(hoursSettings.off)
            this.selectedClosingHour = this.initHoursFormat(hoursSettings.off);
        else
            // Minus sign is already there
            this.selectedClosingHour = "sunrise-" + Math.abs(Number(hoursSettings.off_offset));
      });

    this.authentication.isFacadeUp()
      .subscribe(res => {
        this.selectedFrontageState = res.state
      });
    this.adminProvider.getLifetime()
      .subscribe(res => {
        this.lifetime = res;
      });

  }

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
      this.adminProvider.setBuildingDimensions(dimensions).subscribe();

  }

  matrixTouched(element: number, event: event) {

      // need to change it, but for now it states that this position was already selected
      if (event.target.style.background != '#299a29') {
          var row = Math.floor(element/this.buildingHeight);
          var column = Math.floor(element%this.buildingWidth);

          this.markedPixels.push(event);
          event.target.style.background = '#299a29';

          let position = {
              row: row,
              column: column
          }

          this.adminProvider.setPixelPosition(position).subscribe();
      }
          console.log(event.target);
  }

  undoPixel() {
      if (this.markedPixels.length > 0) {
          var button = this.markedPixels.pop();
          button.target.style.background = '#ffffff';
          this.adminProvider.resetPixelPosition().subscribe();
      }
  }

  private initHoursFormat(hoursFromBack: String): String {
    return hoursFromBack.substring(0, 2) + ':00';
  }

  private initHourList(sunValue: String, listToInit: String[]) {
    let j: number;
    for (j = 0; j <= 5; j++) {
      listToInit.push(sunValue + j.toString());
    }
    let i: number
    for (i = 0; i <= 23; i++) {
      let hourToPush: String = i + ":00";
      if (i < 10) {
        hourToPush = "0" + hourToPush;
      }
      listToInit.push(hourToPush);
    }
  }

  /**
   * Navigation
   */
  goToFappList() {
    this.navCtrl.pop();
  }

  goToMeshPage() {
    //this.navCtrl.push(MeshPage);
  }
  /**
   * Admin Actions
   */
  clearUserQueue() {
    this.adminProvider.clearUserQueue().subscribe();
  }

  updateFrontageState() {
    this.adminProvider.updateFrontageState(this.selectedFrontageState).subscribe();
  }

  updateLifetime() {
    this.adminProvider.updateLifetime(this.lifetime).subscribe();
  }

  setOpeningHour() {
    //Check if the admin choosed an offset or an hour
    if (this.selectedOpeningHour
      && this.selectedOpeningHour.length > 7
      && this.selectedOpeningHour.substring(0, 7) == 'sunset+') {
      let offset: String = this.selectedOpeningHour.substring(7);
      this.adminProvider.setFrontageOpeningOffset(offset).subscribe();
    } else {
      this.adminProvider.setFrontageOpeningHour(this.selectedOpeningHour).subscribe();
    }
  }

  setClosingHour() {
    //Check if the admin choosed an offset or an hour
    if (this.selectedClosingHour
      && this.selectedClosingHour.length > 8
      && this.selectedClosingHour.substring(0, 8) == 'sunrise-') {
      let offset: String = this.selectedClosingHour.substring(7, 9);
      this.adminProvider.setFrontageClosingOffset(offset).subscribe();
    } else {
      this.adminProvider.setFrontageClosingHour(this.selectedClosingHour).subscribe();
    }
  }

  unForceFApp() {
    this.vibration.vibrate(50)
    this.adminProvider.unForceFApp().subscribe();
  }
}
