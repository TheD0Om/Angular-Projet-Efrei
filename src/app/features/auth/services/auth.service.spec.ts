import { TestBed } from '@angular/core/testing';
import { AuthService, LoginRequest, RegisterRequest } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // sandbox propre
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should login with valid credentials (seed user)', (done) => {
    const creds: LoginRequest = {
      email: 'alice.admin@boardhub.dev',
      password: 'admin123',
    };
    service.login(creds).subscribe({
      next: (u) => {
        expect(u.email).toBe('alice.admin@boardhub.dev');
        expect(u.role).toBe('admin');
        // Vérifie que password n'est pas présent dans l'objet renvoyé
        expect('password' in (u as any)).toBeFalse();
        done();
      },
      error: done.fail,
    });
  });

  it('should reject invalid login', (done) => {
    service.login({ email: 'wrong@mail.dev', password: 'bad' }).subscribe({
      next: () => done.fail('expected an error'),
      error: (err: Error) => {
        expect(err.message).toContain('Email ou mot de passe incorrect');
        done();
      },
    });
  });

  it('should register a new user and auto-login', (done) => {
    const req: RegisterRequest = {
      name: 'New User',
      email: 'new.user@boardhub.dev',
      password: 'secret123',
    };
    service.register(req).subscribe({
      next: (u) => {
        expect(u.email).toBe(req.email);
        expect(service.isAuthenticated()).toBeTrue();
        expect(service.isAdmin()).toBeFalse();
        done();
      },
      error: done.fail,
    });
  });

  it('should compute isAdmin based on current user', (done) => {
    service.login({ email: 'alice.admin@boardhub.dev', password: 'admin123' }).subscribe({
      next: () => {
        expect(service.isAdmin()).toBeTrue();
        service.logout();
        expect(service.isAdmin()).toBeFalse();
        done();
      },
      error: done.fail,
    });
  });
});
