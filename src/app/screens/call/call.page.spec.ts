import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CallPage } from './call.page';

describe('CallPage', () => {
  let component: CallPage;
  let fixture: ComponentFixture<CallPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CallPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
