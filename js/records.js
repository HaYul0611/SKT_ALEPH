/* ===========================
   Metrics & Records Fetch & Realtime Sync (페이지 로드 시 실시간 자동 동기화)
   =========================== */
(function initMetricsSync() {
  function applyRecordsData(data) {
    if (!data) return;

    var attendanceDays = data.attendance ? data.attendance.days : 44;
    var ritualDays = data.ritual ? data.ritual.days : 44;
    var practiceSuccess = data.practice ? data.practice.successDays : 40;
    var practiceTotal = data.practice ? data.practice.totalDays : 44;
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
    var restTagEl = document.querySelector('.gauge-tag-rest');
    var restDays = Math.max(0, practiceTotal - practiceSuccess);

    if (pracDaysEl) pracDaysEl.textContent = practiceSuccess + '/' + practiceTotal + '일';
    if (pracRateEl) pracRateEl.textContent = '(' + practiceRate + '%)';
    if (pracFillEl) pracFillEl.style.width = practiceRate + '%';
    if (pracTagEl) pracTagEl.textContent = '실천 ' + practiceSuccess + '일 (' + practiceRate + '%)';
    if (restTagEl) restTagEl.textContent = '재정비 ' + restDays + '일';

    // 5. 아침 호흡 루틴 실천 배지
    var breatheBadgeEl = document.getElementById('recordBreatheBadge');
    if (breatheBadgeEl) {
      breatheBadgeEl.textContent = '오늘(' + dateLabel + ') 실천 완료 · 일관도 ' + (data.breathe ? data.breathe.consistency : 98) + '%';
    }

    // 6. 13개 과제 지하철 노선도 실시간 무결 동기화
    if (window.renderSubwayTracker && data.tasks) {
      window.renderSubwayTracker(data.tasks);
    }

    // 7. 출석 실시간 아날로그 시계 & 4개월 달력 인터랙션 동기화 (하드코딩 제거)
    if (window.renderAttendanceCalendar && data.attendance) {
      window.renderAttendanceCalendar(data.attendance);
    }
  }

  // 브라우저 HTTP 캐시로 인한 구버전 표시 방지 (항상 최신 records.json 실시간 페치)
  fetch('data/records.json?_t=' + Date.now(), { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('records.json network response not ok');
      return res.json();
    })
    .then(function (data) {
      applyRecordsData(data);
    })
    .catch(function (err) {
      console.warn('records.json fetch failed, applying offline fallback', err);
      // 오프라인/로컬 실패 시 기본 13개 마스터 기준 데이터 적용
      applyRecordsData({
        attendance: { days: 44, totalDays: 44, rate: 100, avgCheckIn: '08:59' },
        ritual: { days: 44 },
        practice: { successDays: 40, totalDays: 44, rate: 91 },
        breathe: { consistency: 98 },
        tasks: { completed: 13, currentStage: 13, total: 13, status: "전체 마스터 완주", rate: 100.0 }
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

  // 부드러운 Catmull-Rom 스플라인 곡선 경로 생성 함수
  function pointsToCurvedPath(pts) {
    if (!pts || pts.length < 2) return '';
    var d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = i > 0 ? pts[i - 1] : pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = (i < pts.length - 2) ? pts[i + 2] : p2;

      // Catmull-Rom 제어점 계산 (tension = 0.5)
      var cp1x = p1.x + (p2.x - p0.x) / 6;
      var cp1y = p1.y + (p2.y - p0.y) / 6;
      var cp2x = p2.x - (p3.x - p1.x) / 6;
      var cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ' C ' + cp1x.toFixed(1) + ' ' + cp1y.toFixed(1) + ', ' +
        cp2x.toFixed(1) + ' ' + cp2y.toFixed(1) + ', ' +
        p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }

  function render() {
    if (!isVisible) return;

    var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var t = (now - startTime) / 1000;

    // 규칙적인 4구간 들숨·날숨 리듬 (기본 주기 약 5.5초)
    var breathCycle = Math.sin(t * 1.14);
    var breathExpansion = (breathCycle + 1) * 0.5; // 0.0 ~ 1.0 (폐 활량 팽창도)

    var points = [];
    for (var i = 0; i <= segments; i++) {
      var x = i * step;
      var normX = x / width; // 0 ~ 1

      // 1. 유기적인 다중 파동 중첩 (메인 호흡파 + 부드러운 잔물결 하모닉스)
      var wave1 = Math.sin(normX * 4.2 - t * 2.2) * 8.5;
      var wave2 = Math.cos(normX * 7.5 + t * 1.4) * 3.8;
      var wave3 = Math.sin(normX * 11.0 - t * 3.0) * 1.8;

      // 2. 중앙부에서 드라마틱하게 들숨/날숨 파동이 살아 숨쉬는 엔벨로프
      var centerEnvelope = Math.sin(normX * Math.PI);
      centerEnvelope = Math.pow(centerEnvelope, 1.2);

      // 3. 최종 높낮이 굴곡 계산
      var waveHeight = (wave1 + wave2 + wave3) * (0.65 + breathExpansion * 0.7) * centerEnvelope;
      var y = baseY + waveHeight;

      // 경계 안전 클램핑
      y = Math.max(6, Math.min(44, y));
      points.push({ x: x, y: y });
    }

    var linePath = pointsToCurvedPath(points);
    var areaPath = linePath + ' L ' + width + ' 50 L 0 50 Z';

    waveLine.setAttribute('d', linePath);
    waveArea.setAttribute('d', areaPath);

    animId = requestAnimationFrame(render);
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
   Subway Task Stepper Dynamic Controller (하드코딩 없는 데이터 무결 동기화 & 고정 위치 캐릭터)
   =========================== */
(function initSubwayTaskTracker() {
  var wrapper = document.getElementById('subwayTrackWrapper');
  var floater = document.getElementById('subwayCharFloater');
  var container = document.getElementById('subwayStationsContainer');
  var railFill = document.getElementById('subwayRailFill');
  var statusText = document.getElementById('subwayStationStatus');
  var badgeEl = document.getElementById('subwayBadge');
  var taskCountEl = document.getElementById('recordTasksCount');
  var taskTagEl = document.getElementById('recordTasksTag');
  if (!wrapper || !floater || !container) return;

  var stations = container.querySelectorAll('.subway-station');
  var currentStationIndex = 12; // 0-indexed (기본 13번)
  var currentStageNum = 13;
  var currentStatusLabel = '전체 마스터 완주';
  var currentApprovalRate = '100.0';

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

  // 데이터(tasks)에 기반하여 1~13 역 상태, 레일 진행 채움, 캐릭터 위치를 무결하게 동기화 렌더링
  function renderSubwayTracker(tasksData) {
    if (!tasksData) return;

    var total = tasksData.total || 13;
    var completed = (tasksData.completed !== undefined) ? tasksData.completed : 13;
    currentStageNum = tasksData.currentStage || completed || 13;
    currentStationIndex = Math.max(0, Math.min(stations.length - 1, currentStageNum - 1));
    currentStatusLabel = tasksData.status || (completed >= total ? '전체 마스터 완주' : '수정 제출/진행 중');
    currentApprovalRate = (tasksData.rate !== undefined) ? Number(tasksData.rate).toFixed(1) : ((completed / total) * 100).toFixed(1);

    // 1. 상단 카운트 및 배지 동기화
    if (taskCountEl) {
      taskCountEl.textContent = completed + '/' + total + '개';
    }
    if (taskTagEl) {
      taskTagEl.textContent = currentStatusLabel;
    }
    if (badgeEl) {
      badgeEl.textContent = currentStatusLabel;
    }

    // 2. 1~13 각 지하철 역 노드 상태 동적 부여
    stations.forEach(function (btn, idx) {
      var stationNum = idx + 1;
      btn.classList.remove('is-completed', 'is-current', 'is-pending');

      if (stationNum < currentStageNum) {
        // 이미 승인 완료된 이전 단계들
        btn.classList.add('is-completed');
        btn.setAttribute('title', stationNum + '번 챕터 과제 승인 완료');
      } else if (stationNum === currentStageNum) {
        // 현재 제출/수정 제출 진행 및 승인된 현재 위치!
        btn.classList.add('is-completed', 'is-current');
        btn.setAttribute('title', stationNum + '번 챕터 (현재 위치: ' + currentStatusLabel + ')');
      } else {
        // 아직 도달하지 않은 대기/잠금 단계들
        btn.classList.add('is-pending');
        btn.setAttribute('title', stationNum + '번 챕터 (진행 예정)');
      }
    });

    // 3. 지하철 레일 활성 구간 채움 (Progress Fill)
    if (railFill && stations.length > 1) {
      var fillPercent = (currentStationIndex / (stations.length - 1)) * 100;
      railFill.style.width = fillPercent.toFixed(1) + '%';
    }

    // 4. 캐릭터 플로터 위치: 오직 실제 현재 단계 위에만 안착!
    updateFloaterPosition(currentStationIndex, false);

    // 5. 기본 상태 안내 문구 동기화
    resetStatusText();
  }

  function resetStatusText() {
    if (statusText) {
      statusText.innerHTML = '현재 <strong>' + currentStageNum + '번 챕터</strong> ' + (currentStageNum === 13 ? '완주' : currentStatusLabel) + ' · 승인율 <strong>' + currentApprovalRate + '%</strong>';
    }
  }

  // 전역 노출 (initMetricsSync에서 데이터 fetch 시 호출)
  window.renderSubwayTracker = renderSubwayTracker;

  // [중요] 호버 시 캐릭터 위치 이동 코드 완전 제거!
  // 캐릭터는 사용자의 실제 과제 단계(currentStationIndex)에 굳건히 서 있고,
  // 호버 시에는 하단 상태 텍스트에만 해당 챕터의 상세 정보를 안내함.
  stations.forEach(function (btn, idx) {
    var stationNum = idx + 1;

    btn.addEventListener('mouseenter', function () {
      if (!statusText) return;
      if (stationNum < currentStageNum) {
        statusText.innerHTML = '탐색: <strong>' + stationNum + '번 챕터</strong> 승인 완료';
      } else if (stationNum === currentStageNum) {
        statusText.innerHTML = '현재: <strong>' + stationNum + '번 챕터</strong> ' + currentStatusLabel + ' · 승인율 <strong>' + currentApprovalRate + '%</strong>';
      } else {
        statusText.innerHTML = '대기: <strong>' + stationNum + '번 챕터</strong> 진행 예정';
      }
    });

    btn.addEventListener('mouseleave', function () {
      resetStatusText();
    });
  });

  // 리사이즈 시 캐릭터가 '현재 실제 단계' 역 머리 위에 일관되게 정렬
  window.addEventListener('resize', function () {
    updateFloaterPosition(currentStationIndex, false);
  }, { passive: true });

  // 폰트 및 DOM 렌더링 완료 후 첫 위치 계산
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      setTimeout(function () {
        updateFloaterPosition(currentStationIndex, false);
      }, 50);
    });
  }
  setTimeout(function () {
    updateFloaterPosition(currentStationIndex, false);
  }, 300);
  setTimeout(function () {
    updateFloaterPosition(currentStationIndex, false);
  }, 1000);
})();

/* ==========================================================================
   Realtime Chronograph Analog Clock & 8~11 Multi-Month Attendance Calendar
   - 중심 피벗(26, 26) 절대 이탈 없는 부드러운 실시간 초침/분침/시침 회전 엔진
   - 8월, 9월, 10월, 11월 요일 달력 형태(시작 요일 빈칸 오프셋) 완벽 지원
   - Cortex 실제 출석/리추얼/과제(총 43일) 및 주말·공휴일·개강전 무결 동기화 툴팁
   ========================================================================== */
(function initLiveAnalogClockAndCalendar() {
  var hourHand = document.getElementById('analogHourHand');
  var minuteHand = document.getElementById('analogMinuteHand');
  var secondHand = document.getElementById('analogSecondHand');
  var clockBox = document.getElementById('liveClockBox');
  var clockTextEl = document.getElementById('attendanceClockText');
  var calGrid = document.getElementById('attendanceCalGrid');
  var tooltip = document.getElementById('calTooltip');
  var visualBox = document.getElementById('attendanceVisual');
  var monthTabs = document.querySelectorAll('.cal-month-tab');
  var currentLabel = document.getElementById('calCurrentLabel');
  var streakCaption = document.getElementById('attendanceStreakCaption');

  var currentMonthKey = '2026-10';
  var cachedAttendanceData = null;

  // 1. 실시간 아날로그 시계 무브먼트 (Smooth Sweep Animation, 피벗 26, 26 고정)
  function updateClockHands() {
    var now = new Date();
    var ms = now.getMilliseconds();
    var sec = now.getSeconds() + ms / 1000;
    var min = now.getMinutes() + sec / 60;
    var hr = (now.getHours() % 12) + min / 60;

    var secDeg = sec * 6; // 360도 / 60초
    var minDeg = min * 6;
    var hrDeg = hr * 30;  // 360도 / 12시간

    if (secondHand) secondHand.setAttribute('transform', 'rotate(' + secDeg.toFixed(2) + ' 26 26)');
    if (minuteHand) minuteHand.setAttribute('transform', 'rotate(' + minDeg.toFixed(2) + ' 26 26)');
    if (hourHand) hourHand.setAttribute('transform', 'rotate(' + hrDeg.toFixed(2) + ' 26 26)');

    requestAnimationFrame(updateClockHands);
  }

  // 실시간 시계 가동
  requestAnimationFrame(updateClockHands);

  // 시계 호버 시 실시간 현재 시각 안내 툴팁 피드백 (초 단위 실시간 자동 틱킹)
  var clockTooltipTimer = null;

  function updateClockTooltipText() {
    if (!tooltip || !tooltip.classList.contains('is-active')) return;
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    var timeStr = h + ':' + m + ':' + s;
    tooltip.innerHTML = '현재 시각: <strong>' + timeStr + '</strong>';
  }

  if (clockBox) {
    clockBox.removeAttribute('title'); // 브라우저 네이티브 흰색 title 툴팁 절대 중복 방지

    clockBox.addEventListener('mouseenter', function (e) {
      if (!tooltip || !visualBox) return;
      clockBox.removeAttribute('title');
      tooltip.classList.add('is-active');
      updateClockTooltipText();
      positionTooltip(e.clientX, e.clientY);

      if (clockTooltipTimer) clearInterval(clockTooltipTimer);
      clockTooltipTimer = setInterval(updateClockTooltipText, 250);
    });

    clockBox.addEventListener('mousemove', function (e) {
      positionTooltip(e.clientX, e.clientY);
    });

    clockBox.addEventListener('mouseleave', function () {
      if (clockTooltipTimer) {
        clearInterval(clockTooltipTimer);
        clockTooltipTimer = null;
      }
      if (tooltip) tooltip.classList.remove('is-active');
    });
  }

  function positionTooltip(clientX, clientY) {
    if (!tooltip || !visualBox) return;
    var rect = visualBox.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top - 8;
    tooltip.style.left = Math.max(20, Math.min(rect.width - 20, x)) + 'px';
    tooltip.style.top = y + 'px';
  }

  // 2. 월 선택 화살표 네비게이션 (< 2026. 10 >, 8~11월 제한)
  var allowedMonths = ['2026-08', '2026-09', '2026-10', '2026-11'];
  var currentMonthIdx = 2; // 기본: 2026-10 (가장 최근 갱신된 월)
  var currentMonthKey = allowedMonths[currentMonthIdx];

  var prevBtn = document.getElementById('calPrevBtn');
  var nextBtn = document.getElementById('calNextBtn');

  function updateNavButtons() {
    if (prevBtn) prevBtn.disabled = (currentMonthIdx <= 0);
    if (nextBtn) nextBtn.disabled = (currentMonthIdx >= allowedMonths.length - 1);
    if (currentLabel) {
      var parts = allowedMonths[currentMonthIdx].split('-');
      currentLabel.textContent = parts[0] + '. ' + parts[1];
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentMonthIdx > 0) {
        currentMonthIdx--;
        currentMonthKey = allowedMonths[currentMonthIdx];
        updateNavButtons();
        renderAttendanceCalendar(cachedAttendanceData);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentMonthIdx < allowedMonths.length - 1) {
        currentMonthIdx++;
        currentMonthKey = allowedMonths[currentMonthIdx];
        updateNavButtons();
        renderAttendanceCalendar(cachedAttendanceData);
      }
    });
  }

  updateNavButtons();

  // 3. 요일 달력 형태 미니 캘린더 그리드 렌더링 (일요일 시작 & Cortex 실제 기록 동기화)
  function renderAttendanceCalendar(attData) {
    if (!calGrid) return;
    if (attData) cachedAttendanceData = attData;
    var activeData = cachedAttendanceData;
    if (!activeData) return;

    calGrid.innerHTML = '';

    // Cortex 기반 평균 입실 시간 바인딩
    if (clockTextEl && activeData.avgCheckIn) {
      clockTextEl.textContent = '평균 ' + activeData.avgCheckIn + ' 입실';
    }

    if (streakCaption && activeData.days) {
      streakCaption.textContent = activeData.days + '회차 정상 출석 (100% 무결석) · 결석 0';
    }

    var monthsData = activeData.months || null;
    var monthInfo = monthsData ? monthsData[currentMonthKey] : null;

    if (!monthInfo) {
      return;
    }

    var fragment = document.createDocumentFragment();

    // 3-1. 일요일 시작 오프셋에 맞춘 빈 칸 채우기
    for (var b = 0; b < monthInfo.startOffset; b++) {
      var emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell is-empty';
      emptyCell.setAttribute('aria-hidden', 'true');
      fragment.appendChild(emptyCell);
    }

    // 3-2. 일자별 셀 생성 및 Cortex 동기화 데이터 바인딩
    var daysList = monthInfo.days || [];
    daysList.forEach(function (item) {
      var cell = document.createElement('div');
      var typeClass = 'type-' + (item.type || 'attended');
      var isToday = (currentMonthKey === '2026-10' && item.day === 16); // 가장 최근 출석일

      // 일요일 빨간색, 토요일 파란색 클래스
      var dowColorClass = (item.dowIdx === 0) ? ' dow-sun' : ((item.dowIdx === 6) ? ' dow-sat' : '');

      cell.className = 'cal-day-cell ' + typeClass + (isToday ? ' is-today' : '') + dowColorClass;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.textContent = item.day;

      var fullDateText = (monthInfo.month || 10) + '월 ' + item.day + '일(' + item.dow + ')';
      var tooltipHtml = '';

      if (item.type === 'attended') {
        var entryStr = item.entryTime || item.time;
        var exitStr = item.exitTime || '18:00';
        if (entryStr) {
          // Cortex에서 실제 수집된 세부 입퇴실 분 기록이 있는 경우 (10월 등)
          tooltipHtml = fullDateText + ' · <strong>' + item.seq + '회차 정상 출석</strong> · <strong>' + entryStr + '</strong> 입실 (' + exitStr + ' 퇴실)';
        } else {
          // 세부 분 데이터 없이 100% 정상 출석으로 인정된 전달(8~9월) 기록
          tooltipHtml = fullDateText + ' · <strong>' + item.seq + '회차 정상 출석</strong> · <strong>정시 입실</strong> (100% 무결석 인정)';
        }
      } else if (item.type === 'weekend') {
        tooltipHtml = fullDateText + ' · 주말 (수업 없음)';
      } else if (item.type === 'holiday') {
        tooltipHtml = fullDateText + ' · <strong>' + item.label + '</strong>';
      } else if (item.type === 'pre_course') {
        tooltipHtml = fullDateText + ' · 개강 전 준비 기간 (수업 없음)';
      } else {
        tooltipHtml = fullDateText + ' · 교육 일정 진행 예정';
      }

      cell.setAttribute('aria-label', tooltipHtml.replace(/<[^>]+>/g, ''));

      cell.addEventListener('mouseenter', function (e) {
        if (clockTooltipTimer) {
          clearInterval(clockTooltipTimer);
          clockTooltipTimer = null;
        }
        if (!tooltip || !visualBox) return;
        tooltip.innerHTML = tooltipHtml;
        tooltip.classList.add('is-active');
        positionTooltip(e.clientX, e.clientY);
      });

      cell.addEventListener('mousemove', function (e) {
        positionTooltip(e.clientX, e.clientY);
      });

      cell.addEventListener('mouseleave', function () {
        if (tooltip) tooltip.classList.remove('is-active');
      });

      fragment.appendChild(cell);
    });

    calGrid.appendChild(fragment);
  }

  window.renderAttendanceCalendar = renderAttendanceCalendar;
})();



