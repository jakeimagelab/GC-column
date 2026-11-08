# 글로리의원 칼럼 사이트 비교·검증 보고서

검증 기준은 `docs/design/*.dc.html`의 수치·색·문구·순서이며, 완성 모습은 `docs/design/screens/*.jpg`와 1440px 전체 캡처를 나란히 확인했다.

## 캡처

- `home.png`: 1440 × 6010
- `column-main.png`: 1440 × 4646
- `column-detail.png`: 1440 × 4852
- `megamenu.png`: 1440 × 4646, 메가메뉴 열린 상태

## 다른 부분 목록

의도하지 않은 배치·여백·크기·색·문구 차이는 발견되지 않았다. 아래는 요청에 따라 일부러 다르게 처리한 부분이다.

- 파란 번호 라벨, 검색/메가메뉴 동작 설명 박스, 갈색 작성 안내, 상세 사이드의 비노출 규칙·성과 박스, 모바일 메모, 홈 촬영 전 안내 문구를 모두 제외했다.
- 설명용 표시를 뺀 뒤 페이지 높이를 고정하지 않고 콘텐츠 높이로 계산했다. 그 결과 원본 캔버스보다 홈 30px, 칼럼 메인 134px, 상세 248px 짧다.
- 홈과 칼럼 메인의 오른쪽 상담 메뉴는 원본의 캔버스 절대 위치가 아니라 요청대로 브라우저 화면에 `position: fixed`로 고정했다.
- 실제 사진·영상·장비 누끼·지도는 요청대로 원본의 대괄호 문구와 회색 자리표시를 유지했다.

## 동작 체크리스트

- PASS — 홈 질문 검색: 초기 검색 결과와 결과 없음 상태 확인
- PASS — 홈 질문 검색: 많이 묻는 질문 재검색, 지우기 후 빈 입력 확인
- PASS — 장비 넘기기: 다음 클릭 후 첫 장비 변경 및 `02 / 08` 확인
- PASS — 갤러리: `05` 선택 후 중앙 `시술실`, 이전 `파우더룸`, 다음 `라운지` 확인
- PASS — 칼럼 검색: `세르프` 관련 키워드·칼럼 2·질문 2·시술 안내 확인
- PASS — 칼럼 검색: 결과 없는 질문에서 `질문 남기기` 상태 확인
- PASS — 메가메뉴: hover에서 열림(`data-megamenu-open=true`), 영역 이탈 후 닫힘(`false`) 확인
- PASS — FAQ: 칼럼 메인과 상세에서 펼침/접힘 및 `[본문]` 노출 확인
- PASS — 상세 사이드: 계산 스타일 `position: sticky` 확인
- PASS — 목차: `#difference` 이동 후 해당 사이드 링크 active 클래스 확인
- PASS — 없는 slug: `/column/not-a-column`에서 HTTP 404 확인

## HTML·SEO 확인

- PASS — `npm run build` 성공, 3개 화면과 상세 slug들이 Static/SSG로 생성됨
- PASS — 생성된 상세 HTML에 질문형 제목과 `결론부터 말씀드리면` 본문 문자열 포함
- PASS — 상세 HTML의 `<h1>` 1개 확인
- PASS — 상세 HTML에 `MedicalWebPage`, `FAQPage`, `BreadcrumbList`, `Person` JSON-LD 포함
- PASS — `robots.txt`에 전체 허용 및 GPTBot, ClaudeBot, PerplexityBot 허용 포함
- PASS — `sitemap.xml`이 지정 도메인과 샘플 칼럼 URL을 포함하도록 생성됨

## 실행 참고

`npm run shots`는 Playwright API로 로컬 Chrome을 사용하고, Codex 환경에서는 설치된 Playwright CLI 세션을 대체 경로로 사용한다. 이 작업 환경의 브라우저 자식 프로세스 제한 때문에 최종 4개 파일은 승인된 Playwright CLI 세션으로 생성했다.
