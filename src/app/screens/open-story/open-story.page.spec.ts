import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OpenStoryPage } from './open-story.page';

describe('OpenStoryPage', () => {
  let component: OpenStoryPage;
  let fixture: ComponentFixture<OpenStoryPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(OpenStoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
