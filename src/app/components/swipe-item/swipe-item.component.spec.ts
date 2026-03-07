import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwipeItemComponent } from './swipe-item.component';

describe('SwipeItemComponent', () => {
  let component: SwipeItemComponent;
  let fixture: ComponentFixture<SwipeItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SwipeItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(SwipeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
