import { DataFAppsProvider } from './../data-f-apps/data-f-apps';
import { LocalStorageProvider } from './../local-storage/local-storage';
import { environment } from './../../app/environment';
import { TranslateService } from '@ngx-translate/core'
import { Vibration } from '@ionic-native/vibration';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

/*
  Generated class for the WebsocketMessageHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WebsocketMessageHandlerProvider {
  CODE_CLOSE_APP = "1"
  CODE_GAME_OVER = "2"
  CODE_EXPIRE = "3"
  CODE_EXPIRE_SOON = "4"
  CODE_TETRIS_CLEARED_ROW = "10"
  CODE_SNAKE_ATE_APPLE = "11"

  socket: WebSocket;
  interruptedApp: Boolean = false;

  retryCounter = 0;
  externalClause: Boolean;

  keepAliveSender: Subscription;

  pixelsDown: String = "";


  constructor(private alertCtrl: AlertController, public vibration: Vibration, public tranlation: TranslateService,
    public toastCtrl: ToastController, public localStorage: LocalStorageProvider, public appProvider: DataFAppsProvider) {
  }

  initSocket(navCtrl) {
    this.externalClause = false;
    this.socket = new WebSocket(`${environment.webSocketAdress}`);

    let self = this;
    this.socket.onmessage = message => self.handleMessage(message, navCtrl);

    this.socket.onopen = function () {
      self.retryCounter = 0
    }

    this.socket.onerror = function () {
      if (self.retryCounter < 3) {
        self.retryCounter += 1;
        setTimeout(() => self.initSocket(navCtrl), 300);
      } else {
        throw "Erreur, la connexion websocket a échouée."
      }
    }

    this.keepAliveSender = Observable.interval(5000).subscribe(() => this.sendKeepAlive(), e => console.log(e))
    return this.socket;
  }

  isExternalyClaused(): Boolean {
    return this.externalClause;
  }

  isInterruptedApp(): Boolean {
    return this.interruptedApp;
  }

  resetFlags() {
    this.interruptedApp = false;
  }

  handleMessage(message, navCtrl) {
    let data = JSON.parse(message.data);

    if (data.message == "Pixel down message") {
        console.log("mensagem chego");
        this.pixelsDown = data.code;
    }

    if (data.userid == this.localStorage.getUserId()) {

      if (data.code == this.CODE_GAME_OVER) {
        this.showPopUp("GAME_OVER_TITLE", "GAME_OVER", navCtrl);
        this.vibration.vibrate([100, 100, 100, 100, 1500]);
      } else if (data.code == this.CODE_CLOSE_APP) {
        this.showPopUp("CLOSE_APP_TITLE", "GET_OUT", navCtrl);
        this.vibration.vibrate([100, 100, 100, 100, 600]);
        this.interruptedApp = true;
      } else if (data.code == this.CODE_EXPIRE) {
        this.showPopUp("CODE_EXPIRE_TITLE", "EXPIRE", navCtrl);
        this.vibration.vibrate([100, 100, 100, 100, 1500]);
      } else if (data.code == this.CODE_EXPIRE_SOON) {
        this.showToast("EXPIRE_SOON");
      } else if (data.code == this.CODE_TETRIS_CLEARED_ROW) {
        this.vibration.vibrate([100, 100, 100]);
      } else if (data.code == this.CODE_SNAKE_ATE_APPLE) {
        this.vibration.vibrate(100);
      } else {
        this.showPopUp("UNKNOWN_CODE_TITLE", "UNKNOWN_MESSAGE", navCtrl);
      }
    }
  }

  showToast(messageKey) {
    let content = this.getTranslation(messageKey);

    let toast = this.toastCtrl.create({
      message: content,
      duration: 4000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
    this.vibration.vibrate([100, 100, 100, 100, 600]);
  }

  showPopUp(titleKey, messageKey, navCtrl) {
    this.socket.close();

    this.externalClause = true;

    let popUp = this.alertCtrl.create({
      title: this.getTranslation(titleKey),
      message: this.getTranslation(messageKey),
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Ok',
        handler: () => {
          popUp.dismiss().then(() => {
            navCtrl.pop();
          });
          return false;
        }
      }]
    });

    popUp.present();
  }

  getTranslation(key) {
    let content = "";
    this.tranlation.get(key).subscribe(t => {
      content = t;
    });

    return content;
  }

  send(message) {
    this.socket.send(message);
  }

  closeSocket() {
    console.log("CALL CLOOOOOSE !!!!!!!")
    this.socket.close();
  }

  sendKeepAlive() {
    this.appProvider.sendKeepAlive();
    return true;
  }

  stopKeepAliveSender() {
    if (this.keepAliveSender) {
      this.keepAliveSender.unsubscribe()
      this.keepAliveSender = undefined;
    }
  }





  // i dont know if it's the right way to do it, but right now i just want it
  // to work
  getPixelsDown() {
      if (this.pixelsDown != "") {
          let down = this.pixelsDown;
          this.pixelsDown = "";
          console.log("From websocket :")
          console.log(down);
          console.log(typeof(down));
          return down;
      }
      else {
          return "-1";
      }
  }
}
