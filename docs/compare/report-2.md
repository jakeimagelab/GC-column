# 작업 요청 #2 검증 보고서

## 구현 결과

- 편집 모드: 개발 서버의 `/?edit=1`, `/column?edit=1`
- 저장 원본: `content/site-content.json`
- 업로드 경로: `public/uploads/{편집ID}-{날짜시간}.{확장자}`
- 저장 계층: `lib/contentStore.ts`
- 개발 전용 API: `/api/dev-edit` (`GET`, `PATCH`, `POST`)
- 편집 범위: 고정 문구 167개, 이미지 21개, 배경 이미지 3개
- 잠금 범위: 색, 글꼴, 글자 크기, 레이아웃, 섹션 추가·삭제·순서, 칼럼 데이터

## 동작 확인

| 항목 | 결과 | 확인 내용 |
|---|:---:|---|
| 홈 편집 모드 | PASS | `/?edit=1`에서 하단 툴바, 인라인 글자 편집, 이미지 선택 표시 |
| 칼럼 메인 편집 모드 | PASS | `/column?edit=1`에서 하단 툴바와 글자·이미지 대상 표시 |
| 글자 자동 저장 | PASS | 포커스 해제 후 `PATCH /api/dev-edit` 200, JSON 반영 |
| 새로고침·SSR | PASS | 저장 후 새로고침 유지, 응답 HTML에 수정 문구 포함 확인 후 원문 복원 |
| 이미지 업로드 | PASS | PNG 업로드 후 `/uploads/...png` 생성 및 실제 이미지 렌더링 확인 |
| 확대·초점·alt | PASS | zoom 100~250, focusX/focusY 0~100, alt 저장·재렌더링 확인 |
| 이미지 지우기 | PASS | `src: null`, zoom/focus 기본값 복원 후 기존 자리표시 재노출 |
| 되돌리기·다시하기 | PASS | 같은 세션에서 저장 이력 왕복 확인, 최대 100단계 보관 |
| 장비·갤러리 전체 접근 | PASS | 편집 모드에서도 전용 전환 버튼으로 장비 8종·갤러리 5장 선택 가능 |
| 일반 화면 회귀 | PASS | 390·1024·1280·1366·1440·1728·1920 × 3화면, 편집 UI 없음·가로 스크롤 없음 |
| 빌드 | PASS | `npm run build`, TypeScript 및 정적 페이지 생성 성공 |
| 운영 모드 차단 | PASS | 운영 빌드의 `/?edit=1`, `/column?edit=1`에 툴바 없음; `/api/dev-edit` 404 |
| 브라우저 저장소 미사용 | PASS | 앱 소스에서 `localStorage`, `sessionStorage` 사용 없음 |

폭별 일반 화면은 `docs/compare/widths/{390|1024|1280|1366|1440|1728|1920}/{home|column-main|column-detail}.png`에 다시 캡처했습니다. 자동 캡처 명령은 이 실행 환경의 샌드박스가 npm 자식 프로세스의 브라우저 실행을 막아, 같은 Playwright 루틴을 승인된 브라우저 세션에서 직접 실행했습니다. 21개 결과 모두 `scrollWidth === innerWidth`였고 편집 툴바가 없었습니다. `scripts/shots.mjs`의 CLI 대체 실행 함수 형식도 수정해 일반 로컬 터미널의 `npm run shots` 경로를 유지했습니다.

## 디자인 원본의 이미지 자리 대조

- 홈: 히어로 배경, 대표원장 사진, 실제 서명 이미지, 장비 8종, 갤러리 5장, 갤러리 흐린 배경, 지도
- 칼럼 메인: 히어로 배경, 대표원장 사진, 대표원장 서명, 진료 원칙 사진, 지도
- 공통: 헤더 로고
- 제외: 홈 최신 칼럼 및 칼럼 메인 최신 칼럼 카드 사진은 칼럼 데이터이므로 요청대로 편집 대상에서 제외

## 편집 가능한 ID 전체 목록

### 글자 167개

```text
common.brand.name
common.brand.nameEn
common.header.columnBadge
common.header.search
common.header.homepage
common.header.locales
common.header.columnCount
common.header.equipmentLabel
common.header.relatedCount
common.clinic.address
common.clinic.phone
common.clinic.businessNumber
common.quick.title
common.quick.kakao
common.quick.blog
common.quick.location
common.quick.column
common.quick.homepage
column.footer.brand
column.footer.notice
column.footer.business
column.footer.links
column.footer.sitemap
home.hero.eyebrow
home.hero.title
home.hero.titleStrong
home.hero.description
home.header.about
home.header.column
home.header.locale.kr
home.header.locale.en
home.header.locale.cn
home.question.eyebrow
home.question.title
home.question.description
home.question.inputLabel
home.question.placeholder
home.question.initialQuery
home.question.clear
home.question.ask
home.question.popularLabel
home.question.popular.0
home.question.popular.1
home.question.popular.2
home.question.popular.3
home.question.closest
home.question.reviewed
home.question.read
home.question.related
home.question.noResult
home.question.emptyDescription
home.question.emptyAction
home.doctor.eyebrow
home.doctor.title
home.doctor.name
home.doctor.yearsNumber
home.doctor.yearsLabel
home.doctor.career.0
home.doctor.career.1
home.doctor.career.2
home.doctor.career.3
home.doctor.career.4
home.doctor.career.5
home.doctor.profileAction
home.doctor.columnAction
home.vision.eyebrow
home.vision.title
home.vision.titleStrong
home.vision.description
home.vision.description2
home.vision.signatureTitle
home.vision.signatureName
home.equipment.eyebrow
home.equipment.title
home.equipment.titleStrong
home.equipment.guide
home.equipment.related
home.latest.eyebrow
home.latest.title
home.latest.titleStrong
home.latest.all
home.gallery.eyebrow
home.gallery.title
home.gallery.titleStrong
home.gallery.more
home.gallery.room.lounge
home.gallery.room.laser
home.gallery.room.consult
home.gallery.room.powder
home.gallery.room.treatment
home.location.eyebrow
home.location.title
home.location.titleStrong
home.location.addressLabel
home.location.subwayLabel
home.location.subway
home.location.hoursLabel
home.location.hours
home.location.parkingLabel
home.location.parking
home.location.phoneLabel
home.location.naver
home.location.kakao
home.location.google
home.footer.representative
home.footer.policy
home.footer.notice
home.footer.links
home.footer.sitemap
column.hero.title
column.hero.titleSub
column.hero.description
column.search.initialQuery
column.search.label
column.search.placeholder
column.search.clear
column.search.submit
column.search.relatedKeywords
column.search.relatedGuide
column.search.relatedColumns
column.search.relatedQuestions
column.search.treatmentLink
column.search.allTreatments
column.search.emptyPrefix
column.search.emptySuffix
column.search.emptyDescription
column.search.emptyAction
column.search.popularLabel
column.search.popular.0
column.search.popular.1
column.search.popular.2
column.search.popular.3
column.search.popular.4
column.doctor.title
column.doctor.description
column.doctor.tag.0
column.doctor.tag.1
column.doctor.tag.2
column.doctor.more
column.doctor.titleLabel
column.category.title
column.category.count
column.latest.title
column.latest.all
column.latest.authorDate
column.latest.pageNext
column.faq.title
column.faq.description
column.faq.question.0
column.faq.question.1
column.faq.question.2
column.faq.question.3
column.faq.question.4
column.treatments.title
column.treatments.description
column.treatments.links
column.principles.title
column.principles.0.title
column.principles.0.description
column.principles.1.title
column.principles.1.description
column.principles.2.title
column.principles.2.description
column.location.title
column.location.hours
column.location.reserve
column.location.kakao
```

### 이미지 21개

```text
home.vision.signatureImage
column.doctor.signatureImage
common.header.logo
home.doctor.photo
home.equipment.onda
home.equipment.thermage-flx
home.equipment.ulthera-prime
home.equipment.titanium
home.equipment.tuneface
home.equipment.xerf
home.equipment.shurink
home.equipment.oligio
home.gallery.lounge
home.gallery.laser
home.gallery.consult
home.gallery.powder
home.gallery.treatment
home.location.map
column.doctor.photo
column.principles.photo
column.location.map
```

### 배경 이미지 3개

```text
home.hero.background
home.gallery.background
column.hero.background
```

## 커밋 목록

- `28d2f25` — Fix responsive clinic layouts across widths (#1-1)
- `HEAD` — Add local visual content editor (#2)
