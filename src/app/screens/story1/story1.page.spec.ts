import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Story1Page } from './story1.page';

describe('Story1Page', () => {
  let component: Story1Page;
  let fixture: ComponentFixture<Story1Page>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(Story1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
