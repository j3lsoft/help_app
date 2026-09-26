# Help App — Domain Context

Social app (Ionic + Angular) where authenticated users publish posts with images and text, follow other users, and see a feed.

## Language

**Post**:
A publication created by an author. It consists of optional textual content and an ordered list of attached media.
_Avoid_: loose "publication", "user post"

**Content**:
The post's text. Optional when the post has media.
_Avoid_: caption, description, body

**Caption**:
UI-inherited term for Content. Use only in interface copy; in code and API it is `content`.

**MediaFile**:
A file (image in v1) uploaded by a user to the media system. It has an owner; a Post can only reference MediaFiles owned by its author.
_Avoid_: photo, file, attachment

**MediaIds**:
Ordered references to the MediaFiles attached to a Post. The order defines position within the post.

**Author**:
The authenticated user who creates the Post. Always the current session user in v1.
_Avoid_: writer, poster

**Hashtag**:
A keyword preceded by `#` inside the Content. In v1 it is not its own entity: it travels as plain text.

**Feed**:
Chronological list of posts shown on Home. In v1 it is local client state, not read from the API. A distinct data source from Profile Posts (local mock vs. API), but session mutations (delete, edit, like, save, create) are propagated across lists through `FeedService`'s mutation log, so a change in one list shows in the others immediately (see `docs/adr/0007`).
_Avoid_: timeline, wall

**Post status**:
Post state: `published`, `draft` or `scheduled`. In v1 the app only creates `published`; the others exist in the API but are not creatable from the app.

### Post creation

**Composer**:
The single screen where an Author composes a Post: picks media, applies Filter and Edits, and writes Content, all in one place. Successor of the multi-step creation pages.
_Avoid_: wizard, create-post flow, multi-step flow

### Post creation with image

**Filter**:
Named visual preset (Normal, Gingham, Lark...) that maps to a single CSS `filter` string. It is exclusive: only one Filter is active at a time per selected image. If Edits are active, the Filter is the base they compose on.
_Avoid_: effect, preset, loose CSS filter

**Edit**:
Parametric adjustment that composes on top of the Filter. In v1 the Edits with real functionality are `Brightness`, `Contrast`, `Blur` (continuous via slider) and `Rotate` (discrete in 90° steps). `Adjust`, `Curves`, `Crop` and `Perspective` are not part of the Composer UI in v1; they remain a v2 possibility.
_Avoid_: filter, generic adjustment, effect

**Effective Filter**:
Composition `Filter + Edits (brightness/contrast/blur)` expressed as a CSS string applied in preview (`[style.filter]`) and baked into the bitmap via canvas before upload.
_Avoid_: computed filter, final filter

**Effective Transform**:
Geometric transformation of the `Rotate` Edit (and future `Crop`) expressed as a CSS `transform` in preview and as a canvas operation (`rotate`/`translate`) during baking.
_Avoid_: rotation, loose CSS transform

**BakedImage**:
Optimized image file resulting from drawing the original image on canvas applying `Effective Filter` and `Effective Transform`, rescaled to `POST_IMAGE_MAX_DIMENSION` (≤2048) and with EXIF stripped. Differentiated format: photo → JPEG q≈0.85, screenshot/illustration → WebP q≈0.88, alpha → WebP q≈0.88 with alpha (PNG fallback). It is what is uploaded to storage and what the feed sees: what is previewed is what is published.
_Avoid_: processed image, filtered image, loose jpeg, loose webp

**Optimized BakedImage**:
BakedImage that meets the optimization budget: long side ≤2048, photo JPEG q≈0.85 / screenshot WebP q≈0.88 / alpha WebP q≈0.88 (PNG fallback), no retry if ≤2MB, if >2MB retried at q≈0.80→0.75. The concrete format travels in `MediaFile.mimeType`.
_Avoid_: compressed image, optimized jpeg

### Post carousel (v1 images-only)

**MediaItem**:
Generic visual piece inside a Carousel. In v1 only ImageItem exists.
_Avoid_: media, item, loose attachment

**ImageItem**:
Image MediaItem with its own Filter and Edits that bakes to its own Optimized BakedImage.
_Avoid_: image, photo, filtered image

**Carousel**:
Ordered list of MediaItems in a Post that maps to ordered MediaIds. In v1 holds images only, up to 5; it may be empty for a text-only Post.
_Avoid_: album, gallery, slider

**VideoItem**:
Video MediaItem with duration, Poster, trim, muted and rotate. Reserved for v2; does not exist in v1.
_Avoid_: video, clip, movie

**Poster**:
Optimized preview image derived from a VideoItem. Reserved for v2 with VideoItem.
_Avoid_: thumbnail, cover, preview image

### Post media viewing

**Lightbox**:
Fullscreen overlay that presents the images of one Post, opening at the tapped image and swiping only within that Post.
_Avoid_: image viewer, gallery, modal

**Media Grid**:
Profile tab that presents every image of a user's Profile Posts as a single flattened list. Its Lightbox browses that flattened list, unlike the per-Post Lightbox.
_Avoid_: gallery, photos tab

### Profile and Social

**Username**:
Unique user handle with implicit `@`. Stable identifier for routes (`/user-profile/:username`).
_Avoid_: loose handle, user, nick

**DisplayName**:
Visible user name. Mutable, not unique.
_Avoid_: name, full name

**Avatar**:
A MediaFile image used as the profile picture. May be `null`.
_Avoid_: profileImage, photo (avatarUrl is only a DTO field)

**Bio**:
Short free-text profile description. Optional, max ~150 characters. Never includes `birthDate`.
_Avoid_: description, about, biography

**Website**:
Optional profile URL. Stored normalized and displayed without protocol.
_Avoid_: link, web, loose url

**BirthDate**:
User birth date. Private data only for `edit-profile`; never shown on any profile.
_Avoid_: birthday, DOB in public UI

**AuthUser**:
Minimal view of the authenticated user cached in `AuthService` (`id, email, username, displayName, avatarUrl`). No `bio/website/birthDate`.
_Avoid_: generic currentUser, user, loose me

**Me (My Profile)**:
Full view of the authenticated user (`MeResponseDto`) obtained via `GET /me`. Source of truth for `edit-profile`.
_Avoid_: loose my profile, ambiguous currentProfile

**PublicProfile**:
Public view of another user by `username` (`GET /users/:username`). Exposes `bio/website/avatar` + `relationship`.
_Avoid_: generic user profile, other user

**Viewer**:
The authenticated user in their relation to a visited profile: the subject of `Relationship` and `SocialCounts`. Not to be confused with the Lightbox.
_Avoid_: current user, me (see AuthUser / Me)

**Relationship**:
Social state between the Viewer and the visited profile: `isFollowing` (whether you follow them) and `followsYou` (whether they follow you). Binary in v1; `requested` does not exist.
_Avoid_: followState, friendship, loose isFollow

**SocialCounts**:
Derived counters `followerCount` and `followingCount` obtained from `SocialState`. In v1 all accounts are public.
_Avoid_: loose followers/followings number, counts

**Profile Posts**:
The user's posts listed by `GET /api/v1/users/{userId}/posts`, paginated by an opaque cursor `{createdAt, id}` with `limit=20`, ordered by `createdAt DESC`, and responding `{items, nextCursor, total?}` with enriched media (`publicUrl`). `total` is only present when requested via `IncludeTotal opt-in`. The UI `postsCount` is `total ?? loaded items`. In v1 there is only `All`; there is no `Videos` nor `Tagged` — they are placeholders without an API contract. Independent data source from the Home Feed, but session mutations are kept in sync through `FeedService` (see `docs/adr/0007`).
_Avoid_: gallery, videos, tagged posts, profile feed

**IncludeTotal opt-in**:
Query flag `includeTotal=true` that asks the backend to run the extra COUNT query and include `total` in a paginated response. Profile Posts always requests it to render the real `postsCount`; followers/following/suggestions omit it (default `false`) because no UI needs that total — `SocialCounts` comes from `SocialState` instead.
_Avoid_: withTotal, loose total flag

**UserPosts**:
Canonical name of the endpoint that serves Profile Posts (`UserPostsController_getUserPosts_v1`). Same meaning as Profile Posts; use one term in code and the other in route/operation names consistently.
_Avoid_: loose userPosts vs profilePosts mix

**Private Account**:
An account that requires approval to view posts. Does not exist in v1: all accounts are public by scope decision.
_Avoid_: private profile, locked account in v1

**Story on Avatar**:
Indicator ring of an active story around the avatar. Does not exist in v1; `storyAvailable` stays `false` with no UI.
_Avoid_: story ring, story, bordered avatar

### Loading states

**Skeleton**:
Layout-shaped placeholder shown while a content region loads. It imitates the real structure of the region it replaces — same blocks, order and approximate dimensions — so the swap to real content does not shift the layout. Used for content regions (Profile header, Profile Posts, Media Grid).
_Avoid_: loader, placeholder, shimmer, spinner

**Spinner**:
Indeterminate progress indicator (`ion-spinner`) for a short, local pending operation (follow toggle, avatar upload, list loading). Never used for a content region that has a Skeleton.
_Avoid_: loader, loading indicator

**Data loader**:
The non-visual object that fetches and accumulates pages (`createProfilePostsLoader`). In this codebase "loader" alone always means this, never the Skeleton nor the Spinner.
_Avoid_: using "loader" for the Skeleton or Spinner
