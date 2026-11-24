# 오하율 — Portfolio

채용 담당자를 위한 오하율의 엔지니어 포트폴리오 공식 저장소입니다.

> **"아는 만큼 보인다 — 약봉지에서 서류로, 서류에서 시스템으로."**

병원 원무 행정 실무(대전성모병원 서기, 서울현병원 주임)에서 키오스크·사무단말 1차 점검과 인수인계 전산화를 이끌며 네트워크와 시스템의 흐름에 눈을 떴습니다. 웹 풀스택 과정을 거쳐 **SKT ALEPH 보안인프라 과정(케테르 · 최고 등급)**을 수료하였으며, 흔들림 없는 인프라와 신뢰할 수 있는 서비스를 구축하는 엔지니어로 성장하고 있습니다.

---

## 🌐 배포 & 링크

- **포트폴리오 공식 웹사이트**: [https://hayul0611.github.io/SKT_ALEPH/](https://hayul0611.github.io/SKT_ALEPH/)
- **GitHub**: [https://github.com/HaYul0611](https://github.com/HaYul0611)
- **공식 수료증 (PDF)**: [docs/SKT_ALEPH_수료증.pdf](file:///d:/SKT_ALEPH_workspace/Task/SKT_ALEPH/docs/SKT_ALEPH_수료증.pdf) (인증번호: ALEPH-2026-00263)

---

## 💼 경력 & 교육 이력

### 🎓 Education
- **SKT ALEPH 보안인프라 과정 (케테르 · 최고 등급 수료)** | `2026.08.11 ~ 2026.11.12`
  - AI 보안 에이전트, 네트워크 가상화(GNS3), Wazuh SIEM 연동, 침해 방어전 실습
- **바이브코딩 AI 기반 웹풀스택 개발 과정 수료** | `2025.12.31 ~ 2026.06.30`
  - Node.js, Express, MySQL, REST API, 프론트엔드/백엔드 아키텍처

### 🏢 Experience
- **서울현병원 · 원무(주임)** | `2025.04 ~ 2026.01`
  - 원무 행정 총괄 및 키오스크·발권기·업무용 PC 1차 장애 점검, 유지보수 업체 원격지원 연계
- **대전성모병원 · 원무(서기)** | `2019.12 ~ 2025.03`
  - 응급실 인수인계 전산화(Google Workspace 기반), 5개 파트 업무 매뉴얼 표준화, 의료비 민원 프로세스 개선

### 📜 Certifications
- **네트워크관리사 2급** (필기 합격(2026.11) · 2026.12.06 실기 예정)
- **병원행정사 / 건강보험사** (2019.03)
- **건강보험청구관리사** (2018.07)
- **간호조무사 / 병원코디네이터** (2015 / 2014)
- **정보기술자격(ITQ)** (2014.06)

---

## 🚀 4대 대표 프로젝트

### ① 보건복지부 산하기관 인프라 SI 구축 (팀 프로젝트 / 팀장)
- **기획서 / 증적**: [Notion 상세 기획서](https://app.notion.com/p/420346571e15811189c2eccad3c017ea)
- **담당 역할**: 팀장 / 인프라 설계 및 네트워크 통합
- **기술 스택**: `GNS3`, `Cisco IOS`, `Wazuh SIEM`, `OSPF Routing`, `Linux`
- **핵심 구현**:
  - Core / Distribution / Access 3계층 모델 기반 보건복지부 본부·지사 기관망 가상 토폴로지 설계
  - OSPF 동적 라우팅 및 외부 SOC 관제센터 간 통신 시험 (패킷 손실률 0% 검증)
  - 가상 엔드포인트 내 Wazuh Agent 배포 및 실시간 무결성 모니터링 연동
  - 서브넷 마스킹 정밀화 및 DHCP 대역 격리를 통한 IP 충돌 원천 방지

---

### ② Lumos-Agent — 엔드포인트 자원 & 네트워크 모니터링 (개인 프로젝트)
- **저장소**: [https://github.com/HaYul0611/Lumos-Agent](https://github.com/HaYul0611/Lumos-Agent)
- **담당 역할**: 개인 프로젝트 (100% 설계 및 구현)
- **기술 스택**: `Node.js`, `Express`, `System Metrics CLI`, `REST API`, `HTML5/CSS3`
- **핵심 구현**:
  - OS 활성 네트워크 인터페이스(IP, MAC, MTU, 트래픽) 실시간 파싱 및 감시
  - 로컬 리슨 중인 TCP/UDP 포트 매핑 및 Windows Defender 방화벽 정책 상태 조회
  - CPU 사용률, 물리 메모리 점유율, 상위 부하 프로세스 목록 추적 데몬 및 대시보드 UI 구현
  - *(※ 미구현된 중앙 SDP/XDR 연동은 향후 확장 로드맵으로 명확히 구분)*

---

### ③ eottae — 라이프스타일 매칭 & 소모임 플랫폼 (4인 팀 프로젝트)
- **저장소**: [https://github.com/sterran123/eottae](https://github.com/sterran123/eottae)
- **담당 역할**: 풀스택 개발 (매칭 온보딩, 소모임 검색·필터링, 청첩장 에디터 전담)
- **기술 스택**: `Node.js`, `Express`, `MySQL`, `REST API`, `Git PR Workflow`
- **핵심 기여 (PRs)**:
  - 성향·가치관 기반 다단계 온보딩 설문 및 카드 스와이프 추천 UI 개발 ([PR #93](https://github.com/sterran123/eottae/pull/93))
  - 카테고리/지역/태그 복합 동적 쿼리 필터링 및 페이징 최적화 ([PR #97](https://github.com/sterran123/eottae/pull/97))
  - 모바일 청첩장 문구, 갤러리, 지도 실시간 커스텀 편집 및 미리보기 엔진 ([PR #102](https://github.com/sterran123/eottae/pull/102))

---

### ④ FESTIO — 축제 올인원 O2O 통합 플랫폼 (팀 프로젝트)
- **저장소**: [https://github.com/HaYul0611/Fastival-management](https://github.com/HaYul0611/Fastival-management)
- **담당 역할**: 백엔드 & 데이터베이스 설계 (QR 입장 및 부스 픽업 데이터 모델링 전담)
- **기술 스택**: `Node.js`, `Express`, `MySQL`, `REST API`, `Session RBAC`
- **핵심 구현**:
  - 축제 현장 부스 실시간 대기열·예약 시스템 및 동시성 트랜잭션 무결성 제어 (`SELECT ... FOR UPDATE`)
  - 관리자 / 부스 운영자 / 방문객 3계층 역할 기반 접근 제어(RBAC)
  - 방문객 QR 티켓 발급, 현장 스캔 입장, 부스 음식/물품 픽업 상태 전이 데이터 흐름 설계

---

---

## 📑 학술 연구 (Academic Research)

### 🏥 의료기관 진료비 예외정산(미식별 입금 및 사망환자 미수령 환불금)의 공공관리체계 구축 방안
> **부제**: 병원정보시스템과 공공행정정보 연계를 중심으로  
> **저자**: 오하율 (단독 연구)  
> **연구 상태**: **2026.11.24 투고 완료 · 편집부 초기 점검 단계**  
> **투고 학술지**: HIRA Research (건강보험심사평가원 공식 학술지)  

- **연구 개요**:
  - 병원 원무행정의 대표적 사각지대인 타인명의 송금·개명에 따른 **미식별 입금**과 환자 사망 후 상속인 확인 불가로 장기 방치되는 **미수령 환불금** 문제 해결 방안 제시
  - 병원정보시스템(HIS) 내부 식별정보와 공공행정정보(정부24 안심상속 등)를 단계적으로 연계하는 **5단계 다차원 교차검증 관리모형** 설계
  - 상급종합병원 원무 행정 모수를 반영한 **정밀 실험 표본 150건(미식별 입금 100건, 미수령 환불금 50건)**에 대한 실증 분석 및 **연간 5,000건 모의 트랜잭션** 기반 경제성 검증
- **주요 실증 성과**:
  - **미식별 입금 식별률**: 기존 20.0%(위양성) → **84.0%** 향상 (+64.0%p, McNemar χ² = 48.76, p < 0.001; 진정 환자 귀속 기준 0.0% → 84.0%, χ² = 84.00, N = 100건)
  - **입금 처리 소요일수**: 기존 137.7일 → **9.6일** 단축 (-128.1일, 대응표본 t = 26.45, Cohen's dz = 2.64, 95% 부트스트랩 CI [118.7, 137.4]일)
  - **사망환자 환불금 적격 확인율**: 기존 0.0% → **80.0%** 달성 (McNemar χ² = 20.00, p < 0.001)
  - **카플란-마이어 잔류 중위시간**: 기존 미도달(Not Reached, >240일) → **7.0일** 수렴 (완료 124건 평균 7.37일, 30일 이내 완료 100%)
  - **경제성 분석**: 연간 인건비 절감 4억 2,900만 원(5,000건 × 3.9시간 × 22,000원), 총편익 4억 5,400만 원, 운영비 1억 1,800만 원, 순편익 3억 3,600만 원 (**Net ROI 284.7%**)
- **연구 산출물 및 재현 패키지**:
  - **연구 기준표**: `research_paper/research_sync_reference.md` (MediMatch 전달용 SSOT 문서)
  - **원자료 및 재현 패키지**: `research_paper/reproduction_package/` (150건 원자료 및 Node.js & Python 재현 스크립트 수록)
  - **공공 통계 데이터**: 건강보험심사평가원 공식 공시(2020~2025년) 비급여 진료비 확인신청 및 환불 처리 현황 수록 (병원 내부 잔류 모수와 구분 명시)
  - **공개 연구 초안 (역사적 공개본)**: `research_paper/` 내 수록된 논문 전문 및 PDF/DOCX는 SKT ALEPH 교육과정 중 작성한 이전 연구 초안입니다. (2026.11.24 HIRA Research 최종 제출 원고는 비공개 보존)
  - **연계 웹 시뮬레이터**: [MediMatch 라이브 데모](https://hayul0611.github.io/MediMatch/) | [MediMatch 저장소](https://github.com/HaYul0611/MediMatch)

## 📦 기타 프로젝트

- **MediMatch — 진료비 예외정산 & 공공관리 솔루션**: 학술 논문 연계 연구용 웹 시뮬레이터 ([Live Demo](https://hayul0611.github.io/MediMatch/) / [GitHub](https://github.com/HaYul0611/MediMatch))
- **최부장 시크릿 볼트**: BYTE BACK 가상 자료실 침해 방어전 실습 ([Live Demo](https://choi-bujang-secret-vault-teal.vercel.app) / [GitHub](https://github.com/HaYul0611/choi-bujang-secret-vault))
- **P.D.S Canvas**: 플랜두씨 3D 양장본 메트릭 다이어리 ([Live Demo](https://hayul0611.github.io/PDS-Diary/) / [GitHub](https://github.com/HaYul0611/PDS-Diary))
- **VARO**: 남성 패션 커뮤니티 쇼핑몰 ([GitHub](https://github.com/HaYul0611/varo-shopping-mall))
- **WeddingPlatform**: 웨딩 통합 플랫폼 아키텍처 실습 프로토타입 ([GitHub](https://github.com/HaYul0611/WeddingPlatform))
- **또햄찌 공방 (Hamzzi Studio)**: 60FPS 캔버스 웹 짤방 & 스티커 에디터 ([Live Demo](https://hayul0611.github.io/Hamzzi-Studio/) / [GitHub](https://github.com/HaYul0611/Hamzzi-Studio))
- **Apple 10**: 클래식 콘솔 감성의 수학 퍼즐 게임 ([Live Demo](https://hayul0611.github.io/apple-game/) / [GitHub](https://github.com/HaYul0611/apple-game))

---

## 📂 저장소 디렉터리 구조

```
SKT_ALEPH/
├── index.html                   # 메인 포트폴리오 웹페이지 (최신 이력, 4대 대표작, 인앱 증적 모달)
├── css/
│   ├── style.css                # 테마(다크/라이트), 카드, 모달, 레이아웃 스타일시트
│   └── records.css              # 출석률·학습지표 및 시각화 레이아웃
├── js/
│   ├── main.js                  # 인터랙션 제어 (테마 토글, 아코디언, 프로젝트 필터링)
│   ├── modals.js                # 엔지니어링 증적 모달 (PROJ_DATA) 및 수료증 모달 탭 제어
│   └── records.js               # 2026.11.12 수료 시점 완주 확정 지표 렌더링 스크립트
├── data/
│   └── records.json             # 출석률(100%), 리추얼, 과제 승인(13/13) 확정 데이터
├── assets/
│   ├── profile.jpg / webp       # 프로필 사진
│   ├── certificate_skt_aleph.webp # SKT ALEPH 과정 공식 수료증 고해상도 웹 이미지 (케테르)
│   ├── certificate.jpg / webp   # 웹 풀스택 수료증 이미지
│   └── paper_charts/            # 학술 논문 연계 실증 통계 차트 (4종)
├── docs/                        # 📄 공식 수료증 및 지원 서류
│   ├── SKT_ALEPH_수료증.pdf      # [신규] SKT ALEPH 공식 수료증 원본 (PDF)
│   ├── 이력서_오하율.pdf / docx
│   ├── 경력기술서_오하율.pdf / docx
│   ├── 자기소개서_오하율.pdf / docx
│   └── 오하율_성장에세이_아는만큼보인다.md
├── research_paper/              # 📑 학술 연구 공개 산출물
│   ├── research_sync_reference.md # MediMatch 전달용 단일 연구 기준표 (SSOT)
│   └── reproduction_package/    # 150건 원자료 및 Node.js/Python 재현 스크립트
└── README.md
```

---

## 📜 라이선스

© 2026 오하율. 이 포트폴리오는 개인 채용 목적으로 제작되었습니다.
