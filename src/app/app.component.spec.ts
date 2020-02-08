import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { Platform } from '@ionic/angular';

import { AppComponent } from './app.component';
import { createPlatformMock } from 'test/mocks';

describe('AppComponent', () => {
  let originalSplashScreen;
  let originalStatusBar;

  beforeEach(async(() => {
    originalSplashScreen = Plugins.SplashScreen;
    originalStatusBar = Plugins.StatusBar;
    Plugins.StatusBar = jasmine.createSpyObj('StatusBar', ['setStyle', 'setBackgroundColor']);
    Plugins.SplashScreen = jasmine.createSpyObj('SplashScreen', ['hide']);
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: Platform, useFactory: createPlatformMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  afterEach(() => {
    Plugins.StatusBar = originalStatusBar;
    Plugins.SplashScreen = originalSplashScreen;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('initialization', () => {
    describe('as a hybrid mobile app', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform as any).is.withArgs('hybrid').and.returnValue(true);
      });

      it('hides the splash screen', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      }));

      it('sets the status bar style to light', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledTimes(1);
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith({
          style: StatusBarStyle.Light
        });
      }));
    });

    describe('as any app other than hybrid mobile', () => {
      it('does not hide the splash screen', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
      }));

      it('does not set the status bar style', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.StatusBar.setStyle).not.toHaveBeenCalled();
      }));
    });
  });
});
