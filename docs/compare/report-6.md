# 작업 요청 #6 — 사진 드래그 배치·배치표 반영 보고서

작성일: 2026-11-11

## 구현 결과

| 항목 | 결과 | 확인 내용 |
| --- | --- | --- |
| 편집 모드 사진 자리 표시 | PASS | `?edit=1`에서 이미지·배경·갤러리·히어로 슬라이드·로고·서명 자리에 점선과 `페이지 · 섹션 · 자리명` 표시 |
| 파일 드래그 배치 | PASS | JPG·PNG·WebP를 자리에 놓으면 즉시 미리보기 후 alt 입력 창 표시 |
| 사진 교체·취소 | PASS | 기존 사진/임시 사진 자리에는 교체 확인 문구, 임시 배치에는 자리별 X 취소 버튼 표시 |
| 임시 배치 목록 | PASS | 우측 상단에 임시 건수와 자리·파일·설명·상태 목록 표시 |
| 로컬 저장 | PASS | 원본은 `photos-inbox/`, 배치표는 `photos-inbox/placements.json`에 저장하며 새로고침 후 복원 |
| PC·모바일 개별 조정 | PASS | 드래그 초점 이동, 휠/± 버튼 100~300%, 가운데 맞춤, 초기화, 완료 구현 |
| 비율·화질 경고 | PASS | 자리와 원본 비율 차이가 크거나 확대 대비 원본 해상도가 부족하면 경고만 표시 |
| 정식 반영 명령 | PASS | `npm run images:apply`가 임시 항목만 변환·반영하고 상태를 `반영됨`으로 변경 |
| 재조정 | PASS | 이미 반영된 사진을 조정하면 `kind: "조정"` 임시 항목으로 저장되고 다음 반영 때 src·alt는 유지 |
| 연결 사진 확인 | PASS | 대표원장 사진처럼 연결된 자리의 동시 반영 여부를 터미널에서 질문. `--yes` 사용 시 함께 반영 |
| 운영 비노출 | PASS | 편집 UI는 `DevEditorMount`의 development 조건 안에서만 렌더링하고 API는 production에서 404 반환 |
| 기존 글 편집 | PASS | 기존 DevEditor의 인라인 글 편집·되돌리기·다시하기 흐름은 유지. 기존 이미지 슬라이더도 desktop 값과 동기화 |

## 실제 동작 검증

원본 프로젝트의 콘텐츠를 오염시키지 않기 위해 동일 코드의 격리 복제본에서 실행했다.

1. 홈에서 실제 로컬 파일 3장을 다음 자리에 드롭했다.
   - `home.doctor.photo`
   - `home.gallery.laser`
   - `home.hero.slides.hero-slide-1.bgImage`
2. 세 항목 모두 `photos-inbox/placements.json`에 `status: "임시"`로 생성되고 원본 파일이 파일명 그대로 복사되는 것을 확인했다.
3. 새로고침 후 임시 배치 3건과 사진 미리보기가 복원되는 것을 확인했다.
4. 대표원장 사진을 PC `x 40.4 / y 46.9 / zoom 120`, 모바일 `x 46.2 / y 39.1 / zoom 140`으로 다르게 저장하고 새로고침 후 같은 CSS 변수로 복원되는 것을 확인했다.
5. `npm run images:apply -- --yes` 결과: `반영 3건, 설명 없는 사진 0건, 실패 0건`.
6. 생성된 WebP 3장은 모두 1800×1200으로 원본보다 확대되지 않았고, GPS·카메라 제조사·모델·소프트웨어 메타데이터가 없는 것을 확인했다.
7. 원본 3장은 `photos-inbox/_done/2026-11-11/`로 이동했고 배치표 상태가 모두 `반영됨`으로 변경됐다.
8. 반영된 대표원장 사진을 다시 130%로 조정해 `kind: "조정"` 항목 생성 → 재반영 1건 → src·alt 유지와 desktop/mobile 값 갱신을 확인했다.
9. 대표원장 연결 자리 테스트에서 홈 사진과 칼럼 메인 사진이 같은 WebP src·alt로 함께 반영되는 것을 확인했다.
10. 같은 날짜·같은 파일명이 다시 들어오더라도 `_done` 원본을 덮어쓰지 않고 숫자 접미사로 보존한다.

## 반영 파일 처리 규칙

- 긴 변 최대 2400px, 확대 금지
- WebP 품질 88
- 회전 정보 적용 후 픽셀 방향 정상화
- GPS·카메라 정보 제거
- Copyright·Artist/Creator·Credit만 존재할 때 재기록
- `public/uploads/{원본이름}-{시각}-{배치ID}.webp`로 저장
- `site-content.json`에 `src`, `alt`, `desktop`, 선택적 `mobile` 기록
- `zoom`, `focusX`, `focusY`도 기존 화면과의 호환을 위해 desktop 값으로 동기화

## 화면 캡처

- PC 1440px: [report-6-home-pc.png](./report-6-home-pc.png)
- 모바일 390px: [report-6-home-mobile.png](./report-6-home-mobile.png)

두 캡처는 같은 원본 사진에 서로 다른 PC·모바일 초점과 배율이 반영된 상태다.

## 품질 확인

- `npm run build`: PASS (타입 오류 없음, 18개 정적 경로 생성 완료)
- `npm run images:apply` 배치표 없음 처리: PASS
- React 점검: 전역 리스너 정리, passive scroll, alt 유지, 버튼 라벨, dialog/status 역할, effect 의존성 및 개발 모드 한정 로딩 확인
- `photos-inbox/`: `.gitignore` 등록 확인
- 원본 `content/site-content.json`: QA 중 변경하지 않음

## 커밋

- `Add local photo placement workflow`

원격 저장소 push는 수행하지 않았다.
