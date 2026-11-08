import type { Doctor } from "./types";

export const SITE_URL = "https://blog.gloryclinic.co.kr";

export const clinic = {
  name: "글로리의원",
  nameEn: "GLORY CLINIC",
  address: "서울 강남구 봉은사로 207, KJ빌딩 3층 (논현동)",
  mapLabel: "[지도] 봉은사로 207 KJ빌딩 3층",
  phone: "02-6958-7525",
  businessNumber: "[사업자등록번호]",
};

export const doctor: Doctor = {
  name: "이호",
  title: "대표원장",
  yearsLabel: "13년 피부 진료 경험",
  careers: [
    "現 글로리의원 대표원장",
    "한양대학교 의과대학 졸업",
    "前 리쥬미의원 원장",
    "前 바오밥성형외과 원장",
    "前 에이스의원 원장",
    "[학회·자격]",
  ],
};

export const columnNav = ["리프팅", "색소·모공", "주사시술", "스페셜필러"];

export const homeContent = {
  hero: {
    eyebrow: "NATURAL · PERSONAL · BY THE DIRECTOR",
    title: "자연스러운 아름다움,",
    titleStrong: "대표원장이 직접 진행합니다",
    description: "개개인의 얼굴에 맞춘 시술을 추구합니다.",
    media: "[브랜딩 영상] 자동 재생 · 소리 없음 · 반복",
  },
  question: {
    eyebrow: "ASK THE DIRECTOR",
    title: "궁금한 것을 그대로 물어보세요",
    description: "대표원장이 쓴 칼럼에서 답을 찾아드립니다",
    placeholder: "예: 볼륨이 적은 얼굴도 울쎄라 받아도 되나요?",
    initialQuery: "세르프랑 써마지 중에 뭐가 맞나요?",
    popular: [
      "볼륨이 적은 얼굴도 울쎄라 괜찮나요?",
      "세르프랑 써마지 중에 뭐가 맞나요?",
      "리프팅 후 붓기는 며칠 가나요?",
      "리쥬란 몇 번 맞아야 하나요?",
    ],
  },
  vision: {
    eyebrow: "OUR VISION",
    title: "가족에게 할 수 있는 시술만",
    titleStrong: "권해드립니다",
    description:
      "자연스러운 아름다움을 지향하고, 개개인의 얼굴에 맞춘 시술을 추구합니다.",
    description2: "상담부터 시술까지, 글로리의원의 모든 시술은 대표원장이 직접 진행합니다.",
  },
  equipment: {
    eyebrow: "EQUIPMENT",
    title: "글로리의원",
    titleStrong: "보유 장비",
    guide: "장비를 누르면 관련 시술 안내 · 원장 칼럼으로",
  },
  latest: {
    eyebrow: "DOCTOR'S COLUMN",
    title: "진료실 질문에",
    titleStrong: "원장이 직접 답합니다",
  },
  rooms: ["라운지", "레이저실", "1:1 상담실", "파우더룸", "시술실"],
  location: {
    subway: "언주역 [출구 번호] 도보 [N]분",
    hours: "[요일별 진료시간 확인 필요]",
    parking: "[주차 안내 확인 필요]",
  },
};

export const columnMainContent = {
  hero: {
    title: "Doctor's Column",
    titleSub: "by Glory Clinic",
    description: "궁금한 시술이나 고민을 입력하세요. 대표원장이 쓴 답을 바로 찾아드립니다.",
    image: "[사진] 원장님 상담·시술 장면 또는 라운지 (포토클리닉 촬영본, 한 장 고정)",
    initialQuery: "세르프",
    popular: ["울쎄라", "세르프", "써마지", "붓기", "리쥬란"],
  },
  faqIndex: [
    { q: "세르프가 좋은가요, 써마지가 좋은가요?", keywords: ["세르프", "써마지"] },
    { q: "세르프와 써마지는 보통 어느 연령대가 선택하나요?", keywords: ["세르프", "써마지"] },
    { q: "리프팅 후 붓기는 며칠 가나요?", keywords: ["붓기", "리프팅", "울쎄라", "냉찜질"] },
    { q: "리쥬란 맞고 바로 세안해도 되나요?", keywords: ["리쥬란", "스킨부스터"] },
  ],
  treatSearch: ["울쎄라 프라임", "써마지 FLX", "세르프", "슈링크", "온다", "리쥬란", "보톡스"],
  doctor: {
    title: "이 칼럼은 대표원장 이호가\n직접 씁니다.",
    description:
      "피부과 시술 경력 [10]년. 자연스럽고 부드러운 변화를 추구하며,\n가족에게 권하지 못하는 시술이라면 고객에게도 권하지 않습니다.",
  },
  categoryTitle: "어떤 고민이 있으신가요?",
  faqTitle: "진료실에서\n가장 많이 받는 질문",
  faqDescription: "각 답변 끝에 자세한 칼럼으로 연결됩니다.",
  mainFaqs: ["[대표 질문 1]", "[대표 질문 2]", "[대표 질문 3]", "[대표 질문 4]", "[대표 질문 5]"],
  principles: [
    { no: "01", title: "대표원장 1:1 상담", desc: "상담부터 시술까지 같은 의사가 진행합니다." },
    { no: "02", title: "필요한 시술만 제안", desc: "[진료 원칙 문장]" },
    { no: "03", title: "시술 후 관리", desc: "[사후 관리 방식]" },
  ],
};

export const detailContent = {
  breadcrumb: ["글로리의원", "원장 칼럼", "리프팅", "세르프"],
  coreTitle: "이 글의 핵심",
  tocTitle: "이 글에서 확인할 내용",
  judgementTitle: "이런 분께 권하고, 이런 분께는 권하지 않습니다",
  videoTitle: "원장님이 직접 설명합니다",
  precautionsTitle: "시술 전 확인하세요",
  faqTitle: "자주 묻는 질문",
  referencesTitle: "참고한 자료",
  authorTitle: "이 글을 쓴 사람 · 대표원장 이호",
  authorCareer:
    "글로리의원 원장 · 한양대학교 의과대학 졸 · 前 리쥬미의원 원장 · 前 바오밥성형외과 원장 · 前 에이스의원 원장",
  treatmentTitle: "세르프 시술 안내 보기",
  treatmentDescription: "나에게 맞는 조합은 대표원장 상담으로 확인하세요.",
  relatedTitle: "같이 보면 좋은 글",
  related: ["울쎄라만 받으면 세르프는 필요 없나요?", "리프팅 시술 후 냉찜질, 꼭 해야 하나요?", "[같은 카테고리 칼럼]"],
  notice:
    "본 칼럼은 관련 법령을 준수하여 작성되었습니다. 시술 효과와 부작용은 개인에 따라 다를 수 있으므로 전문의와 상담 후 결정하시기 바랍니다.",
};
