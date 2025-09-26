import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';

class AuthServiceMock {
  register = jasmine.createSpy().and.returnValue(of({
    id: 99, name: 'New', email: 'new@x.dev', role: 'user'
  }));
}

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: AuthServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth.register when form valid and submitted', () => {
    const svc = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    component.form.setValue({
      name: 'John',
      email: 'john@x.dev',
      password: '123456',
      confirmPassword: '123456',
    });
    component.onSubmit();
    expect(svc.register).toHaveBeenCalled();
  });
});
