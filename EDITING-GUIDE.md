# My EDU Prep 웹사이트 문구 수정 안내

웹사이트가 GitHub에 게시된 뒤에는 GitHub 웹사이트에서 직접 문구를 수정할 수 있습니다. 코딩 프로그램을 설치할 필요는 없습니다.

## 가장 안전한 수정 방법

1. GitHub에서 `myeduprep/myeduprep.github.io` 저장소를 엽니다.
2. 홈페이지를 수정하려면 `index.html` 파일을 클릭합니다.
3. 오른쪽 위의 연필 모양 **Edit this file** 버튼을 클릭합니다.
4. `Command + F`를 누르고 변경할 문장을 검색합니다.
5. 보이는 문장만 바꾸고 `<span>`, `</span>`, `<br>`, `<`, `>` 표시는 삭제하지 않습니다.
6. 오른쪽 위의 **Commit changes...** 버튼을 누릅니다.
7. 변경 내용을 짧게 적고 다시 **Commit changes**를 누르면 몇 분 후 웹사이트에 반영됩니다.

## 홈페이지 파일에서 찾기 쉬운 표시

`index.html` 안에는 다음과 같은 메모가 들어 있습니다.

- `EDIT HOME HERO`: 첫 화면 제목과 설명
- `EDIT GLOBAL NETWORK`: 전문가 네트워크와 대학 목록
- `EDIT HOW WE WORK`: 4단계 진행 과정
- `EDIT TESTIMONIALS`: 학생과 학부모 후기

이 메모는 웹사이트 화면에는 보이지 않습니다.

## 두 줄 제목을 수정할 때

두 줄 제목은 아래와 같은 구조입니다.

```html
<span class="headline-line">아이의 가능성을</span>
<span class="headline-line">더 큰 무대로.</span>
```

첫 번째 줄과 두 번째 줄의 글자만 바꾸고 `span` 표시는 그대로 둡니다.

## 페이지별 파일 위치

- 홈페이지: `index.html`
- 장기 교육 플래닝: `long-term-planning/index.html`
- 튜터링: `tutoring/index.html`
- 섬머캠프: `summer-camp/index.html`
- 대학·대학원 지원: `application-support/index.html`
- 후기: `testimonials/index.html`
- 소개: `about/index.html`
- 문의: `contact/index.html`
- 인사이트: `blogs/index.html`

## 서비스별 블로그·영상·후기 추가하기

서비스 페이지와 인사이트 페이지에 보이는 콘텐츠는 `content-data.js` 한 파일에서 관리합니다.

1. GitHub에서 `content-data.js` 파일을 엽니다.
2. 연필 모양 **Edit this file** 버튼을 누릅니다.
3. 기존 항목 하나를 복사해 목록 마지막에 붙여넣습니다.
4. 제목, 설명, 링크와 날짜만 바꿉니다.
5. 표시할 서비스는 `services`에서 선택합니다.

- 장기 플래닝: `planning`
- 튜터링: `tutoring`
- 섬머캠프: `camp`
- 대학·대학원 지원: `application`

블로그 글은 `type: "blog"`, 학생 후기는 `type: "testimonial"`, 추후 영상은 `type: "video"`로 적습니다. 하나의 콘텐츠를 여러 서비스에 보여주려면 아래처럼 서비스 이름을 여러 개 넣습니다.

```js
services: ["planning", "camp"],
```

항목 사이의 쉼표와 따옴표는 삭제하지 않는 것이 중요합니다. 새로운 콘텐츠를 전달해 주시면 Codex에게 평범한 문장으로 추가를 요청해도 됩니다.

인사이트 페이지의 플랫폼 이름과 계정 주소도 `content-data.js` 위쪽의 `MEP_CONTENT_PLATFORMS_KO`에서 관리합니다. 현재 연결된 계정은 다음과 같습니다.

- 네이버 블로그: `blog.naver.com/myeduprep`
- YouTube 표시 핸들: `@studyabroad` / 연결 주소: `youtube.com/@story_abroad`
- Instagram: `@myeduprep`
- Threads: `@mazlee0`
- LinkedIn: `linkedin.com/in/seung-yeon-lee`

외부 콘텐츠 카드는 모두 새 브라우저 탭에서 열립니다.

## 소개 페이지 사진과 설명 바꾸기

소개 페이지의 활동 사진과 사진 아래 설명은 `about-gallery-data.js` 한 파일에서 관리합니다.

1. GitHub에서 `about-gallery-data.js` 파일을 엽니다.
2. 연필 모양 **Edit this file** 버튼을 누릅니다.
3. 바꾸고 싶은 사진 항목의 `caption` 뒤 문장만 수정합니다.
4. 작은 분류명은 `label`, 대체 문구는 `alt`에서 수정합니다.
5. 사진 파일은 `assets/about` 폴더에 올리고 `image` 뒤의 파일명을 맞춥니다.

`layout`은 사진의 크기와 비율을 정합니다.

- `hero`: 넓고 크게 표시
- `portrait`: 세로형으로 표시
- `wide`: 가로형으로 표시
- `standard`: 3열 기본 크기

한 카드에 사진 두 장을 위아래로 보여주려면 School Evaluation 항목처럼 `image` 대신 `images`와 `alts`에 두 파일을 순서대로 적습니다.

같은 파일 아래쪽의 `MEP_ABOUT_CAROUSEL_KO`는 ‘교육은 결국, 사람과 사람을 잇는 일입니다’ 아래에 나오는 가로 사진 캐러셀입니다. 기존 항목을 복사해 `image`, `caption`, `alt`를 바꾸면 사진을 계속 추가할 수 있습니다. 캐러셀은 화살표 버튼, 마우스 스크롤과 모바일 손가락 스와이프로 이동합니다.

캐러셀은 사진 파일의 원래 가로·세로 비율을 자동으로 확인합니다. 가로 사진은 넓게, 세로 사진은 좁게 배치되며 사진 전체가 잘리지 않고 보이므로 `layout`이나 별도의 각도 설정을 추가할 필요가 없습니다.

About the Founder의 원형 대표 프로필 사진은 `assets/about/founder-profile.png`입니다. 페이지 맨 위의 발표 사진은 별도 이미지이므로 서로 독립적으로 교체할 수 있습니다. School Evaluation 사진처럼 갤러리 원본을 자르지 않고 보여주려면 해당 항목에 아래 두 줄을 유지합니다.

```js
fit: "contain",
position: "center center"
```

한국어 소개와 영어 소개는 서로 독립되어 있습니다. `about/index.html` 안의 `about-ko` 영역은 한국어, `about-en` 영역은 영어입니다.

## 후기 추가·수정하기

후기 페이지는 다음 세 파일의 내용을 한 화면에 합쳐 보여줍니다.

- `reviews.js`: 홈페이지에서 우선 보여줄 대표 후기
- `reviews-imported.js`: 이전 My EDU Prep 홈페이지와 네이버 블로그에서 가져온 후기
- `reviews-google.js`: Google 공개 후기

후기 페이지에서는 출처와 서비스별 필터를 사용할 수 있으며, 처음에는 12개만 표시되고 **후기 더 보기**를 누르면 12개씩 추가됩니다. 원문 주소가 있는 후기는 **원문 보기** 링크가 표시됩니다.

이전 홈페이지와 네이버 블로그 내용을 다시 불러와야 할 때는 `scripts/build-imported-reviews.py`를 사용합니다. 자동 생성된 `reviews-imported.js`를 직접 대량 수정하기보다는 Codex에 새 후기 반영을 요청하는 편이 안전합니다.

## 처음 게시하기

처음에는 기존 `myeduprep.com`을 바로 바꾸지 않고 GitHub Pages 임시 주소에서 먼저 확인하는 것을 권장합니다.

1. GitHub에서 `myeduprep.github.io`라는 저장소를 만듭니다.
2. 이 폴더의 모든 파일을 저장소의 `main` 브랜치에 올립니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
5. 브랜치는 `main`, 폴더는 `/ (root)`를 선택하고 **Save**를 누릅니다.
6. 게시가 끝나면 `https://myeduprep.github.io/`에서 최종 확인합니다.

기존 홈페이지 대신 `myeduprep.com`을 사용하려면 위 미리보기를 확인한 뒤 GitHub Pages의 **Custom domain**과 도메인 DNS를 연결합니다. 이 단계는 현재 운영 중인 사이트 주소를 바꾸므로 최종 확인 후 진행합니다.

## 게시 후에도 계속 수정할 수 있나요?

네. GitHub Pages에 공개한 뒤에도 파일을 수정하고 **Commit changes**를 누르면 보통 몇 분 안에 새 내용이 웹사이트에 반영됩니다. 공개는 최종 고정이 아니라, 현재 버전을 온라인에 보여주는 단계입니다.

## 주의할 점

- 한국어 문장은 `lang-ko`, 영어 문장은 `lang-en` 안에 있습니다.
- 저장하기 전에 `<` 또는 `>` 표시가 지워지지 않았는지 확인합니다.
- 사진을 교체할 때는 기존 파일과 같은 파일명을 사용하는 것이 가장 쉽습니다.
- 실수하더라도 GitHub에서 이전 버전으로 되돌릴 수 있습니다.

구조나 디자인을 바꾸는 수정은 Codex에 원하는 내용을 평범한 문장으로 설명하는 방법이 가장 안전합니다.
