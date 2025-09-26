import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // seulement côté local (jamais affiché)
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

const STORAGE_USERS_KEY = 'bh_users';
const STORAGE_CURRENT_KEY = 'bh_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // store local des users, source de vérité
  private _users = signal<User[]>([]);
  users$ = this._users.asReadonly();

  private _current = signal<User | null>(null);
  currentUser$ = this._current.asReadonly();

  constructor() {
    // seed initial si storage vide
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      this._users.set(JSON.parse(saved));
    } else {
      this._users.set([
        { id: 1, name: 'Alice Admin', email: 'alice.admin@boardhub.dev', role: 'admin', password: 'admin123' },
        { id: 2, name: 'Bob Admin',   email: 'bob.admin@boardhub.dev',   role: 'admin', password: 'admin123' },
        { id: 3, name: 'Charlie User',email: 'charlie.user@boardhub.dev',role: 'user',  password: 'user123'  },
        { id: 4, name: 'Diane User',  email: 'diane.user@boardhub.dev',  role: 'user',  password: 'user123'  },
      ]);
    }

    // Restituer la session si présente
    const savedCurrent = localStorage.getItem(STORAGE_CURRENT_KEY);
    if (savedCurrent) this._current.set(JSON.parse(savedCurrent));

    // Effets de persistance
    effect(() => {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this._users()));
    });
    effect(() => {
      const user = this._current();
      if (user) localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_CURRENT_KEY);
    });
  }

  // ===== Auth =====
  login(credentials: LoginRequest): Observable<User> {
    const user = this._users().find(u => u.email === credentials.email && u.password === credentials.password);
    if (!user) return throwError(() => new Error('Email ou mot de passe incorrect'));
    this._current.set({ ...user, password: undefined }); // on masque le mdp en session
    return of({ ...user, password: undefined }).pipe(delay(400));
  }

  logout(): void {
    this._current.set(null);
  }

  getToken(): string | null {
    const user = this._current();
    return user ? `mock-token-${user.id}` : null;
  }

  isAdmin = computed(() => this._current()?.role === 'admin');

  // ===== CRUD Users (utilisé par l’admin) =====
  listUsers(): Observable<User[]> {
    // ne pas exposer les mots de passe
    const clean = this._users().map(u => ({ ...u, password: undefined }));
    return of(clean).pipe(delay(200));
  }

  createUser(data: Omit<User, 'id'>): Observable<User> {
    if (this._users().some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return throwError(() => new Error('Cet email est déjà utilisé'));
    }
    const newUser: User = { ...data, id: Date.now() };
    this._users.update(arr => [...arr, newUser]);
    const clean = { ...newUser, password: undefined };
    return of(clean).pipe(delay(200));
  }

  updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Observable<User> {
    let updated: User | undefined;
    this._users.update(arr => arr.map(u => {
      if (u.id !== id) return u;
      updated = { ...u, ...updates };
      return updated!;
    }));
    if (!updated) return throwError(() => new Error('Utilisateur introuvable'));
    const clean = { ...updated, password: undefined };
    // si on a modifié l'utilisateur courant, on rafraîchit
    if (this._current()?.id === id) this._current.set(clean);
    return of(clean).pipe(delay(200));
  }

  deleteUser(id: number): Observable<void> {
    this._users.update(arr => arr.filter(u => u.id !== id));
    // si on supprime l’utilisateur courant → logout
    if (this._current()?.id === id) this.logout();
    return of(void 0).pipe(delay(200));
  }
}
