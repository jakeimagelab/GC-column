# 작업 요청 #3 화면 캡처 보고서

## 결과

- 운영 빌드(`http://127.0.0.1:3100`)에서 캡처했습니다.
- 폭: 390, 1024, 1280, 1366, 1440, 1728, 1920px
- 화면: 홈, 칼럼 메인, 칼럼 상세, 원장 프로필, 카테고리, 전체 칼럼, 404
- 총 49장 모두 `document.documentElement.scrollWidth === window.innerWidth`로 가로 넘침이 없었습니다.
- 캡처 위치: `docs/compare/widths/{폭}/{화면}.png`

## 폭별 자동 검사

| 폭 | 홈 | 칼럼 메인 | 칼럼 상세 | 원장 | 카테고리 | 전체 칼럼 | 404 |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 390 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1024 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1280 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1366 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1440 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1728 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1920 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## 신규 화면 1440px

- [원장 프로필](./widths/1440/doctor.png)
- [카테고리](./widths/1440/column-category.png)
- [칼럼 전체 목록](./widths/1440/column-all.png)
- [404](./widths/1440/not-found.png)
