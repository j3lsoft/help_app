import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchChatPage } from './search-chat.page';

describe('SearchChatPage', () => {
  let component: SearchChatPage;
  let fixture: ComponentFixture<SearchChatPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SearchChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
