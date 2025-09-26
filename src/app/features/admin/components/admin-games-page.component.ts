// src/app/features/admin/components/admin-games-page.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { GamesService } from '../../app/services/games.service'; // même service que côté users
import { Game, Platform } from '../../app/models/game.model';

@Component({
  selector: 'app-admin-games-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-5xl p-4">
      <h1 class="text-2xl font-semibold mb-4">Gestion des jeux</h1>

      <form (ngSubmit)="onSubmit()" [formGroup]="form" class="grid gap-3 mb-6">
        <div class="grid gap-1">
          <label class="text-sm font-medium">Titre</label>
          <input type="text" formControlName="title" class="border rounded px-3 py-2" placeholder="Ex: Celeste" />
          @if (form.controls.title.invalid && (form.controls.title.dirty || form.controls.title.touched)) {
            <small class="text-red-600">Titre requis (≥ 2 caractères)</small>
          }
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Plateforme</label>
          <select formControlName="platform" class="border rounded px-3 py-2">
            <option value="PC">PC</option>
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox">Xbox</option>
            <option value="Switch">Switch</option>
          </select>
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Genre</label>
          <input type="text" formControlName="genre" class="border rounded px-3 py-2" placeholder="Ex: Platformer" />
          @if (form.controls.genre.invalid && (form.controls.genre.dirty || form.controls.genre.touched)) {
            <small class="text-red-600">Genre requis</small>
          }
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Prix (€)</label>
          <input type="number" step="0.01" min="0" formControlName="price" class="border rounded px-3 py-2" />
          @if (form.controls.price.invalid && (form.controls.price.dirty || form.controls.price.touched)) {
            <small class="text-red-600">Prix valide requis</small>
          }
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Description</label>
          <textarea formControlName="description" rows="3" class="border rounded px-3 py-2" placeholder="Courte description..."></textarea>
          @if (form.controls.description.invalid && (form.controls.description.dirty || form.controls.description.touched)) {
            <small class="text-red-600">Description requise</small>
          }
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Date de sortie</label>
          <input type="date" formControlName="releasedAt" class="border rounded px-3 py-2" />
        </div>

        <div class="flex gap-2">
          <button
            class="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
            [disabled]="form.invalid"
            type="submit">
            {{ editingId() ? 'Mettre à jour' : 'Ajouter' }}
          </button>
          @if (editingId() !== null) {
            <button type="button" class="px-4 py-2 rounded border" (click)="cancelEdit()">Annuler</button>
          }
        </div>
      </form>

      <div class="border-t pt-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Liste des jeux</h2>
          <span class="text-sm text-gray-600">{{ count() }} jeu(x)</span>
        </div>

        <div class="grid gap-2">
          @for (g of games(); track g.id) {
            <div class="flex items-center justify-between border rounded px-3 py-2">
              <div class="flex flex-col">
                <span class="font-medium">{{ g.title }}</span>
                <small class="text-gray-600">
                  {{ g.platform }} • {{ g.genre }} • {{ g.releasedAt ?? 'N/C' }} • {{ g.price | number:'1.2-2' }} €
                </small>
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1 rounded border" (click)="startEdit(g)">Modifier</button>
                <button class="px-3 py-1 rounded bg-red-600 text-white" (click)="remove(g.id)">Supprimer</button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AdminGamesPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly gamesSvc = inject(GamesService);

  // Liste
  readonly games = signal<Game[]>([]);
  readonly count = computed(() => this.games().length);

  // Édition
  readonly editingId = signal<number | null>(null);

  // Form (releasedAt en string | undefined; description non-nullable dans le form)
  readonly form = this.fb.group({
    title:       this.fb.nonNullable.control<string>('', [Validators.required, Validators.minLength(2)]),
    platform:    this.fb.nonNullable.control<Platform>('PC', [Validators.required]),
    genre:       this.fb.nonNullable.control<string>('', [Validators.required]),
    price:       this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    description: this.fb.nonNullable.control<string>('', [Validators.required]),
    releasedAt:  this.fb.control<string | undefined>(undefined),
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.gamesSvc.list().subscribe(items => this.games.set(items));
  }

  startEdit(g: Game): void {
    this.editingId.set(g.id);
    this.form.setValue({
      title: g.title,
      platform: g.platform,
      genre: g.genre,
      price: g.price,
      description: g.description ?? '',           // fallback string
      releasedAt: g.releasedAt ?? undefined,      // pas de null
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      platform: 'PC',
      genre: '',
      price: 0,
      description: '',
      releasedAt: undefined
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: Omit<Game, 'id'> = {
      title: raw.title!.trim(),
      platform: raw.platform!,
      genre: raw.genre!.trim(),
      price: raw.price!,
      description: raw.description!.trim(),
      releasedAt: raw.releasedAt && raw.releasedAt !== '' ? raw.releasedAt : undefined, // <- undefined pas null
    };

    if (this.editingId() !== null) {
      // update: Partial<Omit<Game,'id'>> est compatible avec dto
      this.gamesSvc.update(this.editingId()!, dto).subscribe(() => {
        this.cancelEdit();
        this.refresh();
      });
    } else {
      this.gamesSvc.create(dto).subscribe(() => {
        this.cancelEdit();
        this.refresh();
      });
    }
  }

  remove(id: number): void {
    this.gamesSvc.delete(id).subscribe(() => this.refresh());
  }
}
