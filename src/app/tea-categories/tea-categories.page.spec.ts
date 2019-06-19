import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavController } from '@ionic/angular';

import { TeaCategoriesPage } from './tea-categories.page';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { TeaCategoriesService } from '../services/tea-categories/tea-categories.service';

import { createNavControllerMock } from '../../../test/mocks';
import { createAuthenticationServiceMock } from '../services/authentication/authentication.service.mock';
import { createTeaCategoriesServiceMock } from '../services/tea-categories/tea-categories.service.mock';

describe('TeaCategoriesPage', () => {
  let component: TeaCategoriesPage;
  let fixture: ComponentFixture<TeaCategoriesPage>;
  let authentication;
  let navController;
  let teaCategories;

  beforeEach(async(() => {
    authentication = createAuthenticationServiceMock();
    navController = createNavControllerMock();
    teaCategories = createTeaCategoriesServiceMock();
    TestBed.configureTestingModule({
      declarations: [TeaCategoriesPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AuthenticationService, useValue: authentication },
        { provide: NavController, useValue: navController },
        { provide: TeaCategoriesService, useValue: teaCategories }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeaCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
