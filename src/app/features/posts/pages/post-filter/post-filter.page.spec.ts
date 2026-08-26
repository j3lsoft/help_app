import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { PostCreationService } from '../../services/post-creation.service';
import { POST_FILTER_OPTIONS } from '../../data/posts.mock';
import { PostFilterPage } from './post-filter.page';

describe('PostFilterPage', () => {
  let component: PostFilterPage;
  let fixture: ComponentFixture<PostFilterPage>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let postCreationService: PostCreationService;

  beforeEach(waitForAsync(() => {
    navControllerSpy = jasmine.createSpyObj('NavController', ['back']);

    TestBed.configureTestingModule({
      imports: [PostFilterPage],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NavController, useValue: navControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFilterPage);
    component = fixture.componentInstance;
    postCreationService = TestBed.inject(PostCreationService);
    postCreationService.selectImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go back when no image was selected', () => {
    expect(navControllerSpy.back).toHaveBeenCalled();
  });

  it('should apply the selected filter', () => {
    const gingham = POST_FILTER_OPTIONS[1];
    component.selectFilter(gingham.filter);
    expect(postCreationService.selectedFilter()).toBe(gingham.filter);
  });
});
