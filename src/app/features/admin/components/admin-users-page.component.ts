import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, User, UserRole } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="grid md:grid-cols-3 gap-6">
    <!-- Form -->
    <div class="bg-white rounded-lg shadow p-4">
      <h2 class="font-semibold mb-3" *ngIf="!editingId()">Ajouter un utilisateur</h2>
      <h2 class="font-semibold mb-3" *ngIf="editingId()">Modifier l’utilisateur</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-3">
        <input class="w-full border rounded px-3 py-2" placeholder="Nom" formControlName="name" />
        <input class="w-full border rounded px-3 py-2" placeholder="Email" type="email" formControlName="email" />
        <select class="w-full border rounded px-3 py-2" formControlName="role">
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
        <input class="w-full border rounded px-3 py-2" placeholder="Mot de passe" type="password" formControlName="password" />

        <div class="flex gap-2 pt-2">
          <button [disabled]="form.invalid" class="bg-blue-600 text-white px-4 py-2 rounded">
            {{ editingId() ? 'Mettre à jour' : 'Créer' }}
          </button>
          <button type="button" *ngIf="editingId()" (click)="cancelEdit()" class="px-4 py-2 rounded border">
            Annuler
          </button>
        </div>
        <p class="text-sm text-red-600" *ngIf="error()">{{ error() }}</p>
      </form>
    </div>

    <!-- Liste -->
    <div class="md:col-span-2 bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <h2 class="font-semibold">Liste des utilisateurs</h2>
      </div>
      <div class="divide-y">
        <div class="p-4 flex items-center justify-between" *ngFor="let u of users()">
          <div>
            <p class="font-medium">{{ u.name }} <span class="text-xs px-2 py-0.5 rounded-full ml-2"
              [class]="u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ u.role }}
            </span></p>
            <p class="text-sm text-gray-600">{{ u.email }}</p>
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 border rounded" (click)="startEdit(u)">Modifier</button>
            <button class="px-3 py-1 bg-red-600 text-white rounded" (click)="remove(u)">Supprimer</button>
          </div>
        </div>
        <div *ngIf="users().length === 0" class="p-4 text-sm text-gray-500">Aucun utilisateur</div>
      </div>
    </div>
  </div>
  `,
})
export class AdminUsersPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  users = signal<User[]>([]);
  error = signal<string>('');
  editingId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: <UserRole>'user',
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    this.auth.listUsers().subscribe(u => this.users.set(u));
  }

  onSubmit() {
    this.error.set('');
    const value = this.form.getRawValue();
    if (this.editingId()) {
      this.auth.updateUser(this.editingId()!, {
        name: value.name,
        email: value.email,
        role: value.role,
        ...(value.password ? { password: value.password } : {}),
      }).subscribe({
        next: () => { this.cancelEdit(); this.refresh(); },
        error: e => this.error.set(e.message || 'Erreur MAJ utilisateur'),
      });
    } else {
      this.auth.createUser(value as any).subscribe({
        next: () => { this.form.reset({ name:'', email:'', role:'user', password:'' }); this.refresh(); },
        error: e => this.error.set(e.message || 'Erreur création utilisateur'),
      });
    }
  }

  startEdit(u: User) {
    this.editingId.set(u.id);
    this.form.reset({
      name: u.name,
      email: u.email,
      role: u.role,
      password: '',
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.form.reset({ name:'', email:'', role:'user', password:'' });
  }

  remove(u: User) {
    if (!confirm(`Supprimer ${u.name} ?`)) return;
    this.auth.deleteUser(u.id).subscribe(() => this.refresh());
  }
}
