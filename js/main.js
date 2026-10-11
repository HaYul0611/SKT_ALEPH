/* ===========================
   Theme Toggle (다크/라이트 모드)
   =========================== */
(function initTheme() {
  var toggle = document.getElementById('themeToggle');
  var stored = localStorage.getItem('theme');

  function updateAriaLabel(isDark) {
    if (toggle) {
      toggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
  }

  if (stored === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateAriaLabel(true);
  } else {
    updateAriaLabel(false);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      if (current === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateAriaLabel(false);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateAriaLabel(true);
      }
    });
  }
})();

/* ===========================
   Self Introduction Modal (자기소개서 전문 모달)
   =========================== */
(function initIntroModal() {
  var openBtn = document.getElementById('introModalBtn');
  var modal = document.getElementById('introModal');
  var closeBtn = document.getElementById('introClose');
  var bottomCloseBtn = document.getElementById('introBottomClose');
  var lastFocused = null;

  if (!openBtn || !modal) return;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) {
      lastFocused.focus();
    }
  }

  openBtn.addEventListener('click', openModal);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (bottomCloseBtn) {
    bottomCloseBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!modal.hidden && e.key === 'Escape') {
      closeModal();
    }
  });
})();

/* ===========================
   SAR Toggle (강점 펼치기/접기)
   =========================== */
(function initSarToggles() {
  var toggles = document.querySelectorAll('.sar-toggle');

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var targetId = btn.getAttribute('aria-controls');
      var target = document.getElementById(targetId);
      if (!target) return;

      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        target.hidden = true;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        target.hidden = false;
      }
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

/* ===========================
   Certificate Modal (수료증 모달)
   =========================== */
(function initCertModal() {
  var openBtn = document.getElementById('certBtn');
  var modal = document.getElementById('certModal');
  var closeBtn = document.getElementById('certClose');
  var lastFocused = null;

  if (!openBtn || !modal || !closeBtn) return;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) {
      lastFocused.focus();
    }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
})();

/* ===========================
   Narrative Document Modal & ScrollSpy (서사 문서 모달 및 실시간 스크롤스파이)
   =========================== */
(function initStoryModal() {
  var openBtns = [
    document.getElementById('storyBtn'),
    document.getElementById('aboutStoryBtn'),
    document.getElementById('strengthsStoryBtn')
  ];
  var modal = document.getElementById('storyModal');
  var closeBtn = document.getElementById('storyClose');
  var navChips = document.querySelectorAll('.story-nav-chip');
  var modalBody = modal ? modal.querySelector('.story-modal-body') : null;
  var sections = modal ? modal.querySelectorAll('.story-section') : [];
  var lastFocused = null;
  var isClickScrolling = false;
  var scrollTimer = null;

  if (!modal || !modalBody) return;

  // 특정 탭 활성화 및 탭 바 가로 스크롤 동기화
  function setActiveChip(targetId) {
    var activeChip = null;
    navChips.forEach(function (chip) {
      if (chip.getAttribute('data-target') === targetId) {
        chip.classList.add('active');
        activeChip = chip;
      } else {
        chip.classList.remove('active');
      }
    });

    if (activeChip && !isClickScrolling) {
      activeChip.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }

  // 실시간 스크롤 감지 및 현재 섹션 추적
  function updateScrollSpy() {
    if (isClickScrolling || !sections.length) return;

    var bodyRect = modalBody.getBoundingClientRect();
    // 상단 탭 바로 아래 위치(오프셋 80px)를 기준점으로 설정
    var triggerLine = bodyRect.top + 80;

    // 맨 아래 도달 체크
    if (modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 25) {
      setActiveChip(sections[sections.length - 1].id);
      return;
    }

    var currentId = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var secRect = sec.getBoundingClientRect();
      if (secRect.top <= triggerLine) {
        currentId = sec.id;
      } else {
        break;
      }
    }

    setActiveChip(currentId);
  }

  function scrollToSection(targetId, smooth) {
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    setActiveChip(targetId);
    isClickScrolling = true;
    clearTimeout(scrollTimer);

    var bodyRect = modalBody.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var offset = targetRect.top - bodyRect.top + modalBody.scrollTop - 10;

    modalBody.scrollTo({
      top: Math.max(0, offset),
      behavior: smooth ? 'smooth' : 'auto'
    });

    scrollTimer = setTimeout(function () {
      isClickScrolling = false;
      updateScrollSpy();
    }, smooth ? 600 : 50);
  }

  function openModal(defaultTargetId) {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    var target = (typeof defaultTargetId === 'string' && defaultTargetId) ? defaultTargetId : 'story-sec-1';
    modalBody.scrollTop = 0;
    setActiveChip(target);

    if (target !== 'story-sec-1') {
      setTimeout(function () {
        scrollToSection(target, false);
      }, 30);
    }

    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) {
      lastFocused.focus();
    }
  }

  openBtns.forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', function () {
        var targetSection = btn.getAttribute('data-story-target') || 'story-sec-1';
        openModal(targetSection);
      });
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // 스크롤 이벤트 리스너 등록 (ScrollSpy 실시간 반영)
  modalBody.addEventListener('scroll', updateScrollSpy, { passive: true });

  // 탭 클릭 시 해당 섹션으로 부드러운 이동
  navChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var targetId = chip.getAttribute('data-target');
      scrollToSection(targetId, true);
    });
  });
})();

/* ===========================
   Vision Interactive Pipeline (비전 아키텍처 인터랙션)
   =========================== */
(function initVisionPipeline() {
  var nodes = document.querySelectorAll('.vision-node');
  var badge = document.getElementById('visionStepBadge');
  var title = document.getElementById('visionStepTitle');
  var desc = document.getElementById('visionStepDesc');
  var tags = document.getElementById('visionStepTags');

  if (!nodes.length || !badge || !title || !desc || !tags) return;

  var stepData = [
    {
      badge: 'STEP 01 · 수집 및 센싱',
      title: '네트워크 모니터링 (Network Traffic Sensing)',
      desc: '서버 및 엔드포인트 전반의 인프라 트래픽을 저지연 커널 레벨(eBPF / Suricata)에서 실시간 캡처하여 프로토콜 흐름, 패킷 메타데이터, 비정상 세션 징후를 센싱합니다.',
      tags: ['eBPF', 'Packet Analysis', 'Network Sensing', 'Traffic Flow']
    },
    {
      badge: 'STEP 02 · 핵심 머신러닝 분석',
      title: 'AI 실시간 분석 (Real-time Anomaly Detection)',
      desc: '수집된 로그와 네트워크 벡터를 사전 학습된 비지도 학습 머신러닝 모델(Isolation Forest / AutoEncoder)로 실시간 추론하여 기존 시그니처로 잡히지 않는 제로데이 위협 패턴을 식별합니다.',
      tags: ['Machine Learning', 'Anomaly Detection', 'AutoEncoder', 'Real-time Inference']
    },
    {
      badge: 'STEP 03 · 자동화된 방어',
      title: '위협 탐지 · 대응 (Automated SOAR Defense)',
      desc: '식별된 이상 지표를 위협 인텔리전스와 대조하고, 침해 위험도가 높은 세션이나 IP를 방화벽 룰셋에 즉시 자동 반영하여 세션을 격리하고 보안 담당자에게 실시간 경보를 전송합니다.',
      tags: ['SOAR Automation', 'Threat Response', 'Session Isolation', 'Firewall Policy']
    },
    {
      badge: 'STEP 04 · 인프라 통합 배포',
      title: '기업 맞춤 배포 (Enterprise Cloud Delivery)',
      desc: '온프레미스 레거시 서버부터 Kubernetes, AWS/클라우드 환경까지 경량 컨테이너(Docker) 기반 에이전트로 패키징하여 고객사 인프라에 최소 리소스로 즉시 배포할 수 있도록 최적화합니다.',
      tags: ['Docker', 'Kubernetes', 'Cloud Infrastructure', 'Production Ready']
    }
  ];

  function setActiveStep(idx) {
    nodes.forEach(function (n, i) {
      if (i === idx) {
        n.classList.add('active');
        n.setAttribute('aria-selected', 'true');
      } else {
        n.classList.remove('active');
        n.setAttribute('aria-selected', 'false');
      }
    });

    var data = stepData[idx];
    if (!data) return;

    var card = document.getElementById('visionDetailCard');
    if (card) {
      card.style.opacity = '0.4';
      card.style.transform = 'translateY(3px)';
      setTimeout(function () {
        badge.textContent = data.badge;
        title.textContent = data.title;
        desc.textContent = data.desc;
        tags.innerHTML = data.tags.map(function (t) {
          return '<span class="detail-tag">' + t + '</span>';
        }).join('');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 120);
    }
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var step = parseInt(this.getAttribute('data-step'), 10);
      if (!isNaN(step)) {
        setActiveStep(step);
      }
    });
  });
})();

/* ===========================
   Projects Filter (프로젝트 카테고리 필터)
   =========================== */
(function initProjectFilters() {
  var chips = document.querySelectorAll('.proj-chip');
  var items = document.querySelectorAll('#projectGrid .project-item');
  if (!chips.length || !items.length) return;

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var filter = chip.getAttribute('data-filter');

      items.forEach(function (item) {
        var cat = item.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          item.classList.remove('hidden-proj');
          item.style.animation = 'cardFadeIn 0.25s ease-out';
        } else {
          item.classList.add('hidden-proj');
        }
      });
    });
  });
})();

/* ===========================
   Reduced Motion Toggle
   =========================== */
(function initReducedMotion() {
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    document.documentElement.style.setProperty('--transition', '0.01ms');
  }
})();

/* ===========================
   Academic Paper Reader Modal (학술 논문 전문 뷰어 모달)
   =========================== */
(function initPaperModal() {
  var openBtns = [
    document.getElementById('paperMainOpenBtn'),
    document.getElementById('aboutPaperBtn'),
    document.getElementById('paperEvidenceBtn')
  ];
  var modal = document.getElementById('paperModal');
  var closeBtn = document.getElementById('paperModalClose');
  var modalBody = modal ? modal.querySelector('.paper-modal-body') : null;
  var navLinks = modal ? modal.querySelectorAll('.paper-nav-link') : [];
  var lastFocused = null;

  if (!modal) return;

  function openPaperModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    if (modalBody) modalBody.scrollTop = 0;
    if (navLinks.length) {
      navLinks.forEach(function (link, idx) {
        if (idx === 0) link.classList.add('active');
        else link.classList.remove('active');
      });
    }
    if (closeBtn) closeBtn.focus();
  }

  function closePaperModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  openBtns.forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', openPaperModal);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closePaperModal);
  }

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closePaperModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) {
      closePaperModal();
    }
  });

  // 퀵 내비게이션 스크롤 이동
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#') && modalBody) {
        e.preventDefault();
        var targetSec = modal.querySelector(href);
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // 논문 모달 내부 스크롤스파이 (현재 섹션 탭 활성화)
  if (modalBody && navLinks.length) {
    var paperSections = modal.querySelectorAll('.paper-article-section');
    modalBody.addEventListener('scroll', function () {
      var bodyTop = modalBody.getBoundingClientRect().top + 70;
      var currentId = '';

      paperSections.forEach(function (sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top <= bodyTop) {
          currentId = sec.id;
        }
      });

      if (currentId) {
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + currentId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
})();

/* ===========================
   Dynamic Badge Lifecycle (작성일 기준 7일간 동적 배지 관리)
   - 하드코딩 완전 제거: data-created 기준 일주일(7일) 이내 콘텐츠에만 NEW 배지 동적 부여
   - 7일 경과 시 브라우저에서 영구 자동 숨김
   =========================== */
(function initDynamicBadges() {
  var badges = document.querySelectorAll('.dynamic-badge');
  if (!badges.length) return;

  var now = new Date();
  var ACTIVE_DAYS = 7; // 일주일(7일) 이내 등록된 최신 콘텐츠에만 동적 표시

  badges.forEach(function (badge) {
    var dateStr = badge.getAttribute('data-created');
    if (!dateStr) return;

    var createdDate = new Date(dateStr);
    var diffTime = now.getTime() - createdDate.getTime();
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 최근 7일 이내인 경우에만 동적으로 뱃지 표시
    if (diffDays >= 0 && diffDays <= ACTIVE_DAYS) {
      badge.textContent = 'NEW';
      badge.hidden = false;
      badge.title = '등록일: ' + dateStr + ' (신규 ' + diffDays + '일차 · 일주일간 표시)';
    } else {
      // 7일 초과 시 화면에서 영구 자동 숨김
      badge.hidden = true;
      badge.textContent = '';
    }
  });
})();

/* ===========================
   Metrics & Records Dynamic Hybrid Sync
   - Tier 1: data/records.json 비동기 fetch
   - Tier 2: Fetch 실패 시 내장 기본값(Fallback)으로 100% 가동 보장
   - Tier 3: 오늘 날짜(new Date()) 실시간 자동 계산 (멈춘 날짜 방지)
   - Tier 4: 과제 승인 단계(1~13) 동적 렌더링 (12번 승인 시 자동 체크 및 13번 스위칭)
   =========================== */
(function initMetricsDynamicSync() {
  var grid = document.querySelector('.metrics-grid');
  if (!grid) return;

  var DEFAULT_METRICS = {
    lastUpdated: '2026-10-11',
    startDate: '2026-08-11',
    attendance: { days: 39, totalDays: 39, rate: 100, absent: 0, source: '내 출석 기록' },
    ritual: { days: 39, startDate: '2026-08-11', endDate: '2026-10-08', autoExtendToToday: true, source: '리추얼 기록' },
    practice: { successDays: 35, totalDays: 39, rate: 90, quote: '번아웃 이후에도 멈추지 않고 매일 기록한 숫자', source: '리추얼 기록' },
    breathe: { avgMinutes: 3.1, consistency: 98, source: '리추얼 기록' },
    feedback: { count: 55, weeklyAvg: 7.8, source: '리추얼 기록' },
    tasks: { completed: 11, inProgress: 12, total: 13, source: '내 제출 현황' }
  };

  // 오늘 날짜 계산 (MM.DD 형식)
  var today = new Date();
  var todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  var todayDay = String(today.getDate()).padStart(2, '0');
  var todayFormatted = todayMonth + '.' + todayDay;

  function renderMetrics(data) {
    if (!data) data = DEFAULT_METRICS;

    var tasksCompleted = Number(data.tasks.completed) || 11;
    var tasksTotal = Number(data.tasks.total) || 13;
    var tasksInProgress = (tasksCompleted < tasksTotal) ? (tasksCompleted + 1) : tasksTotal;
    var taskPercent = ((tasksCompleted / tasksTotal) * 100).toFixed(1);

    var ritualEndLabel = (data.ritual.autoExtendToToday) ? todayFormatted + ' (현재)' : (data.ritual.endDate || todayFormatted);

    // 13단계 스테퍼 HTML 동적 생성
    var stepperDotsHtml = '';
    for (var i = 1; i <= tasksTotal; i++) {
      if (i <= tasksCompleted) {
        stepperDotsHtml += '<span class="step-dot completed" title="' + i + '번 과제 완료">✓</span>';
      } else if (i === tasksInProgress) {
        stepperDotsHtml += '<span class="step-dot current" title="' + i + '번 과제 진행 중">' + i + '</span>';
      } else {
        stepperDotsHtml += '<span class="step-dot upcoming" title="' + i + '번 과제 대기">' + i + '</span>';
      }
    }

    // 39개 스트릭 도트 생성
    var streakDotsHtml = '';
    var attDays = data.attendance.days || 39;
    for (var d = 0; d < attDays; d++) {
      streakDotsHtml += '<span class="streak-dot active"></span>';
    }

    grid.innerHTML = '' +
      '<!-- 1. 출석률 -->' +
      '<div class="metric-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">' + data.attendance.days + '/' + data.attendance.totalDays + '일</span>' +
      '      <span class="metric-rate">(' + data.attendance.rate + '%)</span>' +
      '    </div>' +
      '    <p class="metric-label">출석률, 결석 ' + data.attendance.absent + '</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="출석률 ' + data.attendance.rate + '% 시각화">' +
      '    <div class="attendance-visual">' +
      '      <div class="circular-chart-box">' +
      '        <svg class="circular-chart" viewBox="0 0 36 36">' +
      '          <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>' +
      '          <path class="circle-fill" stroke-dasharray="' + data.attendance.rate + ', 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>' +
      '        </svg>' +
      '        <div class="circle-inner-icon" aria-hidden="true">' +
      '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">' +
      '            <polyline points="20 6 9 17 4 12"></polyline>' +
      '          </svg>' +
      '        </div>' +
      '      </div>' +
      '      <div class="streak-dots-area" title="' + data.attendance.days + '일 무결석 연속 출석 기록">' +
      '        <div class="streak-grid" aria-hidden="true">' + streakDotsHtml + '</div>' +
      '        <span class="streak-caption">' + data.attendance.days + '일 무결석 완전 연속 달성</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: ' + data.attendance.source + '</span>' +
      '  </div>' +
      '</div>' +

      '<!-- 2. 리추얼 작성 일수 -->' +
      '<div class="metric-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">' + data.ritual.days + '일</span>' +
      '    </div>' +
      '    <p class="metric-label">리추얼 작성 일수 <span class="metric-date-range">(' + data.ritual.startDate + ' ~ ' + todayFormatted + ')</span></p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="리추얼 지속 기간 타임라인">' +
      '    <div class="timeline-bar-chart">' +
      '      <div class="timeline-bar-track">' +
      '        <div class="timeline-bar-fill" style="width: 100%;"></div>' +
      '        <div class="timeline-bar-pointer"></div>' +
      '      </div>' +
      '      <div class="timeline-bar-scale" aria-hidden="true">' +
      '        <span class="scale-label">08.11 (개강)</span>' +
      '        <span class="scale-mid">총 8주간 매일 기록</span>' +
      '        <span class="scale-label">' + ritualEndLabel + '</span>' +
      '      </div>' +
      '      <div class="timeline-week-blocks" aria-hidden="true">' +
      '        <span class="week-pill active">1주</span>' +
      '        <span class="week-pill active">2주</span>' +
      '        <span class="week-pill active">3주</span>' +
      '        <span class="week-pill active">4주</span>' +
      '        <span class="week-pill active">5주</span>' +
      '        <span class="week-pill active">6주</span>' +
      '        <span class="week-pill active">7주</span>' +
      '        <span class="week-pill active">8주</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: ' + data.ritual.source + '</span>' +
      '  </div>' +
      '</div>' +

      '<!-- 3. 강점 행동 실천 비율 -->' +
      '<div class="metric-card highlight-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">' + data.practice.successDays + '/' + data.practice.totalDays + '일</span>' +
      '      <span class="metric-rate">(' + data.practice.rate + '%)</span>' +
      '    </div>' +
      '    <p class="metric-label">강점 행동 "실천했다" 비율</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="강점 행동 실천율 ' + data.practice.rate + '%">' +
      '    <div class="practice-gauge-box">' +
      '      <div class="segmented-bar" aria-hidden="true">' +
      '        <div class="segmented-fill" style="width: ' + data.practice.rate + '%;"></div>' +
      '        <div class="segmented-unfill" style="width: ' + (100 - data.practice.rate) + '%;"></div>' +
      '      </div>' +
      '      <div class="gauge-meta-row">' +
      '        <span class="gauge-tag-success">실천 ' + data.practice.successDays + '일 (' + data.practice.rate + '%)</span>' +
      '        <span class="gauge-tag-rest">재정비 ' + (data.practice.totalDays - data.practice.successDays) + '일</span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="metric-quote-badge">' +
      '      <span class="quote-mark">“</span>' + data.practice.quote + '<span class="quote-mark">”</span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: ' + data.practice.source + '</span>' +
      '  </div>' +
      '</div>' +

      '<!-- 4. 아침 호흡 시간 -->' +
      '<div class="metric-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">평균 ' + data.breathe.avgMinutes + '분</span>' +
      '    </div>' +
      '    <p class="metric-label">매일 아침 호흡 시간</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="아침 호흡 루틴 일자별 파형 그래프">' +
      '    <div class="sparkline-chart-box">' +
      '      <svg class="sparkline-svg" viewBox="0 0 200 44" preserveAspectRatio="none">' +
      '        <defs>' +
      '          <linearGradient id="breatheGrad" x1="0" y1="0" x2="0" y2="1">' +
      '            <stop offset="0%" stop-color="currentColor" stop-opacity="0.18" />' +
      '            <stop offset="100%" stop-color="currentColor" stop-opacity="0.0" />' +
      '          </linearGradient>' +
      '        </defs>' +
      '        <path class="sparkline-area" d="M 0,26 Q 25,20 50,23 T 100,21 T 150,22 T 200,20 L 200,44 L 0,44 Z" />' +
      '        <line x1="0" y1="22" x2="200" y2="22" class="sparkline-guide" stroke-dasharray="3,3" />' +
      '        <path class="sparkline-line" d="M 0,26 Q 25,20 50,23 T 100,21 T 150,22 T 200,20" />' +
      '        <circle cx="50" cy="23" r="2.5" class="sparkline-point" />' +
      '        <circle cx="100" cy="21" r="2.5" class="sparkline-point" />' +
      '        <circle cx="150" cy="22" r="2.5" class="sparkline-point" />' +
      '        <circle cx="200" cy="20" r="3" class="sparkline-point active" />' +
      '      </svg>' +
      '      <div class="sparkline-meta">' +
      '        <span>안정적 호흡 루틴 지속</span>' +
      '        <span class="sparkline-badge">일관도 ' + data.breathe.consistency + '%</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: ' + data.breathe.source + '</span>' +
      '  </div>' +
      '</div>' +

      '<!-- 5. 동료 피드백 교환 횟수 -->' +
      '<div class="metric-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">' + data.feedback.count + '회</span>' +
      '    </div>' +
      '    <p class="metric-label">동료 피드백 교환 횟수</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="주차별 피드백 교환 빈도 막대 그래프">' +
      '    <div class="mini-bar-chart">' +
      '      <div class="bars-container" aria-hidden="true">' +
      '        <div class="bar-col"><span class="bar-fill" style="height: 60%;" title="1주차: 6회"></span><span class="bar-x">W1</span></div>' +
      '        <div class="bar-col"><span class="bar-fill" style="height: 70%;" title="2주차: 7회"></span><span class="bar-x">W2</span></div>' +
      '        <div class="bar-col"><span class="bar-fill" style="height: 90%;" title="3주차: 9회"></span><span class="bar-x">W3</span></div>' +
      '        <div class="bar-col"><span class="bar-fill" style="height: 80%;" title="4주차: 8회"></span><span class="bar-x">W4</span></div>' +
      '        <div class="bar-col"><span class="bar-fill" style="height: 95%;" title="5주차: 9회"></span><span class="bar-x">W5</span></div>' +
      '        <div class="bar-col"><span class="bar-fill" style="height: 80%;" title="6주차: 8회"></span><span class="bar-x">W6</span></div>' +
      '        <div class="bar-col"><span class="bar-fill active" style="height: 85%;" title="7주차+: 8회"></span><span class="bar-x">W7</span></div>' +
      '      </div>' +
      '      <div class="bar-chart-meta">' +
      '        <span>평균 주 ' + data.feedback.weeklyAvg + '회 교환</span>' +
      '        <span class="bar-total-tag">상호 협업</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: ' + data.feedback.source + '</span>' +
      '  </div>' +
      '</div>' +

      '<!-- 6. 핵심 과제 마스터 승인 -->' +
      '<div class="metric-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">' + tasksCompleted + '/' + tasksTotal + '개</span>' +
      '    </div>' +
      '    <p class="metric-label">핵심 과제 마스터 승인 완료 ' + (tasksCompleted < tasksTotal ? '<span class="metric-progress-tag">' + tasksInProgress + '번 진행 중</span>' : '<span class="metric-progress-tag">전체 마스터 완주</span>') + '</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="' + tasksTotal + '개 과제 진행 파이프라인">' +
      '    <div class="stepper-pipeline">' +
      '      <div class="stepper-track" aria-hidden="true">' +
      '        ' + stepperDotsHtml +
      '      </div>' +
      '      <div class="stepper-meta">' +
      '        <span class="stepper-status">마스터 승인율 <strong>' + taskPercent + '%</strong></span>' +
      '        <span class="stepper-badge">' + (tasksCompleted >= 12 ? '최종 완료 임박' : '최종 관문 진입') + '</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: ' + data.tasks.source + '</span>' +
      '  </div>' +
      '</div>';
  }

  // Tier 1 Fetch: data/records.json 로드 시도
  fetch('data/records.json?v=' + Date.now())
    .then(function (res) {
      if (!res.ok) throw new Error('Status ' + res.status);
      return res.json();
    })
    .then(function (jsonData) {
      renderMetrics(jsonData);
    })
    .catch(function () {
      // Tier 2 Fallback: 로컬 file:/// 환경 또는 네트워크 에러 시에도 무조건 정상 작동
      renderMetrics(DEFAULT_METRICS);
    });
})();

/* ===========================
   Floating Back to Top Handler
   =========================== */
(function initBackToTop() {
  var topBtn = document.getElementById('backToTop');
  if (!topBtn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  }, { passive: true });

  topBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();




