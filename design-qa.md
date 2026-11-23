# 온다 리프팅 상세 페이지 디자인 QA

## 기준 화면과 상태

- 참고 시안: `/Users/jakembpm2/Downloads/시안 1 — 레퍼런스형 (비교용)@1x.png`
- 구현 라우트: `http://127.0.0.1:3002/treatments/lifting/onda`
- 데스크톱 캡처: `output/design-qa/onda-reference-layout-1440.png`
- 모바일 캡처: `output/design-qa/onda-reference-layout-390.png`
- 전체 화면 나란히 비교: `output/design-qa/onda-reference-comparison.png` (왼쪽 시안 / 오른쪽 구현)
- 히어로 집중 비교: `output/design-qa/onda-reference-hero-comparison.png` (왼쪽 시안 / 오른쪽 구현)
- 검수 브라우저: 사용자의 Google Chrome DevTools responsive mode
- 모바일: CSS viewport 390×844, DPR 2
- 데스크톱: CSS viewport 1440×900, DPR 2
- 검수 상태: `NEXT_PUBLIC_SHOW_REVIEW` 미설정(false), 검수 대기 문구 숨김, `noindex` 유지

## 전체 화면 비교

- 시안의 구성 순서인 헤더·히어로·한눈에 보기·권장 대상·작동 원리·정품 원칙·비교표·시술 단계·원장 노트·주의사항·FAQ·CTA·푸터를 그대로 재구성했다.
- 크림 배경, 테라코타 포인트, 짙은 갈색 강조 띠, 아치형 사진과 단계 카드, 세리프 제목 체계를 일관되게 적용했다.
- 시안의 자리표시자에는 실제 원장 사진과 기존 병원 콘텐츠를 사용했다. 의료 문구를 새로 만들지 않았다.
- 390px에서는 모든 주요 섹션이 한 열로 전환되고 문서 전체 폭이 뷰포트와 일치한다.

## 집중 검수

- 히어로: 왼쪽 정보와 오른쪽 아치형 원장 사진의 비율, 제목 크기, 버튼 배치를 시안에 맞췄다.
- 권장 대상: 중앙 제목 아래 세 장의 균등 카드와 설명 구조를 유지했다.
- 작동 원리: 피부층·핸드피스 일러스트를 시안의 좌우 리듬에 맞춰 배치하고 실제 텍스트 라벨을 유지했다.
- 정품 원칙: 어두운 띠 안에 제목과 확인 카드 두 장을 가로 배치했다.
- 비교표: 데스크톱에서는 전체 표를 노출하고 모바일에서는 표 내부만 가로 스크롤된다.
- 시술 단계: 여섯 개 아치형 카드 중 `온다 시술`만 테라코타로 강조했다.
- 원장 노트: 사진·약속·감수 정보·관련 칼럼을 하나의 섹션으로 정리했다.

## 수치 검증

- 390px: `document.documentElement.scrollWidth === 390`
- 390px: `.tableScroll` 내부의 의도된 표 오버플로를 제외한 잘림 요소 `[]`
- 1440px: `document.documentElement.scrollWidth === 1440`
- 1440px: 의도되지 않은 잘림 요소 `[]`
- TypeScript: `npx tsc --noEmit` 통과
- 프로덕션 빌드: Next.js webpack 빌드 통과

## 반복 수정 이력

1. 기존 인터뷰형 Q1~Q6 페이지와 새 레퍼런스의 정보 구조 차이를 확인했다.
2. 단일 재사용 템플릿 안에서 섹션 순서와 시각 체계를 레퍼런스형으로 전면 재구성했다.
3. 데스크톱 전체 화면과 히어로를 시안과 나란히 비교해 간격과 비율을 조정했다.
4. 390px 모바일에서 단일 열 전환과 문서 폭을 재검수했다.

## 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: 시안의 사진 자리표시자는 실제 이호 원장 사진으로 대체했다.
- P3: 시안의 임시 문구 대신 기존 온다 콘텐츠와 병원 공통 데이터를 유지했다.

## 기능·접근성 확인

- [x] 860px 이하 한 열 전환
- [x] 비교표 내부 가로 스크롤
- [x] 공통 원장 약속 표시
- [x] 병원 기존 6단계 시술 과정 표시
- [x] 이미지 대체 텍스트와 제목 계층 유지
- [x] `prefers-reduced-motion` 대응 유지
- [x] `noindex` 유지

## 최종 결과

passed

# 홈 비전 디졸브·칼럼 고정 헤더·상담 사진 최종 QA

## 증거와 상태

- 원본 상담 사진: `Glory_F_0073.jpg` (4000×2668)
- 최적화 에셋: `public/uploads/glory-home-column-doctor-consultation-02.webp` (2800×1868)
- 원본·구현 결합 비교: `output/playwright/home-column-source-vs-implementation-vertical.png`
- 기존 시안·교체 구현 결합 비교: `output/playwright/home-column-photo-reference-vs-implementation.png`
- 홈 원장 칼럼 구현: `output/playwright/home-column-photo-replacement-desktop.png`
- 비전 디졸브 데스크톱 중간 상태: `output/playwright/home-vision-desktop-progress-030.png`
- 비전 디졸브 데스크톱 완료 상태: `output/playwright/home-vision-desktop-progress-090-final.png`
- 비전 디졸브 모바일 완료 상태: `output/playwright/home-vision-mobile-progress-090-final.png`
- 칼럼 고정 헤더·대표 사진 패럴랙스: `output/playwright/column-header-sticky-feature-parallax-final.png`
- 검수 viewport: 1440×900, 390×844, DPR 1

## 비교 결과

- 홈 원장 칼럼 사진은 사용자가 제공한 `Glory_F_0073.jpg`로 교체했으며, 원장 얼굴·상담 도구·거울이 카드 안에서 잘리지 않고 보이는 crop을 원본과 구현을 한 화면에 놓고 확인했다.
- 비전 섹션은 260vh(모바일 220vh) 스크롤 구간과 헤더 아래 sticky 화면을 사용한다. 진행률 .18~.42에서 사진과 지정 그라데이션이 디졸브되고, 사진은 1.08배에서 1배로 축소된다.
- 제목·서명·본문·라벨·GLORY 외곽선은 사진 디졸브와 같은 진행률로 명암이 전환되며, 외곽선은 최종 흰색 22% 불투명도다.
- 원칙 카드 01~03은 .46/.59/.72에서 순서대로 시작해 각각 .14 구간 동안 나타난다. 모바일 이동량은 24px이고 세 카드가 고정 화면과 하단 빠른 메뉴 사이에 모두 들어온다.
- reduced-motion과 `body.devEditActive`에서는 배경 사진을 숨기고 기존 밝은 화면과 카드 전체를 즉시 표시한다.
- `/column` 헤더를 hero의 transform·isolation 컨테이너 밖으로 옮겨 스크롤 후에도 데스크톱 72px, 모바일 56px 위치에 고정된다.
- `01 피부를 읽는 기준`은 배경 사진 레이어에만 스크롤 패럴랙스를 적용하고 흰 설명 카드는 고정했다.

## 기능·접근성·성능 확인

- [x] passive scroll listener와 requestAnimationFrame 1회/프레임 계산
- [x] 컴포넌트 해제 시 scroll·resize·media query·MutationObserver 정리
- [x] CSS 변수와 transform/opacity만 변경하여 스크롤 중 레이아웃 이동 없음
- [x] 390px에서 `document.documentElement.scrollWidth === 390`
- [x] 데스크톱·모바일 스크롤 후 칼럼 헤더 상단 위치 0px 유지
- [x] 홈 원장 칼럼 사진 alt 유지 및 Next Image 최적화 경로 사용
- [x] `npm run build` 통과
- [x] `npm run lint` 오류 0건; 수정 범위 밖 기존 경고 8건
- [x] `git diff --check` 통과

## 잔여 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: 원본 사진은 3:2 비율, 홈 카드 슬롯은 16:10 비율이므로 상하가 소폭 crop된다. 인물 얼굴과 상담 도구를 보존하는 중앙 crop으로 처리했으며 왜곡은 없다.

## 최종 결과

passed

# 칼럼 전환·비교표·모바일 목차 최종 QA (2026-11-23)

## 비교 자료

- 모바일 메인 시안: `/Users/jakembpm2/UGnasync/2026(유그린)/1101_글로리의원(GEO)/칼럼 메인 — 모바일 (390)@1x.png` (390×4500)
- 모바일 상세 시안: 같은 폴더의 `칼럼 상세 — 모바일 (390) 1 2@1x.png`, `칼럼 상세 — 모바일 (390) 2 2 · 이어서@1x.png` (합계 390×9200)
- 메인 구현 전체 캡처: `.playwright-cli/page-2026-11-23T03-08-10-903Z.png` (390×4226)
- 상세 구현 전체 캡처: `.playwright-cli/page-2026-11-23T03-08-21-520Z.png` (390×9863)
- 그림·표 집중 캡처: `.playwright-cli/page-2026-11-23T03-09-03-566Z.png` (390×844)
- 데스크톱 히어로 캡처: `.playwright-cli/page-2026-11-23T03-03-40-476Z.png` (1440×1000)
- 동일 폭 나란히 비교: `.playwright-cli/page-2026-11-23T03-13-19-458Z.png`
- 캡처 조건: CSS viewport 390×844·1440×1000, DPR 1, 검수 표식 표시 상태

## 필수 디자인 표면

- 글꼴·타이포그래피: 명조 제목, 고딕 본문, 영문 라벨 위계와 모바일 직접 줄바꿈을 확인했다. 낱말 중간 잘림이 없다.
- 간격·레이아웃: 모바일 22px 여백, 전체 폭 그림, 그림 다음 40px 표, 질문 띠·작성자·상담 순서를 비교했다.
- 색·토큰: 브라운 표지, 토프 Q&A, 코랄 세르프 강조, 베이지 선, 세르프 표 강조 열을 확인했다.
- 이미지: 최신 요청대로 세르프 히어로를 상세 상단과 칼럼 썸네일에 공통 사용한다. 비교 그림은 실제 3600×2320 비율로 렌더한다.
- 문구: 비교표 세 행은 요청 문구와 일치한다. 검수 전용 문구와 미답변 FAQ는 운영 분기를 유지한다.

## 반복 수정과 증거

1. P2 — 비교 그림 위치에서 모바일 목차가 01을 가리키는 경우가 있었다.
   - 수정: 좁은 관찰 구간 대신 requestAnimationFrame으로 제한한 스크롤 위치 계산으로 변경했다.
   - 재검수: 같은 위치에서 `02 세르프와 써마지는 무엇이 다른가요?`, top 56px, 진행률 45.9%, 문서 폭 390px.
2. P2 — 장비 자동 슬라이드의 소수 픽셀이 매 프레임 0으로 반올림되고 수동 이동을 덮을 수 있었다.
   - 수정: 누적 위치값과 수동 입력 후 1.4초 정지 구간을 적용했다.
   - 재검수: 자동 `scrollLeft` 증가와 다음 버튼 이동을 확인했다.
3. P2 — 비교표가 빠져 있었고 비교 그림의 고유 비율이 실제 파일과 달랐다.
   - 수정: 3행 비교표 복구, 세르프 열 강조, 3600×2320 크기 연결.
   - 재검수: 모바일 표 width·scrollWidth 모두 346px로 가로 스크롤이 없다.

## 반응형·기능 검수

- `/column`, `/column/xerf-vs-thermage`: 390·430에서 문서 폭이 뷰포트와 일치한다.
- 데스크톱 제목: 52px, 쉼표 뒤 강제 줄바꿈, 두 줄, max-width none, 배경 위치 70% 42%.
- 홈 ↔ 칼럼 전환: 양방향 애니메이션과 reduced-motion 우회를 확인했다.
- 장비 캐러셀: 자동 이동, 다음 버튼, 휠·터치·드래그 중 자동 이동 일시 정지를 확인했다.
- 콘솔: 확인 라우트 런타임 오류 0건. 개발 전용 preload/LCP 경고만 남으며 프로덕션 오류는 아니다.
- 정적 검사: ESLint 오류 0건(기존 경고 9건), TypeScript 통과, Next.js 프로덕션 빌드 통과.

## 잔여 차이

- 최신 요청에 따라 메인 특집 이미지는 기존 상담 사진 대신 세르프 장비 히어로를 사용한다.
- 데이터가 없는 발행 예정 카드는 자리표시 없이 숨겨 이전 시안보다 목록 높이가 짧다.
- 위 두 항목은 의도된 최신 요구사항이며 P0/P1/P2 이슈가 아니다.

## 최종 결과

passed

---

# 칼럼 모바일 마무리 및 비교 이미지 교체 QA

## 기준과 검수 자료

- 모바일 기준 시안: 사용자가 제공한 390px 칼럼 메인·상세 이미지
- 기존 동일 폭 비교 입력: `output/playwright/compare-main-final.png`, `output/playwright/compare-detail-final.png`
- 새 비교 원본: `public/uploads/glory-column-treatment-depth-comparison.png` (4096×2304)
- 구현 라우트: `/column`, `/column/xerf-vs-thermage`
- 런타임 출력 확인: `.next/server/app/column/xerf-vs-thermage.html` 및 RSC에 새 이미지·alt·정확한 히어로 오버레이가 포함됨

## 마무리 차이 검수

- Q&A와 상세 FAQ 답변을 첫 문장 `700`, 이어지는 문장을 `400`으로 분리했다.
- 모바일 표지 설명, 대표 칼럼 요약, 상담 띠를 시안의 지정 위치에서만 직접 줄바꿈했다.
- 칼럼에서 다룬 시술 카드에 브랜드색 3px 상단선을 실제 `border-top`으로 적용했다.
- 데스크톱 상세 히어로 제목 폭을 760px로 제한하고, 지정 오버레이와 `70% 42%` 배경 위치를 유지했다.
- 모바일 비교표 행 제목은 400 굵기와 `#766E66`으로 고정했다.
- 상세 모바일 상담 띠는 상하 48px 패딩으로 정리했다.
- 기존 단면도와 비교표 대신 제공된 고해상도 비교 이미지를 데이터 기반 figure로 렌더하고, 의미가 분명한 alt와 별도 캡션을 연결했다. 다른 칼럼을 위한 기존 `layers` 렌더 경로는 보존했다.

## 품질 확인

- [x] `next/image` 반응형 최적화와 정확한 원본 비율 유지
- [x] 콘텐츠 이미지 alt와 figure caption 분리
- [x] 모바일 전폭 이미지가 문서 폭을 늘리지 않도록 `100vw`와 음수 여백을 쌍으로 사용
- [x] JSX 의료 문구는 사용자가 제공한 기존 문장만 사용
- [x] `npm run lint` 오류 0건 (기존 경고 9건)
- [x] `npx tsc --noEmit` 통과
- [x] `npm run build` 통과

## 최종 결과

passed

---

# 원장 칼럼 모바일 390·430 최종 디자인 QA

## 기준과 캡처

- 기준 시안: `칼럼 메인 — 모바일 (390)@1x.png`, `칼럼 상세 — 모바일 (390) 1 2@1x.png`, `칼럼 상세 — 모바일 (390) 2 2 · 이어서@1x.png`
- 메인 공개: `output/playwright/column-390-public-final.png`, `output/playwright/column-430-public-final.png`
- 메인 검토: `output/playwright/column-390-review-final.png`, `output/playwright/column-430-review-final.png`
- 상세 공개: `output/playwright/column-detail-390-public-final.png`, `output/playwright/column-detail-430-public-final.png`
- 상세 검토: `output/playwright/column-detail-390-review-final.png`, `output/playwright/column-detail-430-review-final.png`
- 상세 데스크톱 히어로: `output/playwright/column-detail-1440-hero-final.png`
- 나란히 비교: `output/playwright/compare-main-final.png`, `output/playwright/compare-detail-final.png` (왼쪽 시안 / 오른쪽 구현)

## 시각 비교 결과

- 메인은 56px 헤더, 브라운 표지, 겹친 검색창, 460px 특집 사진, 2열 고민 타일, 단순화한 질문 목록, 가로 시술 카드, 아카이브·상담·푸터·고정 바 순서를 시안과 맞췄다.
- 상세는 sticky 진행 목차, 장비가 드러나는 570px 히어로, 깊이 칩, 검토 모드 영상 카드, 짧은 답, 01~04 섹션, 고정 폭 비교표, 전폭 도해·상담 사진, FAQ·질문 폼·작성자·관련 시술·하단 고정 바를 시안과 같은 흐름으로 맞췄다.
- 시안에 남아 있던 `발행 예정` 초안 카드는 운영 원칙에 따라 구현에서 숨겼다. 데이터가 없는 항목을 숨긴 결과이며 레이아웃 오류가 아니다.
- 상세의 검토 전용 `[원장 확인]`, `[광고 검토]`, 영상 촬영 카드는 `NEXT_PUBLIC_SHOW_REVIEW=true`에서만 표시되고 공개 모드에서는 DOM과 화면 모두에서 제거된다.

## 수치·기능 검증

- 390px: 메인·상세 모두 `document.documentElement.scrollWidth === 390`.
- 430px: 메인·상세 모두 `document.documentElement.scrollWidth === 430`.
- 키워드·대표 칼럼 시술·깊이·관련 시술 칩 묶음은 `scrollWidth === clientWidth`; 시술 카드 줄만 의도적으로 가로 스크롤한다.
- 공개 상세에서 `[원장 확인]`, `[광고 검토]`, `이미지 준비`, `발행 예정` 미노출을 확인했다.
- 모바일 목차 시트 열기·Esc 닫기, FAQ 항목 전환, 메뉴 열림 시 body 스크롤 잠금, 질문 폼 필수 동의 후 버튼 활성화를 실제 클릭으로 확인했다.
- 데스크톱 링크 복사 후 `링크를 복사했습니다` 상태 메시지를 확인했다.
- 공개·검토 캡처 모두 브라우저 콘솔 오류 0건. Next 개발 모드의 미사용 preload 경고 1건만 확인됐다.
- `npm run lint` 통과(오류 0), `npx tsc --noEmit` 통과, `npm run build` 통과.

## 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: 메인 특집 사진은 데이터에 지정된 `listImage`를 사용하므로 시안 캡처의 이전 사진과 인물 각도가 다르다.
- P3: 초안 칼럼 두 개는 자리표시 금지 원칙에 따라 목록 높이에서 빠진다.

## 최종 결과

passed

---

# 최신 칼럼·시술 상세 잔여 차이 디자인 QA

## 기준과 검수 상태

- 기준: 2026-11-23 사용자 최신 캔버스 반영 요청서
- 대상: `/column/xerf-vs-thermage`, `/column`, `/`, `/treatments/lifting/thermage-flx`
- 공개 모드: `NEXT_PUBLIC_SHOW_REVIEW=false`
- 검토 모드: `NEXT_PUBLIC_SHOW_REVIEW=true`
- 공개 캡처: `output/playwright/latest-canvas/public-column-detail-1440.png`, `public-column-detail-390.png`, `public-column-main-1440.png`, `public-home-1440.png`, `public-treatment-top-1440.png`
- 검토 캡처: `output/playwright/latest-canvas/review-column-detail-1440.png`, `review-column-detail-390.png`, `review-column-main-1440.png`, `review-home-1440.png`, `review-treatment-top-1440.png`

## 확인 결과

- 칼럼 제목은 상세 H1과 문서 메타데이터에서 `세르프(XERF)와 써마지FLX의 차이, 누구에게 맞을까요?`로 일치하며 쉼표 뒤 줄바꿈이 적용됐다.
- 상세 히어로는 세르프 차콜·오렌지 그라데이션과 `heroImage`를 사용한다.
- 상담 이미지 단독 블록은 섹션 02와 03 사이에서 번호·목차 없이 표시되며, 원본 비율·대체 텍스트·별도 캡션을 유지한다.
- 공개 모드에는 30초 영상 자리표시가 없고 요약이 전체 폭을 사용한다. 검토 모드에는 300px, 9:16 영상 자리표시가 표시된다.
- `coverImage` 사용처를 제거하고 상세 배경은 `heroImage`, 목록·칼럼 메인 대표 이미지·OG는 `listImage` 역할로 분리했다. 홈은 편집 가능한 `home.latest.featureImage`를 우선하고 값이 없을 때 `listImage`를 사용한다.
- 시술 상세의 한눈에 보기 외부 그리드는 `340px | 1fr`, 80px 간격이며 본문 시작 x좌표가 작용 원리 섹션과 동일하다. 검토 모드 내부는 `1fr | 260px`, 56px 간격이다.
- 390px 상세에서 제목, 영상 자리, 이미지 단독 블록, 표 스크롤, FAQ와 푸터에 문서 가로 넘침이나 겹침이 없다.

## 브라우저·코드 검증

- 공개/검토 상세 페이지 콘솔 오류 0건.
- 공개 모드 영상 자리표시 0개, 검토 모드 자리표시 너비 300px 확인.
- 상담 이미지 `naturalWidth=788`, 캡션과 요청된 alt 확인.
- 시술 상세 1280px 실측에서 한눈에 보기 본문과 작용 원리 본문 시작 x좌표가 모두 460px로 일치했다. 검토 모드 영상 칸은 260px였다.
- `coverImage` 및 이전 제목 문자열 검색 결과 0건.
- `npx tsc --noEmit` 통과.
- `npm run build` 통과. 프로젝트에는 `lint` 스크립트와 ESLint 의존성이 없어 별도 lint 명령은 실행할 수 없다.

## 반복 수정 이력

1. 최초 전체 페이지 캡처에서 지연 로딩 이미지와 스크롤 등장 요소가 비어 보이는 문제를 발견했다.
2. 실제 스크롤로 모든 지연 이미지를 로드하고 `prefers-reduced-motion: reduce` 상태에서 재캡처해, 콘텐츠 누락이 아닌 캡처 상태 문제임을 확인했다.
3. 공개·검토 모드를 각각 독립 실행해 영상 자리표시 분기와 상담 이미지 로딩을 DOM 실측으로 재확인했다.

## 잔여 차이와 판단

- P0/P1/P2/P3 이슈 없음.
- 새 기능은 추가하지 않았고 요청된 데이터 역할 분리, 이미지 블록, 검토 모드 분기, 정렬 보정만 반영했다.

## 최종 결과

passed

---

# 시술 상세 보완 — 검토 미디어·핸드피스 디자인 QA

## 기준 화면과 상태

- 소스 시안: `/Users/jakembpm2/UGnasync/2026(유그린)/1101_글로리의원(GEO)/시술 상세 템플릿 — 장비형 (써마지FLX).pdf`
- 구현 라우트: `/treatments/lifting/thermage-flx`
- 공개 모드 전체 캡처: `output/playwright/thermage-flx-public-1440.png` (1440×5623px), `output/playwright/thermage-flx-public-390.png` (390×8060px)
- 검토 모드 전체 캡처: `output/playwright/thermage-flx-review-1440.png` (1440×7841px), `output/playwright/thermage-flx-review-390.png` (390×11552px)
- 집중 캡처: `output/playwright/thermage-flx-review-video-1440.png`, `output/playwright/thermage-flx-review-mechanism-1440.png`, `output/playwright/thermage-flx-review-handpiece-1440.png`
- 상태 분기: `NEXT_PUBLIC_SHOW_REVIEW=false`와 `true`를 각각 별도 프로덕션 빌드로 생성하고 같은 CSS viewport에서 비교했다.

## 전체 화면 비교

- 공개 모드는 `src`가 없는 30초 영상과 작용 원리 일러스트를 렌더하지 않아 해당 행이 자연스럽게 2열로 정리된다.
- 검토 모드는 30초 영상 자리에 260px·9:16 검토 카드가 나타나고, 작용 원리 STEP 아래에는 21:8 일러스트 검토 영역이 나타난다.
- 390px에서는 영상 카드가 가운데 정렬된 단일 열로 전환되고 핸드피스 이미지는 300px 높이로 축소된다.
- 핸드피스는 데스크톱 380px·모바일 300px 높이와 -18도 회전을 유지하며 캡션이나 팁 카드와 겹치지 않는다.

## 집중 검수

- 줄바꿈: `SectionHeading` 설명을 JSX 표현식 문자열로 전달하고 `Lines`로 렌더해 `결론부터 읽고,` 다음 줄에 `필요한 만큼 내려가 보세요.`가 표시된다.
- 검토 영상: #241C2E 배경, 64px 원형 재생 아이콘, `DOCTOR'S ANSWER · 0:30`, 17px 라벨, 11px 촬영 안내를 확인했다.
- 검토 일러스트: #EFEBE6 배경과 `[일러스트] 피부 단면 · 표면 쿨링 + 진피층 가열` 문구, 점선 `[원장 확인]` 표시를 확인했다.
- 핸드피스: 요청한 drop-shadow와 회전을 유지하면서 래퍼 높이·패딩으로 캡션과의 여백을 확보했다.

## 수치·기능 검증

- 공개 1440/390: `videoPlaceholder=false`, `illustrationPlaceholder=false`
- 검토 1440/390: `videoPlaceholder=true`, `illustrationPlaceholder=true`, 영상 비율 `0.5625`(9:16)
- 1440px 핸드피스: `height=380px`, 회전 행렬이 -18도와 일치
- 390px 핸드피스: `height=300px`, 회전 행렬이 -18도와 일치
- 네 상태 모두: 문서 폭과 viewport 폭 일치, 깨진 이미지 0건, 페이지 텍스트의 리터럴 `\\n` 0건
- 프로덕션 빌드: 공개·검토 모드 모두 통과
- TypeScript: `npx tsc --noEmit --pretty false` 통과
- 이 프로젝트에는 ESLint 의존성과 `lint` 스크립트가 없어 `npm run lint --if-present`로 구성 부재를 확인했다.

## 반복 수정 이력

1. 검토 모드에서 소스가 없는 미디어가 숨겨져 시안의 검토 상태를 비교할 수 없는 차이를 확인했다.
2. 영상·일러스트를 검토 모드에만 추가하고 공개 모드 전체 화면을 다시 캡처해 두 요소가 숨는 것을 확인했다.
3. 핸드피스 높이·회전·래퍼 간격을 적용한 뒤 집중 캡처로 캡션·팁 카드와 겹치지 않는지 재확인했다.
4. 1440px·390px 네 상태의 DOM 수치를 수집해 줄바꿈 문자열, 미디어 분기, 이미지 오류와 문서 가로 넘침을 다시 검사했다.

## 잔여 차이와 판단

- P0/P1/P2/P3 이슈 없음.
- 검토 미디어는 실제 촬영물·일러스트가 들어오기 전 내부 확인용이며 공개 빌드에는 DOM 자체가 생성되지 않는다.

## 최종 결과

passed

---

# 원장 칼럼 7번 — 세르프·써마지 상세 디자인 QA

## 기준 화면과 상태

- 소스 시안: `/Users/jakembpm2/UGnasync/2026(유그린)/1101_글로리의원(GEO)/칼럼 상세 시안 — 세르프와 써마지@1x.png`
- 구현 라우트: `/column/xerf-vs-thermage`
- 데스크톱 캡처: `output/playwright/column-xerf-vs-thermage-1440.png`
- 모바일 캡처: `output/playwright/column-xerf-vs-thermage-390.png`
- 전체 화면 나란히 비교: `output/playwright/column-xerf-comparison-full.png` (왼쪽 시안 / 오른쪽 구현)
- 상단 집중 비교: `output/playwright/column-xerf-comparison-top.png` (왼쪽 시안 / 오른쪽 구현)
- 데스크톱: CSS viewport 1440×1000, DPR 1, 전체 페이지 1440×8504px
- 모바일: CSS viewport 390×844, DPR 1, 전체 페이지 390×10342px
- 검수 상태: `NEXT_PUBLIC_SHOW_REVIEW=true`에서 검토 배지·보류 FAQ·원문 보류 문장을 확인하고, `false` 프로덕션 산출물에서 모두 제거되는지 별도 검사

## 전체 화면 비교

- 1440px 원본 시안과 구현을 같은 1440px 기준으로 축소해 한 장의 비교 입력으로 대조했다.
- 캠페인 사진 위 보라 그라데이션, 2줄 제목, 바이라인·공유 버튼, 본문 8칸·사이드바 4칸, 큰 외곽선 번호와 코랄 영문 라벨을 시안의 계층에 맞췄다.
- 짧은 답 → 01~04 → 함께 읽을 글 → 공유 → FAQ → 방문 전 확인 → 작성자 → 관련 시술 순서를 유지했다.
- 실제 영상 데이터가 없어 시안의 영상 카드는 숨기고, 제공된 핵심 요약 3개만 흰 요약 블록으로 표시했다.

## 집중 검수

- 콘텐츠: 제공된 원장 칼럼 7번 문장만 사용했다. `==` 강조, `**` 굵기, 광고 검토·원장 확인 배지를 데이터 마크업으로 분리했다.
- 레이어 도해: SVG 텍스트 노드로 표피·진피·피하지방·근막과 세 장비의 도달 범위를 구성해 크롤링 가능한 텍스트를 유지했다.
- 비교표: 3행, 세르프 강조 열, 브랜드 색 점과 모바일 가로 스크롤 안내·우측 페이드를 확인했다.
- 사이드바: 데스크톱에서 문서 길이 전체에 sticky로 유지되고 `#difference` 이동 시 02 목차 강조가 갱신된다.
- FAQ: 검토 모드 7개, 공개 모드 2개이며 첫 항목 기본 열림과 두 번째 항목 전환을 실제 클릭으로 확인했다.
- 공개 모드: `[원장 확인]`, `[광고 검토]`, reviewNotes, 검토 FAQ가 HTML/RSC 화면 산출물에 없고 FAQPage에는 공개 2개만 남는다.
- 구조화 데이터: 새 headline, 2026-10-16 발행일, 이호 원장 author/reviewedBy, 세르프·써마지FLX·울쎄라피프라임 MedicalProcedure `@id`를 확인했다.

## 반복 수정 이력

1. 최초 1440px 전체 캡처를 원본 시안과 나란히 비교해 히어로·본문·FAQ·하단의 계층과 폭을 확인했다.
2. 직접 앵커 이동 시 사이드바 부모가 콘텐츠 높이만 차지해 목차가 중간부터 사라지는 P1 문제를 발견했다.
3. 사이드바를 그리드 행 높이에 맞춰 늘리고 sticky 목차가 02 섹션에서도 유지되는 것을 다시 캡처했다.
4. 공개 프로덕션 RSC에 검토 문자열이 클라이언트 prop으로 남는 문제를 발견해 서버에서 검토 마커를 제거한 후 전달하도록 수정했다.
5. 공개·검토 빌드를 각각 생성해 공개 산출물 0건, 검토 산출물 노출을 정적 검색으로 재검증했다.

## 잔여 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: 시안의 30초 영상 카드는 실제 영상 데이터가 없어 표시하지 않았다. 가짜 영상이나 빈 플레이스홀더를 추가하지 않는 기존 운영 원칙을 따른다.
- P3: 시안의 두 번째 `함께 읽을 글`은 현재 저장소에 해당 칼럼이 없어 요청대로 생략했다.

## 기능·접근성 확인

- [x] 1440px·390px 반응형 전체 화면
- [x] 모바일 문서 폭 고정, 도해·표 내부 가로 스크롤
- [x] 목차 sticky 및 현재 섹션 강조
- [x] FAQ 열기·닫기
- [x] 공개·검토 모드 분리
- [x] JSON-LD 공개 FAQ 2개만 포함
- [x] 브라우저 콘솔 오류 0건
- [x] `npm run build` 및 `npx tsc --noEmit` 통과

## 최종 결과

passed

# 홈·칼럼 전환 및 스크롤 강조 마무리 QA

## 기준과 범위

- 참고 화면: 홈 원장 칼럼 상담 이미지, 칼럼 본문 스크롤 강조 예시
- 구현 라우트: `/`, `/column`, `/column/xerf-vs-thermage`
- 검수 범위: 장비 캐러셀 속도·호버 해제, 홈↔칼럼 전환, 칼럼 첫 화면 높이, 세르프 본문 강조 모션

## 반영 확인

- 장비 캐러셀 자동 이동 속도를 약 60px/s로 높이고, 마우스가 캐러셀 위에 있을 때만 정지하도록 조정했다.
- 마우스 클릭으로 남은 focus 상태가 팝업을 유지하지 않도록 `:focus-visible` 기준으로 바꾸고, 키보드 탐색은 유지했다.
- 홈 원장 칼럼 이미지를 대표원장 상담 사진으로 교체했다.
- 홈↔칼럼 진입 시 표지까지는 좌우 슬라이드로 유지하고, 표지에서 목적 화면으로 바뀔 때는 페이드·블러·미세 확대가 풀리는 방식으로 전환했다.
- `/column`의 표지와 검색 영역을 하나의 `100svh` 첫 화면으로 구성했다.
- 칼럼 본문의 강조 문장은 화면에 들어올 때 왼쪽에서 오른쪽으로 밑줄이 그려지며, 세르프 포인트 컬러 `#FF4714`의 반투명 톤을 사용한다.
- `prefers-reduced-motion`에서는 완성된 강조 상태를 즉시 표시한다.

## 정적 검수

- [x] `git diff --check`
- [x] `npm run lint` 오류 0건
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] 빌드 산출물에서 `/column`의 `heroStage`와 상세 페이지 브랜드 강조 변수 확인
- [x] 자동화 브라우저는 실행 환경의 macOS 브라우저 샌드박스 제한으로 기동되지 않아, 이번 차수는 코드·정적 빌드 검수로 대체

## 최종 결과

code-complete — 배포 후 운영 화면에서 모션 체감만 최종 확인

## 후속 반영

- 사용자 확인에 따라 장비 카드의 마우스오버 정보 팝업은 DOM과 스타일에서 완전히 제거했다. 장비 이미지의 가벼운 호버 반응과 키보드 링크 접근성만 유지한다.

---

# 원장 칼럼 상세 페이지 디자인 QA

## 기준 화면과 상태

- 참고 시안: `/Users/jakembpm2/UGnasync/2026(유그린)/1101_글로리의원(GEO)/칼럼 상세 시안 — 세르프와 써마지@2x.png`
- 구현 라우트: `http://127.0.0.1:3002/column/xerf-vs-thermage`
- 데스크톱 캡처: `output/playwright/column-detail-1440.png`
- 모바일 캡처: `output/playwright/column-detail-390.png`
- 전체 화면 나란히 비교: `output/playwright/column-detail-reference-comparison.png` (왼쪽 시안 / 오른쪽 구현)
- 데스크톱: CSS viewport 1440×900, DPR 2
- 모바일: CSS viewport 390×900, DPR 2

## 전체 화면 비교

- 짙은 브라운 상단, 명조 제목, 8:4 본문·사이드바, 큰 외곽선 번호, 질문 띠, 방문 전 확인, 글쓴이, 관련 시술 띠의 순서와 기준선을 시안에 맞췄다.
- `xerf-vs-thermage`의 기존 의료 문장만 사용했으며, 답변이 없는 질문과 임시 문구는 숨겼다.
- 현재 칼럼 데이터에 영상과 본문 도해가 없으므로, 요청 원칙에 따라 시안의 임시 영상·도해 상자를 출력하지 않고 30초 답변 내용을 전체 폭으로 배치했다.
- 모바일에서는 헤더를 햄버거로 바꾸고 본문·목차·질문 폼·방문 전 확인·글쓴이·관련 시술을 한 열로 재배치했다.

## 집중 검수

- 상단: 경로, 이슈 라벨, 두 줄 제목, 바이라인, 공유 버튼을 시안 기준으로 정렬했다.
- 30초 답변: 요약과 핵심 4줄을 실제 데이터로 출력하고 브랜드 점 색과 선택 기준의 외곽선 점을 구분했다.
- 본문: 섹션 사이 가로선을 제거하고 번호·영문 라벨·여백으로만 구분했다. 세르프 대표 색을 번호·라벨·형광펜·표 강조 열에 적용했다.
- 사이드바: 스크롤 위치 목차 강조와 기존 질문 제출 검증을 유지했다.
- 질문: FAQ와 독자 질문을 한 아코디언으로 합치고 중복 질문을 제거했으며 기존 `#faq-n` 앵커를 유지했다.
- 하단: 방문 전 확인 3칸, 글쓴이, 브랜드 색 시술 칩, 상담 버튼과 법적 안내를 시안 순서로 배치했다.

## 수치·기능 검증

- 데스크톱 전체 캡처: 2880×11504px (DPR 2)
- 모바일 전체 캡처: 780×14512px (DPR 2)
- 브라우저 콘솔: 오류 0건; Next.js 개발 서버의 미사용 CSS preload 경고만 확인
- 링크 복사: 클릭 후 `링크를 복사했습니다` 토스트 확인
- FAQ: 두 번째 질문을 열었을 때 첫 질문이 닫히고 실제 답변이 표시되는 것 확인
- 목차: `01` 항목 클릭 후 URL이 `#difference`로 이동하는 것 확인
- 렌더 HTML 검사: `[원장 답변]`, `[한 줄 설명]`, `이미지 준비`, `발행 예정`, `COMING SOON`, `UPCOMING` 출력 0건
- 프로덕션 빌드: `npm run build` 통과

## 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: 참고 시안의 세로 영상 카드는 실제 `video` 데이터가 생기는 12월 이후에만 표시한다. 현재는 요청서의 “video 값을 넣지 않음” 규칙을 우선했다.
- P3: 참고 시안의 임시 도해는 실제 이미지 데이터가 없으므로 빈 상자와 임시 문구를 만들지 않고 숨겼다.

## 기능·접근성 확인

- [x] 1440px·390px 반응형 배치
- [x] 제목·문단 `word-break: keep-all` 및 `text-wrap: pretty`
- [x] 핵심 4줄·표·버튼·칩 낱말 중간 줄바꿈 방지
- [x] 목차 현재 위치 추적 및 앵커 이동
- [x] FAQ 열기·닫기와 기존 FAQ 앵커 유지
- [x] 공유·저장·링크 복사 폴백과 토스트
- [x] 자리표시 문구 렌더링 없음
- [x] 법적 안내 푸터 1회 표시
- [x] 프로덕션 빌드 통과

## 최종 결과

passed

---

# 홈페이지 메인 보완안 디자인 QA

## 기준 화면과 상태

- 참고 시안: `/Users/jakembpm2/Desktop/홈페이지 메인 — 보완안 (구조·디자인 유지)@1x.png`
- 구현 라우트: `http://127.0.0.1:3002/`
- 데스크톱 캡처: `output/playwright/home-main-1440.png`
- 모바일 캡처: `output/playwright/home-main-390.png`
- 전체 화면 나란히 비교: `output/playwright/home-reference-vs-implementation.png` (왼쪽 시안 / 오른쪽 구현)
- 칼럼 전환 녹화: `output/playwright/home-column-transition.gif`
- 데스크톱: CSS viewport 1440×1000, DPR 1, 전체 페이지 캡처
- 모바일: CSS viewport 390×844, DPR 1, 전체 페이지 캡처
- 정적 캡처 상태: `prefers-reduced-motion: reduce`로 순차 등장 완료 상태를 고정하고 지연 로딩 이미지를 모두 로드한 뒤 촬영
- 전환 녹화 상태: `prefers-reduced-motion: no-preference`, 헤더의 `원장 칼럼` 링크를 실제 클릭

## 전체 화면 비교

- 기존 히어로·대표원장·시설·오시는 길·푸터의 구조와 색·폰트는 유지했다.
- 질문 검색 박스에 고민 6칸을 추가하고 데스크톱 6열, 390px 2열로 전환했다.
- 기존 비전 문구·서명·외곽선 워드는 유지하면서 아래에 원칙 카드 3장을 추가했다.
- 보유 장비는 제목 왼쪽 여백과 첫 카드 시작점을 맞추고 링크가 있는 카드에만 `시술 안내 →`를 노출했다.
- 원장 칼럼은 특집 칼럼과 실제 발행 FAQ를 2열로 묶었으며, 칼럼이 한 편이어도 빈 카드가 생기지 않는다.
- 오시는 길과 푸터 사이에 상담 띠를 추가하고 기존 주소·진료시간·카카오톡 링크를 재사용했다.

## 집중 검수

- 질문 검색: 6칸 번호·이름·설명·링크가 모두 실제 텍스트로 렌더되며 한글 줄바꿈과 짧은 라벨 고정 규칙을 적용했다.
- 비전 원칙: 1440px 3열, 모바일 1열이며 카드 배경·번호·간격이 시안의 톤을 따른다.
- 장비: 첫 카드가 섹션 왼쪽 기준선에서 시작하고 누끼 이미지가 잘리지 않는다.
- 칼럼: 대표 이미지는 캠페인 이미지를 사용하고 원장 프로필 사진을 재사용하지 않는다. 질문 수는 실제 답변 2개를 자동 계산한다.
- 상담 띠: 모바일에서 카피와 버튼이 세로로 쌓이며 전화 링크는 `tel:`로 연결된다.
- 전환: 0.8초 동안 짙은 갈색 커버가 오른쪽에서 들어오고 메인 화면은 왼쪽으로 밀리며 어두워진다. 커버 완료 후 `/column`으로 이동한다.

## 수치·기능 검증

- 390px: `document.documentElement.scrollWidth === 390`
- 390px: `document.documentElement.clientWidth === 390`
- 브라우저 콘솔: 오류 0건; Next.js 개발 서버의 미사용 CSS preload 경고만 확인
- 메인 → 칼럼: 실제 클릭 후 최종 URL `/column`, 제목 `원장 칼럼 | 언주역 글로리의원`
- 새 콘텐츠: `/?edit=1`에서 고민·원칙·상담 키 6종의 편집 노드를 확인하고 고민 제목을 실제 클릭해 인라인 편집기(`contenteditable`)가 열리는 것까지 검증했다. 컬렉션 항목의 읽기·쓰기 경로도 콘텐츠 스토어에 추가했다.
- TypeScript: `npx tsc --noEmit --pretty false` 통과
- 프로덕션 빌드: `npm run build` 통과

## 반복 수정 이력

1. 참고 시안과 기존 메인을 1440px 전체 화면으로 나란히 비교했다.
2. 고민 6칸, 비전 원칙, 장비 시작점, 칼럼 2열, 상담 띠를 구현했다.
3. 지연 로딩 이미지와 순차 모션 때문에 초기 전체 캡처에서 빈 슬롯이 보이는 문제를 발견했다.
4. 실제 페이지를 끝까지 스크롤해 이미지를 로드하고 reduced-motion 완료 상태로 다시 캡처했다.
5. 390px에서 2열 고민 그리드, 1열 원칙·칼럼·상담 띠와 문서 폭을 재검수했다.
6. 실제 칼럼 링크 클릭을 10프레임으로 캡처해 전환 GIF를 만들고 최종 `/column` 도착을 확인했다.

## 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: 참고 시안의 히어로 카피는 현재 운영 콘텐츠를 유지하라는 요청에 따라 교체하지 않았다.
- P3: 참고 시안에는 질문 4개가 보이지만 현재 발행 데이터에 답변이 있는 FAQ는 2개이므로 의료 내용을 새로 만들지 않고 실제 2개만 표시했다.
- P3: 비전 원칙 3장은 첨부 시안의 빈 여백 대신 이번 요청서의 명시된 사양대로 추가했다.

## 기능·접근성 확인

- [x] 1440px·390px 반응형 배치
- [x] 390px 문서 가로 넘침 없음
- [x] 고민·비전·상담 신규 문구 편집 키 연결
- [x] 칼럼 FAQ 실제 데이터 자동 집계
- [x] 링크 없는 장비 CTA 숨김
- [x] Ctrl/⌘/휠 클릭은 기본 새 탭 동작 유지
- [x] `prefers-reduced-motion`에서 전환·등장 모션 생략
- [x] 콘솔 오류 없음

## 최종 결과

passed

---

# 공통 메가메뉴 운영 데이터 검수

## 기준

- 운영 홈페이지: `https://gloryclinic.co.kr` (2026-11-20 직접 확인)
- 검수 범위: 메뉴에 노출되는 시술 종류와 순서
- 디자인은 기존 구현을 유지하고 운영 홈페이지의 분류 데이터만 기준으로 삼았다.

## 운영 홈페이지와 일치하는 메뉴

- 리프팅: 써마지FLX, 울쎄라피프라임, 티타늄레이저, 온다, 세르프, 튠페이스, 슈링크유니버스, 올리지오
- 색소·모공: 큐어젯, 레블라이트SI, 셀렉IPL, 시크릿RF, 아그네스
- 주사시술: 줄기세포주사, 보톡스, 필러, 맞춤스킨부스터
- 스페셜필러: 목주름필러, 손등필러, 눈위·눈밑필러, 귓볼필러
- `인모드`, `리쥬란`, `리투오` 데이터는 다른 콘텐츠 호환을 위해 유지하되 메가메뉴에서는 제외했다.

## 확인

- 메뉴명은 `site-content.json` 편집 키로 연결했다.
- 메뉴 순서는 `megaMenuTreatmentOrder`에 운영 홈페이지 순서로 고정했다.
- 외부 이미지 URL 및 자리표시 문구는 메뉴에서 렌더링하지 않는다.
- 사용자의 요청에 따라 추가 화면 호출과 캡처는 중단하고 코드·타입·프로덕션 빌드로 마무리 검수했다.

## 최종 결과

passed

---

# 시술 상세 템플릿 — 장비형(써마지FLX) 디자인 QA

## 기준 화면과 상태

- 소스 시안: `/Users/jakembpm2/UGnasync/2026(유그린)/1101_글로리의원(GEO)/시술 상세 템플릿 — 장비형 (써마지FLX).pdf`
- 소스 렌더: `output/design-reference/thermage-template/page-1.png` ~ `page-5.png`
- 구현 라우트: `/treatments/lifting/thermage-flx`, `/treatments/lifting/onda`
- 데스크톱 캡처: `output/playwright/thermage-flx-1440.png`
- 모바일 캡처: `output/playwright/thermage-flx-390.png`
- 공개 상태 캡처: `output/playwright/thermage-flx-public-1440.png`, `output/playwright/thermage-flx-public-390.png`
- 소스 픽셀: 각 페이지 993×1404px, 총 5페이지
- 구현 데스크톱: CSS viewport 1440×1000, DPR 1, 전체 페이지 1440×7099px
- 구현 모바일: CSS viewport 390×844, DPR 1, 전체 페이지 캡처
- 검수 상태: `NEXT_PUBLIC_SHOW_REVIEW=true`로 검수 문구와 모든 유형별 섹션을 확인하고, 기본값 `false`로 미검수 칸·FAQ가 화면에서 숨는 상태를 별도로 확인

## 전체 화면 비교

- PDF 1페이지와 `thermage-flx-1440-top.png`를 같은 비교 입력에서 열어 히어로의 비율, 장비 누끼 위치, 보라 패턴, 카피 계층, 칩·CTA 배치를 비교했다.
- PDF 2~5페이지와 구현 전체 캡처를 대조해 작용 원리 → 비교표 → 핸드피스·팁 → 진행 → 통증·결과 → 약속 → 전후 관리 → FAQ → 관련 콘텐츠 순서를 확인했다.
- 390px 전체 캡처에서 2단 행의 1단 전환, 팁 2열, 세로 타임라인, 비교표 가로 스크롤 안내와 우측 페이드가 유지된다.

## 필수 충실도 검수

- 폰트·타이포그래피: 기존 Noto Sans KR·Montserrat 토큰을 재사용하고, 300/700 대비와 영문 자간을 시안에 맞췄다. 한글 제목·문장은 `word-break: keep-all`, `text-wrap: pretty`로 중간 분절을 막았다.
- 간격·레이아웃: 데스크톱 공통 340px | 1fr 그리드, 80px 간격, 섹션 120px 패딩과 sticky 제목을 적용했다. 모바일은 1열로 전환하며 문서 가로 넘침이 없다.
- 색·토큰: 써마지 #4A2878, soft #F3EFF8, light #C9B6E4를 CSS 변수로 연결했다. 흰 바탕을 기본으로 하고 지정된 세 섹션만 #F6F4F1, 핸드피스 구간은 #1C1428을 사용했다.
- 이미지 품질: 제공된 장비·핸드피스·정품 팁 PNG를 원본 비율로 사용하고 투명 누끼의 그림자와 라벤더 글로우만 CSS로 보조했다. 모든 콘텐츠 이미지에 alt가 있다.
- 카피·콘텐츠: 요청서에 제공된 의료 문구만 사용했다. 미확정 내용은 검수 모드에서만 `[원장 확인]`으로 나타나며 공개 모드에서는 해당 칸이나 FAQ가 숨는다.

## 집중 검수

- 히어로: 70개 선과 원형 패턴의 순차 드로잉, 장비 등장, 스크롤 패럴랙스와 reduced-motion 정지 상태를 확인했다.
- 핸드피스·팁: 1440px에서 360px | 1fr, 390px에서 팁 2열이며 이미지 잘림이나 투명도 잔상이 없다.
- 비교표: 하이라이트 열 배경과 셀 고정 줄바꿈을 확인했다. 모바일은 표만 가로 스크롤되고 페이지 본문 폭은 390px에 고정된다.
- FAQ: 첫 항목 기본 열림, 두 번째 항목 클릭 후 정상 열림을 확인했다.
- SEO: `MedicalProcedure`, `MedicalWebPage`, 검수 완료 FAQ만 포함한 `FAQPage`, 관련 칼럼 링크를 확인했다. 미확정 `bodyLocation`과 검수 문구는 JSON-LD에서 제외된다.

## 반복 수정 이력

1. 초기 데스크톱 전체 캡처에서 `clip-path: inset(100%)` 대상 자체를 IntersectionObserver가 관찰해 핸드피스·팁이 끝까지 보이지 않는 P1 문제를 발견했다.
2. `clip` 모드는 보이는 부모 컨테이너를 관찰하도록 수정하고 같은 1440px 상태를 다시 캡처해 핸드피스와 팁 4종이 모두 노출되는 것을 확인했다.
3. SVG 선 좌표의 서버·브라우저 부동소수점 차이로 hydration mismatch가 발생하는 P1 문제를 발견했다.
4. 선 좌표와 지연값을 모듈 상수에서 고정 소수점으로 정규화한 뒤 새로고침해 콘솔 오류 0건을 확인했다.
5. 검수 모드에서 반복 `[원장 확인]` 문자열이 같은 React key를 사용한 P2 문제를 발견했다.
6. 배열 인덱스를 key에 포함하도록 수정한 뒤 검수 모드에서 콘솔 오류 0건을 재확인했다.

## 잔여 차이와 판단

- P0/P1/P2 이슈 없음.
- P3: PDF의 30초 영상 카드는 12월 촬영 전이라 `src`가 비어 있다. 최신 보완 요청에 따라 검토 모드에는 촬영 사양이 적힌 내부 확인용 카드를 표시하고, 공개 모드에서는 DOM 자체를 생성하지 않는다.
- P3: 미확정 의료 값은 검수 모드에서 시안처럼 점선 배지로 표시되며 공개 화면에서는 숨는다. 이는 디자인 차이가 아니라 요청된 운영 상태 분기다.

## 기능·접근성 확인

- [x] 1440px·1024px·390px 가로 넘침 없음
- [x] 써마지FLX·온다 두 라우트 공통 템플릿 렌더
- [x] FAQ 키보드 기본 details/summary 동작
- [x] 모든 콘텐츠 이미지 alt, 히어로 장비 preload
- [x] reduced-motion에서 등장·패턴 모션 정지
- [x] 검수 모드와 공개 모드 분리
- [x] 브라우저 콘솔 오류 0건
- [x] `npm run build` 및 `npx tsc --noEmit` 통과

## 최종 결과

passed

---

# 칼럼 시안 정합 및 써마지 히어로 최종 QA

## 기준 화면과 상태

- 칼럼 메인 기준: `칼럼 메인 — 모바일 (390)@1x.png`와 기존 데스크톱 확정 시안
- 칼럼 상세 기준: `칼럼 상세 — 모바일 (390) 1 2@1x.png`, `칼럼 상세 — 모바일 (390) 2 2 · 이어서@1x.png`와 기존 데스크톱 확정 시안
- 시술 상세 기준: `시술 상세 템플릿 — 장비형 (써마지FLX).pdf`
- 구현 캡처: `output/playwright/column-final-1440.png`, `output/playwright/column-final-390.png`
- 상세 캡처: `output/playwright/column-detail-hero-final-1440.png`, `output/playwright/column-detail-final-390.png`
- 강조 확인 캡처: `output/playwright/column-detail-highlight-final-1440.png`
- 시술 캡처: `output/playwright/thermage-final-1440.png`, `output/playwright/thermage-final-390.png`
- 검수 viewport: 1440×1000, 390×844, DPR 1

## 비교 결과

- 메인 표지는 데스크톱·모바일 모두 `Glory's / Column`으로 통일하고, 검색창이 표지 경계에 각각 -44px/-30px 겹치도록 맞췄다. 데스크톱 검색창 상단은 표지 시작점 기준 590px이다.
- 대표 칼럼 사진은 상세 히어로와 분리된 `listImage` 상담 사진을 사용한다. 목록·대표 카드에는 상담 사진, 상세 상단에는 XERF 장비 사진이 표시된다.
- 상세 본문 강조는 노란색을 제거하고 `#FBD5CF` 하단 형광펜으로 통일했다. 스크롤 진입 전 0%, 진입 후 100% 너비로 그려지는 상태를 확인했다.
- 섹션 영문 라벨은 모두 대문자, 데스크톱 10px/모바일 9px, 자간 .24em으로 동일하다.
- 03·04 lead는 별도 문단이 아니라 첫 본문 문단의 `<strong>`으로 결합되어 문단 리듬이 시안과 일치한다.
- 비교표 caption은 13px/400/#766E66이며 모바일 표는 390px 안에서 고정 레이아웃으로 렌더된다.
- 칼럼 메인 Q&A 첫 답변은 짧은 결론을 굵게, 이어지는 본문을 400으로 분리했다. 검수 배지는 검수 모드에서만 노출된다.
- 칼럼 하단 장비 카드의 이미지 바탕은 #F3EEE8, 최근 발행 메타는 `날짜 · 고민` 한 줄이며 제목 배경 박스가 없다.
- 써마지 히어로 방사형 선은 1px, 최종 불투명도 .18로 낮추고 중심을 장비 뒤 오른쪽 아래에 배치했다.

## 기능·접근성 확인

- [x] 390px에서 `document.documentElement.scrollWidth === 390`
- [x] 모바일 상세 목차 `position: sticky`, `top: 56px`
- [x] 스크롤 후 진행 막대 scale 값 증가
- [x] 핑크 형광펜 애니메이션 및 reduced-motion 완성 상태
- [x] 메인·상세·시술 상세 브라우저 콘솔 오류 0건
- [x] 데스크톱·모바일 제목과 칩의 한글 단어 중간 분절 없음
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build` 통과

## 최종 결과

passed

---

# 써마지FLX 타이포·모바일 모션 최종 QA

## 증거

- 기준 PDF: `시술 상세 템플릿 — 장비형 (써마지FLX).pdf`
- 구현 전체 캡처: `output/playwright/thermage-typography-final-1440-loaded.png`
- 상단 나란히 비교: `output/playwright/thermage-compare-page1.png`
- 핸드피스·팁 나란히 비교: `output/playwright/thermage-compare-page3.png`
- CSS viewport: 1440×900, `NEXT_PUBLIC_SHOW_REVIEW=true`

## 비교 결과

- 히어로를 816px 리듬으로 맞추고 제목을 64px, 300/700, 자간 0, 줄높이 1.15로 조정했다.
- 본문 색 `#231F1C`, 보조색 `#6B6560`, 써마지 보라 `#4B2D73`을 적용했다.
- 섹션 영문 라벨·제목·리드·비교표·진행 단계·다짐·FAQ·상담 띠·푸터의 크기와 굵기를 PDF와 나란히 비교했다.
- 핸드피스의 배경 광원을 제거하고 380px 테두리 프레임, -18도 회전, 내용 높이 팁 카드를 적용했다.
- 공개 모드는 검토 전용 `1인 1팁`을 숨기고 검토 모드만 3칸을 표시한다.
- 칼럼 모션은 모바일에서 시간·지연을 모두 0.75배, 패럴랙스 거리를 0.5배로 통일했다.
- 홈→칼럼 전환은 클릭한 사각형에서 전체 화면으로 펼쳐지고, reduced-motion은 0.2초 페이드로 대체된다.

## 검증

- [x] 수정 TSX 접근성·이벤트 정리·수동 전역 리스너 해제 확인
- [x] 프로덕션 빌드와 TypeScript 통과
- [x] ESLint 오류 0건; 수정 범위 밖 기존 경고 8건
- [x] `git diff --check` 통과

## 최종 결과

passed

---

# 홈 비전 타이포·칼럼 상세 간격 최종 QA

## 증거와 환경

- 홈 비전 기준: `/var/folders/qz/9f9fdlpn72gdc0qtrn0l7vgr0000gn/T/TemporaryItems/NSIRD_screencaptureui_KTpBdj/스크린샷 2026-11-23 오후 11.44.55.png`
- 칼럼 상세 기준: `/var/folders/qz/9f9fdlpn72gdc0qtrn0l7vgr0000gn/T/TemporaryItems/NSIRD_screencaptureui_soaKfk/스크린샷 2026-11-23 오후 11.46.44.png`
- 구현 캡처: `output/playwright/home-vision-font-opacity-final.png`, `output/playwright/column-detail-image-gap-reveal-final-1024.png`, `output/playwright/column-detail-image-to-section3-gap-final-1024.png`, `output/playwright/column-detail-image-gap-final-390.png`
- 나란히 비교: `output/design-qa/vision-source-vs-implementation.png`, `output/design-qa/column-spacing-source-vs-implementation.png`
- 검수 viewport: 1440×900, 1024×900, 390×844, DPR 1

## 비교 결과

- 홈 비전 제목은 바로 앞 DIRECTOR 제목과 동일한 Noto Sans KR, 300 굵기, 자간 0을 사용한다. 강조 줄만 700으로 유지해 기존 계층을 보존했다.
- 비전 사진의 최종 불투명도는 0.85로 제한해 이전보다 15% 더 투명하게 보이며, 텍스트 대비와 GLORY 외곽선 가독성은 유지된다.
- 칼럼 상세의 상담 사진은 완전히 가려진 figure 자체가 아니라 보이는 부모를 관찰하도록 변경해, 처음 접근하거나 빠르게 스크롤해도 리빌이 정상 완료된다.
- 섹션 02 표에서 상담 사진까지, 상담 사진 캡션에서 섹션 03까지의 여백은 각각 56px로 맞췄다. 비교 입력에서 보이던 비정상적인 빈 영역이 없다.
- 1024px와 390px에서 사진·캡션·다음 섹션이 순서대로 이어지며 문서 가로 넘침이 없다.

## 검증

- [x] 홈 비전 제목의 font-family/font-weight가 DIRECTOR 제목과 일치
- [x] 비전 사진 최종 opacity 0.85
- [x] 상담 사진 리빌 활성 상태 및 clip-path 해제
- [x] 표→사진 56px, 사진→03 섹션 56px
- [x] 390px에서 `scrollWidth === clientWidth === 390`
- [x] 브라우저 콘솔 오류 0건
- [x] `npm run build` 통과
- [x] `npm run lint` 오류 0건; 수정 범위 밖 기존 경고 8건
- [x] `git diff --check` 통과

## 최종 결과

passed

---

# 홈 비전 외곽선·칼럼 대표 사진 패럴럭스 최종 QA

## 증거와 환경

- 홈 비전 기준: `/var/folders/qz/9f9fdlpn72gdc0qtrn0l7vgr0000gn/T/TemporaryItems/NSIRD_screencaptureui_ni9ZrI/스크린샷 2026-11-24 오전 12.20.04.png`
- 칼럼 대표 사진 기준: `/var/folders/qz/9f9fdlpn72gdc0qtrn0l7vgr0000gn/T/TemporaryItems/NSIRD_screencaptureui_YTjc9m/스크린샷 2026-11-24 오전 12.20.37.png`
- 구현 캡처: `output/playwright/home-vision-1940.png`, `output/playwright/column-feature-parallax-before.png`, `output/playwright/column-feature-parallax-after.png`, `output/playwright/column-feature-parallax-3840.png`
- 같은 비교 입력: `output/design-qa/home-vision-reference-current.png`, `output/design-qa/column-feature-reference-current.png`
- 검수 viewport: 3840×1440, 1440×900, 390×844, DPR 1

## 비교 결과

- 홈 비전의 `GLORY`는 바로 앞 `DIRECTOR`와 동일한 `OutlineWord` 리빌 방식, 170px 상한, 6px 자간, line-height 1을 사용한다. 기존의 260px 대형 글자와 별도 tracking 모션을 제거했다.
- 비전의 한글 제목은 기존 Noto Sans KR 300/700 계층과 34px 리듬으로 되돌려 과도하게 커지거나 다른 글꼴처럼 보이던 상태를 제거했다.
- 칼럼 대표 사진은 `featureVisual` 자체가 아니라 192px 세로 오버스캔을 가진 내부 이미지 레이어만 이동한다. 따라서 제목·흰 카드·섹션 레이아웃은 고정되고 사진만 스크롤과 다른 속도로 움직인다.
- 1440px 검수에서 이미지 레이어 transform이 `translateY(-54.35px)`에서 `translateY(28.40px)`로 변해 82.75px의 실제 패럴럭스 이동을 확인했다.
- 390px에서는 같은 구간이 `translateY(-13.51px)`에서 `translateY(17.89px)`로 이동하고, 모바일 거리 배율 0.5와 `scrollWidth === clientWidth === 390`을 유지한다.

## 필수 충실도 검수

- 폰트·타이포그래피: `DIRECTOR`와 `GLORY`의 Montserrat 외곽선 자형, 굵기, 자간, 리빌 방식을 통일했다.
- 간격·레이아웃: 패럴럭스는 transform만 사용해 카드와 다음 섹션 위치 및 CLS에 영향을 주지 않는다.
- 색·토큰: 비전 배경과 외곽선은 기존 paper/#CDBEAD 토큰을 유지하고, 칼럼 이미지는 기존 그라디언트와 브랜드 색을 보존한다.
- 이미지 품질: XERF 장비 이미지는 `object-fit: cover`를 유지하며 최대 이동량보다 큰 오버스캔으로 상하 빈 가장자리가 드러나지 않는다.
- 카피·콘텐츠: 문구와 줄바꿈은 변경하지 않았다.

## 검증

- [x] 패럴럭스가 기존 passive scroll + requestAnimationFrame 경로만 사용
- [x] reduced-motion에서 패럴럭스 변수 기본값 0으로 즉시 표시
- [x] 데스크톱·모바일 브라우저 콘솔 오류 0건
- [x] 390px 문서 가로 넘침 없음
- [x] `git diff --check` 통과
- [x] `npm run build` 통과
- [x] `npm run lint` 오류 0건; 수정 범위 밖 기존 경고 8건

## 최종 결과

passed

---

# 기존 사이트 원장 칼럼 4개 이전 QA

## 기준과 구현 증거

- 콘텐츠 기준: `content/columns-legacy.ts`의 원문·문단 순서·소제목·그림 표기와 기존 사이트 URL
- 구현 라우트: `/column/ulthera-prime-shots`, `/column/ulthera-low-volume-face`, `/column/thermage-vs-ulthera`, `/column/lifting-cold-compress`
- 정적 출력: `.next/server/app/column/<slug>.html`, `.next/server/app/sitemap.xml.body`, `.next/server/app/llms.txt.body`, `.next/server/app/llms-full.txt.body`
- 이미지 원본: `public/uploads/columns/<slug>/` 아래 doctor 4개, 본문 figure 5개. 총 9개 파일의 형식과 실제 픽셀 크기를 확인했다.
- 요청된 비교 상태: 1440px와 390px, 공개 모드

## 전체·집중 검수

- 네 칼럼 모두 프로덕션 정적 페이지로 생성되고 `/column` 카드가 실제 상세 URL과 doctor 이미지를 사용한다.
- `###` 원문 표기는 목차를 늘리지 않는 섹션 내부 `h3`로 변환된다. 볼패임 칼럼 4개, 울쎄라·써마지 비교 칼럼 4개를 정적 HTML에서 확인했다.
- 본문 그림은 원문 순서대로 `figure`로 변환되고 칼럼별로 `그림 N.` 번호가 매겨진다. 5개 그림의 alt·caption·실제 width/height가 일치한다.
- 레거시 본문·핵심 요약·FAQ·소제목의 줄바꿈은 `br-d`로 출력된다. CSS에서 1024px 미만은 숨고 1024px 이상에서만 표시된다.
- 메타 description과 OG description은 각 칼럼의 `metaDescription`을 동일하게 사용한다. JSON-LD와 llms 출력에는 원문의 줄바꿈 문자가 남지 않는다.
- 기존 `/column/xerf-vs-thermage` 정적 HTML에는 `br-d`, 레거시 소제목, 레거시 figure 클래스가 추가되지 않아 기존 렌더 경로가 유지된다.
- sitemap과 llms에 네 URL이 모두 포함된다.

## 기능·코드 검증

- [x] `npm run build` 통과 — Next.js 16.4.5, 46개 정적 페이지 생성
- [x] `npm run lint` 오류 0건 — 수정 범위 밖 기존 경고 8건
- [x] `git diff --check` 통과
- [x] 수정 TSX의 이미지 alt, 실제 크기, 안정적인 key, 기존 클라이언트 상태 경로 확인
- [x] 이미지 9개 형식·크기 확인
- [x] 원문 마크업 문자열(`###`, `![...]`)이 최종 HTML 본문에 노출되지 않음

## 제한과 후속 검수

- 이 실행 환경에서는 브라우저 호스트가 제공되지 않고 샌드박스의 macOS 브라우저 실행 권한도 거부되어 1440px·390px 신규 화면 캡처를 만들 수 없었다.
- 저장소 안에서 `Legacy3`~`Legacy6` 원본 보드 이미지도 찾을 수 없어, 동일 viewport의 소스/구현 병합 비교와 390px 실제 `scrollWidth` 측정은 수행하지 못했다.
- 코드·정적 출력·프로덕션 빌드 검증은 통과했지만, 요청된 시각 비교 증거가 없으므로 디자인 QA 결과는 차단 상태로 기록한다.

## 최종 결과

blocked

---

# 칼럼 책갈피 회귀·홈 검색 겹침 QA (2026-11-24)

## 기준과 구현 증거

- 기준: 캔버스 `확정 · 원장 칼럼`의 `MotionBookmark` 상태 정의와 이번 요청의 좌표·진행률·색상 수치
- 휠 1회: `output/playwright/column-bookmark-wheel-1-searchfix.png`
- 휠 2회: `output/playwright/column-bookmark-wheel-2-searchfix.png`
- 책갈피 완료: `output/playwright/column-bookmark-complete-searchfix.png`
- 맨 위 복귀: `output/playwright/column-bookmark-reverse-searchfix.png`
- 느린 정방향·역방향 스크럽: `output/playwright/column-bookmark-slow-scroll.gif`
- 홈 전환 직후 스크롤: `output/playwright/home-to-column-immediate-scroll.png`
- 홈 자동완성: `output/playwright/home-search-autocomplete-1440.png`, `output/playwright/home-search-autocomplete-390.png`
- 책갈피 검색 자동완성: `output/playwright/column-bookmark-search-autocomplete.png`

## 책갈피·헤더 상태 검증

- 120px에서 복제 제목 텍스트가 `Glory's\nColumn` 두 줄 모두 유지되고, 원본은 숨김·복제본은 표시 상태다. 헤더는 fixed, 높이 64.41px로 연속 보간됐다.
- 240px에서 제목·검색창이 같은 프레임 진행률로 축소·이동하고 헤더는 56.78px까지 줄었다. 프레임별 CSS transition 없이 14% 추종 루프만 사용한다.
- 640px에서 책갈피는 `84×300px`, top 56px, 헤더는 56px이며 둘 다 `#3A3028`이다. 검색 복제본은 opacity 0, 책갈피 버튼은 활성 상태다.
- 0px로 복귀하면 복제본 opacity 0, 원본 제목·검색 visibility visible, 책갈피 높이 0, 헤더 72px·absolute 상태가 복구된다.
- 홈에서 칼럼으로 전환 직후 스크롤해도 제목 두 줄이 함께 표시되고 `scrollWidth === innerWidth === 1440`을 유지했다.
- 검색 패널은 Esc로 닫히며 `aria-expanded`가 `false`로 돌아온다.

## 홈·책갈피 자동완성 검증

- 홈 1440px에서 목록 열림 시 input row z-index 50, 목록 z-index 80, 배경 `rgb(255,255,255)`, 그림자 `0 18px 40px rgba(31,24,19,.16)`이다.
- 목록이 열린 전후 `popular`와 `concernSection`의 y 좌표가 동일해 아래 콘텐츠는 이동하지 않는다. 겹치는 지점의 `elementFromPoint`가 목록 내부 행을 반환해 칩·고민 카드 위에 그려짐을 확인했다.
- 홈 390px에서도 같은 쌓임 순서를 유지하고 `scrollWidth === 390`이다.
- `세르프`는 결과 자식이 1개이며 단일 열 전체 폭을 사용하고 `관련 칼럼 0` 문구가 없다.
- `울쎄라`는 `관련 칼럼 1`, 결과 자식 2개로 관련 칼럼 블록이 정상 표시된다.
- 책갈피 패널도 input row z-index 50, 목록 z-index 80이며 키워드 칩과 겹치는 좌표에서 목록이 최상단이다.

## 자동 검증

- [x] `npm run build` 통과 — Next.js 16.4.5, 46개 정적 페이지 생성
- [x] `npm run lint` 오류 0건 — 수정 범위 밖 기존 경고 8건
- [x] `git diff --check` 통과
- [x] React 검토: 파생 boolean은 렌더에서 계산, 새 전역 listener·waterfall 없음, 기존 combobox/listbox 접근성 유지

## 최종 결과

passed

---

# 홈 비전 외곽선·칼럼 책갈피 회귀 QA (2026-11-24)

## 비교 기준과 증거

- 글꼴 기준: 같은 홈 화면의 `DIRECTOR` SVG 외곽선 컴포넌트
- 홈 비전 시작 상태: `output/playwright/home-vision-start-mask.png`
- GLORY 외곽선 집중 캡처: `output/playwright/home-vision-glory-close.png`
- 반투명 원칙 카드: `output/playwright/home-vision-cards-translucent.png`
- 책갈피 휠 1회: `output/playwright/column-bookmark-wheel-1-fixed.png`
- 책갈피 완료 상태: `output/playwright/column-bookmark-complete-fixed.png`
- 검수 viewport: 데스크톱 1440px, 모바일 390px

## 정확성 확인

- `DIRECTOR`와 `GLORY`는 같은 `OutlineWord` SVG `<text>` 경로를 사용한다. 두 요소 모두 Montserrat 700, 150px, 자간 -2px이며 CSS 글자 외곽선 대체 경로를 제거했다.
- GLORY는 2px SVG stroke의 글리프 안쪽 절반을 luminance mask로 제거해 화면상 약 1px 외곽선만 남긴다. 글자 내부는 투명하고 R·Y 접합부의 겹친 쐐기 선은 보이지 않는다.
- 기존 `.svg` clip-path 리빌 경로를 그대로 사용하므로 왼쪽에서 오른쪽으로 그려지는 기존 등장 모션과 비전 디졸브 위치·크기·진행 구간은 유지된다.
- 원칙 카드 배경은 `rgba(255,255,255,.78)`과 10px backdrop blur로 바꿔 사진이 은은하게 비치며 본문 대비를 유지한다.
- 책갈피 복제본은 제목 두 줄과 검색창·키워드 전체를 동일한 요소에서 복제·측정한다. 복제본 내부의 진입 transform·animation·opacity를 제거해 첫 휠에서 한 줄이 사라지거나 좌표가 튀지 않는다.
- 복제 레이어를 `document.body` portal로 옮겨 상위 transform의 영향을 없앴다. 제목·검색 복제본에는 프레임 간 CSS transition이 없고, 실제 스크롤 위치를 매 프레임 14%씩 따라간다.
- 헤더 높이는 같은 진행률로 72px에서 56px로 줄고 책갈피 top·검색 패널 top이 이를 따라간다. 완료 상태에서 헤더와 책갈피 배경이 같은 `#3A3028`로 이어지고 연브라운 띠는 책갈피 아래쪽에 있다.
- 맨 위로 돌아오면 원본 제목·검색창 visibility, 72px 헤더, 책갈피 높이 0이 복구된다.

## 동작·반응형 확인

- [x] 1440px 휠 1회·2회·완료 상태에서 제목 두 줄과 검색창이 연속 이동
- [x] 검색 패널 열기, 입력 포커스, Esc 닫기
- [x] Feature 01 사진과 흰 카드가 서로 반대 방향으로 패럴랙스
- [x] 홈 비전 디졸브와 Feature 패럴랙스에 동일한 14% 스무딩 적용
- [x] 390px에서 `document.documentElement.scrollWidth === 390`
- [x] 1023px 이하 책갈피 레이어 숨김
- [x] 칼럼 메인 헤더 높이 390px에서 56px, 641~1023px에서 64px 유지
- [x] reduced-motion·개발 편집 모드 우회 유지
- [x] `npm run build` 통과 — 46개 페이지 생성
- [x] `npm run lint` 오류 0건 — 수정 범위 밖 기존 경고 8건
- [x] `git diff --check` 통과

## 최종 결과

passed

---

# 칼럼 표지 책갈피·전역 TOP 버튼 QA

## 기준과 구현 증거

- 기준 시안: 캔버스 `확정 · 원장 칼럼`의 `MotionBookmark` 보드와 요청서의 수치·상태 정의
- 구현: `components/ColumnBookmark.tsx`, `components/ColumnBookmark.module.css`, `components/ScrollToTopButton.tsx`, `components/ScrollToTopButton.module.css`
- 정적 출력: `.next/server/app/column.html` 및 홈·칼럼 상세·시술 상세·원장 소개 정적 HTML
- 검수 대상 상태: `/column` 1440px 정방향/역방향 스크럽, 검색 패널 열기·닫기, 공통 TOP 버튼 1440px/390px

## 코드·정적 출력 검수

- 책갈피 진행률은 `scrollY / 560`을 passive scroll listener와 requestAnimationFrame 한 번/프레임으로 계산한다. 제목·검색 복제본은 transform/opacity만 사용하고 원본 공간은 유지해 CLS를 만들지 않는다.
- 제목 회전은 p .5~.95, 책갈피 높이는 p .42~.9, 검색 복제본 페이드는 p .7~.92, 검색 버튼 활성화는 p>.92로 분리했다. 위로 스크롤하면 동일 진행률을 역으로 사용해 원상 복귀한다.
- 검색 패널은 기존 `ColumnSearch` 데이터·검색 로직을 그대로 사용하며 별도 ID prefix를 적용해 원본 검색창과 ID가 겹치지 않는다. ×, Esc, 바깥 클릭, p<.9 닫기와 입력 자동 포커스를 구현했다.
- 1023px 이하에서는 책갈피 레이어를 표시하지 않는다. reduced-motion에서는 복제·회전을 생략하고 책갈피와 패널을 0.2초 페이드로 처리한다. 개발 편집 모드에서도 책갈피 모션을 끈다.
- 공통 레이아웃에는 `aria-label="맨 위로"` 버튼이 정확히 한 번 렌더된다. 기존 `FloatingQuickMenu`의 중복 TOP 버튼은 제거했다.
- 홈, `/column`, 칼럼 상세, 시술 상세, 원장 소개의 정적 HTML에서 공통 TOP 버튼 한 개를 확인했다. 칼럼 모바일 바는 `phone`, 공통 빠른 상담 바는 `tablet` 표식을 사용해 버튼 하단 간격을 각각 보정한다.
- 검색·닫기·위쪽 화살표는 기존 Heroicons를 사용하고, 모든 버튼에 포커스 링과 접근 가능한 이름을 제공한다.

## 자동 검증

- [x] `npm run build` 통과 — Next.js 16.4.5, 46개 정적 페이지 생성
- [x] `npm run lint` 통과
- [x] `git diff --check` 통과
- [x] `/column` 정적 HTML의 원본/미니 검색 input ID가 각각 1개이며 서로 다름
- [x] 주요 정적 페이지마다 전역 TOP 버튼이 정확히 1개
- [x] passive scroll + rAF, reduced-motion, 키보드 포커스·Esc 경로 코드 검수

## 제한과 후속 검수

- 현재 실행 환경의 브라우저 호스트가 연결되지 않았고 로컬 서버 포트도 `EPERM`으로 차단되어, MotionBookmark 보드를 직접 스크롤하거나 1440px/390px 구현 화면을 캡처할 수 없었다.
- 사용자의 화면에 브라우저 창이나 완료 알림을 띄우지 않는 조건을 지켜 별도 네이티브 브라우저 실행은 하지 않았다.
- 따라서 요청된 1440px GIF, 패널 실동작 영상, 홈·상세·시술 1440px/390px 위치 스크린샷과 소스/구현 병합 비교는 증거가 없어 완료로 판정하지 않는다.

## 최종 결과

blocked
