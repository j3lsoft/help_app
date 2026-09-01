import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HelpDetailPage } from './help-detail.page';

describe('HelpDetailPage', () => {
  let component: HelpDetailPage;
  let fixture: ComponentFixture<HelpDetailPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(HelpDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
