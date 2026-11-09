# 작업 요청 #2-2 검증 보고서

## 요약

- `npm run build`: **PASS** (Next.js 16.4.3, TypeScript 및 정적 페이지 18개 생성)
- `TREATMENT_PAGES_READY=false`: **PASS** — 시술 항목에 `/treatment/` 링크가 없고 `aria-disabled="true"`로 출력
- `TREATMENT_PAGES_READY=true`: **PASS** — 같은 항목이 `/treatment/{slug}` 링크로 출력
- `npm run knowledge:export`: **PASS** — 공개 칼럼 1건 + 공개 Q&A 1건
- 공개 독자 질문: 화면 HTML 및 `FAQPage` JSON-LD에 동일 문답 포함, JSON 파싱 **PASS**
- 실제 로컬 Q&A API: 저장 200, 1분 제한 400, URL 차단 400, honeypot 무저장 200 확인 후 테스트 질문 제거
- 원격 저장소 push 없음

## 1~10 항목별 확인

| 항목 | 결과 | 확인 방법 |
|---|:---:|---|
| 1. 홈 헤더 메가메뉴 | PASS | 홈·칼럼 공통 `ColumnHeader`로 통합했습니다. 홈에서 병원소개와 시술 메뉴의 hover/focus 개방, 흰 헤더 전환, 0.2초 페이드, 4열·72px 썸네일 구조를 1440px Chrome에서 확인했습니다. 병원소개 5개 앵커와 모바일 햄버거·아코디언도 확인했습니다. |
| 2·3. 시술 연결 준비 | PASS | 모든 `Treatment`에 `/treatment/{slug}` 형식 `detailPath`를 생성했습니다. 기본값 false 빌드에서 홈 장비·메가메뉴·칼럼 시술 카드가 링크가 아닌 `aria-disabled` 요소이고 “시술 안내 준비 중”으로 표시됩니다. true 빌드에서는 같은 위치에 실제 링크가 생성됩니다. |
| 4. 모바일 하단 고정 바 | PASS | 390px와 1024px에서 전화 버튼, 56px 이상 높이, 안전 영역 여백, 본문 하단 패딩을 확인했습니다. 빈 카톡·예약 URL은 숨기고, 1024px 이하에서는 오른쪽 세로 메뉴를 숨깁니다. |
| 5. 지금 진료 중 | PASS | `Asia/Seoul` 기준으로 마운트 후 계산하고 1분마다 갱신합니다. `09:00-18:00 / 13:00-14:00`, 휴진 샘플로 진료 중·점심시간·진료 종료·오늘 휴진·빈 값 숨김을 각각 단위 실행해 모두 PASS를 확인했습니다. |
| 6. 고정 헤더·맨 위로 | PASS | 전 페이지 공통 헤더가 80px 이후 96→72px로 축소되고 흰 배경·그림자로 고정됩니다. 600px 이후 맨 위로 버튼이 나타나며 reduced-motion에서는 즉시 이동합니다. 1024px 스크롤 상태를 캡처했습니다. |
| 7. 질문 자동완성 | PASS | 홈 질문창·칼럼 검색에 제목+FAQ 최대 6개 추천, 일치 글자 강조, `combobox/listbox/option`, ↑↓·Enter·Esc 및 마우스 선택을 구현했습니다. 제목은 칼럼으로, FAQ는 해당 `#faq-N` 앵커로 연결됩니다. 추천이 없으면 기존 검색 결과만 유지됩니다. |
| 8. 읽기 진행 바·공유 | PASS | 칼럼 본문 기준 2px 진행 바, 상·하단 공유 버튼, 링크 복사 2초 안내, Web Share API, Kakao SDK 조건부 로딩을 확인했습니다. `NEXT_PUBLIC_KAKAO_JS_KEY`가 없으면 카카오 버튼과 SDK가 출력되지 않습니다. |
| 9. 갤러리 크게 보기 | PASS | 실제 이미지가 있을 때만 열림, 어두운 전체 화면, 이전·다음·닫기, ←→·Esc, 모바일 스와이프, 공간명 캡션을 구현했습니다. 캡처용 SVG로 모달을 확인한 뒤 `src:null`로 원복했습니다. 편집 모드에서는 기존 이미지 편집이 우선합니다. |
| 10. 칼럼 Q&A | PASS | FAQ 아래·작성자 박스 위 폼, 10~500자, 글자 수, 필수·선택 동의, 개인정보 안내를 구현했습니다. 개발 API 실검증 결과 저장 200, 즉시 재전송 400, URL 포함 400, honeypot 200(무저장)이었습니다. 운영에서는 503 “준비 중” 분기입니다. 공개·동의·답변 조건을 모두 통과한 항목만 화면과 FAQ JSON-LD에 포함됩니다. |

## 시술 링크 설정 양쪽 검증

| 설정 | 빌드 | 정적 HTML 결과 |
|---|:---:|---|
| 기본값 `false` | PASS | 홈·칼럼 메인에 `/treatment/` href 없음, `aria-disabled="true"` 있음 |
| `NEXT_PUBLIC_TREATMENT_PAGES_READY=true` | PASS | `/treatment/ulthera-prime`, `/treatment/thermage-flx`, `/treatment/xerf` 등 생성 |
| 최종 기본값 `false` 재빌드 | PASS | 최종 `.next`도 링크 비활성 상태로 복원 |

## Q&A 저장·공개 검증

- 개발 API 저장 결과: pending, 연락처·이름 필드 없음, `answer:null`, `approvedByDoctor:false`, `sourceColumns`와 `tags` 포함
- 테스트 저장 질문은 확인 직후 삭제하여 `content/questions.json`을 요청된 공개 샘플 1건 상태로 복원했습니다.
- 샘플 `q-xerf-001`은 `status:published`, `consentPublic:true`, 답변 존재, 원장 승인 상태입니다.
- 상세 HTML의 JSON-LD를 직접 `JSON.parse`했고 `FAQPage.mainEntity`에서 독자 질문과 답변을 확인했습니다.
- `docs/knowledge/knowledge.json`에는 공개 칼럼 1건과 공개 Q&A 1건, 출처 URL과 원장 승인 여부가 들어 있습니다.

## 편집 가능한 신규 데이터

- 병원소개 메가메뉴: `home.header.intro.{doctor|vision|equipment|gallery|location}.{label|description|href|thumbnail}`
- 시술 썸네일: `treatments.{treatmentSlug}.thumbnail`
- 상담/상태: `common.quick.*`, `common.status.*`, `common.backToTop`
- 갤러리 모달: `home.gallery.modalClose`, `home.gallery.modalPrevious`, `home.gallery.modalNext`
- 공유: `column.share.{kakao|copy|native|copied|action}`
- Q&A: `qna.{title|description|placeholder|notice|consentText|publicConsentText|submit|sending|success|preparing|readerTitle}`
- 시술 비활성 안내: `common.treatment.preparing`
- 환경 변수 이름만 `.env.example`에 추가: `NEXT_PUBLIC_KAKAO_JS_KEY`, `NEXT_PUBLIC_TREATMENT_PAGES_READY`

## 스크린샷

| 상태 | 파일 | 실제 PNG 크기 |
|---|---|---:|
| 모바일 하단 바 | `docs/compare/2-2/390/mobile-bottom-bar.png` | 780×16272 (DPR 2 전체 캡처) |
| 태블릿 고정 헤더 | `docs/compare/2-2/1024/sticky-header.png` | 2048×11160 (DPR 2 전체 캡처) |
| 홈 메가메뉴 개방 | `docs/compare/2-2/1440/home-megamenu.png` | 2834×11502 (브라우저 fit 캡처) |
| 갤러리 크게 보기 | `docs/compare/2-2/1440/gallery-modal.png` | 2834×11502 (브라우저 fit 캡처) |
| 칼럼 Q&A 입력 화면 | `docs/compare/2-2/1440/column-qna.png` | 2880×1800 (DPR 2 화면 캡처) |

`scripts/shots-2-2.mjs`에도 같은 다섯 상태의 자동 캡처 절차를 추가했으며 `npm run shots`가 기존 폭별 캡처 뒤 이를 실행하도록 연결했습니다. 현재 제한 환경에서는 자동 브라우저 하위 프로세스 실행이 차단되어, 동일 상태를 Chrome DevTools 캡처로 생성했습니다.

## 디자인·회귀 확인

- 편집 모드를 끈 홈·칼럼 화면에서 기존 색·폰트·섹션 배치와 #2-1 검색·슬라이드·장비 회전·지도 fallback을 유지했습니다.
- 새 고정 UI는 요청 위치에만 추가했습니다: 헤더/맨 위로/모바일 상담 바, 칼럼 진행 바·공유·Q&A, 갤러리 모달.
- Kakao 키와 카톡·예약 URL은 저장소에 기록하지 않았습니다. 값이 없을 때 관련 UI를 숨기는 경로를 확인했습니다.

## 커밋

- `Implement home navigation UX and column Q&A` — #2-2 구현, 캡처, 지식 내보내기, 본 보고서
- push하지 않았습니다.
