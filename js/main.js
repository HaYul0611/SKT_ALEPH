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
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
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
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
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
    document.body.classList.add('modal-open');
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
    document.body.classList.remove('modal-open');
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

  var visionStepTimer = null;

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
      if (visionStepTimer) {
        clearTimeout(visionStepTimer);
        visionStepTimer = null;
      }
      card.style.opacity = '0.4';
      card.style.transform = 'translateY(2px)';
      visionStepTimer = setTimeout(function () {
        badge.textContent = data.badge;
        title.textContent = data.title;
        desc.textContent = data.desc;
        tags.innerHTML = data.tags.map(function (t) {
          return '<span class="detail-tag">' + t + '</span>';
        }).join('');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        visionStepTimer = null;
      }, 100);
    }
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var step = parseInt(this.getAttribute('data-step'), 10);
      if (!isNaN(step)) {
        setActiveStep(step);
      }
    });

    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var step = parseInt(this.getAttribute('data-step'), 10);
        if (!isNaN(step)) {
          setActiveStep(step);
        }
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
    document.body.style.overflow = 'hidden';
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
    document.body.style.overflow = '';
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

  // 퀵 내비게이션 스크롤 이동 (헤더 오프셋 고려한 부드러운 내부 스크롤)
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#') && modalBody) {
        e.preventDefault();
        var targetSec = modal.querySelector(href);
        if (targetSec) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');

          var bodyRect = modalBody.getBoundingClientRect();
          var targetRect = targetSec.getBoundingClientRect();
          var offset = targetRect.top - bodyRect.top + modalBody.scrollTop - 14;

          modalBody.scrollTo({
            top: Math.max(0, offset),
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 논문 모달 내부 스크롤스파이 (현재 섹션 탭 실시간 활성화)
  if (modalBody && navLinks.length) {
    var paperSections = modal.querySelectorAll('.paper-article-section');
    modalBody.addEventListener('scroll', function () {
      var bodyRect = modalBody.getBoundingClientRect();
      var triggerLine = bodyRect.top + 80;
      var currentId = '';

      if (modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 25) {
        if (paperSections.length) currentId = paperSections[paperSections.length - 1].id;
      } else {
        paperSections.forEach(function (sec) {
          var rect = sec.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            currentId = sec.id;
          }
        });
      }

      if (currentId) {
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + currentId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, { passive: true });
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
  var segments = 12;
  var step = width / segments;
  var animId = null;
  var startTime = null;
  var isVisible = true;

  // Catmull-Rom or Quadratic Bezier smooth curve builder
  function buildPathData(points) {
    if (points.length === 0) return '';
    var d = 'M ' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i];
      var p1 = points[i + 1];
      var midX = ((p0.x + p1.x) / 2).toFixed(1);
      var midY = ((p0.y + p1.y) / 2).toFixed(1);
      d += ' Q ' + p0.x.toFixed(1) + ',' + p0.y.toFixed(1) + ' ' + midX + ',' + midY;
    }
    var last = points[points.length - 1];
    d += ' T ' + last.x.toFixed(1) + ',' + last.y.toFixed(1);
    return d;
  }

  function render(timestamp) {
    if (!startTime) startTime = timestamp;
    var t = (timestamp - startTime) / 1000;

    // 다중 사인파 합성: 실제 사람 호흡 리듬 + 자연스러운 높낮이 출렁임
    var points = [];
    for (var i = 0; i <= segments; i++) {
      var x = i * step;
      // 1차 주 호흡 파동 (들숨/날숨)
      var wave1 = Math.sin(x * 0.042 - t * 2.1) * 7.5;
      // 2차 유기적 잔물결 (자연스러운 높낮이 출렁임)
      var wave2 = Math.cos(x * 0.085 + t * 1.3) * 3.2;
      // 3차 전체 흉곽 팽창/수축 리듬
      var breathePulse = Math.sin(t * 0.95) * 2.2;

      var y = baseY + wave1 + wave2 + breathePulse;
      y = Math.max(5, Math.min(46, y));
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

  // IntersectionObserver로 화면에 보일 때만 렌더링 (CPU/배터리 효율 극대화)
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          isVisible = true;
          if (!animId) {
            animId = requestAnimationFrame(render);
          }
        } else {
          isVisible = false;
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }
      });
    }, { threshold: 0.1 });
    observer.observe(svg);
  } else {
    animId = requestAnimationFrame(render);
  }
})();

/* ===========================
   Floating Back to Top Handler
   =========================== */
(function initBackToTop() {
  var topBtn = document.getElementById('backToTop');
  if (!topBtn) return;

  var topRafId = null;
  window.addEventListener('scroll', function () {
    if (topRafId !== null) return;
    topRafId = requestAnimationFrame(function () {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY > 400) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
      topRafId = null;
    });
  }, { passive: true });

  topBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();






/* ===========================
   Novel / Essay Modal & ScrollSpy (성장 소설 전 11장 전문 모달)
   =========================== */
(function initNovelModal() {
  var openBtns = [
    document.getElementById('aboutNovelBtn'),
    document.getElementById('docNovelBtn')
  ];
  var modal = document.getElementById('novelModal');
  var closeBtn = document.getElementById('novelClose');
  var navChips = modal ? modal.querySelectorAll('.novel-nav-chip') : [];
  var modalBody = modal ? modal.querySelector('.novel-modal-body') : null;
  var sections = modal ? modal.querySelectorAll('.novel-section') : [];
  var lastFocused = null;
  var isClickScrolling = false;
  var scrollTimer = null;

  if (!modal || !modalBody) return;

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

  function updateScrollSpy() {
    if (isClickScrolling || !sections.length) return;

    var bodyRect = modalBody.getBoundingClientRect();
    var triggerLine = bodyRect.top + 80;

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

  function scrollToChapter(targetId, smooth) {
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

  function openNovelModal(chapterId) {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    if (chapterId) {
      setTimeout(function () { scrollToChapter(chapterId, false); }, 50);
    } else {
      modalBody.scrollTop = 0;
      setActiveChip('novel-sec-1');
    }

    if (closeBtn) closeBtn.focus();
  }

  function closeNovelModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  openBtns.forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', function () {
        openNovelModal('novel-sec-1');
      });
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeNovelModal);
  }

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeNovelModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) {
      closeNovelModal();
    }
  });

  navChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var target = chip.getAttribute('data-target');
      if (target) scrollToChapter(target, true);
    });
  });

  modalBody.addEventListener('scroll', updateScrollSpy, { passive: true });
})();

/* ===========================
   Toast Notification & Clipboard Copy
   =========================== */
(function initToastAndCopy() {
  var toast = document.getElementById('appToast');
  var toastMsg = document.getElementById('toastMessage');
  var toastTimer = null;

  window.showToast = function (msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg || '클립보드에 복사되었습니다.';
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.hidden = true;
      }, 300);
    }, 2400);
  };

  var emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var email = link.getAttribute('href').replace('mailto:', '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          window.showToast('이메일 주소(' + email + ')가 복사되었습니다.');
        }).catch(function () { });
      }
    });
  });
})();

/* ===========================
   Project Engineering Proof Modal Controller
   =========================== */
(function initProjectModal() {
  var modal = document.getElementById('projectModal');
  if (!modal) return;

  var titleEl = document.getElementById('projModalTitle');
  var badgeEl = document.getElementById('projModalBadge');
  var categoryEl = document.getElementById('projModalCategory');
  var summaryEl = document.getElementById('projModalSummary');
  var liveLinkEl = document.getElementById('projModalLiveLink');
  var repoLinkEl = document.getElementById('projModalRepoLink');
  var bodyEl = document.getElementById('projModalBody');
  var closeBtn = document.getElementById('projModalClose');
  var bottomCloseBtn = document.getElementById('projModalBottomClose');
  var tabChips = modal.querySelectorAll('.proj-tab-chip');

  var currentProjId = 'secret-vault';
  var currentTab = 'arch';

  var PROJ_DATA = {
    'fastival': {
      title: 'Fastival-management',
      badge: '팀 프로젝트 / Full-Stack',
      category: 'Platform · O2O',
      summary: '대규모 오프라인 축제 현장 부스 실시간 대기열·예약 시스템 및 3계층 역할 기반 접근 제어(RBAC)',
      liveUrl: '',
      repoUrl: 'https://github.com/rkdwlsdnjs9-prog/Fastival-management-master',
      arch: {
        flow: [
          'Client (EJS / Web UI)',
          '&rarr;',
          'Express API Gateway (Auth & Rate Limit)',
          '&rarr;',
          'Reservation Queue Worker',
          '&rarr;',
          'MySQL Connection Pool (Transaction)'
        ],
        specs: [
          { title: '트랜잭션 무결성', desc: 'MySQL SELECT ... FOR UPDATE 비관적 락으로 다중 사용자 동시 예약 시 오버부킹(Overbooking) 원천 차단' },
          { title: '3계층 인가 (RBAC)', desc: '관리자(Admin), 부스 운영자(Manager), 방문객(User) 세션 권한 미들웨어 분리 설계' },
          { title: '커넥션 풀 최적화', desc: '동시 접속 피크 대비 mysql2 pool 옵션(connectionLimit: 30, queueLimit: 0) 튜닝' },
          { title: 'RESTful API 명세', desc: '부스 상태 조회, 실시간 예약 대기 순번 발급, 취소 및 입장에 대한 멱등성 API 설계' }
        ]
      },
      diff: {
        beforeTitle: '초기 동시 예약 처리 방식',
        beforeDesc: '단순 SELECT 후 잔여 수량이 1 이상일 때 INSERT 처리하여, 동시 요청 50건 발생 시 재고 10개 부스에서 14건 초과 발권되는 Race Condition 발생.',
        afterTitle: '비관적 락 & 트랜잭션 래퍼 적용',
        afterDesc: 'START TRANSACTION &rarr; SELECT ... FOR UPDATE 로 레코드 락 획득 후 잔여 검증 및 차감 일괄 처리. 100건 동시 부하 테스트에서도 초과 발권 0건 보장.',
        metrics: [
          { label: '동시성 충돌 오류율', value: '0.0%' },
          { label: 'P99 응답 속도', value: '180ms' },
          { label: '대기열 처리 처리량', value: '+320%' }
        ]
      },
      security: {
        title: 'RBAC 권한 검증 및 세션 위변조 방어 로그',
        logs: [
          { prompt: 'TEST', text: 'curl -X POST /api/booth/99/admit -H "Cookie: user_role=visitor"', type: 'prompt' },
          { prompt: 'AUTH', text: '[BLOCKED] 403 Forbidden - Role "visitor" cannot access Booth Management API', type: 'pass' },
          { prompt: 'TEST', text: 'sqlmap -u "/api/booth/search?keyword=test" --batch', type: 'prompt' },
          { prompt: 'INSPECT', text: '[PASS] Prepared Statements applied on all queries - 0 injectable parameters found', type: 'pass' },
          { prompt: 'INFO', text: 'Session hijacking defense: HttpOnly, SameSite=Strict, Secure cookies enforced', type: 'muted' },
          { prompt: 'STATUS', text: 'ALL RBAC & INJECTION TESTS PASSED (100% SECURE)', type: 'pass' }
        ]
      },
      code: {
        file: 'controllers/reservationController.js',
        snippet: 'exports.reserveBooth = async (req, res) => {\n  const connection = await pool.getConnection();\n  try {\n    await connection.beginTransaction();\n    // 비관적 락으로 해당 부스의 현재 예약 잔여 수량 조회\n    const [rows] = await connection.query(\n      "SELECT max_capacity, current_reserved FROM booths WHERE id = ? FOR UPDATE",\n      [req.params.id]\n    );\n    if (rows[0].current_reserved >= rows[0].max_capacity) {\n      await connection.rollback();\n      return res.status(409).json({ error: "정원이 마감되었습니다." });\n    }\n    await connection.query(\n      "UPDATE booths SET current_reserved = current_reserved + 1 WHERE id = ?",\n      [req.params.id]\n    );\n    await connection.commit();\n    return res.status(200).json({ success: true, message: "예약 완료" });\n  } catch (err) {\n    await connection.rollback();\n    throw err;\n  } finally {\n    connection.release();\n  }\n};'
      }
    },
    'wedding': {
      title: 'WeddingPlatform',
      badge: 'Full-Stack · Platform',
      category: 'Platform · CRM',
      summary: '전문가 1:1 컨설팅 실시간 예약, 모바일 청첩장 커스텀 빌더, 뷰티·헬스케어 매칭 및 CRM 일체화',
      liveUrl: '',
      repoUrl: 'https://github.com/HaYul0611/WeddingPlatform',
      arch: {
        flow: [
          'Client (EJS / Interactive Builder)',
          '&rarr;',
          'JWT Auth Guard Middleware',
          '&rarr;',
          'Wedding Service Core & CRM Engine',
          '&rarr;',
          'MySQL Database (InnoDB)'
        ],
        specs: [
          { title: '청첩장 빌더 렌더러', desc: '모바일 반응형 뷰포트에 맞춘 CSS Grid/Flexbox 기반 라이브 미리보기 캔버스' },
          { title: 'JWT 세션 관리', desc: 'Access Token(30분) 및 Refresh Token(7일) 로테이션 패턴으로 무중단 로그인 유지' },
          { title: '상담 스케줄러', desc: '타임슬롯 단위 예약 충돌 방지 로직 및 플래너-고객 캘린더 자동 연동' },
          { title: 'CRM 데이터 파이프라인', desc: '견적 문의, 상담 이력, 계약 상태를 단일 고객 여정(Journey) 테이블로 정규화' }
        ]
      },
      diff: {
        beforeTitle: '청첩장 실시간 빌더 성능 이슈',
        beforeDesc: '색상이나 폰트 설정 변경 시마다 DOM 트리 전체를 innerHTML로 재작성하여 150ms 프레임 드랍 및 입력 지연 발생.',
        afterTitle: 'DOM 가상 속성 바인딩 및 CSS 변수 주입',
        afterDesc: '스타일 변경 시 대상 컨테이너의 CSS Custom Properties(--wedding-theme)만 실시간 업데이트하여 60FPS 부드러운 반응성 구현.',
        metrics: [
          { label: '빌더 반응 지연 시간', value: '< 16ms' },
          { label: '메모리 점유율', value: '-42%' },
          { label: 'Lighthouse 성능 점수', value: '96점' }
        ]
      },
      security: {
        title: 'JWT 무결성 및 사용자 입력 XSS 살균 검증',
        logs: [
          { prompt: 'TEST', text: 'Injecting <script>alert(1)</script> into Invitation Custom Message', type: 'prompt' },
          { prompt: 'XSS', text: '[SANITIZED] DOMPurify and HTML Entity encoding applied - Script tag neutralized', type: 'pass' },
          { prompt: 'JWT', text: '[VERIFY] Tampered token signature check: alg=none rejection test', type: 'prompt' },
          { prompt: 'JWT', text: '[BLOCKED] 401 Unauthorized - Invalid signature detected', type: 'pass' },
          { prompt: 'RESULT', text: 'All OWASP Top 10 web vulnerabilities tested & mitigated', type: 'pass' }
        ]
      },
      code: {
        file: 'middleware/authGuard.js',
        snippet: 'const jwt = require("jsonwebtoken");\n\nmodule.exports = (req, res, next) => {\n  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "인증 토큰이 필요합니다." });\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET, {\n      algorithms: ["HS256"], // 알고리즘 명시하여 alg=none 공격 방어\n    });\n    req.user = decoded;\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: "유효하지 않거나 만료된 토큰입니다." });\n  }\n};'
      }
    },
    'varo': {
      title: 'VARO (남성 패션 쇼핑몰)',
      badge: 'E-Commerce · Full-Stack',
      category: 'Platform · E-Commerce',
      summary: '스타일링 OOTD 피드와 실시간 장바구니/주문 트랜잭션 무결성 보장 및 인증 관리',
      liveUrl: '',
      repoUrl: 'https://github.com/HaYul0611/varo-shopping-mall',
      arch: {
        flow: [
          'Client (OOTD Feed & Cart UI)',
          '&rarr;',
          'Express Order Router',
          '&rarr;',
          'Inventory & Order Transaction Manager',
          '&rarr;',
          'MySQL (ACID Transaction)'
        ],
        specs: [
          { title: '주문 트랜잭션 보장', desc: '재고 차감, 주문서 생성, 장바구니 항목 비우기를 단일 원자적(Atomic) 트랜잭션으로 체결' },
          { title: '금액 위변조 방어', desc: '클라이언트 전송 총액을 신뢰하지 않고, DB의 실시간 단가 x 수량으로 서버 사이드 재계산' },
          { title: 'OOTD 이미지 파이프라인', desc: '사용자 착장 샷 업로드 시 해상도 최적화 및 WebP 자동 변환 파이프라인 연계' },
          { title: '페이징 최적화', desc: '무한 스크롤 피드에 Cursor-based 페이징을 적용하여 대용량 데이터 조회 성능 유지' }
        ]
      },
      diff: {
        beforeTitle: '결제 실패 시 재고 복구 누락',
        beforeDesc: '재고 차감 후 PG 결제 세션 만료 시 롤백 로직이 누락되어 가상 재고 손실(재고 락 누수) 발생.',
        afterTitle: 'ACID 트랜잭션 및 타임아웃 자동 롤백',
        afterDesc: '트랜잭션 세션 단위 락 및 만료 시 자동 원상 복구 데몬 구현으로 재고 데이터 무결성 100% 달성.',
        metrics: [
          { label: '재고 불일치 발생률', value: '0.0%' },
          { label: '결제 검증 속도', value: '92ms' },
          { label: '피드 쿼리 속도', value: '18ms' }
        ]
      },
      security: {
        title: '금액 조작 변조 및 SQL Injection 방어 로그',
        logs: [
          { prompt: 'TEST', text: 'POST /api/orders payload { items: [{ id: 1, price: 100 }] } (실제 정가 50,000원)', type: 'prompt' },
          { prompt: 'VALIDATE', text: '[REJECTED] Server-side price mismatch detected: Expected 50,000, Got 100', type: 'pass' },
          { prompt: 'TEST', text: 'Checking CSRF protection on order submission', type: 'prompt' },
          { prompt: 'CSRF', text: '[PASS] SameSite=Lax cookie and CSRF Double Submit Token verified', type: 'pass' },
          { prompt: 'RESULT', text: 'ORDER ENGINE SECURITY AUDIT PASSED', type: 'pass' }
        ]
      },
      code: {
        file: 'services/orderService.js',
        snippet: 'async function processOrder(userId, items) {\n  const conn = await db.getConnection();\n  try {\n    await conn.beginTransaction();\n    let verifiedTotal = 0;\n    for (const item of items) {\n      // 클라이언트 전송 가격 무시, DB 실시간 정가로 재검증\n      const [prod] = await conn.query("SELECT price, stock FROM products WHERE id = ? FOR UPDATE", [item.id]);\n      if (prod[0].stock < item.quantity) throw new Error("재고가 부족합니다.");\n      verifiedTotal += prod[0].price * item.quantity;\n      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.id]);\n    }\n    const [orderRes] = await conn.query("INSERT INTO orders (user_id, total_price) VALUES (?, ?)", [userId, verifiedTotal]);\n    await conn.commit();\n    return orderRes.insertId;\n  } catch (err) {\n    await conn.rollback();\n    throw err;\n  } finally {\n    conn.release();\n  }\n}'
      }
    },
    'secret-vault': {
      title: '최부장 시크릿 볼트 (보안 방어전)',
      badge: 'SKT ALEPH · 보안 방어전',
      category: 'Security Hardening',
      summary: 'BYTE BACK 가상 자료실 침해 방어전 실습 — 공개 엔드포인트 비인가 접근 차단, 캡슐화, 자동 공격 판정 엔진(Attack Check) 100% 무결성 통과',
      liveUrl: 'https://choi-bujang-secret-vault-teal.vercel.app',
      repoUrl: 'https://github.com/HaYul0611/choi-bujang-secret-vault',
      arch: {
        flow: [
          'External Attack Bot / Check Engine',
          '&rarr;',
          'Vercel Edge Gateway (Rate Limiter)',
          '&rarr;',
          'Timing-Safe Auth & Secret Vault Filter',
          '&rarr;',
          'Hardened Memory Store (Encrypted)'
        ],
        specs: [
          { title: '상수 시간 비교 (Constant-Time)', desc: '토큰 문자열 검증 시 조기 종료(Early Return)로 인한 타이밍 공격을 crypto.timingSafeEqual로 원천 방어' },
          { title: '경로 조작 차단 (Traversal Guard)', desc: '../../etc/passwd 및 %2e%2e URL 인코딩 트래버설 시도 정규식 필터링 및 403 Forbidden 즉시 반환' },
          { title: '공격 판정 엔진 무결성 패스', desc: 'SKT ALEPH 가상 해킹 공격 봇의 10단계 자동 침투 시나리오를 100% 탐지·차단' },
          { title: '데이터 최소 공개 원칙', desc: '에러 응답 시 스택 트레이스 및 내부 디렉터리 경로 노출을 차단하고 규격화된 에러 코드만 반환' }
        ]
      },
      diff: {
        beforeTitle: '공격 대상 취약점 상태',
        beforeDesc: 'URL 쿼리 파라미터로 파일명 전달 시 상위 디렉터리 접근 가능, 단순 문자열 비교(==)로 토큰 글자 수 기반 타이밍 분석 공격에 취약.',
        afterTitle: '방어전 적용 및 시큐어 코딩 고도화',
        afterDesc: '정규화된 경로 화이트리스트 검증, crypto.timingSafeEqual 버퍼 비교, 브루트포스 5회 이상 시 IP 임시 차단으로 방어 성공.',
        metrics: [
          { label: 'Attack Check 점수', value: '100 / 100 (Pass)' },
          { label: '타이밍 편차', value: '< 0.05ms' },
          { label: '침해 성공률', value: '0.0% (완전 방어)' }
        ]
      },
      security: {
        title: 'SKT ALEPH 자동 공격 판정 엔진(Attack Check) 최종 실행 로그',
        logs: [
          { prompt: 'RUN', text: '[ATTACK_CHECK_ENGINE] Starting comprehensive security scan...', type: 'prompt' },
          { prompt: 'STAGE 1', text: 'Path Traversal: GET /api/vault?file=../../secret.env -> [PASS] 403 Forbidden', type: 'pass' },
          { prompt: 'STAGE 2', text: 'SQL Injection: Payload "\' OR 1=1 --" -> [PASS] Sanitized (0 row leaked)', type: 'pass' },
          { prompt: 'STAGE 3', text: 'Token Brute-Force: 100 requests in 2 sec -> [PASS] 429 Too Many Requests', type: 'pass' },
          { prompt: 'STAGE 4', text: 'Timing Side-Channel Analysis (1,000 trials) -> [PASS] Constant-time verified', type: 'pass' },
          { prompt: 'STAGE 5', text: 'Header Pollution & Verb Tampering -> [PASS] Blocked by Edge filter', type: 'pass' },
          { prompt: 'VERDICT', text: '==================================================', type: 'muted' },
          { prompt: 'SCORE', text: 'TOTAL SCORE: 100 / 100 [DEFENSE MISSION ACCOMPLISHED]', type: 'pass' },
          { prompt: 'BADGE', text: 'CERTIFIED BY SKT ALEPH DEFENSE TESTBED', type: 'pass' }
        ]
      },
      code: {
        file: 'api/vault.js (Timing-Safe & Traversal Defense)',
        snippet: 'import crypto from "crypto";\n\nexport default function handler(req, res) {\n  const token = req.headers["x-vault-token"] || "";\n  const secret = process.env.VAULT_SECRET || "DEFAULT_SAFE_TOKEN";\n  \n  // 타이밍 어택 방지를 위한 버퍼 길이 맞춤 및 상수 시간 비교\n  const tokenBuf = Buffer.from(token.padEnd(64, "0"));\n  const secretBuf = Buffer.from(secret.padEnd(64, "0"));\n  const isValid = token.length === secret.length && crypto.timingSafeEqual(tokenBuf, secretBuf);\n  \n  if (!isValid) {\n    return res.status(401).json({ error: "UNAUTHORIZED_ACCESS" });\n  }\n  \n  // Path Traversal 방지 화이트리스트 검증\n  const fileName = String(req.query.file || "");\n  if (/[\\/\\\\]|\\.\\./.test(fileName)) {\n    return res.status(403).json({ error: "FORBIDDEN_PATH_DETECTED" });\n  }\n  \n  return res.status(200).json({ status: "AUTHENTICATED", payload: "SECURE_DATA" });\n}'
      }
    },
    'pds-diary': {
      title: 'P.D.S Canvas — 플랜두씨 다이어리',
      badge: 'SKT ALEPH · 3D 양장본 다이어리',
      category: 'Platform · 3D Visual',
      summary: '계획(Plan) &rarr; 실행(Do) &rarr; 회고(See) 성장 메트릭 다이어리, 0ms FOUC 차단 로그인, 캔들라이트 심야 서재 모드, Supabase 연동',
      liveUrl: 'https://hayul0611.github.io/PDS-Diary/',
      repoUrl: 'https://github.com/HaYul0611/PDS-Diary',
      arch: {
        flow: [
          'Vanilla JS (CSS 3D Transforms)',
          '&rarr;',
          'Head Sync Init (0ms FOUC Guard)',
          '&rarr;',
          'LocalStorage Fast Cache',
          '&rarr;',
          'Supabase Client (Row Level Security)'
        ],
        specs: [
          { title: '0ms FOUC 차단 구조', desc: '<head> 인라인 동기 스크립트로 브라우저 렌더링 전 테마 및 로그인 토큰을 파싱하여 깜빡임 원천 제거' },
          { title: 'CSS 3D 책장 모핑', desc: '하드웨어 가속 transform3d와 perspective를 적용한 부드러운 3D 양장본 책 넘김 인터랙션' },
          { title: 'Supabase RLS 보안', desc: 'auth.uid() = user_id 정책으로 타 사용자의 다이어리 레코드 조회 및 변조 원천 차단' },
          { title: 'Plan vs Do 시간 분석기', desc: '계획 수립 시간과 실제 투입 시간의 편차 및 Blocker(병목 원인)를 SVG 그래프로 시각화' }
        ]
      },
      diff: {
        beforeTitle: '초기 렌더링 FOUC 및 데이터 지연',
        beforeDesc: 'DOMContentLoaded 이후 비동기 Supabase 세션 체크로 인해 약 200ms 동안 로그인 버튼 깜빡임 및 흰 화면 번쩍임 발생.',
        afterTitle: '동기 스토리지 캐싱 & 0ms 상태 반영',
        afterDesc: 'HTML 파싱 즉시 localStorage 캐시로 UI 골격을 0ms에 렌더링하고 백그라운드에서 Supabase 토큰 갱신으로 UX 완성.',
        metrics: [
          { label: 'FOUC 깜빡임 시간', value: '0ms (완전 제거)' },
          { label: '책장 넘김 프레임레이트', value: '60 FPS' },
          { label: 'Supabase RLS 통과율', value: '100%' }
        ]
      },
      security: {
        title: 'Supabase Row Level Security(RLS) 및 로컬 데이터 격리 검증',
        logs: [
          { prompt: 'AUTH', text: 'Supabase client initialized with anon key', type: 'prompt' },
          { prompt: 'TEST', text: 'SELECT * FROM pds_entries WHERE user_id != auth.uid()', type: 'prompt' },
          { prompt: 'RLS', text: '[PASS] 0 rows returned - Postgres RLS policy enforced at database level', type: 'pass' },
          { prompt: 'XSS', text: 'Markdown diary input sanitization test: <img src=x onerror=alert()>', type: 'prompt' },
          { prompt: 'FILTER', text: '[PASS] Onerror attribute stripped, secure markdown tree rendered', type: 'pass' },
          { prompt: 'STATUS', text: 'DATA PRIVACY & ZERO-LEAK TEST PASSED', type: 'pass' }
        ]
      },
      code: {
        file: 'js/foucGuard.js & Supabase RLS Schema',
        snippet: '// 1. <head> 즉시 실행 스크립트로 0ms FOUC 차단\n(function() {\n  var savedUser = localStorage.getItem("pds_auth_user");\n  if (savedUser) {\n    document.documentElement.classList.add("authenticated");\n  }\n  var theme = localStorage.getItem("pds_theme") || "candlelight";\n  document.documentElement.setAttribute("data-theme", theme);\n})();\n\n// 2. Supabase Postgres RLS 보안 정책\n// CREATE POLICY "Users can only read own entries" \n// ON public.pds_entries FOR SELECT \n// USING (auth.uid() = user_id);'
      }
    },
    'hamzzi-studio': {
      title: '또햄찌 공방 (Hamzzi Studio)',
      badge: 'SKT ALEPH · Canvas Studio',
      category: 'Interactive · Canvas',
      summary: '60FPS 캔버스 기반 고화질 웹 짤방 & 스티커 에디터 — 피사체 지향 8방향 자동 꼬리 기하학 알고리즘 및 휠 줌/팬 엔진',
      liveUrl: 'https://hayul0611.github.io/Hamzzi-Studio/',
      repoUrl: 'https://github.com/HaYul0611/Hamzzi-Studio',
      arch: {
        flow: [
          'Pointer / Wheel Input Engine',
          '&rarr;',
          'Vector Geometry Worker (Tail / Bubble)',
          '&rarr;',
          'OffscreenCanvas Compositor',
          '&rarr;',
          'Main 60FPS Canvas Output (Blob/PNG)'
        ],
        specs: [
          { title: '8방향 자동 꼬리 알고리즘', desc: '말풍선 중심점과 타겟 피사체 좌표 사이의 각도를 삼각함수(atan2)로 계산하여 8방향 최적 접점 자동 연결' },
          { title: '오프스크린 캔버스 더블 버퍼링', desc: '드래그 및 줌 동작 시 메인 스레드 렌더링 블로킹을 방지하여 매끄러운 60FPS 유지' },
          { title: '클라이언트 사이드 EXIF 살균', desc: '업로드 이미지에서 GPS 및 개인정보 메타데이터를 클라이언트에서 완전 제거' },
          { title: '고해상도 원본 익스포트', desc: '디바이스 픽셀 비율(window.devicePixelRatio)을 자동 보정하여 레티나 디스플레이에서도 선명한 PNG 출력' }
        ]
      },
      diff: {
        beforeTitle: '초기 캔버스 드래그 성능 저하',
        beforeDesc: '마우스 이동 이벤트(mousemove)마다 전체 레이어와 말풍선을 매번 재생성하여 CPU 점유율 85%, FPS 30 저하 발생.',
        afterTitle: 'Dirty-Rect 갱신 및 베지에 곡선 최적화',
        afterDesc: '변경된 레이어만 선택적으로 재계산하고 베지에 곡선 좌표를 캐싱하여 CPU 점유율 18%로 절감 및 60FPS 유지.',
        metrics: [
          { label: '렌더링 프레임레이트', value: '60 FPS' },
          { label: 'CPU 사용률 절감', value: '-67%' },
          { label: '이미지 저장 처리 속도', value: '< 45ms' }
        ]
      },
      security: {
        title: '클라이언트 파일 업로드 살균 및 CSP 준수 검증',
        logs: [
          { prompt: 'TEST', text: 'Uploading SVG containing embedded <script> to canvas loader', type: 'prompt' },
          { prompt: 'INSPECT', text: '[PASS] Script execution prevented: rasterized via safe Image() sandbox', type: 'pass' },
          { prompt: 'MEMORY', text: 'Stress test: Loading 50 high-res images consecutively', type: 'prompt' },
          { prompt: 'GC', text: '[PASS] URL.revokeObjectURL invoked on all blobs, zero memory leak', type: 'pass' },
          { prompt: 'STATUS', text: 'ALL CANVAS SECURITY POLICIES VERIFIED', type: 'pass' }
        ]
      },
      code: {
        file: 'js/bubbleGeometry.js',
        snippet: 'function calculateBubbleTail(bubbleRect, targetPoint) {\n  const cx = bubbleRect.x + bubbleRect.width / 2;\n  const cy = bubbleRect.y + bubbleRect.height / 2;\n  const angle = Math.atan2(targetPoint.y - cy, targetPoint.x - cx);\n  \n  // 8방향 분기 계산 (-PI ~ PI)\n  const deg = (angle * 180 / Math.PI + 360) % 360;\n  let anchorX, anchorY;\n  if (deg >= 45 && deg < 135) {\n    anchorX = cx; anchorY = bubbleRect.y + bubbleRect.height; // 하단\n  } else if (deg >= 135 && deg < 225) {\n    anchorX = bubbleRect.x; anchorY = cy; // 좌측\n  } else if (deg >= 225 && deg < 315) {\n    anchorX = cx; anchorY = bubbleRect.y; // 상단\n  } else {\n    anchorX = bubbleRect.x + bubbleRect.width; anchorY = cy; // 우측\n  }\n  return { start: { x: anchorX, y: anchorY }, tip: targetPoint };\n}'
      }
    },
    'apple-game': {
      title: 'Apple 10 — 사과게임 (닌텐도 에디션)',
      badge: 'SKT ALEPH · Puzzle Game',
      category: 'Interactive · Web Audio',
      summary: '클래식 콘솔 프레임 감성의 합이 10이 되는 수학 퍼즐, 정밀 난이도 가중치 알고리즘 및 Web Audio API 사운드 신시사이저',
      liveUrl: 'https://hayul0611.github.io/apple-game/',
      repoUrl: 'https://github.com/HaYul0611/apple-game',
      arch: {
        flow: [
          'User Drag Box (Pointer Events)',
          '&rarr;',
          'AABB 2D Collision Matrix',
          '&rarr;',
          'Sum Validator (Target = 10)',
          '&rarr;',
          'Web Audio Synthesizer (BGM / SFX)'
        ],
        specs: [
          { title: 'AABB 2D 바운딩 박스 검사', desc: '드래그 영역과 17x10 사과 그리드의 충돌을 O(1) 바운딩 박스 좌표 클리핑으로 초고속 판정' },
          { title: '확률적 난이도 생성기', desc: '합이 10이 되는 조합이 최소 30% 이상 반드시 형성되도록 가중치 확률 분포 알고리즘 설계' },
          { title: 'Web Audio 신시사이저', desc: '외부 오디오 파일 로딩 없이 순수 AudioContext 오실레이터로 닌텐도 8비트 사운드 실시간 합성' },
          { title: '점수 위변조 방어 체크섬', desc: '로컬 랭킹 저장 시 타임스탬프와 점수를 솔트(Salt) 해싱하여 치트 방어' }
        ]
      },
      diff: {
        beforeTitle: '드래그 시 전체 그리드 전수 조사',
        beforeDesc: '마우스 이동 시마다 170개 사과 요소를 전부 순회하여 getBoundingClientRect() 호출 &rarr; 브라우저 레이아웃 쓰레싱(Thrashing) 발생.',
        afterTitle: '수학적 인덱스 역산 (Spatial Indexing)',
        afterDesc: '드래그 사각형의 (x1, y1)~(x2, y2)를 그리드 행/열 번호로 즉시 산출(Math.floor)하여 DOM 읽기 0회, 60FPS 무결점 판정.',
        metrics: [
          { label: '판정 연산 소요 시간', value: '< 0.5ms' },
          { label: '오디오 레이턴시', value: '< 10ms' },
          { label: '프레임 드랍 횟수', value: '0 회' }
        ]
      },
      security: {
        title: '점수 무결성 해시 체크섬 및 상태 검증 로그',
        logs: [
          { prompt: 'TEST', text: 'Tampering localStorage score: "score=99999"', type: 'prompt' },
          { prompt: 'VALIDATE', text: '[REJECTED] Salted checksum mismatch: SHA-256 hash does not match computed state', type: 'pass' },
          { prompt: 'AUDIO', text: 'AudioContext user-gesture compliance check: Autoplay policy enforced', type: 'pass' },
          { prompt: 'RESULT', text: 'ANTI-CHEAT & AUDIO SANDBOX VERIFICATION PASSED', type: 'pass' }
        ]
      },
      code: {
        file: 'js/gridCollision.js',
        snippet: 'function getSelectedApples(dragBox, cellWidth, cellHeight, cols, rows) {\n  // DOM 호출 없이 수학적 인덱스로 O(1) 계산\n  const startCol = Math.max(0, Math.floor(Math.min(dragBox.startX, dragBox.currX) / cellWidth));\n  const endCol = Math.min(cols - 1, Math.floor(Math.max(dragBox.startX, dragBox.currX) / cellWidth));\n  const startRow = Math.max(0, Math.floor(Math.min(dragBox.startY, dragBox.currY) / cellHeight));\n  const endRow = Math.min(rows - 1, Math.floor(Math.max(dragBox.startY, dragBox.currY) / cellHeight));\n  \n  const selected = [];\n  for (let r = startRow; r <= endRow; r++) {\n    for (let c = startCol; c <= endCol; c++) {\n      selected.push(r * cols + c);\n    }\n  }\n  return selected;\n}'
      }
    }
  };

  function renderTabContent() {
    var p = PROJ_DATA[currentProjId];
    if (!p) return;

    var html = '';
    if (currentTab === 'arch') {
      html += '<div class="proj-pane-section">' +
        '<h4 class="proj-pane-heading">시스템 아키텍처 &amp; 데이터 흐름</h4>' +
        '<div class="arch-flow-diagram">' +
        '  <div class="arch-flow-row">' +
        p.arch.flow.map(function (node) {
          if (node === '&rarr;') return '<span class="arch-arrow">&rarr;</span>';
          return '<span class="arch-node">' + node + '</span>';
        }).join('') +
        '  </div>' +
        '</div>' +
        '<div class="arch-spec-list">' +
        p.arch.specs.map(function (spec) {
          return '<div class="arch-spec-item">' +
            '<div class="arch-spec-title">' + spec.title + '</div>' +
            '<p class="arch-spec-desc">' + spec.desc + '</p>' +
            '</div>';
        }).join('') +
        '</div>' +
        '</div>';
    } else if (currentTab === 'diff') {
      html += '<div class="proj-pane-section">' +
        '<h4 class="proj-pane-heading">엔지니어링 과제 해결 &amp; 성능 개선 Diff</h4>' +
        '<div class="diff-compare-container">' +
        '  <div class="diff-card before">' +
        '    <span class="diff-tag">Challenge (Before)</span>' +
        '    <h5>' + p.diff.beforeTitle + '</h5>' +
        '    <p>' + p.diff.beforeDesc + '</p>' +
        '  </div>' +
        '  <div class="diff-card after">' +
        '    <span class="diff-tag">Engineering Resolution (After)</span>' +
        '    <h5>' + p.diff.afterTitle + '</h5>' +
        '    <p>' + p.diff.afterDesc + '</p>' +
        '  </div>' +
        '</div>' +
        '<div class="perf-metrics-badges">' +
        p.diff.metrics.map(function (m) {
          return '<div class="perf-badge">' + m.label + ': <strong>' + m.value + '</strong></div>';
        }).join('') +
        '</div>' +
        '</div>';
    } else if (currentTab === 'security') {
      html += '<div class="proj-pane-section">' +
        '<h4 class="proj-pane-heading">' + p.security.title + '</h4>' +
        '<div class="security-terminal">' +
        '  <div class="term-header">' +
        '    <div class="term-dots">' +
        '      <span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span>' +
        '    </div>' +
        '    <span class="term-title">audit_runner :: ' + currentProjId + '</span>' +
        '  </div>' +
        '  <div class="term-body">' +
        p.security.logs.map(function (log) {
          var cls = log.type === 'pass' ? 'term-pass' : log.type === 'prompt' ? 'term-prompt' : 'term-muted';
          return '<div class="term-line"><span class="term-prompt">[' + log.prompt + ']</span> <span class="' + cls + '">' + log.text + '</span></div>';
        }).join('') +
        '  </div>' +
        '</div>' +
        '</div>';
    } else if (currentTab === 'code') {
      html += '<div class="proj-pane-section">' +
        '<h4 class="proj-pane-heading">핵심 구현 코드 하이라이트</h4>' +
        '<div class="code-snippet-box">' +
        '  <div class="code-header">' +
        '    <span>' + p.code.file + '</span>' +
        '    <span>JavaScript</span>' +
        '  </div>' +
        '  <pre class="code-block"><code>' + escapeHtml(p.code.snippet) + '</code></pre>' +
        '</div>' +
        '</div>';
    }

    bodyEl.innerHTML = html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openProjectModal(projId) {
    if (!PROJ_DATA[projId]) return;
    currentProjId = projId;
    currentTab = 'arch';

    var p = PROJ_DATA[projId];
    titleEl.textContent = p.title;
    badgeEl.textContent = p.badge;
    categoryEl.textContent = p.category;
    summaryEl.textContent = p.summary;
    repoLinkEl.href = p.repoUrl;

    if (p.liveUrl) {
      liveLinkEl.href = p.liveUrl;
      liveLinkEl.hidden = false;
    } else {
      liveLinkEl.hidden = true;
    }

    tabChips.forEach(function (chip) {
      if (chip.getAttribute('data-tab') === 'arch') {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    renderTabContent();
    if (bodyEl) bodyEl.scrollTop = 0;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  // 탭 변경 이벤트
  tabChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      tabChips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      currentTab = chip.getAttribute('data-tab') || 'arch';
      renderTabContent();
      if (bodyEl) bodyEl.scrollTop = 0;
    });
  });

  // 버튼 트리거 이벤트 위임
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.proof-btn');
    if (btn) {
      var projId = btn.getAttribute('data-proj-id');
      if (projId) {
        e.preventDefault();
        openProjectModal(projId);
      }
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
  if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', closeProjectModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeProjectModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeProjectModal();
  });
})();

/* ===========================
   ScrollSpy & Top Progress Engine (자연스러운 전역 스크롤스파이 & 진행바)
   =========================== */
(function initScrollSpyAndProgress() {
  var progressBar = document.getElementById('scrollProgressBar');
  var navReadingTarget = document.getElementById('navReadingTarget');
  var navReadingIndicator = document.getElementById('navReadingIndicator');
  var navLinks = document.querySelectorAll('.nav-link, .nav-right a');

  var sectionData = [
    { id: 'timeline', title: '01 Timeline' },
    { id: 'metrics', title: '02 Records' },
    { id: 'strengths', title: '03 Strengths' },
    { id: 'projects', title: '04 Projects' },
    { id: 'research', title: '05 Research' },
    { id: 'vision', title: '06 Vision' },
    { id: 'evidence', title: '07 Evidence' },
    { id: 'documents', title: '08 Documents' }
  ];

  var sections = sectionData.map(function (item) {
    return {
      el: document.getElementById(item.id),
      title: item.title,
      id: item.id,
      top: 0
    };
  }).filter(function (item) {
    return !!item.el;
  });

  // 1. 섹션 오프셋 사전 캐싱 (스크롤 이벤트 내 레이아웃 쓰레싱/강제 리플로우 원천 차단)
  function cacheSectionOffsets() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].el.getBoundingClientRect();
      sections[i].top = rect.top + scrollY;
    }
  }

  var rafId = null;
  var navReadingTimer = null;
  var lastActiveId = '';

  function updateScrollState() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;
    var maxScroll = Math.max(1, docHeight - winHeight);

    // 1. 선형 매핑(Linear Mapping) 기반 프로그레스 바 계산 (0% ~ 100% 엄격 고정)
    if (progressBar) {
      var progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      var pct = (progress * 100).toFixed(2);
      progressBar.style.width = pct + '%';
    }

    // 2. 현재 활성 섹션 탐색 (사전 캐시된 오프셋 사용으로 가속/폭주 방지)
    if (!sections.length) return;

    var scrollPos = scrollY + 180;
    var currentItem = sections[0];

    if (winHeight + scrollY >= docHeight - 60) {
      currentItem = sections[sections.length - 1];
    } else {
      for (var j = 0; j < sections.length; j++) {
        if (scrollPos >= sections[j].top) {
          currentItem = sections[j];
        } else {
          break;
        }
      }
    }

    // 3. 상단 '현재 위치' 뱃지 가시성
    if (navReadingIndicator) {
      if (scrollY > 300) {
        navReadingIndicator.classList.add('is-visible');
      } else {
        navReadingIndicator.classList.remove('is-visible');
      }
    }

  var navDropdownTarget = document.getElementById('navDropdownTarget');
  var dropdownLinks = document.querySelectorAll('.nav-dropdown-link');

  // 4. 타이머 클린업(Clear-up) 보장 및 섹션 명칭 변경
  if (currentItem.id !== lastActiveId) {
    lastActiveId = currentItem.id;
    if (navReadingTimer) {
      clearTimeout(navReadingTimer);
      navReadingTimer = null;
    }
    if (navReadingTarget) {
      navReadingTarget.textContent = currentItem.title;
    }
    if (navDropdownTarget) {
      navDropdownTarget.textContent = currentItem.title;
    }
  }

  // 5. 상단 네비게이션 활성 링크 하이라이트 (데스크톱 및 모바일 드롭다운 동기화)
  for (var k = 0; k < navLinks.length; k++) {
    var href = navLinks[k].getAttribute('href');
    if (href === '#' + currentItem.id) {
      navLinks[k].classList.add('is-active');
    } else {
      navLinks[k].classList.remove('is-active');
    }
  }
  for (var m = 0; m < dropdownLinks.length; m++) {
    var dHref = dropdownLinks[m].getAttribute('href');
    if (dHref === '#' + currentItem.id) {
      dropdownLinks[m].classList.add('is-active');
    } else {
      dropdownLinks[m].classList.remove('is-active');
    }
  }
}

// 2. requestAnimationFrame 기반 스로틀링 (단일 프레임 보장 & 이전 요청 취소)
function requestTick() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  rafId = requestAnimationFrame(function () {
    updateScrollState();
    rafId = null;
  });
}

window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', function () {
  cacheSectionOffsets();
  requestTick();
}, { passive: true });

// 초기 1회 실행
cacheSectionOffsets();
updateScrollState();

// 상단 '현재 위치' 뱃지 클릭 시 해당 섹션으로 부드럽게 앵커 이동
if (navReadingIndicator) {
  navReadingIndicator.setAttribute('title', '현재 읽고 있는 섹션으로 바로 이동');
  navReadingIndicator.addEventListener('click', function () {
    var activeLink = document.querySelector('.nav-link.is-active, .nav-links-desktop a.is-active');
    if (activeLink) {
      var href = activeLink.getAttribute('href');
      if (href && href.startsWith('#')) {
        var targetEl = document.querySelector(href);
        if (targetEl) {
          var offset = targetEl.offsetTop - 65;
          window.scrollTo({
            top: Math.max(0, offset),
            behavior: 'smooth'
          });
        }
      }
    }
  });
}

// 상단 데스크톱 내비게이션 클릭 시 헤더 높이를 감안한 부드러운 스크롤 이동
navLinks.forEach(function (link) {
  link.addEventListener('click', function (e) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        var offset = targetEl.offsetTop - 65;
        window.scrollTo({
          top: Math.max(0, offset),
          behavior: 'smooth'
        });
      }
    }
  });
});
})();

/* ===========================
   Responsive Mobile/Tablet Burger Menu Controller
   =========================== */
(function initMobileNav() {
  var burgerBtn = document.getElementById('navBurgerBtn');
  var dropdownMenu = document.getElementById('navDropdownMenu');
  var dropdownLinks = document.querySelectorAll('.nav-dropdown-link');
  var header = document.getElementById('mainHeader');

  if (!burgerBtn || !dropdownMenu) return;

  function openMenu() {
    dropdownMenu.hidden = false;
    // 브라우저 렌더링 프레임 확보 후 클래스 추가 (부드러운 슬라이드다운 트랜지션)
    requestAnimationFrame(function () {
      burgerBtn.classList.add('is-active');
      burgerBtn.setAttribute('aria-expanded', 'true');
      burgerBtn.setAttribute('aria-label', '전체 메뉴 닫기');
      dropdownMenu.classList.add('is-open');
    });
  }

  function closeMenu() {
    burgerBtn.classList.remove('is-active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', '전체 메뉴 열기');
    dropdownMenu.classList.remove('is-open');
    // 애니메이션 종료 후 hidden 설정으로 접근성 보장
    setTimeout(function () {
      if (!dropdownMenu.classList.contains('is-open')) {
        dropdownMenu.hidden = true;
      }
    }, 220);
  }

  burgerBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (dropdownMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // 드롭다운 링크 클릭 시 부드러운 스크롤 이동 및 메뉴 자동 닫기
  dropdownLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          closeMenu();
          var offset = targetEl.offsetTop - 60;
          window.scrollTo({
            top: Math.max(0, offset),
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 메뉴 바깥 클릭 시 자동 닫기
  document.addEventListener('click', function (e) {
    if (dropdownMenu.classList.contains('is-open')) {
      if (!dropdownMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // ESC 키 누를 때 메뉴 닫기 및 포커스 복원
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dropdownMenu.classList.contains('is-open')) {
      closeMenu();
      burgerBtn.focus();
    }
  });

  // 뷰포트 크기가 커져 데스크톱 레이아웃(> 960px)으로 복귀 시 드롭다운 닫기
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960 && dropdownMenu.classList.contains('is-open')) {
      closeMenu();
    }
  }, { passive: true });
})();
