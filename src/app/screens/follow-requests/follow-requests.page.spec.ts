import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowRequestsPage } from './follow-requests.page';

describe('FollowRequestsPage', () => {
  let component: FollowRequestsPage;
  let fixture: ComponentFixture<FollowRequestsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FollowRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
