import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPostsPage } from './user-posts.page';

describe('UserPostsPage', () => {
  let component: UserPostsPage;
  let fixture: ComponentFixture<UserPostsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserPostsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
