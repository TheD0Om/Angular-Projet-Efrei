import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <form class="bg-white shadow rounded p-6 w-full max-w-md" [formGroup]="form" (ngSubmit)="onSubmit()">
      <h1 class="text-2xl font-bold mb-4">Connexion</h1>

      <label class="block text-sm font-medium mb-1">Email</label>
      <input class="w-full border rounded p-2 mb-2" formControlName="email" type="email" />
      @if (form.controls.email.invalid && (form.controls.email.dirty || form.controls.email.touched)) {
        <p class="text-sm text-red-600 mb-2">Email invalide</p>
      }

      <label class="block text-sm font-medium mb-1">Mot de passe</label>
      <input class="w-full border rounded p-2 mb-2" formControlName="password" type="password" />
      @if (form.controls.password.invalid && (form.controls.password.dirty || form.controls.password.touched)) {
        <p class="text-sm text-red-600 mb-2">Minimum 6 caractères</p>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 p-2 rounded mb-2">
          {{ error() }}
        </div>
      }

      <button class="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50" [disabled]="form.invalid || loading()">
        @if (loading()) {
          <span class="animate-spin mr-2 inline-block w-4 h-4 border-b-2 border-white rounded-full"></span>
        }
        Se connecter
      </button>

      <p class="text-sm mt-3">
        Pas de compte ?
        <a class="text-blue-600 underline" routerLink="/auth/register">Créer un compte</a>
      </p>
    </form>
  </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private ar = inject(ActivatedRoute);

  loading = signal(false);
  error = signal<string>('');

  // ✅ nonNullable: plus de string | null, donc plus d’erreur de typage
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    // getRawValue() est maintenant { email: string; password: string }
    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password }).subscribe({
      next: (user) => {
        this.loading.set(false);
        const returnUrl = this.ar.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate([user.role === 'admin' ? '/admin' : '/app']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Erreur de connexion');
      }
    });
  }
}
