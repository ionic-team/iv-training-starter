import { of } from 'rxjs';

export function createIdentityServiceMock() {
  return jasmine.createSpyObj('IdentityService', {
    get: of(null),
    set: Promise.resolve(),
    remove: Promise.resolve(),
    getToken: Promise.resolve(),
    hasStoredSession: Promise.resolve(),
    getAuthMode: Promise.resolve(),
    restoreSession: Promise.resolve()
  });
}
