import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LinkAccountsPage } from './link-accounts.page';

describe('LinkAccountsPage', () => {
  let component: LinkAccountsPage;
  let fixture: ComponentFixture<LinkAccountsPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(LinkAccountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
