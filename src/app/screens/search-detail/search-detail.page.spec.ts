import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchDetailPage } from './search-detail.page';

describe('SearchDetailPage', () => {
  let component: SearchDetailPage;
  let fixture: ComponentFixture<SearchDetailPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(SearchDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
