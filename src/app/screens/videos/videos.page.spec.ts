import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VideosPage } from './videos.page';

describe('VideosPage', () => {
  let component: VideosPage;
  let fixture: ComponentFixture<VideosPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(VideosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
