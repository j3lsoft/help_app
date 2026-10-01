import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AuthService } from '@features/auth/services/auth.service';
import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        {
          provide: AuthService,
          useValue: { logout: jasmine.createSpy('logout') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should propagate the enter lifecycle only when re-entering', () => {
    const element = document.createElement('div');
    const willEnter = jasmine.createSpy('ionViewWillEnter');
    const didEnter = jasmine.createSpy('ionViewDidEnter');
    element.addEventListener('ionViewWillEnter', willEnter);
    element.addEventListener('ionViewDidEnter', didEnter);

    (component as unknown as { tabs: unknown }).tabs = {
      outlet: {
        getActiveStackId: () => 'tab-profile',
        getLastRouteView: () => ({ element }),
      },
    };

    component.ionViewWillEnter();
    expect(willEnter).not.toHaveBeenCalled();
    expect(didEnter).not.toHaveBeenCalled();

    component.ionViewWillEnter();
    expect(willEnter).toHaveBeenCalledTimes(1);
    expect(didEnter).toHaveBeenCalledTimes(1);
  });

  it('should not throw when there is no active view', () => {
    (component as unknown as { tabs: unknown }).tabs = {
      outlet: {
        getActiveStackId: () => undefined,
        getLastRouteView: () => undefined,
      },
    };

    component.ionViewWillEnter();
    expect(() => component.ionViewWillEnter()).not.toThrow();
  });
});
