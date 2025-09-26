import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password')?.value;
  const c = group.get('confirmPassword')?.value;
  return p && c && p !== c ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <form class="bg-white shadow rounded p-6 w-full max-w-md" [formGroup]="form" (ngSubmit)="onSubmit()">
      <h1 class="text-2xl font-bold mb-4">Créer un compte</h1>

      <label class="block text-sm font-medium mb-1">Nom</label>
      <input class="w-full border rounded p-2 mb-2" formControlName="name" type="text" />
      @if (form.controls.name.invalid && (form.controls.name.dirty || form.controls.name.touched)) {
        <p class="text-sm text-red-600 mb-2">Minimum 2 caractères</p>
      }

      <label class="block text-sm font-medium mb-1">Email</label>
      <input class="w-full border rounded p-2 mb-2" formControlName="email" type="email" />
      @if (form.controls.email.invalid && (form.controls.email.dirty || form.controls.email.touched)) {
        <p class="text-sm text-red-600 mb-2">Email invalide</p>
      }

      <label class="block text-sm font-medium mb-1">Mot de passe</label>
      <input class="w-full border rounded p-2 mb-2" formControlName="password" type="password" />
      <label class="block text-sm font-medium mb-1">Confirmer</label>
      <input class="w-full border rounded p-2 mb-2" formControlName="confirmPassword" type="password" />
      @if (form.errors?.['passwordMismatch'] && (form.dirty || form.touched)) {
        <p class="text-sm text-red-600 mb-2">Les mots de passe ne correspondent pas</p>
      }

      @if (error()) { <div class="bg-red-50 border text-red-700 p-2 rounded mb-2">{{ error() }}</div> }

      <button class="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50" [disabled]="form.invalid || loading()">
        @if (loading()) { <span class="animate-spin mr-2 inline-block w-4 h-4 border-b-2 border-white rounded-full"></span> }
        Créer le compte
      </button>

      <p class="text-sm mt-3">Déjà inscrit ?
        <a class="text-blue-600 underline" routerLink="/auth/login">Se connecter</a>
      </p>
    </form>
  </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string>('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatch });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { name, email, password } = this.form.getRawValue();

    // création locale d’un utilisateur (rôle user par défaut)
    this.auth.createUser({ name: name!, email: email!, password: password!, role: 'user' }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message || 'Erreur lors de la création du compte');
      }
    });
  }
}
