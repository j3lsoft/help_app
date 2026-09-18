import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { AuthUserDto } from '@features/auth/models/auth.dto';
import { AuthService } from '@features/auth/services/auth.service';
import { FollowRelationResponseDto, SocialStateResponseDto } from '../models/social.dto';
import { FollowApiService } from './follow-api.service';
import { RelationshipService } from './relationship.service';

const VIEWER: AuthUserDto = {
  id: 'viewer-1',
  email: 'viewer@example.com',
  emailVerified: true,
  username: 'viewer',
  displayName: 'Viewer',
  avatarUrl: null,
};

const TARGET = 'target-1';

const RELATION: FollowRelationResponseDto = {
  followerId: VIEWER.id,
  followeeId: TARGET,
  createdAt: '2026-01-01T00:00:00Z',
};

const SOCIAL_STATE: SocialStateResponseDto = {
  followerCount: 10,
  followeeCount: 4,
  isFollowing: false,
};

describe('RelationshipService', () => {
  let service: RelationshipService;
  let apiSpy: jasmine.SpyObj<FollowApiService>;
  let currentUser: WritableSignal<AuthUserDto | null>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('FollowApiService', [
      'follow',
      'unfollow',
      'getSocialState',
    ]);
    apiSpy.follow.and.returnValue(of(RELATION));
    apiSpy.unfollow.and.returnValue(of(void 0));
    apiSpy.getSocialState.and.returnValue(of(SOCIAL_STATE));

    currentUser = signal<AuthUserDto | null>(VIEWER);

    TestBed.configureTestingModule({
      providers: [
        RelationshipService,
        { provide: FollowApiService, useValue: apiSpy },
        { provide: AuthService, useValue: { currentUser } },
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
    service = TestBed.inject(RelationshipService);
  });

  it('follows a user: flips the relationship and bumps both counts', () => {
    service.toggle(TARGET).subscribe();

    expect(apiSpy.follow).toHaveBeenCalledWith(TARGET);
    expect(service.relationship(TARGET)().isFollowing).toBeTrue();
    expect(service.counts(TARGET)().followerCount).toBe(1);
    expect(service.counts(VIEWER.id)().followingCount).toBe(1);
  });

  it('unfollows a user: flips back and drops both counts', () => {
    service.toggle(TARGET).subscribe();
    service.toggle(TARGET).subscribe();

    expect(apiSpy.unfollow).toHaveBeenCalledWith(TARGET);
    expect(service.relationship(TARGET)().isFollowing).toBeFalse();
    expect(service.counts(TARGET)().followerCount).toBe(0);
    expect(service.counts(VIEWER.id)().followingCount).toBe(0);
  });

  it('rolls back the bit and both counts on failure, then rethrows', () => {
    const failure = new Subject<FollowRelationResponseDto>();
    apiSpy.follow.and.returnValue(failure.asObservable());
    let caught: unknown;
    service.toggle(TARGET).subscribe({ error: (error: unknown) => (caught = error) });

    expect(service.relationship(TARGET)().isFollowing).toBeTrue();
    expect(service.counts(TARGET)().followerCount).toBe(1);
    expect(service.counts(VIEWER.id)().followingCount).toBe(1);

    const boom = new Error('boom');
    failure.error(boom);

    expect(caught).toBe(boom);
    expect(service.relationship(TARGET)().isFollowing).toBeFalse();
    expect(service.relationship(TARGET)().isToggling).toBeFalse();
    expect(service.counts(TARGET)().followerCount).toBe(0);
    expect(service.counts(VIEWER.id)().followingCount).toBe(0);
  });

  it('ignores a second toggle while the first is in flight', () => {
    const pending = new Subject<FollowRelationResponseDto>();
    apiSpy.follow.and.returnValue(pending.asObservable());

    service.toggle(TARGET).subscribe();
    service.toggle(TARGET).subscribe();

    expect(apiSpy.follow).toHaveBeenCalledTimes(1);
    expect(service.isToggling(TARGET)).toBeTrue();

    pending.next(RELATION);
    pending.complete();
    expect(service.isToggling(TARGET)).toBeFalse();
  });

  it('primes server relationship, but ignores prime while toggling', () => {
    service.prime(TARGET, { isFollowing: true, followsYou: true });
    expect(service.relationship(TARGET)().isFollowing).toBeTrue();
    expect(service.relationship(TARGET)().followsYou).toBeTrue();

    const other = 'target-2';
    const pending = new Subject<FollowRelationResponseDto>();
    apiSpy.follow.and.returnValue(pending.asObservable());
    service.toggle(other).subscribe();

    service.prime(other, { isFollowing: false, followsYou: true });
    expect(service.relationship(other)().followsYou).toBeFalse();

    pending.next(RELATION);
    pending.complete();
    service.prime(other, { isFollowing: false, followsYou: true });
    expect(service.relationship(other)().followsYou).toBeTrue();
  });

  it('loads SocialCounts for a target', () => {
    service.load(TARGET).subscribe();

    expect(apiSpy.getSocialState).toHaveBeenCalledWith(TARGET);
    expect(service.counts(TARGET)()).toEqual({
      followerCount: 10,
      followingCount: 4,
    });
  });

  it('clears all state when the authenticated viewer changes', () => {
    service.toggle(TARGET).subscribe();
    expect(service.relationship(TARGET)().isFollowing).toBeTrue();

    currentUser.set({ ...VIEWER, id: 'viewer-2' });
    TestBed.tick();

    expect(service.relationship(TARGET)().isFollowing).toBeFalse();
    expect(service.counts(TARGET)().followerCount).toBe(0);
    expect(service.counts('viewer-2')().followingCount).toBe(0);
  });

  it('clears state when the viewer logs out (id becomes null)', () => {
    service.toggle(TARGET).subscribe();
    expect(service.relationship(TARGET)().isFollowing).toBeTrue();

    currentUser.set(null);
    TestBed.tick();

    expect(service.relationship(TARGET)().isFollowing).toBeFalse();
    expect(service.counts(TARGET)().followerCount).toBe(0);
  });

  it('keeps another in-flight toggle counted when one fails', () => {
    const first = new Subject<FollowRelationResponseDto>();
    const second = new Subject<FollowRelationResponseDto>();
    apiSpy.follow.and.callFake((id: string) =>
      id === 'a' ? first.asObservable() : second.asObservable(),
    );

    service.toggle('a').subscribe({ error: () => undefined });
    service.toggle('b').subscribe();

    expect(service.counts(VIEWER.id)().followingCount).toBe(2);

    first.error(new Error('boom'));

    expect(service.counts(VIEWER.id)().followingCount).toBe(1);
    expect(service.counts('a')().followerCount).toBe(0);
    expect(service.counts('b')().followerCount).toBe(1);
  });
});
