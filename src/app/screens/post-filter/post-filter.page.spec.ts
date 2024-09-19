import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostFilterPage } from './post-filter.page';

describe('PostFilterPage', () => {
  let component: PostFilterPage;
  let fixture: ComponentFixture<PostFilterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PostFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
