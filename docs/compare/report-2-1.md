# 작업 요청 #2-1 검증 보고서

## 요약

- 구현 범위: 히어로 슬라이드, 검색 반응, 통합 편집 박스, 장비 회전/편집, 한글 줄바꿈, 카카오맵 연동
- `npm run build`: **PASS**
- 운영 빌드 편집 UI: **미노출 확인**
- 운영 빌드 `/api/dev-edit`: **404 확인**
- 가로 스크롤: 7개 폭 × 3개 화면, 총 21건 **PASS**
- 캡처: `docs/compare/widths/{390|1024|1280|1366|1440|1728|1920}/{home|column-main|column-detail}.png`

## 1~7 항목별 확인

| 항목 | 결과 | 확인 방법 |
|---|:---:|---|
| 1. 히어로 슬라이드 | PASS | 3장 초기 데이터, 6초 자동 전환 `01 / 03 → 02 / 03`, 0.8초 페이드, hover/focus 정지, 번호 이동, 편집 모드 추가·삭제·순서 이동을 브라우저에서 확인했습니다. `prefers-reduced-motion: reduce`에서는 6.3초 후에도 `01 / 03`으로 유지됐습니다. 편집 모드에서 추가 후 4장, 삭제 후 3장 복귀도 확인했습니다. |
| 2. 검색 반응 | PASS | 홈·칼럼 메인 모두 빈 초기값, 100ms 디바운스, IME 조합 종료, Enter/버튼 검색, 인기 질문 채우기, 0.2초 페이드를 확인했습니다. 없는 검색어에서 질문 남기기 표시, 지우기 0.42초 후 결과 DOM 제거와 입력 포커스 복귀를 확인했습니다. `?edit=1`에서도 검색이 동작했습니다. |
| 3·4. 편집 박스 통합 | PASS | 문장/문단 단위 ID로 통합하고 `\n`과 `**굵게**`만 직렬화하도록 했습니다. contentEditable에서 Enter, Cmd/Ctrl+B, 일반 텍스트 붙여넣기, 자동 저장, 되돌리기를 확인했습니다. |
| 5. 보유 장비 | PASS | 8개 데이터를 배열로 이전했습니다. 3.9초 관찰에서 `01 / 08 → 02 / 08`, reduced-motion에서는 `01 / 08` 유지가 확인됐습니다. 0.6초 이동, hover/focus 정지, 화살표 이동, 무한 루프, 5개 이하 정지는 코드와 브라우저에서 확인했습니다. 편집 모드 추가 후 9개, 되돌리기 후 8개 복귀를 확인했습니다. |
| 6. 줄바꿈 | PASS | 전역 `word-break: keep-all`, `overflow-wrap: break-word`, `line-break: strict`, 제목 `text-wrap: balance`, 본문 `text-wrap: pretty`를 적용했습니다. 가운뎃점 앞은 줄바꿈되지 않는 공백으로 저장했습니다. 폭별 캡처에서 단어 중간 끊김이 없음을 확인했습니다. |
| 7. 카카오맵 | PASS(키 없음 경로) | IntersectionObserver 지연 로딩, services 주소 검색, 저장 좌표 우선, 마커/이동/확대, 스크롤 확대 끄기, 실패 시 기존 지도 자리표시를 구현했습니다. 현재 키가 없어 자리표시 fallback, 외부 지도 링크, MedicalClinic JSON-LD를 확인했습니다. 실제 Kakao SDK 지도 표시는 키 입력 후 확인 대상입니다. |

## 통합한 편집 ID

- `home.doctor.title` — `대표원장 **이호**`
- `home.doctor.years` — `**13**년 피부 진료 경험`
- `home.vision.title`
- `home.vision.description`
- `home.equipment.title`
- `home.latest.title`
- `home.gallery.title`
- `home.location.title`
- `home.footer.businessInfo`
- `column.hero.title` — `**Doctor's Column** by Glory Clinic`

히어로의 `title`과 `titleStrong`은 요청된 슬라이드 데이터 구조를 유지하기 위해 각각의 필드로 남겼습니다. 검색 결과의 검색어 앞·뒤 문구처럼 런타임 값이 사이에 들어가는 문장은 별도 ID를 유지했습니다.

## 새 편집 ID

### 히어로 슬라이드

- 컬렉션: `home.hero.slides`
- 슬라이드별 배경: `home.hero.slides.{slideId}.bgImage`
- 슬라이드별 문구: `home.hero.slides.{slideId}.eyebrow`, `.title`, `.titleStrong`, `.description`
- 기본 슬라이드 ID: `hero-slide-1`, `hero-slide-2`, `hero-slide-3`
- 각 슬라이드에 `type: "image"`를 저장하며, 향후 `video` 타입을 받을 수 있는 타입 구조를 마련했습니다.

### 보유 장비

- 컬렉션: `home.equipment.items`
- 장비별 이미지/문구/링크: `home.equipment.items.{itemId}.image`, `.name`, `.desc`, `.link`

### 오시는 길

- 좌표: `home.location.lat`, `home.location.lng`
- 링크: `home.location.naverUrl`, `home.location.kakaoUrl`, `home.location.googleUrl`
- 값이 비어 있으면 각 서비스의 주소 검색 URL을 사용합니다.

## 폭별 가로 스크롤 및 줄바꿈

판정식: `document.documentElement.scrollWidth > window.innerWidth`

| 폭 | 홈 | 칼럼 메인 | 칼럼 상세 | 줄바꿈 확인 |
|---:|:---:|:---:|:---:|:---:|
| 390 | PASS (390=390) | PASS (390=390) | PASS (390=390) | PASS |
| 1024 | PASS (1024=1024) | PASS (1024=1024) | PASS (1024=1024) | PASS |
| 1280 | PASS (1280=1280) | PASS (1280=1280) | PASS (1280=1280) | PASS |
| 1366 | PASS (1366=1366) | PASS (1366=1366) | PASS (1366=1366) | PASS |
| 1440 | PASS (1440=1440) | PASS (1440=1440) | PASS (1440=1440) | PASS |
| 1728 | PASS (1728=1728) | PASS (1728=1728) | PASS (1728=1728) | PASS |
| 1920 | PASS (1920=1920) | PASS (1920=1920) | PASS (1920=1920) | PASS |

요청에서 지정한 줄바꿈 확인 폭 390·1024·1280·1440에서 홈, 칼럼 메인, 칼럼 상세의 제목·카드·본문을 확인했습니다. “누구에게”, “되나요” 같은 한글 단어의 중간 분리는 발견되지 않았습니다.

## 일반 화면 비교

- 히어로 첫 슬라이드의 문구·배치·크기·색은 수정 전과 동일합니다.
- 홈과 칼럼 메인은 초기 검색 결과를 숨기라는 이번 요구에 따라 첫 화면의 검색 결과 영역 높이가 줄었습니다. 이는 의도된 차이입니다.
- 장비 첫 카드, 갤러리, 원장/비전, 오시는 길의 키 없는 상태는 기존 자리표시 디자인을 유지합니다.
- 칼럼 상세는 전역 `keep-all` 적용에 따라 일부 문단의 줄 배치와 전체 높이가 소폭 달라졌습니다. 단어 중간 끊김을 막기 위한 의도된 차이입니다.
- 그 외 확인한 화면에서 의도하지 않은 배치·색·글꼴·크기 차이는 발견되지 않았습니다.

## 카카오맵 설정

- `.env.example`에 `NEXT_PUBLIC_KAKAO_MAP_KEY=`만 추가했습니다.
- `.env.local`은 `.gitignore` 대상이며 생성하거나 커밋하지 않았습니다.
- 위치 기본 주소: 서울 강남구 봉은사로 207
- 좌표가 JSON에 있으면 좌표를 우선하고, 없으면 Kakao services 주소 검색을 사용합니다.
- 홈에는 이름, 주소, 전화, 좌표(값이 있을 때), 지도 링크를 데이터에서 읽는 `MedicalClinic` JSON-LD를 추가했습니다.

## 캡처 실행 메모

`npm run shots`는 현재 Codex 제한 환경에서 Chrome 하위 프로세스가 macOS 캐시 폴더에 접근하지 못해 직접 기동 단계가 차단됐습니다. 동일한 Playwright 브라우저 세션으로 7개 폭 × 3개 화면을 직접 실행해 21장 PNG를 모두 재생성했고, 위 가로 스크롤 판정도 같은 세션에서 다시 확인했습니다. 캡처 스크립트에는 자동 전환으로 결과가 흔들리지 않도록 reduced-motion 설정을 추가했습니다.

## 커밋

- `Enhance home editing interactions and maps` — #2-1 구현, 검증 캡처, 본 보고서
- 원격 저장소에는 push하지 않았습니다.
