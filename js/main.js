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


