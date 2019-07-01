import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Platform } from '@ionic/angular';
import {
  AuthMode,
  DefaultSession,
  IonicIdentityVaultUser
} from '@ionic-enterprise/identity-vault';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
  private user: User;

  constructor(private http: HttpClient, platform: Platform ) {
    super(platform, { authMode: AuthMode.SecureStorage });
  }

  async set(user: User, token: string): Promise<void> {
    this.user = user;
    await this.login({ username: user.email, token });
  }

  get(): Observable<User> {
    if (!this.user) {
      return this.http
        .get<User>(`${environment.dataService}/users/current`)
        .pipe(tap(u => (this.user = u)));
    } else {
      return of(this.user);
    }
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      await this.restoreSession();
    }
    return this.token;
  }

  async remove(): Promise<void> {
    this.user = undefined;
    await this.logout();
  }
}
