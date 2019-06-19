import { of } from 'rxjs';

export function createIdentityServiceMock() {
  return jasmine.createSpyObj('IdentityService', {
    get: of(null),
    set: undefined,
    remove: undefined,
    setToken: Promise.resolve(),
    getToken: Promise.resolve()
  });
}
