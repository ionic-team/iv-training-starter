import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { AuthenticationService } from '../services/authentication/authentication.service';
import { IdentityService } from '../services/identity/identity.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  email: string;
  password: string;
  errorMessage: string;
  unlockIcon: string;
  displayVaultLogin: boolean;

  constructor(
    private authentication: AuthenticationService,
    private identity: IdentityService,
    private navController: NavController
  ) {}

  ngOnInit(): Promise<void> {
    return this.initLoginType();
  }

  signInClicked() {
    this.authentication.login(this.email, this.password).subscribe((success: boolean) => {
      this.password = '';
      if (success) {
        this.email = '';
        this.errorMessage = '';
        this.goToApp();
      } else {
        this.errorMessage = 'Invalid e-mail address or password';
      }
    });
  }

  async unlockClicked(): Promise<void> {
    const session = await this.identity.restoreSession();
    if (session && session.token) {
      this.goToApp();
      return;
    }

    alert('Unable to authenticate. Please log in again');
  }

  private goToApp() {
    this.navController.navigateRoot('/tea-categories');
  }

  private async initLoginType(): Promise<void> {
    if (await this.identity.hasStoredSession()) {
      this.displayVaultLogin = true;
      const authMode = await this.identity.getAuthMode();
      switch (authMode) {
        case AuthMode.BiometricOnly:
          this.unlockIcon = 'finger-print';
          break;
        case AuthMode.PasscodeOnly:
          this.unlockIcon = 'unlock';
          break;
      }
    } else {
      this.displayVaultLogin = false;
      this.unlockIcon = '';
    }
  }
}
