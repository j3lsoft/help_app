import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { ProfileTab } from '../../models/profile-tab.model';
import { ProfileTabsComponent } from './profile-tabs.component';

describe('ProfileTabsComponent', () => {
  let component: ProfileTabsComponent;
  let fixture: ComponentFixture<ProfileTabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfileTabsComponent],
      providers: [provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileTabsComponent);
    component = fixture.componentInstance;
  }));

  it('should emit the selected tab value on segment change', () => {
    fixture.componentRef.setInput('selectedTab', 'posts');
    fixture.detectChanges();

    let emitted: ProfileTab | undefined;
    component.tabChange.subscribe((tab) => (emitted = tab));

    component.onTabChange({
      detail: { value: 'media' },
    } as unknown as CustomEvent);

    expect(emitted).toBe('media');
  });
});
