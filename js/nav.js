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
