import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // seulement côté local (jamais exposé)
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

const DEFAULT_USERS: User[] = [
  { id: 1, name: 'Alice Admin',   email: 'alice.admin@boardhub.dev',  role: 'admin', password: 'admin123' },
  { id: 2, name: 'Bob Admin',     email: 'bob.admin@boardhub.dev',    role: 'admin', password: 'admin123' },
  { id: 3, name: 'Charlie User',  email: 'charlie.user@boardhub.dev', role: 'user',  password: 'user123'  },
  { id: 4, name: 'Diane User',    email: 'diane.user@boardhub.dev',   role: 'user',  password: 'user123'  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  // store local des users, source de vérité
  private _users = signal<User[]>([]);
  readonly users$ = this._users.asReadonly();

  private _current = signal<User | null>(null);
  readonly currentUser$ = this._current.asReadonly();

  constructor() {
    // Charger éventuels utilisateurs du storage
    const savedUsers = localStorage.getItem(STORAGE_USERS_KEY);
    if (!savedUsers) {
      // seed initial propre
      this._users.set(DEFAULT_USERS.map(u => this.normalizeUser(u)));
    } else {
      const parsed: User[] = JSON.parse(savedUsers);

      // Normalisation + backfill des passwords si manquants
      const migrated = parsed.map(u => {
        const normalized = this.normalizeUser(u);
        if (!normalized.password) {
          const match = DEFAULT_USERS.find(d => d.email.toLowerCase() === normalized.email.toLowerCase());
          return match ? { ...normalized, password: match.password } : normalized;
        }
        return normalized;
      });

      this._users.set(migrated.length ? migrated : DEFAULT_USERS.map(u => this.normalizeUser(u)));
    }

    // Restituer la session si présente
    const savedCurrent = localStorage.getItem(STORAGE_CURRENT_KEY);
    if (savedCurrent) {
      const u = JSON.parse(savedCurrent) as User;
      // on normalise et on ne remet pas le password en mémoire session
      const normalized = this.normalizeUser(u);
      this._current.set({ ...normalized, password: undefined });
    }

    // Persistance automatique
    effect(() => {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this._users()));
    });
    effect(() => {
      const user = this._current();
      if (user) localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_CURRENT_KEY);
    });
  }

  // ===== Helpers =====
  private normalizeEmail(email: string): string {
    return (email ?? '').trim().toLowerCase();
  }

  private normalizeUser(u: User): User {
    return {
      ...u,
      name: (u.name ?? '').trim(),
      email: this.normalizeEmail(u.email),
      role: u.role,
      password: u.password ? u.password.trim() : u.password,
    };
  }

  /** Backfill des passwords manquants depuis DEFAULT_USERS (si storage ancien) */
  private migrateMissingPasswords(): void {
    const byEmail = new Map(
      DEFAULT_USERS.map(u => [this.normalizeEmail(u.email), u.password ?? ''])
    );
    let changed = false;
    const fixed = this._users().map(u => {
      if (!u.password) {
        const pw = byEmail.get(this.normalizeEmail(u.email));
        if (pw) {
          changed = true;
          return { ...u, password: pw };
        }
      }
      return u;
    });
    if (changed) this._users.set(fixed);
  }

  // ===== Lecture état =====
  isAuthenticated(): boolean {
    return !!this._current();
  }

  getCurrentUser(): User | null {
    return this._current();
  }

  readonly isAdmin = computed(() => this._current()?.role === 'admin');

  getToken(): string | null {
    const user = this._current();
    return user ? `mock-token-${user.id}` : null; // mock token (remplaçable par un vrai JWT plus tard)
  }

  // ===== Auth =====
  login(credentials: LoginRequest): Observable<User> {
    const email = this.normalizeEmail(credentials.email);
    const password = (credentials.password ?? '').trim();

    // tentative 1
    let user = this._users().find(
      u => this.normalizeEmail(u.email) === email && (u.password ?? '') === password
    );

    // tentative 2 (si storage ancien sans password)
    if (!user) {
      this.migrateMissingPasswords();
      user = this._users().find(
        u => this.normalizeEmail(u.email) === email && (u.password ?? '') === password
      );
    }

    if (!user) {
      return throwError(() => new Error('Email ou mot de passe incorrect'));
    }

    const sessionUser = { ...user, password: undefined };
    this._current.set(sessionUser);
    return of(sessionUser).pipe(delay(400));
  }

  register(data: RegisterRequest): Observable<User> {
    const name = (data.name ?? '').trim();
    const email = this.normalizeEmail(data.email);
    const password = (data.password ?? '').trim();

    // vérifier l’unicité de l’email
    if (this._users().some(u => this.normalizeEmail(u.email) === email)) {
      return throwError(() => new Error('Cet email est déjà utilisé'));
    }

    // créer un user standard par défaut
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role: 'user',
      password,
    };

    this._users.update(arr => [...arr, newUser]);

    // connexion auto après inscription
    const sessionUser = { ...newUser, password: undefined };
    this._current.set(sessionUser);

    return of(sessionUser).pipe(delay(400));
  }

  logout(): void {
    this._current.set(null);
  }

  // ===== CRUD Users (utilisé par l’admin) =====
  listUsers(): Observable<User[]> {
    // ne pas exposer les mots de passe
    const clean = this._users().map(u => ({ ...u, password: undefined }));
    return of(clean).pipe(delay(200));
  }

  createUser(data: Omit<User, 'id'>): Observable<User> {
    const normalized: Omit<User, 'id'> = {
      ...data,
      name: (data.name ?? '').trim(),
      email: this.normalizeEmail(data.email),
      password: data.password ? data.password.trim() : data.password,
      role: data.role,
    };
    if (this._users().some(u => this.normalizeEmail(u.email) === normalized.email)) {
      return throwError(() => new Error('Cet email est déjà utilisé'));
    }
    const newUser: User = { ...normalized, id: Date.now() };
    this._users.update(arr => [...arr, newUser]);
    const clean = { ...newUser, password: undefined };
    return of(clean).pipe(delay(200));
  }

  updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Observable<User> {
    let updated: User | undefined;
    this._users.update(arr =>
      arr.map(u => {
        if (u.id !== id) return u;
        const next: User = {
          ...u,
          ...updates,
          name: updates.name !== undefined ? (updates.name ?? '').trim() : u.name,
          email: updates.email !== undefined ? this.normalizeEmail(updates.email) : u.email,
          password:
            updates.password !== undefined
              ? (updates.password ? updates.password.trim() : updates.password)
              : u.password,
        };
        updated = next;
        return next;
      })
    );
    if (!updated) return throwError(() => new Error('Utilisateur introuvable'));

    const clean = { ...updated, password: undefined };

    // si on a modifié l'utilisateur courant, on rafraîchit la session
    if (this._current()?.id === id) this._current.set(clean);

    return of(clean).pipe(delay(200));
  }

  deleteUser(id: number): Observable<void> {
    this._users.update(arr => arr.filter(u => u.id !== id));
    // si on supprime l’utilisateur courant → logout
    if (this._current()?.id === id) this.logout();
    return of(void 0).pipe(delay(200));
  }

  // ===== Utils Dev =====
  /** Réinitialise le seed (utile si storage corrompu pendant le dev) */
  resetSeed(): void {
    this._users.set(DEFAULT_USERS.map(u => this.normalizeUser(u)));
    this._current.set(null);
  }
}
