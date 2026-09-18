import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { AuthUserDto } from '@features/auth/models/auth.dto';
import { AuthService } from '@features/auth/services/auth.service';
import { FollowApiService } from './follow-api.service';
import { FollowService } from './follow.service';
import { RelationshipService } from './relationship.service';

const VIEWER: AuthUserDto = {
  id: 'viewer-1',
  email: 'viewer@example.com',
  emailVerified: true,
  username: 'viewer',
  displayName: 'Viewer',
  avatarUrl: null,
};

describe('FollowService', () => {
  let service: FollowService;
  let relationships: RelationshipService;
  let apiSpy: jasmine.SpyObj<FollowApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('FollowApiService', [
      'follow',
      'unfollow',
      'getFollowers',
      'getFollowing',
      'getSuggestions',
      'getSocialState',
    ]);
    apiSpy.follow.and.returnValue(
      of({ followerId: VIEWER.id, followeeId: 's1', createdAt: '2026-01-01T00:00:00Z' }),
    );

    TestBed.configureTestingModule({
      providers: [
        FollowService,
        RelationshipService,
        { provide: FollowApiService, useValue: apiSpy },
        { provide: AuthService, useValue: { currentUser: signal(VIEWER) } },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj('LoggerService', [
            'error',
            'debug',
            'info',
            'warn',
          ]),
        },
      ],
    });
    service = TestBed.inject(FollowService);
    relationships = TestBed.inject(RelationshipService);
  });

  it('primes the store from a fetched followers page', () => {
    apiSpy.getFollowers.and.returnValue(
      of({
        items: [
          {
            id: 'f1',
            username: 'f1',
            displayName: 'F1',
            avatarUrl: null,
            relationship: { isFollowing: true, followsYou: false },
          },
        ],
        nextCursor: null,
      }),
    );

    service.loadFollowers('viewer-1', true).subscribe();

    expect(relationships.relationship('f1')().isFollowing).toBeTrue();
  });

  it('does not let a suggestions fetch reset an existing relationship', () => {
    relationships.toggle('s1').subscribe();
    expect(relationships.relationship('s1')().isFollowing).toBeTrue();

    apiSpy.getSuggestions.and.returnValue(
      of({
        items: [
          { id: 's1', username: 's1', displayName: 'S1', avatarUrl: null, bio: null },
        ],
        nextCursor: null,
      }),
    );

    service.loadSuggestions(true).subscribe();

    expect(relationships.relationship('s1')().isFollowing).toBeTrue();
  });
});
