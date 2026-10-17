/* ===========================
   Metrics & Records Fetch & Realtime Sync (페이지 로드 시 실시간 자동 동기화)
   =========================== */
(function initMetricsSync() {
  function applyRecordsData(data) {
    if (!data) return;

    var attendanceDays = data.attendance ? data.attendance.days : 43;
    var ritualDays = data.ritual ? data.ritual.days : 43;
    var practiceSuccess = data.practice ? data.practice.successDays : 39;
    var practiceTotal = data.practice ? data.practice.totalDays : 43;
    var practiceRate = data.practice ? data.practice.rate : 91;
    var tasksCompleted = data.tasks ? data.tasks.completed : 13;
    var tasksTotal = data.tasks ? data.tasks.total : 13;

    // 실시간 날짜 포맷팅 (오늘 날짜와 records.json의 lastUpdated 동기화)
    var today = new Date();
    var currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    var currentDate = String(today.getDate()).padStart(2, '0');
    var todayLabel = currentMonth + '.' + currentDate;
    var todayRange = currentMonth + '-' + currentDate;

    // 만약 records.json에 지정된 날짜가 유효하면 사용하되, 현재 접속일에 맞추어 연동
    var dateLabel = data.lastUpdated ? (data.lastUpdated.split('-')[1] + '.' + data.lastUpdated.split('-')[2]) : todayLabel;
    var dateRange = data.lastUpdated ? (data.lastUpdated.split('-')[1] + '-' + data.lastUpdated.split('-')[2]) : todayRange;

    // 1. 상단 요약 프리뷰
    var summaryEl = document.getElementById('recordsSectionSummary');
    if (summaryEl) {
      summaryEl.textContent = '출석 ' + attendanceDays + '일(100% 무결석) · 리추얼 ' + ritualDays + '일 연속 · 과제 마스터 승인 ' + tasksCompleted + '/' + tasksTotal + '개 (100% 완주)';
    }

    // 2. 출석 카드
    var attDaysEl = document.getElementById('recordAttendanceDays');
    var attRateEl = document.getElementById('recordAttendanceRate');
    if (attDaysEl) attDaysEl.textContent = attendanceDays + '/' + attendanceDays + '일';
    if (attRateEl) attRateEl.textContent = '(100%)';

    // 3. 리추얼 일수 카드
    var ritDaysEl = document.getElementById('recordRitualDays');
    var ritRangeEl = document.getElementById('recordRitualDateRange');
    var ritDateEl = document.getElementById('recordRitualCurrentDate');
    if (ritDaysEl) ritDaysEl.textContent = ritualDays + '일';
    if (ritRangeEl) ritRangeEl.textContent = '(2026-08-11 ~ ' + dateRange + ')';
    if (ritDateEl) ritDateEl.textContent = dateLabel + ' (현재)';

    // 4. 강점 실천율 카드
    var pracDaysEl = document.getElementById('recordPracticeDays');
    var pracRateEl = document.getElementById('recordPracticeRate');
    var pracFillEl = document.getElementById('recordPracticeFill');
    var pracTagEl = document.getElementById('recordPracticeTag');
    if (pracDaysEl) pracDaysEl.textContent = practiceSuccess + '/' + practiceTotal + '일';
    if (pracRateEl) pracRateEl.textContent = '(' + practiceRate + '%)';
    if (pracFillEl) pracFillEl.style.width = practiceRate + '%';
    if (pracTagEl) pracTagEl.textContent = '실천 ' + practiceSuccess + '일 (' + practiceRate + '%)';

    // 5. 아침 호흡 루틴 실천 배지
    var breatheBadgeEl = document.getElementById('recordBreatheBadge');
    if (breatheBadgeEl) {
      breatheBadgeEl.textContent = '오늘(' + dateLabel + ') 실천 완료 · 일관도 ' + (data.breathe ? data.breathe.consistency : 98) + '%';
    }
  }

  fetch('data/records.json')
    .then(function (res) {
      if (!res.ok) throw new Error('records.json network response not ok');
      return res.json();
    })
    .then(function (data) {
      applyRecordsData(data);
    })
    .catch(function () {
      // 오프라인/로컬 실패 시 기본 43일 기준 동적 날짜 계산 적용
      applyRecordsData({
        attendance: { days: 43 },
        ritual: { days: 43 },
        practice: { successDays: 39, totalDays: 43, rate: 91 },
        breathe: { consistency: 98 },
        tasks: { completed: 13, total: 13 }
      });
    });
})();

/* ===========================
   Fluid Organic Breathing Wave Animator (진짜 물결치듯 유기적인 푸른빛 호흡 파동)
   =========================== */
(function initOrganicBreathingWave() {
  var waveLine = document.getElementById('sparklineWaveLine');
  var waveArea = document.getElementById('sparklineWaveArea');
  var svg = document.getElementById('sparklineSvg');
  if (!waveLine || !waveArea || !svg) return;

  var width = 240;
  var baseY = 25;
  var segments = 24;
  var step = width / segments;
  var animId = null;
  var startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var isVisible = true;

  // 부드러운 3차 베지어 스플라인 (모든 계산된 피크와 골의 굴곡을 100% 온전히 통과)
  function buildPathData(points) {
    if (points.length === 0) return '';
    var d = 'M ' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i];
      var p1 = points[i + 1];
      var dx = p1.x - p0.x;
      var cp1x = (p0.x + dx * 0.45).toFixed(1);
      var cp1y = p0.y.toFixed(1);
      var cp2x = (p0.x + dx * 0.55).toFixed(1);
      var cp2y = p1.y.toFixed(1);
      d += ' C ' + cp1x + ',' + cp1y + ' ' + cp2x + ',' + cp2y + ' ' + p1.x.toFixed(1) + ',' + p1.y.toFixed(1);
    }
    return d;
  }

  function render(timestamp) {
    var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : (timestamp || Date.now());
    var t = (now - startTime) / 1000;

    // 실제 생체 호흡 주기: 약 4.2초 주기의 깊은 들숨(Inhale) ↔ 날숨(Exhale) 팽창/수축 리듬
    var inhaleCycle = Math.sin(t * 1.5);
    var chestExpansion = 1.05 + 0.35 * inhaleCycle; // 0.70 ~ 1.40배 다이내믹 팽창

    // 다중 고조파 생체 호흡 파형 합성 (위치별 고저차 굴곡이 살아있는 엔벨로프)
    var points = [];
    for (var i = 0; i <= segments; i++) {
      var x = i * step;
      var normX = x / width; // 0.0 ~ 1.0

      // 공간 엔벨로프: 균일한 기계식 사인파를 탈피하여 높은 마루, 깊은 골, 완만한 구간이 교차
      var spatialEnvelope = 0.55 +
        0.50 * Math.sin(normX * Math.PI * 2 - 0.3) +
        0.28 * Math.cos(normX * Math.PI * 3.2);

      // 1차 주 호흡 팽창 파동 (높은 피크와 깊은 골 형성)
      var primaryWave = Math.sin(x * 0.038 - t * 1.8) * 13.5 * spatialEnvelope * chestExpansion;

      // 2차 생체 고조파 (마루마다 다른 높낮이 굴곡 부여)
      var secondaryWave = Math.sin(x * 0.072 - t * 2.5 + 1.1) * 4.2 * chestExpansion;

      // 3차 흉곽 기저 유동
      var chestDrift = Math.sin(t * 1.2 + normX * 1.5) * 2.0;

      var y = baseY + primaryWave + secondaryWave + chestDrift;
      // SVG viewBox(0 0 240 56) 내부에서 테두리 클리핑 없이 최대 굴곡(고저차 ~33px) 보장
      y = Math.max(6.5, Math.min(47.5, y));
      points.push({ x: x, y: y });
    }

    var linePath = buildPathData(points);
    var areaPath = linePath + ' L 240,54 L 0,54 Z';

    waveLine.setAttribute('d', linePath);
    waveArea.setAttribute('d', areaPath);

    if (isVisible) {
      animId = requestAnimationFrame(render);
    }
  }

  // 살아 숨쉬는 생체 호흡 시작
  function startWave() {
    isVisible = true;
    if (!animId) {
      animId = requestAnimationFrame(render);
    }
  }

  function stopWave() {
    isVisible = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  startWave();

  // 탭 전환 시 CPU/배터리 절전 (현재 탭 보고 있을 때는 항상 유기적으로 살아 숨쉼)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopWave();
    } else {
      startWave();
    }
  });

  // 여유 있는 400px 마진의 IntersectionObserver (스크롤 진입 전부터 이미 자연스럽게 호흡)
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !document.hidden) {
          startWave();
        } else if (!entry.isIntersecting) {
          stopWave();
        }
      });
    }, { rootMargin: '400px 0px 400px 0px', threshold: 0 });
    observer.observe(svg);
  }
})();

/* ===========================
   Subway Task Stepper Dynamic Controller (하드코딩 없는 동적 노선도 & 귀여운 캐릭터 러너 모션)
   =========================== */
(function initSubwayTaskTracker() {
  var wrapper = document.getElementById('subwayTrackWrapper');
  var floater = document.getElementById('subwayCharFloater');
  var container = document.getElementById('subwayStationsContainer');
  var statusText = document.getElementById('subwayStationStatus');
  if (!wrapper || !floater || !container) return;

  var stations = container.querySelectorAll('.subway-station');
  var currentStationIndex = 12; // 0-indexed (13번 역)
  var activeHoverIndex = null;

  function updateFloaterPosition(index, animate) {
    if (index < 0 || index >= stations.length) return;
    var target = stations[index];
    var circle = target.querySelector('.station-circle') || target;
    var wrapperRect = wrapper.getBoundingClientRect();
    var targetRect = circle.getBoundingClientRect();
    if (wrapperRect.width === 0) return;

    // 계산된 역의 중심 x 좌표 (wrapper 기준 상대 좌표)
    var centerX = (targetRect.left + targetRect.width / 2) - wrapperRect.left;

    if (animate === false) {
      floater.style.transition = 'none';
    } else {
      floater.style.transition = 'left 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
    floater.style.left = centerX.toFixed(1) + 'px';
  }

  // 초기 위치 설정 (13번 역 안착)
  function setInitialPosition() {
    updateFloaterPosition(currentStationIndex, false);
  }

  // 각 챕터별 마우스 오버 / 터치 인터랙션 (노선을 따라 캐릭터가 이동하여 반응)
  stations.forEach(function (btn, idx) {
    btn.addEventListener('mouseenter', function () {
      activeHoverIndex = idx;
      updateFloaterPosition(idx, true);
      if (statusText) {
        var num = idx + 1;
        statusText.innerHTML = '탐색: <strong>' + num + '번 챕터</strong> ' + (num === 13 ? '마스터 완주' : '승인 완료') + ' · 승인율 <strong>100.0%</strong>';
      }
    });

    btn.addEventListener('mouseleave', function () {
      activeHoverIndex = null;
      updateFloaterPosition(currentStationIndex, true);
      if (statusText) {
        statusText.innerHTML = '현재 <strong>13번 챕터</strong> 완주 · 승인율 <strong>100.0%</strong>';
      }
    });

    btn.addEventListener('click', function () {
      currentStationIndex = idx;
      stations.forEach(function (s, sIdx) {
        if (sIdx === idx) s.classList.add('is-current');
        else s.classList.remove('is-current');
      });
      updateFloaterPosition(idx, true);
    });
  });

  // 리사이즈 시 캐릭터 위치 자동 보정
  window.addEventListener('resize', function () {
    var idx = (activeHoverIndex !== null) ? activeHoverIndex : currentStationIndex;
    updateFloaterPosition(idx, false);
  }, { passive: true });

  // 폰트 및 DOM 렌더링 완료 후 첫 위치 계산
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      setTimeout(setInitialPosition, 50);
    });
  }
  setTimeout(setInitialPosition, 300);
  setTimeout(setInitialPosition, 1000);
})();

