import { Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavController, Platform } from '@ionic/angular';
import { EdgeToEdgeService } from './core/services/edge-to-edge.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: Platform,
          useValue: {
            ready: () => Promise.resolve(),
            backButton: {
              subscribeWithPriority: () => ({ unsubscribe: () => undefined }),
            },
          },
        },
        {
          provide: Location,
          useValue: { isCurrentPathEqualTo: () => false },
        },
        {
          provide: NavController,
          useValue: { back: () => undefined },
        },
        {
          provide: EdgeToEdgeService,
          useValue: {
            initialize: () => Promise.resolve(),
            updateStyleFromTheme: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
