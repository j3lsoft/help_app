import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenStoryPage } from './open-story.page';

describe('OpenStoryPage', () => {
  let component: OpenStoryPage;
  let fixture: ComponentFixture<OpenStoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OpenStoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
