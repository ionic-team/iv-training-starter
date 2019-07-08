import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Platform, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import {
  createPlatformMock,
  createStorageMock,
  createNavControllerMock,
  createOverlayElementMock,
  createOverlayControllerMock
} from '../../../../test/mocks';
import { environment } from '../../../environments/environment';
import { IdentityService } from './identity.service';
import { PinDialogComponent } from '../../pin-dialog/pin-dialog.component';
import { User } from '../../models/user';

describe('IdentityService', () => {
  let httpTestingController: HttpTestingController;
  let modal;
  let identity: IdentityService;

  beforeEach(() => {
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IdentityService,
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('ModalController', modal)
        },
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: Platform, useFactory: createPlatformMock },
        { provide: Storage, useFactory: createStorageMock }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
  });

  beforeEach(inject([IdentityService], (service: IdentityService) => {
    identity = service;
  }));

  it('injects', () => {
    expect(identity).toBeTruthy();
  });

  describe('get', () => {
    it('gets the user', () => {
      identity.get().subscribe(u =>
        expect(u).toEqual({
          id: 42,
          firstName: 'Douglas',
          lastName: 'Adams',
          email: 'thank.you@forthefish.com'
        })
      );
      const req = httpTestingController.expectOne(`${environment.dataService}/users/current`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'thank.you@forthefish.com'
      });
      httpTestingController.verify();
    });

    it('caches the user', () => {
      identity.get().subscribe(u =>
        expect(u).toEqual({
          id: 42,
          firstName: 'Douglas',
          lastName: 'Adams',
          email: 'thank.you@forthefish.com'
        })
      );
      const req = httpTestingController.expectOne(`${environment.dataService}/users/current`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'thank.you@forthefish.com'
      });
      httpTestingController.verify();
      identity.get().subscribe(u =>
        expect(u).toEqual({
          id: 42,
          firstName: 'Douglas',
          lastName: 'Adams',
          email: 'thank.you@forthefish.com'
        })
      );
      httpTestingController.verify();
    });
  });

  describe('set', () => {
    const user: User = {
      id: 314159,
      firstName: 'Sherry',
      lastName: 'Pigh',
      email: 'alamode@test.org'
    };

    it('sets the user, caching it', async () => {
      await identity.set(user, 'IAmToken');
      identity.get().subscribe(u => expect(u).toEqual(user));
      httpTestingController.verify();
    });

    it('calls the base login method', async () => {
      spyOn(identity, 'login');
      await identity.set(user, 'IAmToken');
      expect(identity.login).toHaveBeenCalledTimes(1);
    });

    it('uses biometrics if available', async () => {
      spyOn(identity, 'isBiometricsAvailable').and.returnValue(Promise.resolve(true));
      spyOn(identity, 'login');
      await identity.set(user, 'IAmToken');
      expect(identity.login).toHaveBeenCalledWith(
        { username: user.email, token: 'IAmToken' },
        AuthMode.BiometricOnly
      );
    });

    it('uses passcode if biometrics is not available', async () => {
      spyOn(identity, 'isBiometricsAvailable').and.returnValue(Promise.resolve(false));
      spyOn(identity, 'login');
      await identity.set(user, 'IAmToken');
      expect(identity.login).toHaveBeenCalledWith(
        { username: user.email, token: 'IAmToken' },
        AuthMode.PasscodeOnly
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      identity.get().subscribe();
      const req = httpTestingController.expectOne(`${environment.dataService}/users/current`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'thank.you@forthefish.com'
      });
      httpTestingController.verify();
    });

    it('remove the user from the cache (thus forcing a GET on the next get())', async () => {
      identity.get().subscribe();
      httpTestingController.verify();
      await identity.remove();
      identity.get().subscribe();
      const req = httpTestingController.expectOne(`${environment.dataService}/users/current`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'thank.you@forthefish.com'
      });
      httpTestingController.verify();
    });

    it('calls the logout method', async () => {
      spyOn(identity, 'logout');
      await identity.remove();
      expect(identity.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('getToken', () => {
    beforeEach(() => {
      spyOn(identity, 'restoreSession').and.callFake(async () => {
        (identity as any).session = { username: 'meh', token: 'dude' };
        return (identity as any).session;
      });
    });

    it('it restores the session and returns the restored token if there is no token', async () => {
      const token = await identity.getToken();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
      expect(token).toEqual('dude');
    });

    it('it returns the token from the current session if there is one', async () => {
      (identity as any).session = { username: 'blah', token: 'fubbily-doo-dah' };
      const token = await identity.getToken();
      expect(identity.restoreSession).not.toHaveBeenCalled();
      expect(token).toEqual('fubbily-doo-dah');
    });
  });

  describe('onPasscodeRequest', () => {
    beforeEach(() => {
      modal.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    });

    [true, false].forEach(setPasscode => {
      it(`creates a PIN dialog, setting passcode: ${setPasscode}`, async () => {
        const modalController = TestBed.get(ModalController);
        await identity.onPasscodeRequest(setPasscode);
        expect(modalController.create).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledWith({
          backdropDismiss: false,
          component: PinDialogComponent,
          componentProps: {
            setPasscodeMode: setPasscode
          }
        });
      });
    });

    it('presents the modal', async () => {
      await identity.onPasscodeRequest(false);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('resolves to the PIN', async () => {
      modal.onDidDismiss.and.returnValue(Promise.resolve({ data: '4203', role: 'OK' }));
      expect(await identity.onPasscodeRequest(true)).toEqual('4203');
    });

    it('resolves to an empty string if the PIN is undefined', async () => {
      expect(await identity.onPasscodeRequest(true)).toEqual('');
    });
  });

  describe('onVaultLocked', () => {
    it('redirects to the login page', () => {
      const navController = TestBed.get(NavController);
      identity.onVaultLocked();
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(['login']);
    });
  });
});
