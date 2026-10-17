/* ==========================================================================
   Navigation & Tab View Controller (nav.js)
   - 다크/라이트 테마 토글 (initTheme)
   - 모바일 버거 메뉴 & 드롭다운 제어 (initMobileNav)
   - 인터랙티브 단일 탭 모드 & 전체보기(All) 탭 시스템 (initTabSystem)
   - 전역 스크롤스파이 및 프로그레스 바 (initScrollSpy)
   ========================================================================== */

/* ===========================
   1. Theme Toggle (다크/라이트 모드)
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
   2. Responsive Burger & Mobile Dropdown Controller
   =========================== */
var MobileNav = (function () {
  var burgerBtn = document.getElementById('navBurgerBtn');
  var dropdownMenu = document.getElementById('navDropdownMenu');

  function openMenu() {
    if (!burgerBtn || !dropdownMenu) return;
    dropdownMenu.hidden = false;
    requestAnimationFrame(function () {
      burgerBtn.classList.add('is-active');
      burgerBtn.setAttribute('aria-expanded', 'true');
      burgerBtn.setAttribute('aria-label', '전체 메뉴 닫기');
      dropdownMenu.classList.add('is-open');
    });
  }

  function closeMenu() {
    if (!burgerBtn || !dropdownMenu) return;
    burgerBtn.classList.remove('is-active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', '전체 메뉴 열기');
    dropdownMenu.classList.remove('is-open');
    setTimeout(function () {
      if (!dropdownMenu.classList.contains('is-open')) {
        dropdownMenu.hidden = true;
      }
    }, 220);
  }

  function toggleMenu() {
    if (!dropdownMenu) return;
    if (dropdownMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (burgerBtn && dropdownMenu) {
    burgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', function (e) {
      if (dropdownMenu.classList.contains('is-open')) {
        if (!dropdownMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
          closeMenu();
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdownMenu.classList.contains('is-open')) {
        closeMenu();
        burgerBtn.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && dropdownMenu.classList.contains('is-open')) {
        closeMenu();
      }
    }, { passive: true });
  }

  return {
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu
  };
})();


/* ===========================
   3. Tab View & ScrollSpy Controller (단일 탭 모드 + 전체보기 시스템)
   =========================== */
(function initTabViewAndScrollSpy() {
  var progressBar = document.getElementById('scrollProgressBar');
  var navReadingTarget = document.getElementById('navReadingTarget');
  var navReadingIndicator = document.getElementById('navReadingIndicator');
  var navDropdownTarget = document.getElementById('navDropdownTarget');
  var desktopNavLinks = document.querySelectorAll('.nav-links-desktop .nav-link');
  var dropdownNavLinks = document.querySelectorAll('.nav-dropdown-links .nav-dropdown-link');
  var tabPanes = document.querySelectorAll('.section-tab-pane');

  var tabMeta = {
    all: { title: '전체보기', id: 'all' },
    timeline: { title: '01 Timeline', id: 'timeline' },
    metrics: { title: '02 Records', id: 'metrics' },
    strengths: { title: '03 Strengths', id: 'strengths' },
    projects: { title: '04 Projects', id: 'projects' },
    research: { title: '05 Research', id: 'research' },
    vision: { title: '06 Vision', id: 'vision' },
    evidence: { title: '07 Evidence', id: 'evidence' },
    documents: { title: '08 Documents', id: 'documents' }
  };

  var currentTab = 'all';
  var isSwitchingTab = false;

  // 섹션 오프셋 캐싱 (전체보기 ScrollSpy 전용)
  var sections = [
    { id: 'timeline', title: '01 Timeline', top: 0 },
    { id: 'metrics', title: '02 Records', top: 0 },
    { id: 'strengths', title: '03 Strengths', top: 0 },
    { id: 'projects', title: '04 Projects', top: 0 },
    { id: 'research', title: '05 Research', top: 0 },
    { id: 'vision', title: '06 Vision', top: 0 },
    { id: 'evidence', title: '07 Evidence', top: 0 },
    { id: 'documents', title: '08 Documents', top: 0 }
  ].map(function (item) {
    item.el = document.getElementById(item.id);
    return item;
  }).filter(function (item) {
    return !!item.el;
  });

  function cacheSectionOffsets() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el) {
        var rect = sections[i].el.getBoundingClientRect();
        sections[i].top = rect.top + scrollY;
      }
    }
  }

  // 1. 탭 활성화 상태 UI 동기화
  function syncNavActiveLinks(tabId) {
    var targetHref = '#' + tabId;

    desktopNavLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      var linkTab = link.dataset.tab;
      if (href === targetHref || linkTab === tabId) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    dropdownNavLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      var linkTab = link.dataset.tab;
      if (href === targetHref || linkTab === tabId) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    var meta = tabMeta[tabId] || tabMeta.all;
    if (navReadingTarget) {
      navReadingTarget.textContent = meta.title;
    }
    if (navDropdownTarget) {
      navDropdownTarget.textContent = meta.title;
    }
  }

  // 2. 탭 전환 메인 함수
  function switchTab(tabId, shouldScroll) {
    if (!tabMeta[tabId]) {
      tabId = 'all';
    }

    currentTab = tabId;
    isSwitchingTab = true;

    // 모바일 드롭다운 메뉴가 열려 있다면 닫기
    MobileNav.close();

    if (tabId === 'all') {
      // [전체보기 모드]: 모든 섹션 및 구분선 활성화
      document.body.classList.remove('tab-mode-single');
      tabPanes.forEach(function (pane) {
        pane.classList.remove('is-tab-hidden');
        pane.classList.remove('is-tab-active');
      });

      syncNavActiveLinks('all');
      cacheSectionOffsets();

      // 전체보기 클릭 시, 이미 스크롤이 내려가 있었다면 부드럽게 첫 번째 섹션 또는 상단으로
      if (shouldScroll) {
        var firstSec = document.getElementById('timeline');
        if (firstSec) {
          var targetTop = Math.max(0, firstSec.offsetTop - 65);
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      }

      // URL 해시 업데이트
      if (window.location.hash !== '#all') {
        history.replaceState(null, '', '#all');
      }
    } else {
      // [단일 탭 모드]: 선택된 섹션만 노출, 나머지는 숨김
      document.body.classList.add('tab-mode-single');
      var activePane = null;

      tabPanes.forEach(function (pane) {
        var paneId = pane.dataset.tabId || pane.id;
        if (paneId === tabId) {
          pane.classList.remove('is-tab-hidden');
          pane.classList.add('is-tab-active');
          activePane = pane;
        } else {
          pane.classList.add('is-tab-hidden');
          pane.classList.remove('is-tab-active');
        }
      });

      syncNavActiveLinks(tabId);

      // 상단 읽기 뱃지 표시
      if (navReadingIndicator) {
        navReadingIndicator.classList.add('is-visible');
      }

      // 프로그레스 바: 단일 탭일 때는 깔끔하게 100% 안착
      if (progressBar) {
        progressBar.style.width = '100%';
      }

      // 해당 섹션 상단(헤더 높이 65px 고려)으로 자연스럽게 스크롤 안착
      if (shouldScroll && activePane) {
        var topPos = Math.max(0, activePane.offsetTop - 65);
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }

      // URL 해시 업데이트
      if (window.location.hash !== '#' + tabId) {
        history.replaceState(null, '', '#' + tabId);
      }
    }

    setTimeout(function () {
      isSwitchingTab = false;
      if (tabId === 'all') {
        cacheSectionOffsets();
        updateScrollState();
      }
    }, 350);
  }

  // 3. 전체보기 전용 ScrollSpy & Progress Engine
  var rafId = null;
  function updateScrollState() {
    if (currentTab !== 'all' || isSwitchingTab) return;

    var scrollY = window.scrollY || window.pageYOffset || 0;
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;
    var maxScroll = Math.max(1, docHeight - winHeight);

    // 1. 프로그레스 바 계산
    if (progressBar) {
      var progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      var pct = (progress * 100).toFixed(2);
      progressBar.style.width = pct + '%';
    }

    // 2. 현재 읽고 있는 섹션 탐색
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

    // 3. '현재 위치' 뱃지 가시성
    if (navReadingIndicator) {
      if (scrollY > 300) {
        navReadingIndicator.classList.add('is-visible');
      } else {
        navReadingIndicator.classList.remove('is-visible');
      }
    }

    // 4. 뱃지 텍스트 갱신 (전체보기일 때 실시간 추종)
    if (navReadingTarget) {
      navReadingTarget.textContent = currentItem.title;
    }
    if (navDropdownTarget) {
      navDropdownTarget.textContent = currentItem.title;
    }
  }

  function requestTick() {
    if (currentTab !== 'all' || isSwitchingTab) return;
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
    if (currentTab === 'all') {
      cacheSectionOffsets();
      requestTick();
    }
  }, { passive: true });

  // 4. 클릭 이벤트 바인딩 (데스크톱 & 모바일)
  function handleLinkClick(e) {
    var link = e.currentTarget;
    var tabId = link.dataset.tab;
    if (!tabId) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        tabId = href.substring(1);
      }
    }

    if (tabId && tabMeta[tabId]) {
      e.preventDefault();
      switchTab(tabId, true);
    }
  }

  desktopNavLinks.forEach(function (link) {
    link.addEventListener('click', handleLinkClick);
  });

  dropdownNavLinks.forEach(function (link) {
    link.addEventListener('click', handleLinkClick);
  });

  // 상단 '현재 위치' 뱃지 클릭 시 현재 탭으로 부드럽게 스크롤
  if (navReadingIndicator) {
    navReadingIndicator.setAttribute('title', '현재 읽고 있는 섹션으로 바로 이동');
    navReadingIndicator.addEventListener('click', function () {
      if (currentTab === 'all') {
        var activeSec = document.querySelector('.section-tab-pane:not(.is-tab-hidden)');
        if (activeSec) {
          window.scrollTo({ top: Math.max(0, activeSec.offsetTop - 65), behavior: 'smooth' });
        }
      } else {
        var pane = document.querySelector('.section-tab-pane[data-tab-id="' + currentTab + '"]');
        if (pane) {
          window.scrollTo({ top: Math.max(0, pane.offsetTop - 65), behavior: 'smooth' });
        }
      }
    });
  }

  // 5. 브라우저 뒤로가기 / 앞으로가기 (hashchange) 지원
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && tabMeta[hash] && hash !== currentTab) {
      switchTab(hash, true);
    }
  });

  // 6. 초기 페이지 로드 시 해시 확인 및 탭 설정
  var initialHash = window.location.hash.replace('#', '');
  if (initialHash && tabMeta[initialHash]) {
    switchTab(initialHash, false);
  } else {
    switchTab('all', false);
  }
})();
