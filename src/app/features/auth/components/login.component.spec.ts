import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

class AuthServiceMock {
  login = jasmine.createSpy().and.returnValue(of({
    id: 1, name: 'Mock', email: 'mock@x.dev', role: 'user'
  }));
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: AuthServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth.login on submit when form valid', () => {
    const svc = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    component.form.setValue({ email: 'x@x.dev', password: '123456' });
    component.onSubmit();
    expect(svc.login).toHaveBeenCalled();
  });
});
