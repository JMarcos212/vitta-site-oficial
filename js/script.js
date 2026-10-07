'use strict';

// Links sem endereço confirmado: informar a pendência sem levar ao topo.
const notice = document.querySelector('#site-notice');
let noticeTimeout;

document.querySelectorAll('a[data-pending]').forEach((link) => {
  link.addEventListener('click', (event) => {
    // Um endereço real passa a funcionar assim que o href for atualizado.
    if (link.getAttribute('href') !== '#') return;
    event.preventDefault();
    if (!notice) return;
    window.clearTimeout(noticeTimeout);
    notice.textContent = link.dataset.pending;
    notice.classList.add('is-visible');
    noticeTimeout = window.setTimeout(() => {
      notice.classList.remove('is-visible');
      notice.textContent = '';
    }, 6000);
  });
});

// Fechar o menu móvel depois da seleção, preservando o foco da navegação.
const menu = document.querySelector('#menu-principal');
const menuToggle = document.querySelector('.navbar-toggler');

if (menu && menuToggle && window.bootstrap) {
  const collapse = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
  let focusAfterClose = null;

  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !menu.classList.contains('show')) return;
    const href = link.getAttribute('href');
    focusAfterClose = href?.startsWith('#') && href.length > 1
      ? document.querySelector(href)
      : menuToggle;
    collapse.hide();
  });

  menu.addEventListener('hidden.bs.collapse', () => {
    if (!focusAfterClose) return;
    const target = focusAfterClose;
    if (target !== menuToggle) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      // Recalcular a âncora após a redução da altura do cabeçalho móvel.
      target.scrollIntoView({ block: 'start' });
    }
    target.focus({ preventScroll: true });
    focusAfterClose = null;
  });

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('show')) {
      focusAfterClose = menuToggle;
      collapse.hide();
    }
  });
}

// Indicar a seção visível sem interferir no histórico ou nas âncoras nativas.
if ('IntersectionObserver' in window) {
  const navLinks = [...document.querySelectorAll('.navbar-nav .nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const visibleSections = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibleSections.set(entry.target.id, entry.isIntersecting));
    const current = sections.find((section) => visibleSections.get(section.id));
    navLinks.forEach((link) => {
      if (current && link.hash === `#${current.id}`) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}

// Expandir a demonstração do Painel Web sem substituir ou reiniciar o vídeo.
const panelFrame = document.querySelector('.panel-video-frame');
const panelFullscreenButton = panelFrame?.querySelector('.panel-fullscreen-button');

if (panelFrame && panelFullscreenButton) {
  const expandIcon = panelFullscreenButton.querySelector('.panel-fullscreen-icon--expand');
  const exitIcon = panelFullscreenButton.querySelector('.panel-fullscreen-icon--exit');
  const supportsFullscreen = document.fullscreenEnabled !== false
    && typeof panelFrame.requestFullscreen === 'function'
    && typeof document.exitFullscreen === 'function';

  const updatePanelFullscreenState = () => {
    const isPanelFullscreen = document.fullscreenElement === panelFrame;
    panelFullscreenButton.setAttribute('aria-pressed', String(isPanelFullscreen));
    panelFullscreenButton.setAttribute(
      'aria-label',
      isPanelFullscreen
        ? 'Sair da visualização em tela cheia'
        : 'Assistir demonstração do Painel Web em tela cheia'
    );
    if (expandIcon) expandIcon.hidden = isPanelFullscreen;
    if (exitIcon) exitIcon.hidden = !isPanelFullscreen;
  };

  if (supportsFullscreen) {
    panelFullscreenButton.hidden = false;
    updatePanelFullscreenState();

    panelFullscreenButton.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === panelFrame) {
          await document.exitFullscreen();
        } else if (!document.fullscreenElement) {
          await panelFrame.requestFullscreen();
        }
      } catch {
        updatePanelFullscreenState();
      }
    });

    document.addEventListener('fullscreenchange', updatePanelFullscreenState);
  }
}
