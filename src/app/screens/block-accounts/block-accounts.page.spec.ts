import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BlockAccountsPage } from './block-accounts.page';

describe('BlockAccountsPage', () => {
  let component: BlockAccountsPage;
  let fixture: ComponentFixture<BlockAccountsPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(BlockAccountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
