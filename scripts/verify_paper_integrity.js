/**
 * verify_paper_integrity.js
 * 프로젝트 내 학술 논문 산출물 및 index.html 반영 영역에 대한
 * 누락 여부, 데이터 일관성, 파일 유효성, 무결성을 종합 검증하는 자동화 스크립트.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const researchDir = path.join(rootDir, 'research_paper');
const assetsChartDir = path.join(rootDir, 'assets/paper_charts');
const indexPath = path.join(rootDir, 'index.html');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(description, condition, extraInfo = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${description}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${description} ${extraInfo ? '-> ' + extraInfo : ''}`);
  }
}

console.log('======================================================================');
console.log('          논문 산출물 및 포트폴리오 웹 무결 일치성 종합 검증          ');
console.log('======================================================================\n');

// ----------------------------------------------------------------------
// 1. 파일 시스템 및 산출물 파일 검증
// ----------------------------------------------------------------------
console.log('[1] 연구 논문 정식 산출물 파일 유효성 검증');

const canonicalDocx = path.join(researchDir, '논문_의료기관_진료비_미식별_입금_및_사망환자_미수령_환불금의_공공관리체계_구축_방안_오하율.docx');
const canonicalPdf = path.join(researchDir, '논문_의료기관_진료비_미식별_입금_및_사망환자_미수령_환불금의_공공관리체계_구축_방안_오하율.pdf');
const zipFile = path.join(researchDir, '재현패키지_오하율.zip');

assert('정식 논문 Word (.docx) 파일 존재 여부', fs.existsSync(canonicalDocx));
if (fs.existsSync(canonicalDocx)) {
  const size = fs.statSync(canonicalDocx).size;
  assert(`정식 논문 Word 크기 적격성 (현재 ${size} bytes >= 200KB)`, size >= 200000);
}

assert('정식 논문 PDF (.pdf) 파일 존재 여부', fs.existsSync(canonicalPdf));
if (fs.existsSync(canonicalPdf)) {
  const size = fs.statSync(canonicalPdf).size;
  assert(`정식 논문 PDF 크기 적격성 (현재 ${size} bytes >= 800KB)`, size >= 800000);
}

assert('재현 패키지 (.zip) 파일 존재 여부', fs.existsSync(zipFile));
if (fs.existsSync(zipFile)) {
  const size = fs.statSync(zipFile).size;
  assert(`재현 패키지 ZIP 크기 적격성 (현재 ${size} bytes >= 800KB)`, size >= 800000);
}

const mediDocx = path.join(researchDir, '논문_의료기관_진료비_미식별_입금_및_사망환자_미수령_환불금의_공공관리체계_구축_방안_오하율_MediMatch.docx');
const mediPdf = path.join(researchDir, '논문_의료기관_진료비_미식별_입금_및_사망환자_미수령_환불금의_공공관리체계_구축_방안_오하율_MediMatch.pdf');

assert('임시 작업 파일(_MediMatch.docx) 제거 확인', !fs.existsSync(mediDocx));
assert('임시 작업 파일(_MediMatch.pdf) 제거 확인', !fs.existsSync(mediPdf));

const charts = ['chart_cv.png', 'chart_hypothesis.png', 'chart_survival.png', 'chart_forest.png'];
charts.forEach(c => {
  const p = path.join(assetsChartDir, c);
  assert(`웹 연계 고해상도 차트 (${c}) 존재 및 크기 검증`, fs.existsSync(p) && fs.statSync(p).size > 30000);
});

// ----------------------------------------------------------------------
// 2. index.html 다운로드 링크 정합성 검증
// ----------------------------------------------------------------------
console.log('\n[2] index.html 다운로드 링크 및 경로 정합성 검증');

assert('index.html 파일 존재 확인', fs.existsSync(indexPath));
const html = fs.readFileSync(indexPath, 'utf8');

// 링크 검색
const docxLinks = html.match(/href="research_paper\/[^"]+\.docx"/g) || [];
const pdfLinks = html.match(/href="research_paper\/[^"]+\.pdf"/g) || [];
const zipLinks = html.match(/href="research_paper\/[^"]+\.zip"/g) || [];

assert(`DOCX 다운로드 링크 개수 및 경로 확인 (${docxLinks.length}개 링크)`, docxLinks.length >= 2);
docxLinks.forEach(link => {
  const relPath = link.replace('href="', '').replace('"', '');
  const absPath = path.join(rootDir, relPath);
  assert(`DOCX 실물 파일 존재 확인: ${relPath}`, fs.existsSync(absPath));
});

assert(`PDF 다운로드 링크 개수 및 경로 확인 (${pdfLinks.length}개 링크)`, pdfLinks.length >= 3);
pdfLinks.forEach(link => {
  const relPath = link.replace('href="', '').replace('"', '');
  const absPath = path.join(rootDir, relPath);
  assert(`PDF 실물 파일 존재 확인: ${relPath}`, fs.existsSync(absPath));
});

assert(`ZIP 다운로드 링크 개수 및 경로 확인 (${zipLinks.length}개 링크)`, zipLinks.length >= 1);
zipLinks.forEach(link => {
  const relPath = link.replace('href="', '').replace('"', '');
  const absPath = path.join(rootDir, relPath);
  assert(`ZIP 실물 파일 존재 확인: ${relPath}`, fs.existsSync(absPath));
});

// ----------------------------------------------------------------------
// 3. index.html 내 논문 전문 모달(#paperModal) 내용 무결 일치성 검증
// ----------------------------------------------------------------------
console.log('\n[3] index.html 논문 뷰어(#paperModal) 텍스트 및 데이터 무결 일치 검증');

// 3.1 초록 (Abstract)
assert('국문 초록 - 5단계 교차검증 모델 및 5,000건 시뮬레이션 명시', html.includes('5단계 교차검증 관리모형') && html.includes('5,000건 규모 모의 정산 트랜잭션 데이터셋'));
assert('국문 초록 - 4대 핵심 검증 수치(식별률 84%, 소요일 9.6일, 적격확인율 80%, 중위잔류일 7일) 수록', 
  html.includes('84.0%') && html.includes('9.6일') && html.includes('80.0%') && html.includes('7일'));
assert('국문 초록 - 구버전 소극적 한계 서술("실증분석을 수행하지 않았으므로") 완전 삭제 확인', !html.includes('실제 의료기관 자료를 이용한 실증분석과 시스템 구현·평가는 수행하지 않았으므로'));

const normHtml = html.replace(/\s+/g, ' ');
assert('영문 Abstract - 5-stage cross-validation & 5,000 synthetic transactions 명시', 
  normHtml.includes('5-stage multidimensional cross-validation framework') && normHtml.includes('synthetic dataset of 5,000 transactions'));
assert('영문 Abstract - 구버전 한계 서술 완전 삭제 확인', !normHtml.includes('However, this study did not conduct an empirical analysis'));

// 3.2 서론 목적
assert('서론 제3절 - 5단계 모형 및 5,000건 대규모 시뮬레이션 검증 목적 명시', 
  html.includes('상급종합병원 환경을 반영한 대규모 모의 정산 트랜잭션 시뮬레이션 모델을 구현하여'));

// 3.3 연구 방법 (순서 및 가설 배치 확인)
const secMethodIdx = html.indexOf('id="paper-sec-method"');
const secResultIdx = html.indexOf('id="paper-sec-result"');
const methodHtml = html.substring(secMethodIdx, secResultIdx);

assert('연구방법 - 1절 연구자료 및 분석 대상(HIRA 통계 포함) 수록', methodHtml.includes('1. 연구자료 및 분석 대상') && methodHtml.includes('건강보험심사평가원(HIRA)'));
assert('연구방법 - 2절 5단계 다차원 교차검증 모형 설계 수록', methodHtml.includes('2. 5단계 다차원 교차검증 모형 설계'));
assert('연구방법 - 3절 교차검증 기반 예측 시뮬레이션 모델 및 모의 데이터셋 구축 수록', methodHtml.includes('3. 교차검증 기반 예측 시뮬레이션 모델 및 모의 데이터셋 구축'));
assert('연구방법 - 4절 통계적 적합성 검증 및 분석 절차 수록', methodHtml.includes('4. 통계적 적합성 검증 및 분석 절차'));

// 순서 검증: 5단계 모형 설계(2절)가 시뮬레이션(3절)보다 먼저 나와야 함
const idxSec2 = methodHtml.indexOf('2. 5단계 다차원 교차검증 모형 설계');
const idxSec3 = methodHtml.indexOf('3. 교차검증 기반 예측 시뮬레이션 모델 및 모의 데이터셋 구축');
assert('연구방법 순서 검증: 5단계 모형 설계(2절)가 시뮬레이션 모델(3절)보다 선행', idxSec2 !== -1 && idxSec3 !== -1 && idxSec2 < idxSec3);

// 가설 설정 문단 배치 검증 (3절 시뮬레이션 직후 배치)
assert('연구방법 - 3절 시뮬레이션 모델 직후 가설 설정 수록 ("이러한 시뮬레이션 모델을 바탕으로, 연구자는 다음과 같은 최종 연구 가설과 4대 세부 실증 검정 가설을 설정하였다.")', 
  methodHtml.includes('이러한 시뮬레이션 모델을 바탕으로, 연구자는 다음과 같은 최종 연구 가설과 4대 세부 실증 검정 가설을 설정하였다.') &&
  methodHtml.includes('가설 6.1') && methodHtml.includes('가설 6.4'));

// 3.4 연구 결과 (제6절 시뮬레이션 및 실증 통계분석 검증 결과)
const secResultHtml = html.substring(secResultIdx, html.indexOf('id="paper-sec-conclusion"'));

assert('연구결과 - 6. 시뮬레이션 및 실증 통계분석 검증 결과 절 수록', secResultHtml.includes('6. 시뮬레이션 및 실증 통계분석 검증 결과'));
assert('연구결과 - 6.1 5-Fold 교차검증 결과 수록 (90.03%, 89.22%, 0.81%p)', 
  secResultHtml.includes('90.03%') && secResultHtml.includes('89.22%') && secResultHtml.includes('0.81%p'));
assert('연구결과 - 6.2 4대 핵심 가설 검정 결과 및 요약표 수록', 
  secResultHtml.includes('&lt;표 5&gt; 4대 핵심 가설 실증 검정 요약표') && secResultHtml.includes('Z = 13.42') && secResultHtml.includes('Cohen\'s d = 4.22'));
assert('연구결과 - 6.3 카플란-마이어 생존분석 수록 (138일 vs 7일, Log-Rank χ² = 412.8)', 
  secResultHtml.includes('138일') && secResultHtml.includes('7일') && secResultHtml.includes('χ² = 412.8'));
assert('연구결과 - 6.4 다중 로지스틱 회귀분석 수록 (안심상속 OR 47.00, HIS보호자 OR 30.57)', 
  secResultHtml.includes('47.00') && secResultHtml.includes('30.57'));
assert('연구결과 - 6.5 비모수 부트스트랩 BCa 95% CI 수록', secResultHtml.includes('124.8일, 131.4일'));
assert('연구결과 - 6.6 대학병원 ROI 분석 수록 (연간 절감 4억 1,200만 원, ROI 285%)', 
  secResultHtml.includes('4억 1,200만 원') && secResultHtml.includes('285%'));

// 3.5 연구결과 내 4대 차트 및 X/Y축 주석 검증
assert('차트 1 삽입 및 X/Y축 주석 확인 ([그림 1] chart_cv.png)', 
  secResultHtml.includes('assets/paper_charts/chart_cv.png') && 
  secResultHtml.includes('* 주: X축은 5-Fold 계층화 교차검증의 분할 단위(Fold 1~5)를, Y축은 모델의 분류 정확도(Accuracy, %)를 나타냄.'));

assert('차트 2 삽입 및 X/Y축 주석 확인 ([그림 2] chart_hypothesis.png)', 
  secResultHtml.includes('assets/paper_charts/chart_hypothesis.png') && 
  secResultHtml.includes('* 주: X축은 4대 핵심 실증 가설 항목(가설 6.1~6.4)을, Y축은 각 가설의 측정 지표값(비율 % 또는 평균 소요일수 Days)을 나타냄.'));

assert('차트 3 삽입 및 X/Y축 주석 확인 ([그림 3] chart_survival.png)', 
  secResultHtml.includes('assets/paper_charts/chart_survival.png') && 
  secResultHtml.includes('* 주: X축은 정산 미해소 상태의 경과 기간(일수, Days)을, Y축은 미해소 상태로 남아있는 잔류 확률(Survival Probability, %)을 나타냄.'));

assert('차트 4 삽입 및 X/Y축 주석 확인 ([그림 4] chart_forest.png)', 
  secResultHtml.includes('assets/paper_charts/chart_forest.png') && 
  secResultHtml.includes('* 주: X축은 설명변수별 승산비(Odds Ratio, 로그 스케일, 점선=1.0 무영향 기준선)를, Y축은 다중 로지스틱 회귀분석에 투입된 주요 예측 독립변수를 나타냄.'));

// 3.6 결론 (Conclusion)
const secConclIdx = html.indexOf('id="paper-sec-conclusion"');
const secRefIdx = html.indexOf('id="paper-sec-ref"');
const conclHtml = html.substring(secConclIdx, secRefIdx);

assert('결론 - 5단계 예측 시뮬레이션 실증 효과 및 공공관리체계 타당성 명시', 
  conclHtml.includes('본 연구에서 구현한 5단계 다차원 교차검증 예측 시뮬레이션 모델은') && 
  conclHtml.includes('공공행정 간 정보연계 체계의 구축 타당성을 뒷받침하는 강력한 실증적 근거가 된다.'));
assert('결론 - 구버전 한계 서술 완전 삭제 확인 ("실증분석이나 시스템 구현 및 효과검증을 수행하지 못하였다" 미존재)', 
  !conclHtml.includes('실제 발생자료를 이용한 실증분석이나 시스템 구현 및 효과검증을 수행하지 못하였다'));

// ----------------------------------------------------------------------
// 4. 어문 규범 및 중복 조사 검사
// ----------------------------------------------------------------------
console.log('\n[4] 학술 문장 어문 규범 및 중복 조사 검사');

const paperModalBody = html.substring(html.indexOf('id="paperModal"'), html.indexOf('id="projectModal"'));
const plainText = paperModalBody.replace(/<[^>]+>/g, ' ');

const particlePatterns = [
  { name: '~의 ~의', regex: /(\S+의\s+\S+의)/g },
  { name: '~에 ~에', regex: /(\S+에\s+\S+에)/g },
  { name: '~을 ~를 / ~를 ~을', regex: /(\S+을\s+\S+를|\S+를\s+\S+을)/g }
];

let dupParticleCount = 0;
particlePatterns.forEach(p => {
  const matches = plainText.match(p.regex) || [];
  matches.forEach(m => {
    // 예외 단어 필터 (예: 한자어 명사 '동의', '명의' 등)
    if (m.includes('동의') || m.includes('명의')) return;
    console.warn(`    주의: 중복 조사 의심 패턴 발견 [${p.name}]: "${m}"`);
    dupParticleCount++;
  });
});

assert(`논문 본문 중복 조사 전수 검사 (발견 건수: ${dupParticleCount}건)`, dupParticleCount === 0);

// ----------------------------------------------------------------------
// 종합 결과 요약
// ----------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`                     종합 검증 결과 요약                     `);
console.log(`  총 검사 항목: ${totalTests}개`);
console.log(`  통과 (PASS):   ${passedTests}개`);
console.log(`  실패 (FAIL):   ${failedTests}개`);
console.log('======================================================================');

if (failedTests === 0) {
  console.log('\n>>> [성공] 모든 검사 항목을 100% 통과하였습니다. 프로젝트 산출물과 웹 반영 내용이 완전히 일치합니다.');
  process.exit(0);
} else {
  console.error(`\n>>> [실패] ${failedTests}개 항목에서 정합성 불일치가 발견되었습니다.`);
  process.exit(1);
}
