# SEO 자동 검사 보고서

- 실행 시각: 2026-11-09T05:15:32.007Z
- 공개 URL: 9개
- FAIL: 0개
- 경고: 0개

## URL 결과

| URL | HTTP | title 길이 | description 길이 | 결과 |
|---|---:|---:|---:|:---:|
| / | 200 | 30 | 74 | PASS |
| /column | 200 | 17 | 62 | PASS |
| /column/all | 200 | 23 | 58 | PASS |
| /doctor/lee-ho | 200 | 22 | 61 | PASS |
| /column/category/lifting | 200 | 18 | 66 | PASS |
| /column/category/pigment | 200 | 20 | 56 | PASS |
| /column/category/injection | 200 | 19 | 51 | PASS |
| /column/category/filler | 200 | 20 | 53 | PASS |
| /column/xerf-vs-thermage | 200 | 39 | 127 | PASS |

## 실패

- FAIL 없음

## 의료광고 주의 표현

- 경고 없음

## 페이지별 JSON-LD 전문

### `/`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "WebPage",
      "@id": "https://blog.gloryclinic.co.kr/#webpage",
      "url": "https://blog.gloryclinic.co.kr",
      "name": "언주역 피부과 리프팅 글로리의원 | 대표원장 직접 시술",
      "description": "언주역 글로리의원은 대표원장 이호가 상담부터 시술까지 직접 진행하며, 리프팅과 피부 시술에 관한 진료 정보와 원장 칼럼을 제공합니다.",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "about": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      }
    }
  ]
}
```

</details>

### `/column`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "CollectionPage",
      "@id": "https://blog.gloryclinic.co.kr/column#collection",
      "name": "원장 칼럼 | 언주역 글로리의원",
      "description": "언주역 글로리의원 대표원장 이호가 진료실에서 자주 받는 리프팅과 피부 시술 질문에 직접 답하는 원장 칼럼입니다.",
      "url": "https://blog.gloryclinic.co.kr/column",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column#items"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://blog.gloryclinic.co.kr/column#items",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage",
          "name": "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?"
        }
      ]
    }
  ]
}
```

</details>

### `/column/all`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "CollectionPage",
      "@id": "https://blog.gloryclinic.co.kr/column/all#collection",
      "name": "원장 칼럼 전체 보기 | 언주역 글로리의원",
      "description": "글로리의원 대표원장 이호가 작성하고 검토한 리프팅과 피부 시술 칼럼을 최신 발행 순서로 모아 제공합니다.",
      "url": "https://blog.gloryclinic.co.kr/column/all",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column/all#items"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://blog.gloryclinic.co.kr/column/all#items",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage",
          "name": "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?"
        }
      ]
    }
  ]
}
```

</details>

### `/doctor/lee-ho`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "ProfilePage",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#profile",
      "name": "대표원장 이호 소개 | 언주역 글로리의원",
      "description": "글로리의원 대표원장 이호의 경력, 진료 철학, 전문 시술과 직접 작성한 피부 시술 칼럼을 확인할 수 있습니다.",
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "inLanguage": "ko-KR",
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician"
      },
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      }
    }
  ]
}
```

</details>

### `/column/category/lifting`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "CollectionPage",
      "@id": "https://blog.gloryclinic.co.kr/column/category/lifting#collection",
      "name": "리프팅 칼럼",
      "description": "울쎄라 프라임, 써마지 FLX, 세르프 등 리프팅 시술에 관해 진료실에서 자주 받는 질문과 대표원장 답변을 모았습니다.",
      "url": "https://blog.gloryclinic.co.kr/column/category/lifting",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column/category/lifting#items"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://blog.gloryclinic.co.kr/column/category/lifting#items",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage",
          "name": "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?"
        }
      ]
    }
  ]
}
```

</details>

### `/column/category/pigment`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "CollectionPage",
      "@id": "https://blog.gloryclinic.co.kr/column/category/pigment#collection",
      "name": "색소·모공 칼럼",
      "description": "색소와 모공에 관한 진료실 질문을 대표원장 칼럼과 관련 시술 정보로 이해하기 쉽게 정리해 제공합니다.",
      "url": "https://blog.gloryclinic.co.kr/column/category/pigment",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column/category/pigment#items"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://blog.gloryclinic.co.kr/column/category/pigment#items"
    }
  ]
}
```

</details>

### `/column/category/injection`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "CollectionPage",
      "@id": "https://blog.gloryclinic.co.kr/column/category/injection#collection",
      "name": "주사시술 칼럼",
      "description": "리쥬란과 보톡스 등 주사시술에 관한 질문을 대표원장 칼럼과 함께 차분히 확인할 수 있습니다.",
      "url": "https://blog.gloryclinic.co.kr/column/category/injection",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column/category/injection#items"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://blog.gloryclinic.co.kr/column/category/injection#items"
    }
  ]
}
```

</details>

### `/column/category/filler`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "CollectionPage",
      "@id": "https://blog.gloryclinic.co.kr/column/category/filler#collection",
      "name": "스페셜필러 칼럼",
      "description": "스페셜필러 관련 질문과 상담 전에 확인할 내용을 대표원장 칼럼으로 알기 쉽게 정리해 제공합니다.",
      "url": "https://blog.gloryclinic.co.kr/column/category/filler",
      "inLanguage": "ko-KR",
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column/category/filler#items"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://blog.gloryclinic.co.kr/column/category/filler#items"
    }
  ]
}
```

</details>

### `/column/xerf-vs-thermage`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "MedicalWebPage",
      "@id": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage#webpage",
      "headline": "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?",
      "description": "결론부터 말씀드리면, 세르프는 써마지처럼 진피층에 에너지를 넣고 DEEP 모드로 조금 더 깊은 층까지 전달하는 고주파 장비입니다. 울쎄라만큼 깊게 들어가지는 않지만, 지방 감소가 걱정되는 분께는 오히려 선택지가 될 수 있습니다.",
      "url": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage",
      "inLanguage": "ko-KR",
      "datePublished": "2026-12-15",
      "dateModified": "2026-12-15",
      "lastReviewed": "2026-12-15",
      "author": {
        "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician"
      },
      "reviewedBy": {
        "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician"
      },
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "isPartOf": {
        "@id": "https://blog.gloryclinic.co.kr/#website"
      },
      "about": [
        {
          "@type": "MedicalProcedure",
          "name": "세르프"
        },
        {
          "@type": "MedicalProcedure",
          "name": "써마지 FLX"
        },
        {
          "@type": "MedicalProcedure",
          "name": "울쎄라 프라임"
        }
      ],
      "mainEntity": {
        "@id": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage#faq"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          "#summary"
        ]
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage#faq-1",
          "name": "세르프가 좋은가요, 써마지가 좋은가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "두 장비는 모두 고주파를 사용하지만 세르프는 DEEP 모드로 조금 더 깊은 층까지 에너지를 전달합니다. 피부 탄력과 지방량을 확인한 뒤 맞는 장비를 판단합니다."
          }
        },
        {
          "@type": "Question",
          "@id": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage#faq-2",
          "name": "세르프와 써마지는 보통 어느 연령대가 선택하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "연령만으로 장비를 정하지 않습니다. 현재 피부 탄력과 지방량, 원하는 변화의 범위를 함께 확인해 선택합니다."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://blog.gloryclinic.co.kr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "원장 칼럼",
          "item": "https://blog.gloryclinic.co.kr/column"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "리프팅",
          "item": "https://blog.gloryclinic.co.kr/column/category/lifting"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?",
          "item": "https://blog.gloryclinic.co.kr/column/xerf-vs-thermage"
        }
      ]
    }
  ]
}
```

</details>

### `/404`

<details><summary>JSON-LD 전문 보기</summary>

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://blog.gloryclinic.co.kr/#clinic",
      "name": "글로리의원",
      "alternateName": "GLORY CLINIC",
      "url": "https://blog.gloryclinic.co.kr",
      "telephone": "02-6958-7525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
        "addressLocality": "강남구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "medicalSpecialty": "Dermatology",
      "sameAs": [
        "https://gloryclinic.co.kr"
      ],
      "hasMap": "https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C%20207"
    },
    {
      "@type": "WebSite",
      "@id": "https://blog.gloryclinic.co.kr/#website",
      "name": "글로리의원",
      "url": "https://blog.gloryclinic.co.kr",
      "inLanguage": "ko-KR",
      "publisher": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://blog.gloryclinic.co.kr/column?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://blog.gloryclinic.co.kr/doctor/lee-ho#physician",
      "name": "이호",
      "jobTitle": "대표원장",
      "worksFor": {
        "@id": "https://blog.gloryclinic.co.kr/#clinic"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "한양대학교 의과대학"
        }
      ],
      "url": "https://blog.gloryclinic.co.kr/doctor/lee-ho",
      "knowsAbout": [
        "울쎄라 프라임",
        "써마지 FLX",
        "세르프",
        "리쥬란"
      ],
      "medicalSpecialty": "Dermatology"
    },
    {
      "@type": "WebPage",
      "@id": "https://blog.gloryclinic.co.kr/404#webpage",
      "name": "페이지를 찾을 수 없습니다",
      "url": "https://blog.gloryclinic.co.kr/404",
      "inLanguage": "ko-KR"
    }
  ]
}
```

</details>
