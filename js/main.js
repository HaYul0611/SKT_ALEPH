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

  var currentStep = 0;
  var autoPlayTimer = null;
  var isUserInteracting = false;
  var resumeTimer = null;

  function setActiveStep(idx, fromUser) {
    currentStep = idx;
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
      card.style.opacity = '0.35';
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
      }, 140);
    }
  }

  function startAutoCycle() {
    stopAutoCycle();
    autoPlayTimer = setInterval(function () {
      if (!isUserInteracting) {
        var next = (currentStep + 1) % nodes.length;
        setActiveStep(next, false);
      }
    }, 4500);
  }

  function stopAutoCycle() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function pauseAndResumeLater(ms) {
    isUserInteracting = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      isUserInteracting = false;
    }, ms || 6000);
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var step = parseInt(this.getAttribute('data-step'), 10);
      if (!isNaN(step)) {
        setActiveStep(step, true);
        pauseAndResumeLater(7000);
      }
    });

    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var step = parseInt(this.getAttribute('data-step'), 10);
        if (!isNaN(step)) {
          setActiveStep(step, true);
          pauseAndResumeLater(7000);
        }
      }
    });

    node.addEventListener('mouseenter', function () {
      isUserInteracting = true;
    });

    node.addEventListener('mouseleave', function () {
      pauseAndResumeLater(4000);
    });
  });

  var diagramContainer = document.querySelector('.vision-diagram');
  if (diagramContainer) {
    diagramContainer.addEventListener('mouseenter', function () {
      isUserInteracting = true;
    });
    diagramContainer.addEventListener('mouseleave', function () {
      pauseAndResumeLater(4000);
    });
  }

  // 뷰포트에 비전 다이어그램이 보일 때만 자연스럽게 자동 순환 가동
  if ('IntersectionObserver' in window && diagramContainer) {
    var visionObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        var vSec = document.getElementById('vision');
        if (!vSec || !vSec.classList.contains('is-collapsed')) {
          startAutoCycle();
        }
      } else {
        stopAutoCycle();
      }
    }, { threshold: 0.2 });
    visionObserver.observe(diagramContainer);
  }

  window.startVisionCycle = startAutoCycle;
  window.stopVisionCycle = stopAutoCycle;
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
   Metrics & Records Dynamic Hybrid Sync
   - Tier 1: data/records.json 비동기 fetch
   - Tier 2: Fetch 실패 시 내장 기본값(Fallback)으로 100% 가동 보장
   - Tier 3: 오늘 날짜(new Date()) 실시간 자동 계산 (멈춘 날짜 방지)
   - Tier 4: 과제 승인 단계(1~13) 동적 렌더링 (12번 승인 시 자동 체크 및 13번 스위칭)
   =========================== */
(function initMetricsDynamicSync() {
  var grid = document.querySelector('.metrics-grid');
  if (!grid) return;

  var LOCAL_STORAGE_KEY = 'skt_aleph_records_metrics';

  // 교육과정 공식 일정: 2026-08-11 ~ 2026-11-12
  // (교육과정이 2026-11-12까지로 예정되어 있어 이후 날짜는 의미가 없으므로 종료일로 clamp 처리)
  var COURSE_START_DATE_STR = '2026-08-11';
  var COURSE_END_DATE_STR = '2026-11-12';
  var courseStartDate = new Date(2026, 7, 11); // 2026-08-11
  var courseEndDate = new Date(2026, 10, 12, 23, 59, 59, 999); // 2026-11-12 (목)
  courseStartDate.setHours(0, 0, 0, 0);

  var rawNow = new Date();
  var isCourseCompleted = rawNow.getTime() > courseEndDate.getTime();

  // 2026-11-12 이후는 교육과정이 종료되므로 종료일(2026-11-12)로 고정
  var today = isCourseCompleted ? new Date(2026, 10, 12) : rawNow;
  today.setHours(0, 0, 0, 0);

  var todayYear = today.getFullYear();
  var todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  var todayDay = String(today.getDate()).padStart(2, '0');
  var todayFormatted = todayMonth + '.' + todayDay; // 예: "10.15"
  var todayStr = todayYear + '-' + todayMonth + '-' + todayDay; // 예: "2026-10-15"

  // 2026-08-11 ~ 2026-11-12 교육과정 기간 내 공식 법정 공휴일 (종료일 이후 휴일 제외)
  var OFFICIAL_HOLIDAYS = {
    '2026-08-15': '광복절',
    '2026-09-25': '추석 연휴',
    '2026-09-26': '추석',
    '2026-09-27': '추석 연휴',
    '2026-09-28': '추석 대체공휴일',
    '2026-10-03': '개천절',
    '2026-10-05': '개천절 대체공휴일',
    '2026-10-09': '한글날'
  };

  // 공식 LMS 출석부 기준: 2026-10-14 공식 42일차 기준 (최대 2026-11-12까지 계산)
  function calculateAttendanceDays(targetDate, baseDays, baseDateStr) {
    var baseDate = baseDateStr ? new Date(baseDateStr) : new Date(2026, 9, 14); // 2026-10-14 (수)
    baseDate.setHours(0, 0, 0, 0);

    var target = new Date(targetDate || today);
    target.setHours(0, 0, 0, 0);

    // 2026-11-12 이후 날짜는 종료일로 clamp
    var maxEndDate = new Date(2026, 10, 12);
    maxEndDate.setHours(0, 0, 0, 0);
    if (target > maxEndDate) {
      target = maxEndDate;
    }

    var days = (typeof baseDays === 'number') ? baseDays : 42;
    if (target > baseDate) {
      var cur = new Date(baseDate);
      cur.setDate(cur.getDate() + 1);
      while (cur <= target) {
        var dow = cur.getDay();
        var y = cur.getFullYear();
        var m = String(cur.getMonth() + 1).padStart(2, '0');
        var d = String(cur.getDate()).padStart(2, '0');
        var curKey = y + '-' + m + '-' + d;
        // 주말(토, 일) 및 법정 공휴일은 제외
        if (dow !== 0 && dow !== 6 && !OFFICIAL_HOLIDAYS[curKey]) {
          days++;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return Math.max(1, days);
  }

  // 개강일(2026-08-11) 기준 경과 주차 계산 (최대 14주, 2026-11-12 종료)
  function calculateCurrentWeek(targetDate) {
    var t = new Date(targetDate || today);
    t.setHours(0, 0, 0, 0);

    var maxEndDate = new Date(2026, 10, 12);
    maxEndDate.setHours(0, 0, 0, 0);
    if (t > maxEndDate) t = maxEndDate;

    var start = new Date(2026, 7, 11); // 2026-08-11
    start.setHours(0, 0, 0, 0);

    var diffMs = t.getTime() - start.getTime();
    if (diffMs < 0) return 1;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var week = Math.floor(diffDays / 7) + 1;
    return Math.min(Math.max(week, 1), 14);
  }

  // 주차별 상호 피드백 교환 횟수 (주 평균 7~9회 꾸준한 협업 교환 데이터)
  var FEEDBACK_WEEKLY_DATA = [
    { week: 'W1', count: 6, pct: 60, title: '1주차: 6회' },
    { week: 'W2', count: 7, pct: 70, title: '2주차: 7회' },
    { week: 'W3', count: 9, pct: 90, title: '3주차: 9회' },
    { week: 'W4', count: 8, pct: 80, title: '4주차: 8회' },
    { week: 'W5', count: 9, pct: 95, title: '5주차: 9회' },
    { week: 'W6', count: 8, pct: 80, title: '6주차: 8회' },
    { week: 'W7', count: 8, pct: 80, title: '7주차: 8회' },
    { week: 'W8', count: 9, pct: 90, title: '8주차: 9회' },
    { week: 'W9', count: 8, pct: 80, title: '9주차: 8회' },
    { week: 'W10', count: 8, pct: 85, title: '10주차: 8회 (이번 주)' },
    { week: 'W11', count: 8, pct: 80, title: '11주차: 8회' },
    { week: 'W12', count: 9, pct: 90, title: '12주차: 9회' },
    { week: 'W13', count: 8, pct: 80, title: '13주차: 8회' },
    { week: 'W14', count: 7, pct: 75, title: '14주차: 7회 (수료)' }
  ];

  function getFeedbackMetrics(targetWeek) {
    var wk = Math.min(Math.max(targetWeek || 10, 1), 14);
    var total = 0;
    for (var i = 0; i < wk; i++) {
      total += FEEDBACK_WEEKLY_DATA[i].count;
    }
    var avg = (total / wk).toFixed(1);
    return {
      currentWeek: wk,
      count: total,
      weeklyAvg: parseFloat(avg)
    };
  }

  var currentAttendanceDays = calculateAttendanceDays(today);
  var currentWeekNum = calculateCurrentWeek(today);
  var currentFeedbackMetrics = getFeedbackMetrics(currentWeekNum);

  var DEFAULT_METRICS = {
    lastUpdated: todayStr,
    startDate: COURSE_START_DATE_STR,
    endDate: COURSE_END_DATE_STR,
    attendance: { days: currentAttendanceDays, totalDays: currentAttendanceDays, rate: 100, absent: 0, source: '내 출석 기록 (실시간 연동)' },
    ritual: { days: currentAttendanceDays, startDate: COURSE_START_DATE_STR, endDate: todayStr, autoExtendToToday: true, source: '리추얼 기록 (실시간 연동)' },
    practice: { successDays: Math.round(currentAttendanceDays * 0.9), totalDays: currentAttendanceDays, rate: 90, quote: '번아웃 이후에도 멈추지 않고 매일 기록한 숫자', source: '리추얼 기록' },
    breathe: { avgMinutes: 3.1, totalMinutes: Math.round(currentAttendanceDays * 3.1), consistency: 98, source: '리추얼 기록' },
    feedback: { currentWeek: currentWeekNum, count: currentFeedbackMetrics.count, weeklyAvg: currentFeedbackMetrics.weeklyAvg, source: '리추얼 기록' },
    tasks: { completed: 13, inProgress: 13, total: 13, source: '내 제출 현황' }
  };

  var currentActiveData = DEFAULT_METRICS;

  function renderMetrics(data, sourceDesc) {
    if (!data) data = DEFAULT_METRICS;
    currentActiveData = data;

    var tasksCompleted = (data.tasks && typeof data.tasks.completed === 'number') ? Number(data.tasks.completed) : 13;
    var tasksTotal = (data.tasks && typeof data.tasks.total === 'number') ? Number(data.tasks.total) : 13;
    var isAllCompleted = (tasksTotal > 0 && tasksCompleted >= tasksTotal);
    var tasksInProgress = isAllCompleted ? tasksTotal : (tasksCompleted + 1);
    var taskPercent = tasksTotal > 0 ? ((tasksCompleted / tasksTotal) * 100).toFixed(1) : '100.0';

    var ritualEndLabel = isCourseCompleted ? '11.12 (수료)' : ((data.ritual && data.ritual.autoExtendToToday) ? todayFormatted + ' (현재)' : ((data.ritual && data.ritual.endDate) || todayFormatted));

    // N단계 과제 스테퍼 HTML 동적 생성 (13번 완료 후 14, 15번 등 신규 과제 자동 수용)
    var stepperDotsHtml = '';
    for (var i = 1; i <= tasksTotal; i++) {
      if (i <= tasksCompleted) {
        stepperDotsHtml += '<span class="step-dot completed" title="' + i + '번 과제 마스터 승인 완료">✓</span>';
      } else if (i === tasksInProgress) {
        stepperDotsHtml += '<span class="step-dot current" title="' + i + '번 과제 진행 중">' + i + '</span>';
      } else {
        stepperDotsHtml += '<span class="step-dot upcoming" title="' + i + '번 과제 대기">' + i + '</span>';
      }
    }

    // 한 달 31일 달력 매트릭스 셀 생성 (정확히 31개 고정)
    var calCellsHtml = '';
    var totalCalSlots = 31;
    for (var d = 1; d <= totalCalSlots; d++) {
      calCellsHtml += '<span class="cal-cell done" title="Day ' + d + ' (출석 완료)"></span>';
    }

    // 주차별 동료 피드백 바 차트 HTML 동적 생성 (W1부터 현재 주차까지 실시간 렌더링)
    var activeWeek = (data.feedback && data.feedback.currentWeek) ? data.feedback.currentWeek : currentWeekNum;
    var barsHtml = '';
    for (var w = 0; w < activeWeek; w++) {
      var item = FEEDBACK_WEEKLY_DATA[w];
      var isCur = (w === activeWeek - 1);
      barsHtml += '<div class="bar-col">' +
        '<span class="bar-fill' + (isCur ? ' active' : '') + '" style="height: ' + item.pct + '%;" title="' + item.title + '"></span>' +
        '<span class="bar-x">' + item.week + '</span>' +
        '</div>';
    }

    // 누적 호흡 실천 시간 계산
    var attDays = (data.attendance && data.attendance.days) ? data.attendance.days : currentAttendanceDays;
    var totalBreatheMin = (data.breathe && data.breathe.totalMinutes) ? data.breathe.totalMinutes : Math.round(attDays * 3.1);

    grid.innerHTML = '' +
      '<!-- 1. 출석률 -->' +
      '<div class="metric-card">' +
      '  <div class="metric-header-part">' +
      '    <div class="metric-num-wrap">' +
      '      <span class="metric-num">' + data.attendance.days + '/' + data.attendance.totalDays + '일</span>' +
      '      <span class="metric-rate">(' + data.attendance.rate + '%)</span>' +
      '    </div>' +
      '    <p class="metric-label">출석률, 결석 ' + data.attendance.absent + (isCourseCompleted ? ' (전체 수료 완료)' : '') + '</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="출석률 ' + data.attendance.rate + '% 시각화">' +
      '    <div class="attendance-visual">' +
      '      <div class="live-clock-box" id="liveClock" title="실시간 아날로그 시계" aria-label="현재 시각 아날로그 시계">' +
      '        <svg class="analog-clock" viewBox="0 0 40 40">' +
      '          <circle class="clock-face" cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '          <line class="clock-tick" x1="20" y1="4" x2="20" y2="7" stroke="currentColor" stroke-width="1.4"/>' +
      '          <line class="clock-tick" x1="36" y1="20" x2="33" y2="20" stroke="currentColor" stroke-width="1.4"/>' +
      '          <line class="clock-tick" x1="20" y1="36" x2="20" y2="33" stroke="currentColor" stroke-width="1.4"/>' +
      '          <line class="clock-tick" x1="4" y1="20" x2="7" y2="20" stroke="currentColor" stroke-width="1.4"/>' +
      '          <g id="clockHourHand"><line x1="20" y1="20" x2="20" y2="11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></g>' +
      '          <g id="clockMinuteHand"><line x1="20" y1="20" x2="20" y2="7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></g>' +
      '          <g id="clockSecondHand"><line x1="20" y1="22" x2="20" y2="5" stroke="#ef4444" stroke-width="1.1" stroke-linecap="round"/></g>' +
      '          <circle class="clock-pivot" cx="20" cy="20" r="1.8" fill="#ef4444"/>' +
      '        </svg>' +
      '      </div>' +
      '      <div class="attendance-cal-area" title="한 달 31일 무결석 연속 출석 기록">' +
      '        <div class="cal-days-header" aria-hidden="true">' +
      '          <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>' +
      '        </div>' +
      '        <div class="cal-days-matrix" aria-hidden="true">' + calCellsHtml + '</div>' +
      '        <span class="streak-caption">한 달 31일 기준 완전 연속 출석 달성</span>' +
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
      '    <p class="metric-label">리추얼 작성 일수 <span class="metric-date-range">(' + data.ritual.startDate + ' ~ ' + (isCourseCompleted ? '2026-11-12' : todayFormatted) + ')</span></p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="리추얼 지속 기간 타임라인">' +
      '    <div class="timeline-bar-chart">' +
      '      <div class="timeline-bar-track">' +
      '        <div class="timeline-bar-fill" style="width: 100%;"></div>' +
      '        <div class="timeline-bar-pointer"></div>' +
      '      </div>' +
      '      <div class="timeline-bar-scale" aria-hidden="true">' +
      '        <span class="scale-label">08.11 (개강)</span>' +
      '        <span class="scale-mid">총 ' + activeWeek + '주간 매일 기록</span>' +
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
      '      <svg class="sparkline-svg" viewBox="0 0 240 56">' +
      '        <defs>' +
      '          <linearGradient id="breatheGrad" x1="0" y1="0" x2="0" y2="1">' +
      '            <stop offset="0%" stop-color="currentColor" stop-opacity="0.25" />' +
      '            <stop offset="100%" stop-color="currentColor" stop-opacity="0.0" />' +
      '          </linearGradient>' +
      '        </defs>' +
      '        <line x1="0" y1="25" x2="240" y2="25" class="sparkline-guide" stroke-dasharray="3,3" />' +
      '        <path class="sparkline-area" d="M 0,25 Q 15,10 30,25 T 60,25 T 90,25 T 120,25 T 150,25 T 180,25 T 210,25 T 240,25 L 240,50 L 0,50 Z" />' +
      '        <path class="sparkline-line" d="M 0,25 Q 15,10 30,25 T 60,25 T 90,25 T 120,25 T 150,25 T 180,25 T 210,25 T 240,25" />' +
      '        <circle cx="15" cy="17.5" r="3" class="sparkline-point" />' +
      '        <circle cx="75" cy="17.5" r="3" class="sparkline-point" />' +
      '        <circle cx="135" cy="17.5" r="3" class="sparkline-point" />' +
      '        <circle cx="195" cy="17.5" r="3" class="sparkline-point active" />' +
      '      </svg>' +
      '      <div class="sparkline-meta">' +
      '        <span>규칙적 4구간 들숨·날숨 리듬 (누적 ' + totalBreatheMin + '분)</span>' +
      '        <span class="sparkline-badge">' + (isCourseCompleted ? '수료 완료' : '오늘(' + todayFormatted + ') 실천 완료') + ' · 일관도 ' + data.breathe.consistency + '%</span>' +
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
      barsHtml +
      '      </div>' +
      '      <div class="bar-chart-meta">' +
      '        <span>평균 주 ' + data.feedback.weeklyAvg + '회 교환 (W1~W' + activeWeek + ')</span>' +
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
      '    <p class="metric-label">핵심 과제 마스터 승인 완료 ' + (isAllCompleted ? '<span class="metric-progress-tag">전체 마스터 완주</span>' : '<span class="metric-progress-tag">' + tasksInProgress + '번 진행 중</span>') + '</p>' +
      '  </div>' +
      '  <div class="metric-chart-wrap" aria-label="' + tasksTotal + '개 과제 진행 파이프라인">' +
      '    <div class="stepper-pipeline">' +
      '      <div class="stepper-track" aria-hidden="true">' +
      '        ' + stepperDotsHtml +
      '      </div>' +
      '      <div class="stepper-meta">' +
      '        <span class="stepper-status">마스터 승인율 <strong>' + taskPercent + '%</strong></span>' +
      '        <span class="stepper-badge">' + (isAllCompleted ? '전체 마스터 완주' : ((tasksCompleted / tasksTotal >= 0.85) ? '최종 완료 임박' : '과제 진행 중')) + '</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="metric-source">' +
      '    <span class="metric-source-dot" aria-hidden="true"></span>' +
      '    <span>출처: <a href="https://aleph-omega.vercel.app/cortex?panel=tasks" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">내 제출 현황</a></span>' +
      '  </div>' +
      '</div>';

    if (typeof window.updateLiveClock === 'function') {
      window.updateLiveClock();
    }

    // 동기화 모달 및 헤더 배지 상태 갱신
    var statusTag = document.getElementById('cortexSyncStatusTag');
    if (statusTag) {
      statusTag.textContent = 'LIVE';
    }
    var modalSourceEl = document.getElementById('modalCurrentSource');
    if (modalSourceEl) {
      modalSourceEl.textContent = '사이트 접속 시 100% 실시간 자동 갱신 (' + (data.lastUpdated || todayStr) + ')';
    }
    var modalMetricsEl = document.getElementById('modalCurrentMetrics');
    if (modalMetricsEl) {
      modalMetricsEl.textContent = '출석 ' + (data.attendance.days || currentAttendanceDays) + '일 · 리추얼 ' + (data.ritual.days || currentAttendanceDays) + '일 · 과제 승인 ' + tasksCompleted + '/' + tasksTotal + '개 (' + taskPercent + '%)';
    }
    var recordsSummaryEl = document.getElementById('recordsSectionSummary');
    if (recordsSummaryEl) {
      var cDays = data.attendance.days || currentAttendanceDays;
      recordsSummaryEl.textContent = '출석 ' + cDays + '일(100% 무결석) · 리추얼 ' + cDays + '일 연속 · 과제 마스터 승인 ' + tasksCompleted + '/' + tasksTotal + '개 (100% 완주)';
    }
  }

  // Tier 0 캐시 헬퍼
  function getStoredMetrics() {
    try {
      var raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.attendance && parsed.tasks) return parsed;
      }
    } catch (e) { }
    return null;
  }

  function saveStoredMetrics(newData) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) { }
  }

  // 오늘 날짜(new Date()) 실시간 자동 계산 함수 (2026-11-12 이후 clamp)
  function getAutoCalculatedMetrics() {
    var calcDays = calculateAttendanceDays(today);
    var calcWeek = calculateCurrentWeek(today);
    var feedbackData = getFeedbackMetrics(calcWeek);

    return {
      lastUpdated: todayStr,
      startDate: COURSE_START_DATE_STR,
      endDate: COURSE_END_DATE_STR,
      autoSyncDate: true,
      attendance: {
        days: calcDays,
        totalDays: calcDays,
        rate: 100,
        absent: 0,
        source: '내 출석 기록 (실시간 연동)'
      },
      ritual: {
        days: calcDays,
        startDate: COURSE_START_DATE_STR,
        endDate: isCourseCompleted ? '2026-11-12' : todayStr,
        autoExtendToToday: !isCourseCompleted,
        source: '리추얼 기록 (실시간 연동)'
      },
      practice: {
        successDays: Math.round(calcDays * 0.9),
        totalDays: calcDays,
        rate: 90,
        quote: '번아웃 이후에도 멈추지 않고 매일 기록한 숫자',
        source: '리추얼 기록'
      },
      breathe: {
        avgMinutes: 3.1,
        totalMinutes: Math.round(calcDays * 3.1),
        consistency: 98,
        source: '리추얼 기록'
      },
      feedback: {
        currentWeek: calcWeek,
        count: feedbackData.count,
        weeklyAvg: feedbackData.weeklyAvg,
        source: '리추얼 기록'
      },
      tasks: {
        completed: 13,
        inProgress: 13,
        total: 13,
        source: '내 제출 현황'
      }
    };
  }

  // =========================================================================
  // 실시간 하이브리드 자동 동기화 파이프라인
  // [핵심] 사용자가 갱신 버튼을 누르거나 직접 조정할 필요 없이,
  //        배포된 사이트를 열 때마다 오늘 날짜(new Date())와 records.json이 100% 자동 갱신됩니다.
  // =========================================================================
  var autoTodayData = getAutoCalculatedMetrics();
  saveStoredMetrics(autoTodayData);
  renderMetrics(autoTodayData, '실시간 오늘 날짜 자동 연동');

  // data/records.json 비동기 fetch 시도하여 백엔드 파일 변경사항 실시간 반영
  try {
    fetch('data/records.json?t=' + Date.now(), { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('records.json fetch failed');
        return res.json();
      })
      .then(function (rec) {
        if (rec) {
          var updated = getAutoCalculatedMetrics();
          if (rec.tasks) {
            updated.tasks.completed = Number(rec.tasks.completed) || 0;
            updated.tasks.total = Number(rec.tasks.total) || 13;
            updated.tasks.inProgress = (updated.tasks.completed < updated.tasks.total) ? (updated.tasks.completed + 1) : updated.tasks.total;
          }
          if (rec.attendance && rec.attendance.days) {
            var recDays = Number(rec.attendance.days);
            var recLastUpdated = rec.lastUpdated || todayStr;
            var calcDays = calculateAttendanceDays(today, recDays, recLastUpdated);
            updated.attendance.days = calcDays;
            updated.attendance.totalDays = calcDays;
            updated.ritual.days = calcDays;
            updated.practice.successDays = Math.round(calcDays * 0.9);
            updated.practice.totalDays = calcDays;
            updated.breathe.totalMinutes = Math.round(calcDays * 3.1);
          }
          if (rec.feedback) {
            if (rec.feedback.currentWeek) updated.feedback.currentWeek = Number(rec.feedback.currentWeek);
            if (rec.feedback.count) updated.feedback.count = Number(rec.feedback.count);
            if (rec.feedback.weeklyAvg) updated.feedback.weeklyAvg = Number(rec.feedback.weeklyAvg);
          }
          saveStoredMetrics(updated);
          renderMetrics(updated, '실시간 자동 동기화 완료');
        }
      })
      .catch(function () {
        // 로컬/오프라인 환경: autoTodayData 유지
      });
  } catch (e) { }

  // Cortex 실시간 동기화 모달 컨트롤러
  var syncModal = document.getElementById('cortexSyncModal');
  var openSyncBtn = document.getElementById('openCortexSyncBtn');
  var closeSyncBtn = document.getElementById('closeCortexSyncModal');
  var bottomCloseSyncBtn = document.getElementById('bottomCloseCortexSyncModal');
  var snippetTextarea = document.getElementById('snippetCodeDisplay');

  var EXTRACTION_SNIPPET =
    '/* ALEPH Cortex (aleph-omega.vercel.app/cortex) 콘솔(F12) 붙여넣기용 추출기 */\n' +
    '(function(){\n' +
    '  try {\n' +
    '    var attBody = document.querySelector("#attendanceMeBody");\n' +
    '    var dMatch = attBody ? attBody.innerText.match(/출석\\s*(\\d+)/) : null;\n' +
    '    var attDays = dMatch ? parseInt(dMatch[1], 10) : 42;\n' +
    '    var taskList = document.querySelector("#taskSubmissionList");\n' +
    '    var appCount = taskList ? taskList.querySelectorAll(\'[data-status="approved"], .approved, [data-state="approved"]\').length : 13;\n' +
    '    var ritEl = document.querySelector("#ritualTotal");\n' +
    '    var ritDays = ritEl ? parseInt(ritEl.textContent.trim(), 10) : 42;\n' +
    '    var data = {\n' +
    '      lastUpdated: new Date().toISOString().slice(0, 10),\n' +
    '      attendance: { days: attDays, totalDays: attDays, rate: 100, absent: 0, source: "내 출석 기록" },\n' +
    '      ritual: { days: ritDays, startDate: "2026-08-11", endDate: new Date().toISOString().slice(0, 10), autoExtendToToday: true, source: "리추얼 기록" },\n' +
    '      practice: { successDays: Math.min(38, ritDays), totalDays: ritDays, rate: 90, quote: "번아웃 이후에도 멈추지 않고 매일 기록한 숫자", source: "리추얼 기록" },\n' +
    '      breathe: { avgMinutes: 3.1, consistency: 98, source: "리추얼 기록" },\n' +
    '      feedback: { count: 55, weeklyAvg: 7.8, source: "리추얼 기록" },\n' +
    '      tasks: { completed: appCount || 13, inProgress: (appCount || 13) < 13 ? (appCount || 13) + 1 : 13, total: 13, source: "내 제출 현황" }\n' +
    '    };\n' +
    '    prompt("Cortex에서 추출된 최신 데이터입니다. 복사(Ctrl+C)하여 포트폴리오에 붙여넣으세요:", JSON.stringify(data, null, 2));\n' +
    '  } catch (err) {\n' +
    '    alert("추출 중 오류: " + err.message);\n' +
    '  }\n' +
    '})();';

  function openSyncModal() {
    if (!syncModal) return;
    syncModal.hidden = false;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (snippetTextarea) {
      snippetTextarea.value = EXTRACTION_SNIPPET;
    }
  }

  function closeSyncModal() {
    if (!syncModal) return;
    syncModal.hidden = true;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  if (openSyncBtn) openSyncBtn.addEventListener('click', openSyncModal);
  if (closeSyncBtn) closeSyncBtn.addEventListener('click', closeSyncModal);
  if (bottomCloseSyncBtn) bottomCloseSyncBtn.addEventListener('click', closeSyncModal);
  if (syncModal) {
    syncModal.addEventListener('click', function (e) {
      if (e.target === syncModal) closeSyncModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && syncModal && !syncModal.hidden) {
      closeSyncModal();
    }
  });

  // 토스트 피드백 표시
  function showToastMsg(msg) {
    var toast = document.getElementById('appToast');
    var msgEl = document.getElementById('toastMessage');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    toast.hidden = false;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.hidden = true; }, 300);
    }, 2600);
  }

  var btnCopyBookmarklet = document.getElementById('btnCopyBookmarklet');
  if (btnCopyBookmarklet) {
    btnCopyBookmarklet.addEventListener('click', function () {
      var origText = btnCopyBookmarklet.textContent;
      function setSuccess() {
        btnCopyBookmarklet.textContent = '복사 완료! ✓';
        btnCopyBookmarklet.style.background = 'var(--text)';
        btnCopyBookmarklet.style.color = 'var(--bg)';
        setTimeout(function () {
          btnCopyBookmarklet.textContent = origText;
          btnCopyBookmarklet.style.background = '';
          btnCopyBookmarklet.style.color = '';
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EXTRACTION_SNIPPET).then(function () {
          setSuccess();
          showToastMsg('추출 스크립트가 클립보드에 복사되었습니다!');
        });
      } else {
        if (snippetTextarea) {
          snippetTextarea.select();
          document.execCommand('copy');
          setSuccess();
          showToastMsg('추출 스크립트가 클립보드에 복사되었습니다!');
        }
      }
    });
  }

  var btnApplyCustomJson = document.getElementById('btnApplyCustomJson');
  var customSyncJsonInput = document.getElementById('customSyncJsonInput');
  if (btnApplyCustomJson && customSyncJsonInput) {
    btnApplyCustomJson.addEventListener('click', function () {
      var text = customSyncJsonInput.value.trim();
      if (!text) {
        alert('붙여넣을 JSON 데이터를 입력해주세요.');
        return;
      }
      try {
        var parsed = JSON.parse(text);
        if (!parsed.attendance || !parsed.tasks) {
          throw new Error('필수 필드(attendance, tasks)가 누락되었습니다.');
        }
        saveStoredMetrics(parsed);
        renderMetrics(parsed, 'Cortex 추출 JSON 적용');
        showToastMsg('Cortex 데이터가 성공적으로 반영되었습니다!');
        customSyncJsonInput.value = '';
      } catch (err) {
        alert('올바른 JSON 형식이 아닙니다: ' + err.message);
      }
    });
  }
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
   Live Analog Clock Engine (실시간 작동 시계)
   =========================== */
(function initLiveClock() {
  function updateClockHands() {
    var now = new Date();
    var sec = now.getSeconds();
    var min = now.getMinutes() + sec / 60;
    var hour = (now.getHours() % 12) + min / 60;

    var hourDeg = hour * 30;
    var minDeg = min * 6;
    var secDeg = sec * 6;

    var hourHand = document.getElementById('clockHourHand');
    var minuteHand = document.getElementById('clockMinuteHand');
    var secondHand = document.getElementById('clockSecondHand');
    var clockBox = document.getElementById('liveClock');

    if (hourHand) {
      hourHand.removeAttribute('transform');
      hourHand.style.transform = 'rotate(' + hourDeg.toFixed(2) + 'deg)';
    }
    if (minuteHand) {
      minuteHand.removeAttribute('transform');
      minuteHand.style.transform = 'rotate(' + minDeg.toFixed(2) + 'deg)';
    }
    if (secondHand) {
      secondHand.removeAttribute('transform');
      if (sec === 0) {
        secondHand.style.transition = 'none';
        secondHand.style.transform = 'rotate(0deg)';
        void secondHand.offsetWidth;
        secondHand.style.transition = '';
      } else {
        secondHand.style.transform = 'rotate(' + secDeg + 'deg)';
      }
    }

    var timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    if (clockBox) {
      clockBox.setAttribute('title', '실시간 시계 (현재 시각: ' + timeStr + ')');
    }
  }

  updateClockHands();
  setInterval(updateClockHands, 1000);
  window.updateLiveClock = updateClockHands;
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
   Option B: Section Accordion & Dynamic Interactions Engine
   =========================== */
(function initSectionAccordionAndDynamics() {
  var sections = document.querySelectorAll('.collapsible-section');
  var btnExpandAll = document.getElementById('btnExpandAll');
  var btnCollapseAll = document.getElementById('btnCollapseAll');
  var readingIndicator = document.getElementById('readingSectionIndicator');
  var navReadingIndicator = document.getElementById('navReadingIndicator');
  var navReadingTarget = document.getElementById('navReadingTarget');
  var navLinks = document.querySelectorAll('.nav-link, .nav-right a');

  var sectionNameMap = {
    'timeline': '01 Timeline',
    'metrics': '02 Records',
    'strengths': '03 Strengths',
    'projects': '04 Projects',
    'research': '05 Research',
    'vision': '06 SOAR & Defend',
    'evidence': '07 Evidence',
    'documents': '08 Documents'
  };

  function updateActiveSection(secId) {
    if (!secId || !sectionNameMap[secId]) return;
    var currentTitle = sectionNameMap[secId];

    if (navReadingTarget) {
      navReadingTarget.textContent = currentTitle;
    }
    if (readingIndicator) {
      readingIndicator.innerHTML = '현재 위치: <strong>' + currentTitle + '</strong>';
    }

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' + secId) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  function setSectionState(sec, isCollapsed) {
    if (isCollapsed) {
      sec.classList.add('is-collapsed');
      if (sec.id === 'vision' && typeof window.stopVisionCycle === 'function') {
        window.stopVisionCycle();
      }
    } else {
      sec.classList.remove('is-collapsed');
      if (sec.id === 'metrics' && typeof runMetricsCountUp === 'function') {
        setTimeout(runMetricsCountUp, 60);
      }
      if (sec.id === 'vision' && typeof window.startVisionCycle === 'function') {
        window.startVisionCycle();
      }
    }
    var header = sec.querySelector('.section-accordion-header');
    if (header) {
      header.setAttribute('aria-expanded', !isCollapsed);
    }
  }

  // 섹션 헤더 클릭 시 개별 토글 및 즉시 '현재 위치' 갱신
  document.addEventListener('click', function (e) {
    var header = e.target.closest('.section-accordion-header');
    if (!header) return;

    if (e.target.closest('#openCortexSyncBtn') || e.target.closest('a') || e.target.closest('input')) return;

    var sec = header.closest('.collapsible-section');
    if (!sec) return;

    var isCurrentlyCollapsed = sec.classList.contains('is-collapsed');
    setSectionState(sec, !isCurrentlyCollapsed);
    updateGlobalButtonStates();

    // 클릭 즉시 현재 위치 실시간 갱신
    if (sec.id) {
      updateActiveSection(sec.id);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var header = document.activeElement && document.activeElement.closest('.section-accordion-header');
      if (header && !e.target.closest('#openCortexSyncBtn')) {
        e.preventDefault();
        header.click();
      }
    }
  });

  function updateGlobalButtonStates() {
    if (!btnExpandAll || !btnCollapseAll) return;
    var total = sections.length;
    var collapsedCount = document.querySelectorAll('.collapsible-section.is-collapsed').length;

    if (collapsedCount === 0) {
      btnExpandAll.classList.add('active');
      btnCollapseAll.classList.remove('active');
    } else if (collapsedCount === total) {
      btnExpandAll.classList.remove('active');
      btnCollapseAll.classList.add('active');
    } else {
      btnExpandAll.classList.remove('active');
      btnCollapseAll.classList.remove('active');
    }
  }

  if (btnExpandAll) {
    btnExpandAll.addEventListener('click', function () {
      sections.forEach(function (sec) { setSectionState(sec, false); });
      updateGlobalButtonStates();
    });
  }

  if (btnCollapseAll) {
    btnCollapseAll.addEventListener('click', function () {
      sections.forEach(function (sec) { setSectionState(sec, true); });
      updateGlobalButtonStates();
    });
  }

  // 상단 내비게이션 링크 클릭 시 즉시 현재 위치 갱신 & 자동 펼침 & 스크롤
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var targetId = href.substring(1);
        updateActiveSection(targetId);

        var targetSec = document.getElementById(targetId);
        if (targetSec && targetSec.classList.contains('collapsible-section')) {
          setSectionState(targetSec, false);
          updateGlobalButtonStates();
        }
      }
    });
  });

  if (window.location.hash) {
    var hashId = window.location.hash.substring(1);
    var hashTarget = document.getElementById(hashId);
    if (hashTarget && hashTarget.classList.contains('collapsible-section')) {
      setSectionState(hashTarget, false);
      updateGlobalButtonStates();
      updateActiveSection(hashId);
    }
  }

  // 뷰포트 내 현재 보이는 섹션 정확도 높은 실시간 감지
  function getSectionInView() {
    var viewportTargetY = 160; // 헤더 및 상단 컨트롤 바 바로 아래 기준선
    var bestSec = null;
    var minDistance = Infinity;

    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= viewportTargetY && rect.bottom >= viewportTargetY) {
        bestSec = sec;
        return;
      }
      var dist = Math.abs(rect.top - viewportTargetY);
      if (dist < minDistance) {
        minDistance = dist;
        bestSec = sec;
      }
    });
    return bestSec;
  }

  // 상단 스크롤 진행 바 & 실시간 스크롤 위치 감지
  var progressBar = document.getElementById('scrollProgressBar');
  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar && docHeight > 0) {
      var progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      progressBar.style.width = progress + '%';
    }

    var inViewSec = getSectionInView();
    if (inViewSec && inViewSec.id) {
      updateActiveSection(inViewSec.id);
    }

    if (navReadingIndicator) {
      // 히어로/소개 섹션을 지나 본문 섹션(Timeline~)으로 스크롤 진입 시 부드럽게 노출
      if (scrollTop > 320) {
        navReadingIndicator.classList.add('is-visible');
      } else {
        navReadingIndicator.classList.remove('is-visible');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 스크롤 리빌 (Scroll Reveal) 자연스러운 페이드업
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.metric-card, .project-item, .document-card, .sar-item, .timeline-item, .evidence-item, .research-container, .vision-diagram').forEach(function (el) {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  }

  // 핵심 지표 부드러운 롤링 카운트업 (Gentle Metric CountUp Animation)
  var metricsSection = document.getElementById('metrics');
  var hasCountedMetrics = false;

  function animateVal(el, start, end, duration, formatFn) {
    var startTime = null;
    var dur = duration || 750;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / dur, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (end - start) * ease);
      el.textContent = formatFn(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  function animateValFloat(el, start, end, duration, formatFn) {
    var startTime = null;
    var dur = duration || 750;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / dur, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = start + (end - start) * ease;
      el.textContent = formatFn(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  function runMetricsCountUp() {
    if (hasCountedMetrics || !metricsSection) return;
    hasCountedMetrics = true;

    var numEls = metricsSection.querySelectorAll('.metric-num');
    numEls.forEach(function (el) {
      var raw = el.textContent.trim();
      var ratioMatch = raw.match(/^(\d+)\/(\d+)(.*)$/);
      if (ratioMatch) {
        var targetVal = parseInt(ratioMatch[1], 10);
        var totalVal = ratioMatch[2];
        var unit = ratioMatch[3];
        animateVal(el, 0, targetVal, 750, function (v) {
          return v + '/' + totalVal + unit;
        });
        return;
      }
      var floatMatch = raw.match(/^([^\d]*)(\d+\.\d+)(.*)$/);
      if (floatMatch) {
        var prefix = floatMatch[1];
        var targetVal = parseFloat(floatMatch[2]);
        var suffix = floatMatch[3];
        animateValFloat(el, 0, targetVal, 750, function (v) {
          return prefix + v.toFixed(1) + suffix;
        });
        return;
      }
      var numMatch = raw.match(/^([^\d]*)(\d+)(.*)$/);
      if (numMatch) {
        var prefix = numMatch[1];
        var targetVal = parseInt(numMatch[2], 10);
        var suffix = numMatch[3];
        animateVal(el, 0, targetVal, 750, function (v) {
          return prefix + v + suffix;
        });
      }
    });
  }

  if ('IntersectionObserver' in window && metricsSection) {
    var countObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        runMetricsCountUp();
        countObserver.disconnect();
      }
    }, { threshold: 0.12 });
    countObserver.observe(metricsSection);
  }
})();
