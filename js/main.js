/* ══════════════════════════════════════════════════════════════════════
   QUEZADA · Landing Page V01 · comportamento
   Sem dependências. Rolagem nativa. O JS escreve classes e variáveis
   CSS, nunca `transform` direto (regra do design-system §6.4).
   ══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── Configuração ────────────────────────────────────────────────────── */
  const CONFIG = {
    whatsapp: '5511925483835',
    pixelId: '',          // ID do Meta Pixel. Vazio = nenhum cookie, nenhum banner.
    exitIntent: true,     // janela de saída (só desktop, 1x por sessão)
    exitDelayMs: 8000,    // não aparece antes disso
    quizPopupMs: 10000,   // popup do Raio-X: 10s depois de abrir a página (0 = desliga)
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => matchMedia('(min-width: 901px) and (hover: hover)').matches;
  const store = {
    get(k, s = localStorage) { try { return s.getItem(k); } catch { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, v); } catch { /* sem armazenamento */ } },
  };

  /* ── Medição ─────────────────────────────────────────────────────────── */
  const STANDARD = { Lead: 1, Contact: 1, ViewContent: 1 };
  function track(name, params = {}) {
    try {
      if (window.fbq) STANDARD[name] ? fbq('track', name, params) : fbq('trackCustom', name, params);
      (window.dataLayer = window.dataLayer || []).push({ event: name, ...params });
    } catch { /* medição nunca quebra a página */ }
  }

  /* ── Ângulo do anúncio (?angulo=) e referência de campanha ───────────── */
  const params = new URLSearchParams(location.search);
  const ANGLES = {
    consultoria: {
      t: ['Consultoria organiza a casa.', 'A Quezada organiza', '<em class="hl">e protege o que é seu.</em>'],
      s: 'Consultorias de gestão cuidam de processo e caixa. Nenhuma escreve o acordo com o seu sócio, revisa os seus contratos ou defende a sua empresa num processo. <strong>A Quezada entrega gestão e jurídico no mesmo time.</strong>',
    },
    dono: {
      t: ['Sua empresa vende.', 'Agora ela precisa crescer', '<em class="hl">sem depender de você.</em>'],
      s: 'Decisões com dono, limite e prazo. Regras claras entre os sócios. Contratos que funcionam no dia do conflito. <strong>Gestão e jurídico no mesmo time, para você sair do centro de tudo.</strong>',
    },
    socio: {
      t: ['Tudo combinado com o sócio', 'na confiança. <em class="hl">Até o dia</em>', '<em class="hl">em que a visão muda.</em>'],
      s: 'Regras para decisão, entrada, saída e impasse, escritas antes de precisar. E o alinhamento entre as pessoas para que elas funcionem. <strong>Estrutura e jurídico no mesmo time.</strong>',
    },
    contrato: {
      t: ['O contrato que você baixou', 'funciona. <em class="hl">Até o dia</em>', '<em class="hl">em que precisa dele.</em>'],
      s: 'Um padrão de contrato seu, feito para o seu setor e revisado antes de você assinar. <strong>E, se o problema chegar, o mesmo time que já conhece a sua empresa cuida da defesa.</strong>',
    },
    trabalhista: {
      t: ['A equipe cresceu.', 'A proteção trabalhista', '<em class="hl">cresceu junto?</em>'],
      s: 'Riscos mapeados, contratos e políticas em dia, rescisões revisadas: custo previsível no lugar do medo. <strong>Gestão e jurídico no mesmo time.</strong>',
    },
    bombeiro: {
      t: ['Você virou o bombeiro', 'da sua própria empresa.', '<em class="hl">Dá para sair disso.</em>'],
      s: 'Decisões com dono, limite e prazo. Regras entre sócios e contratos que evitam o incêndio antes de ele começar. <strong>Gestão e jurídico no mesmo time, para você sair do operacional.</strong>',
    },
    cobranca: {
      t: ['Você entrega, fatura.', 'E o dinheiro', '<em class="hl">não entra?</em>'],
      s: 'Contratos que facilitam cobrar, régua de cobrança, protesto e execução funcionando. <strong>Sua empresa deixa de ser o banco do cliente.</strong>',
    },
  };
  function initAngle() {
    const a = ANGLES[(params.get('angulo') || '').toLowerCase()];
    if (!a) return;
    a.t.forEach((html, i) => { const el = $(`.hero__title [data-hero="${i + 1}"]`); if (el) el.innerHTML = html; });
    const sub = $('[data-angle-sub]'); if (sub) sub.innerHTML = a.s;
  }
  const ref = [params.get('utm_campaign'), params.get('utm_content')].filter(Boolean).join(' / ');

  /* ── WhatsApp ────────────────────────────────────────────────────────── */
  const waUrl = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(ref ? `${msg}\n\n(ref.: ${ref})` : msg)}`;
  function initWhatsApp() {
    $$('[data-wa]').forEach((a) => { a.href = waUrl(a.dataset.wa); });
    document.addEventListener('click', (e) => {
      const wa = e.target.closest('a[href*="wa.me"]');
      if (wa) { track('Contact', { origem: wa.dataset.track || 'whatsapp', item: wa.dataset.label || '' }); store.set('qz-wa', '1', sessionStorage); return; }
      const t = e.target.closest('[data-track]');
      if (t) track('cta_click', { origem: t.dataset.track });
    });
  }

  /* ── Hero: entrada + contadores ──────────────────────────────────────── */
  function initHero() {
    const hero = $('.hero');
    const start = () => {
      document.body.classList.add('is-loaded');
      setTimeout(() => hero && hero.classList.add('is-settled'), 2400);
      setTimeout(() => countUp($$('.proofbar [data-count]')), 1300);
    };
    const img = $('.hero__media img');
    if (img && !img.complete) {
      let done = false;
      const go = () => { if (!done) { done = true; start(); } };
      img.addEventListener('load', go, { once: true });
      img.addEventListener('error', go, { once: true });
      setTimeout(go, 900); // nunca segurar o texto por causa da foto
    } else start();
  }
  function countUp(els) {
    els.forEach((el) => {
      const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      if (reduced) { el.textContent = pre + to + suf; return; }
      const t0 = performance.now(), dur = 1400;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(to * e) + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ── Cabeçalho, barra fixa ───────────────────────────────────────────── */
  function initChrome() {
    const header = $('[data-header]');
    const dock = $('[data-dock]');
    const hero = $('.hero'), final = $('#contato'), footer = $('.footer');
    let pastHero = false, atEnd = false;
    const sync = () => dock && dock.classList.toggle('is-on', pastHero && !atEnd);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; sync(); }, { rootMargin: '-40% 0px 0px 0px' }).observe(hero);
      const endObs = new IntersectionObserver((ens) => { atEnd = ens.some((x) => x.isIntersecting); sync(); }, { threshold: 0.15 });
      [final, footer].forEach((el) => el && endObs.observe(el));
    }
    const onScroll = () => header.classList.toggle('is-solid', scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Revelações ──────────────────────────────────────────────────────── */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); onCompare(); onPhone(); return; }
    const io = new IntersectionObserver((ens) => {
      ens.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));

    // gatilhos especiais
    once($('[data-compare]'), onCompare, 0.35);
    once($('[data-phone]'), onPhone, 0.35);
    $$('.btn--gold').forEach((b) => once(b, () => shine(b), 0.9));
  }
  function once(el, fn, threshold = 0.3) {
    if (!el) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { fn(); io.disconnect(); } }, { threshold });
    io.observe(el);
  }
  function shine(b) {
    b.classList.add('is-shine');
    setTimeout(() => b.classList.remove('is-shine'), 1200);
  }
  function onCompare() { const c = $('[data-compare]'); c && setTimeout(() => c.classList.add('is-struck'), reduced ? 0 : 500); }

  /* Celular: notificações chegando uma a uma, contador subindo */
  function onPhone() {
    const phone = $('[data-phone]'); if (!phone) return;
    const items = $$('.phone__list li', phone), badge = $('[data-badge]', phone);
    items.forEach((li, i) => { li.style.transitionDelay = reduced ? '0s' : `${0.25 + i * 0.42}s`; });
    phone.classList.add('is-live');
    if (!badge) return;
    if (reduced) { badge.textContent = '47'; return; }
    const total = 47, t0 = performance.now(), dur = 0.25e3 + items.length * 420 + 600;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      badge.textContent = Math.round(total * (1 - Math.pow(1 - k, 2)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── Efeitos conduzidos pela rolagem (um único rAF) ──────────────────── */
  function initScrollFx() {
    if (reduced) { $$('.step').forEach((s) => s.classList.add('is-on')); const f = $('[data-steps-fill]'); f && f.style.setProperty('--p', 1); return; }
    const heroMedia = $('[data-parallax]');
    const duoImg = $('[data-parallax-inner]');
    const steps = $('[data-steps]'), fill = $('[data-steps-fill]'), stepEls = $$('.step');
    const wm = $('.watermark--final');
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = innerHeight;
      if (heroMedia && isDesktop() && scrollY < vh * 1.2) {
        heroMedia.style.setProperty('--py', `${(scrollY * +heroMedia.dataset.parallax).toFixed(1)}px`);
      }
      if (duoImg) {
        const r = duoImg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const k = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
          duoImg.style.setProperty('--py', `${(k * -40).toFixed(1)}px`);
        }
      }
      if (steps && fill) {
        const r = steps.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.62 - r.top) / (r.height - 40)));
        fill.style.setProperty('--p', p.toFixed(3));
        stepEls.forEach((s) => s.classList.toggle('is-on', s.getBoundingClientRect().top < vh * 0.62));
      }
      if (wm) {
        const r = wm.parentElement.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) wm.style.setProperty('--rot', `${((vh - r.top) / (vh + r.height) * 14 - 7).toFixed(2)}deg`);
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ── Antes / depois ──────────────────────────────────────────────────── */
  function initCompareSlider() {
    const ba = $('[data-ba]'); if (!ba) return;
    const range = $('.ba__range', ba);
    let touched = false;
    const set = (v) => ba.style.setProperty('--pos', `${v}%`);
    range.addEventListener('input', () => { touched = true; set(range.value); });
    range.addEventListener('pointerdown', () => { touched = true; ba.classList.add('is-dragging'); });
    addEventListener('pointerup', () => ba.classList.remove('is-dragging'));
    range.addEventListener('change', () => track('antes_depois', { pos: range.value }));

    // dica de uso: a régua passeia uma vez quando aparece
    if (reduced) return;
    once(ba, () => {
      const keys = [50, 24, 76, 50], seg = 800;
      const t0 = performance.now() + 500;
      const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      const step = (now) => {
        if (touched) return;
        const t = Math.max(0, now - t0), i = Math.min(keys.length - 2, Math.floor(t / seg));
        const k = Math.min(1, (t - i * seg) / seg);
        const v = keys[i] + (keys[i + 1] - keys[i]) * ease(k);
        set(v); range.value = v;
        if (t < seg * (keys.length - 1)) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0.55);
  }

  /* ── Abas das frentes (celular) ──────────────────────────────────────── */
  function initTabs() {
    const tabs = $('[data-tabs]'); if (!tabs) return;
    const btns = $$('[data-tab]', tabs);
    const activate = (btn, focus) => {
      btns.forEach((b, i) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
        if (on) tabs.style.setProperty('--i', i);
        const panel = $(`[data-panel="${b.dataset.tab}"]`);
        panel.classList.toggle('is-active', on);
        if (on) $$('[data-reveal]', panel).forEach((el) => el.classList.add('is-in'));
      });
      if (focus) btn.focus();
      track('aba_frente', { frente: btn.dataset.tab });
    };
    btns.forEach((b) => b.addEventListener('click', () => activate(b)));
    tabs.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const i = btns.findIndex((b) => b.classList.contains('is-active'));
      activate(btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length], true);
    });
  }

  /* ── FAQ ─────────────────────────────────────────────────────────────── */
  function initFaq() {
    const items = $$('.faq__item');
    items.forEach((it) => {
      const btn = $('button', it);
      btn.addEventListener('click', () => {
        const open = !it.classList.contains('is-open');
        items.forEach((o) => { o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false'); });
        if (open) { it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); track('faq', { pergunta: btn.textContent.trim().slice(0, 60) }); }
      });
    });
  }

  /* ── Modais (vídeo e saída) ──────────────────────────────────────────── */
  function modal(root, closeSel, onClose) {
    let last = null;
    const open = () => {
      last = document.activeElement;
      root.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
      const x = $('.exit__x', root); x && x.focus({ preventScroll: true });
      document.addEventListener('keydown', esc);
    };
    const close = () => {
      root.classList.remove('is-open');
      document.removeEventListener('keydown', esc);
      onClose && onClose();
      setTimeout(() => { root.hidden = true; last && last.focus({ preventScroll: true }); }, 420);
    };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    $$(closeSel, root).forEach((b) => b.addEventListener('click', close));
    return { open, close };
  }
  function initVideo() {
    const root = $('[data-vmodal]'); if (!root) return;
    const video = $('[data-vmodal-video]', root);
    const m = modal(root, '[data-vmodal-close]', () => video.pause());
    $$('[data-video]').forEach((b) => b.addEventListener('click', () => {
      m.open();
      video.play().catch(() => {});
      track('ViewContent', { content_name: 'video_como_ajudamos' });
    }));
    video.addEventListener('ended', () => track('video_fim'));
  }
  function initExit() {
    const root = $('[data-exit]');
    if (!root || !CONFIG.exitIntent) return;
    const m = modal(root, '[data-exit-close]');
    const t0 = Date.now();
    document.addEventListener('mouseout', (e) => {
      if (e.relatedTarget || e.clientY > 8 || !isDesktop()) return;
      if (Date.now() - t0 < CONFIG.exitDelayMs) return;
      if (store.get('qz-exit', sessionStorage) || store.get('qz-wa', sessionStorage) || store.get('qz-pop', sessionStorage)) return;
      store.set('qz-exit', '1', sessionStorage);
      m.open();
      track('janela_saida');
    });
  }

  /* ── Popup do Raio-X: "Cansado de…" ─────────────────────────────────
     Aparece 1x por sessão, depois de CONFIG.quizPopupMs. Não aparece para
     quem já começou o Raio-X ou clicou no WhatsApp; espera se outro modal
     estiver aberto ou se o Raio-X já estiver na tela.                    */
  function initQuizPopup() {
    const root = $('[data-qpop]');
    if (!root || !CONFIG.quizPopupMs) return;
    // Máquina de escrever: digita → segura → apaga letra a letra → próxima frase.
    const rot = $('.qpop__rot', root);
    const phrases = (rot.dataset.phrases || '').split('|').map((t) => t.trim()).filter(Boolean);
    const out = $('[data-type-text]', rot), type = $('.qpop__type', rot);
    $('.qpop__sizer', rot).textContent = phrases.reduce((a, b) => (b.length > a.length ? b : a), '');
    const TYPE = 58, ERASE = 26, HOLD = 1700, GAP = 380;
    let timer = null, running = false;
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
    const rotate = async () => {
      if (running || phrases.length < 2) return;
      running = true;
      let i = 0;
      out.textContent = phrases[0];
      await wait(HOLD);
      while (running) {
        if (reduced) { i = (i + 1) % phrases.length; out.textContent = phrases[i]; await wait(2600); continue; }
        type.classList.add('is-typing');
        for (let n = out.textContent.length; n >= 0 && running; n--) { out.textContent = phrases[i].slice(0, n); await wait(ERASE); }
        i = (i + 1) % phrases.length;
        await wait(GAP);
        for (let n = 1; n <= phrases[i].length && running; n++) {
          out.textContent = phrases[i].slice(0, n);
          await wait(TYPE + Math.random() * 40); // ritmo levemente irregular, como alguém digitando
        }
        type.classList.remove('is-typing');
        await wait(HOLD);
      }
    };
    const m = modal(root, '[data-qpop-close]', () => { running = false; clearTimeout(timer); type.classList.remove('is-typing'); });
    $$('[data-qpop-close]', root).forEach((b) => b.addEventListener('click', () => track('popup_raiox_fechado')));
    const quizInView = () => { const r = $('#raio-x').getBoundingClientRect(); return r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; };
    const tryOpen = () => {
      if (quizStarted || store.get('qz-pop', sessionStorage) || store.get('qz-wa', sessionStorage) || store.get('qz-exit', sessionStorage)) return;
      if ($('.exit.is-open, .vmodal.is-open') || quizInView()) { setTimeout(tryOpen, 6000); return; }
      store.set('qz-pop', '1', sessionStorage);
      m.open();
      rotate();
      track('popup_raiox_exibido');
    };
    setTimeout(tryOpen, CONFIG.quizPopupMs);
    $('[data-qpop-go]', root).addEventListener('click', () => {
      track('popup_raiox_clique');
      m.close();
      setTimeout(() => {
        $('#raio-x').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        setTimeout(() => { const o = $('.q__opt'); o && o.focus({ preventScroll: true }); }, reduced ? 0 : 900);
      }, 180);
    });
  }

  /* ── Consentimento + Meta Pixel ──────────────────────────────────────── */
  function loadPixel() {
    if (!CONFIG.pixelId || window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', CONFIG.pixelId);
    fbq('track', 'PageView');
  }
  function initConsent() {
    if (!CONFIG.pixelId) return;
    const choice = store.get('qz-consent');
    if (choice === 'yes') return loadPixel();
    if (choice === 'no') return;
    const bar = $('[data-consent]'); if (!bar) return;
    bar.hidden = false;
    $('[data-consent-yes]', bar).addEventListener('click', () => { store.set('qz-consent', 'yes'); bar.hidden = true; loadPixel(); });
    $('[data-consent-no]', bar).addEventListener('click', () => { store.set('qz-consent', 'no'); bar.hidden = true; });
  }

  /* ══ RAIO-X ═══════════════════════════════════════════════════════════
     Nada é salvo. As respostas só montam a mensagem do WhatsApp.
     Pesos por área → maior exposição normalizada vence; empate → a
     preocupação declarada na última pergunta.                           */
  let quizStarted = false; // o popup do Raio-X não interrompe quem já começou
  const QUIZ = [
    { id: 'equipe', label: 'Equipe', q: 'Quantas pessoas trabalham na sua empresa hoje?',
      opts: [['so', 'Só eu'], ['2-5', '2 a 5'], ['6-29', '6 a 29'], ['30+', '30 ou mais']] },
    { id: 'fat', label: 'Faturamento', q: 'Qual o faturamento mensal aproximado?',
      opts: [['ate50', 'Até R$ 50 mil'], ['50-100', 'R$ 50 a 100 mil'], ['100-300', 'R$ 100 a 300 mil'], ['300+', 'Acima de R$ 300 mil']] },
    { id: 'socio', label: 'Sócios', q: 'Você tem sócio?',
      opts: [['nao', 'Não tenho sócio'], ['escrito', 'Sim, com acordo escrito'], ['boca', 'Sim, combinado de boca', { sociedade: 3 }], ['diverge', 'Sim, e já estamos divergindo', { sociedade: 5 }]] },
    { id: 'contratos', label: 'Contratos', q: 'Os contratos com os seus clientes são…',
      opts: [['proprio', 'Feitos e revisados por advogado'], ['internet', 'Um modelo da internet', { contratos: 3, credito: 1 }], ['nenhum', 'Não usamos contrato', { contratos: 4, credito: 2 }], ['antigo', 'Usamos um modelo antigo', { contratos: 2, credito: 1 }], ['nsei', 'Não sei dizer', { contratos: 2 }, true]] },
    { id: 'trab', label: 'Trabalhista', q: 'A documentação trabalhista (contratos, responsabilidades, jornada, rescisões) está…',
      opts: [['ok', 'Em dia e revisada'], ['mais', 'Mais ou menos', { trabalhista: 2 }], ['desat', 'Desatualizada', { trabalhista: 3 }], ['ja', 'Já tivemos reclamação trabalhista', { trabalhista: 4 }], ['naotem', 'Não temos', { trabalhista: 5 }, true]] },
    { id: 'ausencia', label: 'Se eu sumir 15 dias', q: 'Se você sumir por 15 dias, a empresa…',
      opts: [['roda', 'Roda normalmente'], ['acumula', 'Segura, mas acumula decisões', { decisoes: 3 }], ['para', 'Para', { decisoes: 5 }, true]] },
    // Pergunta de momento (gatilhos de compra da pesquisa, PESQUISA §3.2 e QUEZADA.md §5.6)
    { id: 'momento', label: 'Momento atual', q: 'Algum destes momentos está acontecendo na sua empresa?',
      opts: [['socio', 'Entrada ou saída de sócio', { sociedade: 3 }], ['cresc', 'Crescendo e contratando rápido', { decisoes: 2, trabalhista: 1 }], ['venda', 'Pensando em vender ou receber investimento', { contratos: 1, sociedade: 1, patrimonio: 2 }], ['familia', 'Passando a empresa para a família', { sucessao: 3 }], ['nada', 'Nenhum destes agora', null, true]] },
    { id: 'dor', label: 'Maior preocupação', q: 'O que mais tira o seu sono hoje?',
      opts: [['socio', 'Sócio', { sociedade: 3 }], ['trab', 'Trabalhista', { trabalhista: 3 }], ['credito', 'Cliente que não paga', { credito: 4 }], ['dono', 'Tudo depende de mim', { decisoes: 3 }], ['familia', 'Família e sucessão', { sucessao: 5 }], ['patrimonio', 'Proteger meu patrimônio pessoal', { patrimonio: 4 }], ['processo', 'Já tenho um processo ou notificação', { urgente: 1 }, true]] },
  ];
  // Máximo possível por área (para normalizar: áreas com mais perguntas não vencem só por somar mais).
  const MAX = { sociedade: 11, contratos: 5, trabalhista: 9, credito: 6, decisoes: 10, sucessao: 8, patrimonio: 6 };
  const PREF = { socio: 'sociedade', trab: 'trabalhista', credito: 'credito', dono: 'decisoes', familia: 'sucessao', patrimonio: 'patrimonio' };
  const AREAS = {
    sociedade: { name: 'Sociedade', text: 'As regras entre os sócios ainda dependem da boa vontade de cada um. Enquanto todos concordam, funciona. No dia em que a visão muda, quem decide vira o mais teimoso.', next: 'acordo de sócios e regras de decisão, com o alinhamento entre as pessoas.' },
    contratos: { name: 'Contratos', text: 'Seus contratos só vão ser testados no dia do conflito, e modelo genérico ou antigo costuma falhar exatamente aí. É também o que dificulta cobrar quem não paga.', next: 'um padrão de contrato próprio e a revisão da carteira atual.' },
    trabalhista: { name: 'Trabalhista', text: 'Documentação incompleta ou desatualizada é um risco que fica aberto todos os dias. Ele só aparece como reclamação e pode custar o resultado de um ano.', next: 'o mapa dos riscos trabalhistas e a adequação de contratos, responsabilidades, políticas e rescisões.' },
    credito: { name: 'Crédito e cobrança', text: 'Sua empresa está financiando o cliente. Sem contrato firme e régua de cobrança, o recebível encalha e o caixa aperta.', next: 'régua de cobrança, protesto e execução, com contratos que facilitam cobrar.' },
    decisoes: { name: 'Dependência do dono', text: 'A empresa cresceu, mas as decisões seguem o mesmo caminho de quando vocês eram poucos: todas passam por você. Esse é o teto do crescimento.', next: 'papéis, limites de decisão e processos essenciais, do tamanho da sua empresa.' },
    sucessao: { name: 'Sucessão', text: 'Sem regras para a entrada da família e a passagem do bastão, o herdeiro recebe uma briga, não um negócio.', next: 'protocolo familiar e roteiro de sucessão, antes de virar urgência.' },
    patrimonio: { name: 'Patrimônio pessoal', text: 'Quando o que é da empresa e o que é seu não estão bem separados, uma dívida da empresa pode chegar à sua casa e à sua conta pessoal.', next: 'separar o que é da empresa do que é seu, com a proteção preventiva adequada ao seu momento.' },
  };

  function initQuiz() {
    const root = $('[data-quiz]'); if (!root) return;
    const stage = $('[data-quiz-stage]', root), bar = $('[data-quiz-bar]', root);
    const count = $('[data-quiz-count]', root), back = $('[data-quiz-back]', root);
    const answers = {};
    let idx = 0, started = false, busy = false;

    const swap = (html, after) => {
      const old = $('.q, .result', stage);
      const put = () => {
        stage.innerHTML = html;
        const neu = stage.firstElementChild;
        if (!reduced) { neu.classList.add('is-enter'); requestAnimationFrame(() => requestAnimationFrame(() => neu.classList.remove('is-enter'))); }
        after && after(neu);
        busy = false;
      };
      if (old && !reduced) { old.classList.add('is-out'); setTimeout(put, 280); } else put();
    };

    const render = () => {
      const Q = QUIZ[idx];
      bar.style.setProperty('--p', ((idx + 1) / (QUIZ.length + 1)).toFixed(3));
      count.hidden = false;
      count.textContent = `Pergunta ${idx + 1} de ${QUIZ.length}`;
      back.hidden = idx === 0;
      const opts = Q.opts.map(([v, txt, , wide]) =>
        `<button type="button" class="q__opt${wide ? ' q__opt--wide' : ''}" data-v="${v}" aria-pressed="${answers[Q.id] === v}">${txt}</button>`).join('');
      swap(`<div class="q"><h3 class="q__title" tabindex="-1">${Q.q}</h3><div class="q__opts" role="group" aria-label="${Q.q}">${opts}</div></div>`,
        (el) => { if (started) $('.q__title', el).focus({ preventScroll: true }); });
    };

    stage.addEventListener('click', (e) => {
      const b = e.target.closest('.q__opt'); if (!b || busy) return;
      busy = true;
      const Q = QUIZ[idx];
      answers[Q.id] = b.dataset.v;
      $$('.q__opt', stage).forEach((o) => o.setAttribute('aria-pressed', o === b));
      if (!started) { started = true; quizStarted = true; track('quiz_inicio'); }
      track('quiz_passo', { pergunta: Q.id, resposta: b.dataset.v });
      setTimeout(() => { if (idx < QUIZ.length - 1) { idx++; render(); } else result(); }, reduced ? 0 : 260);
    });
    back.addEventListener('click', () => { if (busy || idx === 0) return; busy = true; idx--; render(); });

    const labelOf = (Q, v) => (Q.opts.find((o) => o[0] === v) || [, 'não respondido'])[1];

    function result() {
      const score = { sociedade: 0, contratos: 0, trabalhista: 0, credito: 0, decisoes: 0, sucessao: 0, patrimonio: 0 };
      let urgente = false;
      QUIZ.forEach((Q) => {
        const o = Q.opts.find((x) => x[0] === answers[Q.id]);
        if (!o || !o[2]) return;
        Object.entries(o[2]).forEach(([k, n]) => { if (k === 'urgente') urgente = true; else score[k] += n; });
      });
      const norm = Object.fromEntries(Object.entries(score).map(([k, n]) => [k, n / MAX[k]]));
      const pref = PREF[answers.dor];
      let top = Object.keys(norm).sort((a, b) => norm[b] - norm[a] || (b === pref) - (a === pref))[0];
      const clean = Object.values(score).every((n) => n === 0);

      const summary = QUIZ.map((Q) => `• ${Q.label}: ${labelOf(Q, answers[Q.id])}`).join('\n');
      let title, text, next, cta, msgLine;
      if (urgente) {
        title = 'O processo que já chegou';
        text = 'Quando já existe processo ou notificação, o primeiro passo é entender prazo e risco, antes de qualquer outra coisa.';
        next = 'Fale agora com um especialista. Depois de resolver o urgente, olhamos o resto da estrutura.';
        cta = 'Falar agora com um especialista';
        msgLine = 'Resultado: tenho um processo/notificação em andamento e preciso de orientação.';
      } else if (clean) {
        title = 'Bom sinal';
        text = 'Pelas suas respostas, não há uma exposição evidente. Isso é raro, e vale confirmar com um olhar de fora antes do próximo salto de crescimento.';
        next = 'O Diagnóstico Inicial confirma o que está sólido e aponta o que ainda não aparece.';
        cta = 'Conversar sobre o meu resultado';
        msgLine = 'Resultado: nenhuma exposição evidente. Quero confirmar com um diagnóstico.';
      } else {
        const A = AREAS[top];
        title = A.name; text = A.text;
        next = `O primeiro passo costuma ser <strong>${A.next}</strong>`;
        cta = 'Conversar sobre o meu resultado';
        msgLine = `Resultado: meu ponto mais exposto é ${A.name.toUpperCase()}. Quero entender o próximo passo.`;
      }
      const soft = answers.equipe === 'so'
        ? '<p class="result__soft">Pelo porte informado, um plano mensal talvez ainda não se pague, e a gente diz isso na conversa. Vale conversar se houver sócio, contratos recorrentes ou um problema específico.</p>' : '';
      const meters = Object.keys(AREAS).sort((a, b) => norm[b] - norm[a]).map((k) =>
        `<li class="${k === top && !urgente && !clean ? 'is-top' : ''}"><span>${AREAS[k].name}</span><i style="--v:${Math.max(0.04, norm[k]).toFixed(2)}"></i></li>`).join('');
      const msg = `Olá! Fiz o Raio-X Quezada no site.\n${summary}\n\n${msgLine}`;

      bar.style.setProperty('--p', 1);
      count.hidden = true; // o resultado já tem o próprio rótulo
      back.hidden = true;
      swap(`<div class="result">
          <p class="result__kicker">${urgente ? 'Prioridade agora' : clean ? 'Seu Raio-X' : 'Seu ponto mais exposto hoje'}</p>
          <p class="result__area" tabindex="-1">${title}</p>
          <p class="result__text">${text}</p>
          ${urgente || clean ? '' : `<ul class="result__meters" aria-label="Exposição por área">${meters}</ul>`}
          <p class="result__next">${next}</p>
          ${soft}
          <div class="result__actions">
            <a class="btn btn--gold btn--lg" href="${waUrl(msg)}" target="_blank" rel="noopener" data-track="quiz_whatsapp" data-label="${urgente ? 'urgente' : top}"><span>${cta}</span><svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <button type="button" class="result__redo" data-redo>Refazer o Raio-X</button>
          </div>
        </div>`, (el) => {
        requestAnimationFrame(() => el.classList.add('is-shown'));
        $('.result__area', el).focus({ preventScroll: true });
        shine($('.btn--gold', el));
        $('[data-redo]', el).addEventListener('click', () => { Object.keys(answers).forEach((k) => delete answers[k]); idx = 0; busy = true; render(); });
      });
      track('Lead', { content_name: 'raio_x', area: urgente ? 'urgente' : clean ? 'sem_exposicao' : top, equipe: answers.equipe, faturamento: answers.fat });
    }

    render();
  }

  /* ── Início ──────────────────────────────────────────────────────────── */
  const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
  initAngle();
  initWhatsApp();
  initHero();
  initChrome();
  initReveal();
  initScrollFx();
  initCompareSlider();
  initTabs();
  initFaq();
  initVideo();
  initExit();
  initConsent();
  initQuiz();
  initQuizPopup();
})();
