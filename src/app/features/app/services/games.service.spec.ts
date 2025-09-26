import { TestBed } from '@angular/core/testing';
import { GamesService } from './games.service';
import { Game } from '../models/game.model';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamesService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('list() should return initial seed', (done) => {
    service.list().subscribe({
      next: (games) => {
        expect(Array.isArray(games)).toBeTrue();
        expect(games.length).toBeGreaterThan(0);
        done();
      },
      error: done.fail
    });
  });

  it('create() then getById() should return created game', (done) => {
    const dto: Omit<Game, 'id'> = {
      title: 'Test Game',
      platform: 'PC',
      genre: 'Indie',
      price: 9.99,
      description: 'Small test game',
      releasedAt: '2024-01-01',
    };
    service.create(dto).subscribe({
      next: (created) => {
        expect(created.id).toBeDefined();
        service.getById(created.id).subscribe({
          next: (g) => {
            expect(g.title).toBe('Test Game');
            done();
          },
          error: done.fail
        });
      },
      error: done.fail
    });
  });

  it('update() should modify an existing game', (done) => {
    service.list().subscribe({
      next: ([first]) => {
        service.update(first.id, { price: 42 }).subscribe({
          next: (updated) => {
            expect(updated.price).toBe(42);
            done();
          },
          error: done.fail
        });
      },
      error: done.fail
    });
  });

  it('delete() should remove a game', (done) => {
    service.list().subscribe({
      next: ([first]) => {
        const id = first.id;
        service.delete(id).subscribe({
          next: () => {
            service.list().subscribe({
              next: (games) => {
                expect(games.find(g => g.id === id)).toBeUndefined();
                done();
              },
              error: done.fail
            });
          },
          error: done.fail
        });
      },
      error: done.fail
    });
  });
});
