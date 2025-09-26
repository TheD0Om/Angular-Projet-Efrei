import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { GameDetailComponent } from './game-detail.component';
import { GamesService } from '../services/games.service';
import { Game } from '../models/game.model';
import { ActivatedRoute } from '@angular/router';

describe('GameDetailComponent (integration)', () => {
  let fixture: ComponentFixture<GameDetailComponent>;

  const mockGame: Game = {
    id: 999,
    title: 'Integration Test Game',
    platform: 'PC',
    genre: 'Test',
    price: 12.34,
    description: 'A mocked game',
    releasedAt: '2024-02-02'
  };

  const gamesMock = {
    getById: jasmine.createSpy('getById').and.returnValue(of(mockGame))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameDetailComponent],
      providers: [
        { provide: GamesService, useValue: gamesMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['id', '999']])),
            snapshot: { paramMap: { get: () => '999' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameDetailComponent);
    fixture.detectChanges();
  });

  it('should render game title from service', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Integration Test Game');
    expect(gamesMock.getById).toHaveBeenCalledWith(999);
  });
});
