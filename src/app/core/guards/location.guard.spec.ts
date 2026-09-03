import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { locationGuard } from './location.guard';

describe('locationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => locationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
