# 작업 요청 #5 — 손맛 모션 적용 보고서

## 최종 결과

- `npm run build`: PASS
- `npx tsc --noEmit`: PASS
- Playwright 데스크톱·모바일 6개 전 화면 스크롤: 콘솔 오류 0
- 편집 모드: 실행 중 애니메이션 0, 타이핑 예시 비노출, 기존 편집 UI 정상
- 동작 줄이기: 모든 내용이 완성된 상태로 표시
- JS 비활성: 홈·칼럼 상세의 글과 숫자가 초기 HTML에 존재
- 모션용 `==…==` 표기: 화면·메타·JSON-LD·RSS·llms·knowledge 내보내기에서 기호 제거 확인

## 1~9 구현·확인표

| 번호 | 결과 | 구현 및 확인 방법 |
|---:|:---:|---|
| 1 | PASS | 홈 히어로 제목 2줄을 0.15초 간격으로 올리고 부제를 0.5초 뒤 표시했습니다. 6초 진행 막대의 완료 이벤트와 슬라이드 전환을 동기화했고, 9초 1.08→1.0 배경 축소·호버/포커스 정지·정지/재생 버튼을 확인했습니다. |
| 2 | PASS | 빈 질문창에 4개 예시를 타이핑→1.6초 대기→삭제 순환합니다. 포커스·입력 즉시 중지되고 기존 placeholder·자동완성·IME 검색을 유지합니다. `home.question.typingExamples`를 사이트 정보 편집 패널에서 줄 단위로 수정·저장할 수 있습니다. |
| 3 | PASS | DIRECTOR·VISION·COLUMN을 SVG text로 교체하고 2.6초 선 그리기, 배경색 fill, 이중선, `feTurbulence` 연필 떨림을 적용했습니다. 데스크톱·모바일 viewBox 비율과 기존 위치를 확인했습니다. |
| 4 | PASS | 홈·칼럼 메인 원장 사진에 clip-path 커튼과 1.15→1.0 축소, 연차 숫자 0→최종값 1.1초 카운트, 약력 0.12초 순차 페이드업을 적용했습니다. SSR에는 최종 숫자가 그대로 있습니다. |
| 5 | PASS | 홈 비전·칼럼 원장 박스의 서명 이미지를 모션 컴포넌트로 통일했습니다. SVG path는 길이를 측정해 약 2초 순차 드로잉하고, PNG/JPG/WebP는 1.2초 좌→우 마스크로 대체합니다. 서명 항목만 SVG 업로드를 허용하며 안내는 `docs/motion/signature.md`에 기록했습니다. |
| 6 | PASS | 장비를 약 38초 무한 연속 흐름으로 바꾸고, 버튼 한 칸 이동 뒤 흐름 복귀, 호버/포커스·정지 버튼 일시정지, 카드 이미지 14px 상승·1.04배, 섹션 진입 순차 상승을 확인했습니다. 복제 카드는 `aria-hidden`·탭 제외이며 편집 모드는 기존 단계 이동을 유지합니다. |
| 7 | PASS | 본문 `==문장==`을 실제 `<mark>`로 렌더링해 1.1초 형광펜 효과를 적용하고 두 번째 표시는 0.5초 늦췄습니다. 목차 현재 항목은 왼쪽 선·진한 글자로 맞췄습니다. 공개 출력에서는 `==` 기호가 남지 않습니다. |
| 8 | PASS | 홈 최신 칼럼, 칼럼 메인 최신 칼럼, 카테고리·전체 목록 카드에 0.12초 순차 페이드업과 1.2초 사진 1.05배 호버 확대를 적용했습니다. |
| 9 | PASS | 시설 갤러리를 가운데 1.0, 좌우 0.78, 바깥 숨김으로 구성하고 4초 자동 이동·0.9초 전환·옆 카드/막대 이동·정지 버튼·호버/포커스 정지·모바일 스와이프를 확인했습니다. 가운데 실제 이미지는 기존 라이트박스를 열며, 토프 배경은 passive scroll+rAF로 0.12 패럴랙스합니다. |

## 편집 모드·접근성·SSR

| 항목 | 결과 |
|---|:---:|
| `?edit=1`에서 모든 모션 중지 | PASS — `document.getAnimations()`의 running 항목 0개 |
| `prefers-reduced-motion: reduce` | PASS — 타이핑·자동 전환·드로잉·패럴랙스가 꺼지고 최종 화면 표시 |
| 호버·키보드 포커스 자동 요소 정지 | PASS — 히어로·장비·갤러리 |
| 명시적 정지/재생 버튼 | PASS — 히어로·장비·갤러리, `aria-pressed`·동작 라벨 포함 |
| JS 비활성 홈 | PASS — HTTP 200, `대표원장이 직접 진행합니다`, `13년 피부 진료 경험` 확인 |
| JS 비활성 칼럼 상세 | PASS — HTTP 200, 본문 질문·`이 글의 핵심` 확인 |
| 모션 표기 공개 출력 | PASS — 화면·title·description·JSON-LD·RSS·llms·knowledge에서 `==` 없음 |

## Playwright 산출물

### 전체 스크롤 WebM

| 화면 | 1440px | 390px |
|---|---|---|
| 홈 | [home-1440.webm](./motion/home-1440.webm) | [home-390.webm](./motion/home-390.webm) |
| 칼럼 메인 | [column-main-1440.webm](./motion/column-main-1440.webm) | [column-main-390.webm](./motion/column-main-390.webm) |
| 칼럼 상세 | [column-detail-1440.webm](./motion/column-detail-1440.webm) | [column-detail-390.webm](./motion/column-detail-390.webm) |

Playwright가 연속 스크롤 프레임을 캡처하고 로컬 FFmpeg가 WebM으로 묶었습니다. 해상도는 각각 1440×900, 390×844이며 영상 길이는 약 10~14초입니다.

### 동작 줄이기 스크린샷

- [홈 1440px](./motion/reduced-home-1440.png)
- [칼럼 상세 390px](./motion/reduced-column-detail-390.png)

두 캡처 모두 외곽선 글자·사진·숫자·카드·본문이 숨김 없이 완성된 상태입니다.

## 성능·LCP·CLS 비교

적용 전 기준은 [작업 #3 보고서](./report-3.md)의 Lighthouse 13 모바일 운영 빌드 결과입니다.

| 화면 | 적용 전 Lighthouse 성능 | 적용 전 LCP | 적용 전 CLS | 적용 후 로컬 LCP¹ | 적용 후 CLS¹ |
|---|---:|---:|---:|---:|---:|
| 홈 | 95 | 2.4s | 0 | 0.204s | 0.000053 |
| 칼럼 메인 | 95 | 2.4s | 0.001 | 0.196s | 0 |
| 칼럼 상세 | 98 | 2.0s | 0.006 | 0.196s | 0.001009 |

¹ 적용 후 값은 Playwright 모바일 390px 로컬 브라우저에서 `PerformanceObserver`의 buffered LCP·layout-shift를 직접 측정한 값이며 네트워크/CPU 제한이 없는 수치입니다. CLS는 모두 목표 0.05 이하입니다. 격리 실행 환경이 Lighthouse의 별도 Chrome 디버깅 소켓 연결을 `EPERM`으로 막아 적용 후 Lighthouse 점수 재측정은 완료하지 못했습니다. 점수를 추정하거나 기존 JSON을 새 결과로 재사용하지 않았습니다.

첫 화면의 SSR 표시를 유지하고, 히어로 모션은 hydration 직후 transform/opacity에만 적용해 레이아웃 크기를 바꾸지 않습니다. 나머지 섹션은 화면 도착 시에만 1회 실행합니다.

## React 품질 점검

- 타이머·IntersectionObserver·ResizeObserver·scroll·keydown 이벤트 정리 함수 확인
- 무한 흐름 복제 카드의 접근성 트리·탭 제외 확인
- 애니메이션 상태와 편집 데이터 상태 분리, 외부 상태 저장에 localStorage 미사용
- 이미지 크기 슬롯 유지, transform/clip-path 중심으로 CLS 방지

## 커밋

- `Apply handcrafted motion system` (이 보고서와 모션 산출물을 포함하며 push 하지 않음)
