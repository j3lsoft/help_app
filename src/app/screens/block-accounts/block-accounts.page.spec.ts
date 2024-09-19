import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockAccountsPage } from './block-accounts.page';

describe('BlockAccountsPage', () => {
  let component: BlockAccountsPage;
  let fixture: ComponentFixture<BlockAccountsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BlockAccountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
