import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { EdgeToEdgeService } from './core/services/edge-to-edge.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: Platform,
          useValue: {
            ready: () => Promise.resolve(),
            backButton: {
              subscribeWithPriority: () => ({ unsubscribe: () => undefined }),
            },
          },
        },
        { provide: Location, useValue: { isCurrentPathEqualTo: () => false } },
        { provide: NavController, useValue: { back: () => undefined } },
        {
          provide: EdgeToEdgeService,
          useValue: {
            initialize: () => Promise.resolve(),
            updateStyleFromTheme: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
