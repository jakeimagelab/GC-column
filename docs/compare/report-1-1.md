# 작업 요청 #1-1 검증 보고서

## 결과

- `npm run build`: PASS
- 필수 21개 캡처: `docs/compare/widths/{폭}/{home|column-main|column-detail}.png`
- 전체 가로 스크롤 검사: **PASS**
- 판정식: `document.documentElement.scrollWidth > window.innerWidth`
- 추가 확인 폭 1180·1512·2560px도 세 화면 모두 PASS
- Nanum Pen Script 계산값: `"Nanum Pen Script", "Nanum Pen Script Fallback", cursive`, 한글 글리프 로드 PASS
- 메가메뉴: 1180px에서 열림·닫힘과 `scrollWidth === innerWidth` 확인 PASS

## 폭별 자동 검사

| 폭 | 화면 | innerWidth | scrollWidth | 결과 |
|---:|---|---:|---:|:---:|
| 390 | home | 390 | 390 | PASS |
| 390 | column-main | 390 | 390 | PASS |
| 390 | column-detail | 390 | 390 | PASS |
| 1024 | home | 1024 | 1024 | PASS |
| 1024 | column-main | 1024 | 1024 | PASS |
| 1024 | column-detail | 1024 | 1024 | PASS |
| 1280 | home | 1280 | 1280 | PASS |
| 1280 | column-main | 1280 | 1280 | PASS |
| 1280 | column-detail | 1280 | 1280 | PASS |
| 1366 | home | 1366 | 1366 | PASS |
| 1366 | column-main | 1366 | 1366 | PASS |
| 1366 | column-detail | 1366 | 1366 | PASS |
| 1440 | home | 1440 | 1440 | PASS |
| 1440 | column-main | 1440 | 1440 | PASS |
| 1440 | column-detail | 1440 | 1440 | PASS |
| 1728 | home | 1728 | 1728 | PASS |
| 1728 | column-main | 1728 | 1728 | PASS |
| 1728 | column-detail | 1728 | 1728 | PASS |
| 1920 | home | 1920 | 1920 | PASS |
| 1920 | column-main | 1920 | 1920 | PASS |
| 1920 | column-detail | 1920 | 1920 | PASS |

## B·C 수정 전/후

- B1 서명 폰트: 폰트 변수 적용 위치 때문에 기본 serif로 계산되던 “이 호”를 `html`의 Nanum Pen Script 변수와 요소 클래스에 연결해 실제 손글씨체로 표시했습니다.
- B2 칼럼 헤더: 칼럼 메인의 “칼럼 검색 / 홈페이지 →”를 “홈페이지 → / EN · 中 · 日”로 교체하고, 상세 헤더는 기존 문구를 유지했습니다.
- B3 시술 카드: 8번째 “[필러명]”을 원본 `renderVals()`의 “스페셜필러”로 교체했습니다.
- B4 최신 칼럼: 제목·카테고리·“핵심 답변 한 줄 미리보기”를 Main.dc.html의 6개 카드 데이터와 일치시켰습니다.
- C1 상세 푸터: 의료법 고지 아래에 칼럼 메인과 같은 디자인·문구의 푸터를 추가했습니다.
- C2 히어로 자리표시: 중앙에서 제목과 겹치던 브랜딩 영상 문구를 오른쪽 아래 작은 글씨로 이동했습니다.
- C3 갤러리 제목: 경계에 걸치던 제목을 이동해 전체가 토프 배경 안에 놓이도록 했습니다.

## 육안 비교

- 390·1280·1920px의 세 화면을 전부 확인했습니다.
- 넓은 화면의 배경 띠는 좌우 끝까지 이어지고 콘텐츠는 1440px 기준 안에서 가운데 정렬됩니다.
- 좁은 화면에서 콘텐츠 잘림과 가로 스크롤은 없습니다.
- 모바일은 기존 섹션 순서와 문구를 유지한 한 열 레이아웃입니다.
