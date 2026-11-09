# 작업 요청 #3 — SEO / GEO 전체 구현 보고서

## 최종 결과

- `npm run build`: PASS
- `npm run seo:check`: 공개 URL 9개, FAIL 0, 의료광고 경고 0
- 운영 빌드: 초안 칼럼 404, `/api/dev-edit` 404
- 공개 칼럼: `xerf-vs-thermage` 1편만 색인 대상
- 폭별 캡처: 7개 폭 × 7개 화면 = 49장, 가로 넘침 0

## A~L 구현 체크

| 구분 | 결과 | 구현 내용 |
|:---:|:---:|---|
| A | PASS | ISO 날짜 저장, `<time datetime>`, 빈 날짜 생략, 자리표시 필터, 실제 카테고리 Breadcrumb, 페이지별 편집형 SEO 제목·설명을 적용했습니다. |
| B | PASS | `draft/published`와 `isPublishable()`을 추가하고 운영 목록·검색·페이지·sitemap·RSS·llms에서 공개 조건을 통과한 칼럼만 사용합니다. 개발 초안은 noindex 배너를 표시합니다. |
| C | PASS | `/doctor/lee-ho`, `/column/category/[slug]`, `/column/all`, 커스텀 404를 추가하고 작성자·카테고리 내부 링크를 연결했습니다. |
| D | PASS | 페이지당 JSON-LD 스크립트 1개와 `@graph`를 사용해 MedicalClinic, WebSite, Physician, 페이지별 MedicalWebPage/FAQ/Breadcrumb/Collection/Profile 노드를 `@id`로 연결했습니다. |
| E | PASS | self canonical, OG, Twitter, article 메타, next/og 자동 이미지, 조건부 소유 확인, ko hreflang 구조, 개발·초안·404 noindex를 적용했습니다. |
| F | PASS | 요청된 검색·AI 봇 robots 규칙, 이미지 포함 sitemap, RSS, llms/llms-full, IndexNow 키 파일·dry-run 스크립트, 소문자·끝 슬래시 301 규칙을 적용했습니다. |
| G | PASS | 질문형 h1/h2, 첫 화면 핵심 요약, 표 caption, 목록·figure, 고정 앵커, 검토일, 관련 글·시술·작성자 링크, 영상 대본 구조를 적용했습니다. |
| H | PASS | 편집 툴에 사이트 정보 패널을 추가해 병원·주소·진료시간·좌표·진료과목·원장 이력·외부 프로필·소유 확인·SEO 문구를 JSON에 저장하고 새로고침 반영합니다. |
| I | PASS | next/image AVIF/WebP, sizes, 첫 히어로만 priority, 지연 지도·영상, next/font swap을 유지했습니다. |
| J | PASS | GA ID가 있을 때만 GA4를 로드하고 AI referrer와 전화·카카오·예약 클릭 이벤트를 전송합니다. |
| K | PASS | `lib/adRules.ts`에 의료광고 주의 표현을 정의하고 자동 검사 경고에 연결했습니다. 현재 경고는 0개입니다. |
| L | PASS | `npm run seo:check`가 공개 URL의 메타·canonical·heading·JSON-LD·FAQ·자리표시·alt·내부 링크·크롤링 파일·광고 표현을 확인하고 보고서를 생성합니다. |

## Lighthouse 모바일 — 로컬 운영 빌드

| 화면 | 성능 | 접근성 | 권장사항 | SEO | FCP | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| 홈 | 95 | 96 | 100 | 100 | 2.4s | 2.4s | 0 |
| 칼럼 메인 | 95 | 96 | 100 | 100 | 2.4s | 2.4s | 0.001 |
| 칼럼 상세 | 98 | 96 | 100 | 100 | 2.0s | 2.0s | 0.006 |
| 원장 프로필 | 98 | 96 | 100 | 100 | 1.8s | 1.8s | 0 |

원본 JSON은 `docs/compare/lighthouse/`에 저장했습니다.

## 자동 검사와 JSON-LD

- [SEO 자동 검사 보고서](./report-seo.md) — 페이지별 JSON-LD 전문 10개(공개 URL 9개 + 404) 포함
- [화면 캡처 보고서](./report-shots-3.md)
- IndexNow dry-run: 실제 전송 없이 payload 생성 확인

## 사이트 정보 편집 범위

- 병원: 이름·영문명·도로명·상세주소·우편번호·지역·국가·전화·요일별 진료시간·좌표·진료과목 표시
- 원장: 이름·직함·경력·학력·출신 학교·학회·자격·면허·전문 시술·진료 철학·외부 프로필
- 외부 주소: 네이버 플레이스·카카오맵·구글 지도·기존 홈페이지·유튜브·인스타그램·모두닥
- 검색: 홈·칼럼·원장·전체 목록 제목/설명, 구글·네이버·빙 소유 확인 코드

## 환경 변수

- `NEXT_PUBLIC_KAKAO_MAP_KEY`
- `NEXT_PUBLIC_GA_ID`
- `INDEXNOW_KEY`

값은 저장소에 기록하지 않았고 `.env.example`에는 변수 이름만 있습니다.

## 커밋

- SEO/GEO 전체 구현 (이 보고서와 함께 커밋, push 하지 않음)
