import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AccountPrivacyPage } from './account-privacy.page';

describe('AccountPrivacyPage', () => {
  let component: AccountPrivacyPage;
  let fixture: ComponentFixture<AccountPrivacyPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(AccountPrivacyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
