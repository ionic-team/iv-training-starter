import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Storage } from '@ionic/storage';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private tokenKey = 'auth-token';
  private token: string;
  private user: User;

  changed: Subject<User>;

  constructor(private http: HttpClient, private storage: Storage) {
    this.changed = new Subject();
  }

  async set(user: User, token: string): Promise<void> {
    this.user = user;
    await this.setToken(token);
    this.changed.next(this.user);
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
      await this.storage.ready();
      this.token = await this.storage.get(this.tokenKey);
    }
    return this.token;
  }

  async remove(): Promise<void> {
    this.user = undefined;
    await this.setToken('');
    this.changed.next(this.user);
  }

  private async setToken(token: string): Promise<void> {
    this.token = token;
    await this.storage.ready();
    if (token) {
      this.storage.set(this.tokenKey, token);
    } else {
      this.storage.remove(this.tokenKey);
    }
  }
}
