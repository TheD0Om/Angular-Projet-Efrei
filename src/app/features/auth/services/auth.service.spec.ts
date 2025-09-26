import { TestBed } from '@angular/core/testing';
import { AuthService, LoginRequest, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // isole chaque test du localStorage précédent
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login with valid admin credentials', (done) => {
    const creds: LoginRequest = {
      email: 'alice.admin@boardhub.dev',
      password: 'admin123',
    };
    service.login(creds).subscribe({
      next: (u: User) => {
        expect(u.email).toBe('alice.admin@boardhub.dev');
        expect(u.role).toBe('admin');
        // on ne doit pas exposer le password côté session
        expect((u as any).password).toBeUndefined();
        done();
      },
      error: done.fail,
    });
  });

  it('should fail login with wrong password', (done) => {
    const creds: LoginRequest = {
      email: 'alice.admin@boardhub.dev',
      password: 'bad',
    };
    service.login(creds).subscribe({
      next: () => done.fail('should have errored'),
      error: (err: Error) => {
        expect(err.message).toContain('incorrect');
        done();
      },
    });
  });
});
