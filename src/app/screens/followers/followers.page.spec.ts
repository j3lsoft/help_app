import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowersPage } from './followers.page';

describe('FollowersPage', () => {
  let component: FollowersPage;
  let fixture: ComponentFixture<FollowersPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FollowersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
