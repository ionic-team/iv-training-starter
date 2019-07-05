import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { of } from 'rxjs';

import { AuthenticationService } from '../services/authentication/authentication.service';
import { IdentityService } from '../services/identity/identity.service';
import { LoginPage } from './login.page';

import { createAuthenticationServiceMock } from '../services/authentication/authentication.service.mock';
import { createNavControllerMock } from '../../../test/mocks';
import { createIdentityServiceMock } from '../services/identity/identity.service.mock';

describe('LoginPage', () => {
  let authentication;
  let navController;

  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async(() => {
    authentication = createAuthenticationServiceMock();
    navController = createNavControllerMock();
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [FormsModule, IonicModule],
      providers: [
        { provide: AuthenticationService, useValue: authentication },
        { provide: IdentityService, useFactory: createIdentityServiceMock },
        { provide: NavController, useValue: navController }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('init', () => {
    describe('without a stored session', () => {
      let identity;
      beforeEach(() => {
        identity = TestBed.get(IdentityService);
        identity.hasStoredSession.and.returnValue(Promise.resolve(false));
      });

      it('sets unlockIcon to an empty string', async () => {
        await component.ngOnInit();
        expect(component.unlockIcon).toEqual('');
      });

      it('sets displayVaultLogin to false', async () => {
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(false);
      });
    });

    describe('with a stored session', () => {
      let identity;
      beforeEach(() => {
        identity = TestBed.get(IdentityService);
        identity.hasStoredSession.and.returnValue(Promise.resolve(true));
      });

      it('sets displayVaultLogin to true', async () => {
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(true);
      });

      it('sets the unlockIcon to unlock when using passcode', async () => {
        identity.getAuthMode.and.returnValue(Promise.resolve(AuthMode.PasscodeOnly));
        await component.ngOnInit();
        expect(component.unlockIcon).toEqual('unlock');
      });

      it('sets the unlockIcon to finger-print when using biometrics', async () => {
        identity.getAuthMode.and.returnValue(Promise.resolve(AuthMode.BiometricOnly));
        await component.ngOnInit();
        expect(component.unlockIcon).toEqual('finger-print');
      });
    });
  });

  describe('clicking the "Sign in" button', () => {
    it('performs the login', () => {
      component.signInClicked();
      expect(authentication.login).toHaveBeenCalledTimes(1);
    });

    it('passes the entered e-mail and password', () => {
      component.email = 'jimmy@test.org';
      component.password = 'I Crack the Corn';
      component.signInClicked();
      expect(authentication.login).toHaveBeenCalledWith('jimmy@test.org', 'I Crack the Corn');
    });

    describe('on success', () => {
      beforeEach(() => {
        authentication.login.and.returnValue(of(true));
        component.email = 'jimmy@test.org';
        component.password = 'I Crack the Corn';
      });

      it('clears the entered email and password', () => {
        component.signInClicked();
        expect(component.email).toBeFalsy();
        expect(component.password).toBeFalsy();
      });

      it('clears any existing error message', () => {
        component.errorMessage = 'failed to log in';
        component.signInClicked();
        expect(component.errorMessage).toBeFalsy();
      });

      it('navigates to the main page', () => {
        component.signInClicked();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith('/tea-categories');
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        authentication.login.and.returnValue(of(false));
        component.email = 'jimmy@test.org';
        component.password = 'I Crack the Corn';
      });

      it('clears just the password', () => {
        component.signInClicked();
        expect(component.email).toEqual('jimmy@test.org');
        expect(component.password).toBeFalsy();
      });

      it('displays an error message', () => {
        component.signInClicked();
        expect(component.errorMessage).toEqual('Invalid e-mail address or password');
      });

      it('does not navigate', () => {
        component.signInClicked();
        expect(navController.navigateRoot).not.toHaveBeenCalled();
      });
    });
  });

  describe('clicking the "unlock" button', () => {
    it('restores the session', async () => {
      const identity = TestBed.get(IdentityService);
      await component.unlockClicked();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
    });

    it('navigates to the tea-categories page if the session is restored ', async () => {
      const identity = TestBed.get(IdentityService);
      identity.restoreSession.and.returnValue(Promise.resolve({ username: 'test@test.com', token: 'IAmALittleToken' }));
      await component.unlockClicked();
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith('/tea-categories');
    });

    it('does not navigate if a session is not restored', async () => {
      const identity = TestBed.get(IdentityService);
      await component.unlockClicked();
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });

    it('does not navigate if a session is restored but it does not have a token', async () => {
      const identity = TestBed.get(IdentityService);
      identity.restoreSession.and.returnValue(Promise.resolve({ username: 'test@test.com' }));
      await component.unlockClicked();
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });
  });
});
