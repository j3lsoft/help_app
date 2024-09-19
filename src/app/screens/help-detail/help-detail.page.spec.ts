import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpDetailPage } from './help-detail.page';

describe('HelpDetailPage', () => {
  let component: HelpDetailPage;
  let fixture: ComponentFixture<HelpDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HelpDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
