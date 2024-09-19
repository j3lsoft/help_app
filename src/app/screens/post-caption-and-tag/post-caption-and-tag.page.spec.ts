import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCaptionAndTagPage } from './post-caption-and-tag.page';

describe('PostCaptionAndTagPage', () => {
  let component: PostCaptionAndTagPage;
  let fixture: ComponentFixture<PostCaptionAndTagPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PostCaptionAndTagPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
