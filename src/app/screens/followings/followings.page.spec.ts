import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowingsPage } from './followings.page';

describe('FollowingsPage', () => {
  let component: FollowingsPage;
  let fixture: ComponentFixture<FollowingsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FollowingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
