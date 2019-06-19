import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Storage } from '@ionic/storage';

import { createStorageMock } from '../../../../test/mocks';
import { environment } from '../../../environments/environment';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let httpTestingController: HttpTestingController;
  let identity: IdentityService;
  let storage;

  beforeEach(() => {
    storage = createStorageMock();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IdentityService, { provide: Storage, useValue: storage }]
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
    it('sets the user, caching it', () => {
      identity.set({
        id: 314159,
        firstName: 'Sherry',
        lastName: 'Pigh',
        email: 'alamode@test.org'
      });
      identity.get().subscribe(u =>
        expect(u).toEqual({
          id: 314159,
          firstName: 'Sherry',
          lastName: 'Pigh',
          email: 'alamode@test.org'
        })
      );
      httpTestingController.verify();
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

    it('remove the user from the cache (thus forcing a GET on the next get())', () => {
      identity.get().subscribe();
      httpTestingController.verify();
      identity.remove();
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
  });

  describe('token', () => {
    describe('setting', () => {
      it('waits for the storage to be ready', () => {
        identity.setToken('IAmAToken');
        expect(storage.ready).toHaveBeenCalledTimes(1);
      });

      it('sets the token', async () => {
        await identity.setToken('IAmAToken');
        expect(storage.remove).not.toHaveBeenCalled();
        expect(storage.set).toHaveBeenCalledTimes(1);
        expect(storage.set).toHaveBeenCalledWith('auth-token', 'IAmAToken');
      });

      it('clears the token', async () => {
        await identity.setToken('');
        expect(storage.set).not.toHaveBeenCalled();
        expect(storage.remove).toHaveBeenCalledTimes(1);
        expect(storage.remove).toHaveBeenCalledWith('auth-token');
      });

      it('caches the token', async () => {
        await identity.setToken('IAmAToken');
        expect(await identity.getToken()).toEqual('IAmAToken');
        expect(storage.get).not.toHaveBeenCalled();
      });
    });

    describe('getting', () => {
      it('waits for the storage to be ready', () => {
        identity.getToken();
        expect(storage.ready).toHaveBeenCalledTimes(1);
      });

      it('gets the stored token', async () => {
        await identity.getToken();
        expect(storage.get).toHaveBeenCalledTimes(1);
        expect(storage.get).toHaveBeenCalledWith('auth-token');
      });

      it('returns the stored token', async () => {
        storage.get.and.returnValue(Promise.resolve('ThisIsAToken'));
        expect(await identity.getToken()).toEqual('ThisIsAToken');
      });

      it('caches the token', async () => {
        storage.get.and.returnValue(Promise.resolve('ThisIsAToken'));
        await identity.getToken();
        expect(await identity.getToken()).toEqual('ThisIsAToken');
        expect(storage.get).toHaveBeenCalledTimes(1);
      });
    });
  });
});
