import { Component } from '@angular/core';

import { Plugins, StatusBarStyle } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(platform: Platform) {
    console.log(platform.platforms());
    this.initializeApp();
  }

  async initializeApp() {
    const { SplashScreen, StatusBar } = Plugins;
    try {
      await SplashScreen.hide();
      await StatusBar.setStyle({ style: StatusBarStyle.Light });
    } catch (err) {
      console.log('This is normal in a browser', err);
    }
  }
}
