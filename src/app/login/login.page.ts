import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email: string;
  password: string;
  errorMessage: string;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController
  ) {}

  signInClicked() {
    this.authentication.login(this.email, this.password).subscribe((success: boolean) => {
      this.password = '';
      if (success) {
        this.email = '';
        this.errorMessage = '';
        this.navController.navigateRoot('/tea-categories');
      } else {
        this.errorMessage = 'Invalid e-mail address or password';
      }
    });
  }
}
