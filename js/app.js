/* ============ The Business Table — interactions ============ */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- shared: nav, progress bar, reveal ---------- */
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  const menuBtn = $('.menu-btn'), menu = $('#menu');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    menu.addEventListener('click', e => { if (e.target.matches('a')) { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });
  }
  const bar = $('#progress');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + '%';
  }, { passive: true });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // highlight current section in nav
  const links = $$('.nav a.link[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => { const t = $(l.getAttribute('href')); if (t) so.observe(t); });
  }

  /* ---------- confetti ---------- */
  function confetti() {
    if (reduceMotion) return;
    const c = $('#confetti'); if (!c) return;
    const ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const cols = ['#c9a24b', '#7a1f33', '#1f6b50', '#f1e3bb', '#ffffff'];
    const ps = Array.from({ length: 140 }, () => ({
      x: Math.random() * c.width, y: -20 - Math.random() * c.height * .4,
      r: 4 + Math.random() * 6, vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4,
      col: cols[Math.floor(Math.random() * cols.length)], rot: Math.random() * 6
    }));
    let t = 0;
    (function frame() {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.rot += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
      if (++t < 160) requestAnimationFrame(frame); else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }

  /* ---------- 1) interactive place setting ---------- */
  const ITEMS = [
    { n: 1, x: 142, y: 300, name: 'Napkin', tags: ['Left side', 'Cloth or paper'],
      text: 'Wait until your host unfolds theirs, then place yours on your lap. It is for dabbing your mouth and fingers — never for wiping your face or blowing your nose. If you step away briefly, leave it on your chair; when the meal ends, set it loosely to the left of your plate.',
      c: 'At the banquet, the napkin is unfolded over the knees and used only to clean the lips.', ref: 'Carreño, “De los banquetes”, §11' },
    { n: 2, x: 222, y: 236, name: 'Salad fork (outer fork)', tags: ['Far left', 'First course'],
      text: 'The fork farthest from the plate is for the first course. You always work from the outside in, so every course has its own tool waiting in the right order.',
      c: 'Each utensil has its own way of being handled; mistakes here are small but reveal how well-mannered a person is.', ref: 'Carreño, “De la mesa”, A §12' },
    { n: 3, x: 268, y: 244, name: 'Dinner fork', tags: ['Left of plate', 'Main course'],
      text: 'This sturdier fork is for the main dish. When you pause, rest your knife and fork on the plate with the handles over the rim; when you finish, place them together on the plate so the server knows you are done.',
      c: 'Utensils you set down go on the plate with the handle on the edge; when done, fork and knife lie together with the handles toward you.', ref: 'Carreño, “De la mesa”, A §38–39' },
    { n: 4, x: 410, y: 300, name: 'Plate (and charger)', tags: ['Center', 'Stays put'],
      text: 'The large decorative charger under your plate is usually removed after the first course. Put salt, butter or sauce on the plate itself, not on the table, and eat at a pace that matches the group.',
      c: 'Do not use the rim of the plate for anything; keep salt, butter and sauce inside the plate.', ref: 'Carreño, “De la mesa”, A §37' },
    { n: 5, x: 552, y: 268, name: 'Dinner knife', tags: ['Right of plate', 'Blade inward'],
      text: 'The cutting edge faces the plate. Use the knife only to cut or spread, and once you have used it, never let it touch the table again. It never goes in your mouth.',
      c: 'The knife is only for dividing and serving solid food with the fork — never bring it to the mouth.', ref: 'Carreño, “De la mesa”, A §22' },
    { n: 6, x: 618, y: 270, name: 'Spoons (soup + tea)', tags: ['Far right', 'Outside → in'],
      text: 'The outermost spoon is for soup. Scoop away from yourself, sip from the side of the spoon quietly, and do not blow on hot food — let it cool.',
      c: 'Spoons are for liquids; sip soup quietly instead of slurping, and avoid blowing on hot dishes.', ref: 'Carreño, “De la mesa”, A §21, 33–34' },
    { n: 7, x: 170, y: 120, name: 'Bread plate + butter knife', tags: ['Upper left', 'B in BMW'],
      text: 'Your bread plate is on your LEFT. Tear off one bite-sized piece at a time, butter just that piece over your plate, and eat it. Do not cut bread with a knife or butter the whole roll at once.',
      c: 'Bread sits at the left; break it by hand, a mouthful at a time, over your plate, without cutting it.', ref: 'Carreño, “De la mesa”, A §25–28' },
    { n: 8, x: 560, y: 92, name: 'Water glass', tags: ['Upper right', 'W in BMW'],
      text: 'Water and any other drink glasses live on your RIGHT. Dab your lips before you sip so you do not leave marks, and avoid drinking while your mouth is full.',
      c: 'Glasses always stay on the right-hand side; wipe your lips before and after drinking.', ref: 'Carreño, “De la mesa”, A §25, 41–42' },
    { n: 9, x: 662, y: 132, name: 'Wine glass', tags: ['Upper right', 'Optional'],
      text: 'It is perfectly fine to decline alcohol at a business meal. If you do drink, keep it to a small amount — you need a clear head more than a glass of wine.',
      c: 'Moderation is the natural regulator of the pleasures of the table. Never be pushed to drink more than you wish.', ref: 'Carreño, “De los banquetes”, §26–27' },
    { n: 10, x: 425, y: 142, name: 'Dessert fork + spoon', tags: ['Above plate', 'Last course'],
      text: 'Utensils above the plate are for dessert and arrive last. Bring them down to the table when the dessert comes. Take your cue from the host: when they finish, the meal is winding down.',
      c: 'After dessert, the host stands and everyone moves on together to coffee.', ref: 'Carreño, “De los banquetes”, §30' }
  ];
  const hs = $('#hotspots'), panel = $('#infoPanel');
  if (hs) {
    const NS = 'http://www.w3.org/2000/svg';
    ITEMS.forEach(it => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'hot'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${it.n}. ${it.name}`);
      g.innerHTML = `<circle class="ring" cx="${it.x}" cy="${it.y}" r="14"/><circle class="pulse" cx="${it.x}" cy="${it.y}" r="16"/><text x="${it.x}" y="${it.y + 5}" text-anchor="middle">${it.n}</text>`;
      const show = () => {
        $$('.hot', hs).forEach(h => h.classList.remove('sel')); g.classList.add('sel');
        panel.innerHTML = `<div class="fade-swap"><h3>${it.n}. ${it.name}</h3>${it.tags.map(t => `<span class="tag">${t}</span>`).join('')}<p>${it.text}</p><blockquote>${it.c}<cite>${it.ref}</cite></blockquote></div>`;
      };
      g.addEventListener('click', show);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
      hs.appendChild(g);
    });
  }

  /* ---------- 2) tabs + checklists ---------- */
  const tabs = $$('.tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    $$('.tabpanel').forEach(p => p.classList.toggle('active', p.id === t.getAttribute('aria-controls')));
  }));
  $$('.checklist li').forEach(li => {
    const flip = () => li.classList.toggle('done');
    li.addEventListener('click', flip);
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });

  /* ---------- games bookkeeping ---------- */
  const done = new Set();
  function completed(id) {
    if (done.has(id)) return;
    done.add(id); confetti();
    const c = $('#badgeCount'); if (c) c.textContent = done.size;
    if (done.size === 4) { $('#badgeText').innerHTML = '🎉 <strong>You did it!</strong> You are officially Dinner-Ready. Now take the <a href="survey.html">short survey</a> and tell me how it went.'; confetti(); setTimeout(confetti, 700); }
  }

  /* ---------- game 1: set the table ---------- */
  const PIECES = [
    { id: 'fork', label: 'Dinner fork', icon: '🍴' }, { id: 'knife', label: 'Knife', icon: '🔪' },
    { id: 'spoon', label: 'Soup spoon', icon: '🥄' }, { id: 'bread', label: 'Bread plate', icon: '🍞' },
    { id: 'glass', label: 'Water glass', icon: '🥛' }, { id: 'napkin', label: 'Napkin', icon: '🧻' },
    { id: 'dessert', label: 'Dessert fork', icon: '🍰' }
  ];
  const board = $('#board');
  if (board) {
    const tray = $('#tray'), fb = $('#g1fb'), sc = $('#g1score');
    let selected = null, placed = 0;
    const setFb = (m, ok) => { fb.textContent = m; fb.className = 'feedback ' + (ok ? 'ok' : 'no'); };
    function reset() {
      placed = 0; selected = null; sc.textContent = '0 / 7 placed'; fb.textContent = '';
      $$('.slot[data-accept]', board).forEach(s => { s.classList.remove('filled', 'wrong', 'over'); s.innerHTML = s.dataset.orig; });
      tray.innerHTML = '';
      shuffle(PIECES).forEach(p => {
        const c = document.createElement('button');
        c.type = 'button'; c.className = 'chip'; c.draggable = true; c.dataset.id = p.id;
        c.innerHTML = `<span aria-hidden="true">${p.icon}</span>${p.label}`;
        c.addEventListener('click', () => { selected = selected === c ? null : c; $$('.chip', tray).forEach(x => x.classList.toggle('sel', x === selected)); });
        c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', p.id); c.classList.add('dragging'); selected = c; });
        c.addEventListener('dragend', () => c.classList.remove('dragging'));
        tray.appendChild(c);
      });
    }
    function attempt(slot, chip) {
      if (!chip || slot.classList.contains('filled')) return;
      const p = PIECES.find(x => x.id === chip.dataset.id);
      if (slot.dataset.accept === p.id) {
        slot.classList.add('filled'); slot.innerHTML = `<span><span class="big">${p.icon}</span>${p.label}</span>`;
        chip.remove(); selected = null; placed++; sc.textContent = `${placed} / 7 placed`;
        setFb(['Nice!', 'Exactly right.', 'Well placed.', 'Correct!'][placed % 4], true);
        if (placed === 7) { setFb('Perfect table — outside-in and BMW mastered! 🎉', true); completed('g1'); }
      } else {
        slot.classList.add('wrong'); setTimeout(() => slot.classList.remove('wrong'), 450);
        const hints = { bread: 'Remember BMW: Bread is on the left.', glass: 'Drinks go on the right, above the knife.', fork: 'Forks go on the left of the plate.', knife: 'Knife blade faces the plate, on the right.', spoon: 'Spoons sit on the right, outside the knife.', napkin: 'The napkin goes to the left of the forks.', dessert: 'Dessert utensils wait above the plate.' };
        setFb('Not quite. ' + (hints[p.id] || ''), false);
      }
    }
    $$('.slot[data-accept]', board).forEach(s => {
      s.dataset.orig = s.innerHTML;
      s.addEventListener('dragover', e => { e.preventDefault(); s.classList.add('over'); });
      s.addEventListener('dragleave', () => s.classList.remove('over'));
      s.addEventListener('drop', e => { e.preventDefault(); s.classList.remove('over'); const id = e.dataTransfer.getData('text/plain'); attempt(s, $(`.chip[data-id="${id}"]`, tray)); });
      s.addEventListener('click', () => attempt(s, selected));
    });
    $('#g1reset').addEventListener('click', reset);
    reset();
  }

  /* ---------- game 2: do or don't ---------- */
  const DD = [
    ['📱', 'Place your phone face-down next to your plate, just in case.', false, 'Keep it out of sight and on silent. A phone on the table says the meal is second priority.'],
    ['🤝', 'Wait for your host to begin eating before you do.', true, 'Following the host’s lead is one of the simplest ways to show respect.'],
    ['💸', 'Order the most expensive dish on the menu.', false, 'Choose something moderately priced, unless your host nudges you toward a pricier option.'],
    ['🧂', 'Season your food before tasting it.', false, 'Taste first. Salting before tasting suggests you have already decided it needs fixing.'],
    ['🧂', 'Pass the salt and pepper together, even if only one was requested.', true, 'They travel as a pair so the next person never has to hunt for one.'],
    ['📊', 'Start talking business the moment you sit down.', false, 'Begin with small talk and let the host steer toward business, usually after ordering.'],
    ['💪', 'Rest your elbows on the table while you eat.', false, 'Keep elbows off the table during the meal — Carreño said so too!'],
    ['🙏', 'Say thank you to the server each time they help you.', true, 'Courtesy toward staff is noticed by everyone at the table.'],
    ['🥩', 'Cut your whole steak into small pieces before starting.', false, 'Cut one or two bites at a time so the plate stays tidy and the food stays warm.'],
    ['🍞', 'Tear bread into bite-size pieces and butter each one separately.', true, 'This is the classic tidy way to eat bread at the table.'],
    ['🤧', 'Use your cloth napkin to blow your nose.', false, 'Excuse yourself and step away; the napkin is only for dabbing your lips and fingers.'],
    ['💌', 'Send a short thank-you note within a day of the meal.', true, 'A prompt, specific thank-you leaves a lasting impression.']
  ];
  const g2text = $('#g2text');
  if (g2text) {
    const emo = $('#g2emoji'), fb = $('#g2fb'), sc = $('#g2score'), barEl = $('#g2bar'), btns = $('#g2btns'), start = $('#g2start');
    let q = [], i = 0, s = 0, locked = true;
    const show = () => {
      if (i >= q.length) {
        emo.textContent = s >= 9 ? '🏆' : '👍'; g2text.textContent = `You scored ${s} / ${q.length}.`; fb.textContent = s >= 9 ? 'Outstanding — you know your table manners!' : 'Good effort — try again to beat your score.'; fb.className = 'feedback ok';
        btns.style.display = 'none'; start.style.display = ''; start.textContent = 'Play again'; locked = true;
        if (s >= 9) completed('g2'); return;
      }
      emo.textContent = q[i][0]; g2text.textContent = q[i][1]; barEl.style.width = (i / q.length * 100) + '%'; locked = false;
    };
    const begin = () => { q = shuffle(DD); i = 0; s = 0; sc.textContent = 'Score 0'; fb.textContent = ''; btns.style.display = ''; start.style.display = 'none'; show(); };
    btns.style.display = 'none';
    start.addEventListener('click', begin);
    btns.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || locked) return;
      locked = true; const ok = (b.dataset.ans === 'true') === q[i][2];
      if (ok) s++; sc.textContent = 'Score ' + s;
      fb.textContent = (ok ? '✓ Correct. ' : '✗ Not quite. ') + q[i][3]; fb.className = 'feedback ' + (ok ? 'ok' : 'no');
      i++; setTimeout(() => { fb.textContent = ''; show(); }, 2600);
    });
  }

  /* ---------- game 3: scenario quiz ---------- */
  const QZ = [
    { q: 'You sit down and see three forks. Which one do you pick up first?', o: ['The biggest one', 'The one farthest from the plate', 'The one closest to the plate', 'Any fork — it does not matter'], a: 1, e: 'Work from the outside in: the outermost fork is for the first course.' },
    { q: 'There is a small plate to your left and another to your right. Which is your bread plate?', o: ['The one on the right', 'Whichever is closer', 'The one on the left (B in BMW)', 'Neither — bread goes on the tablecloth'], a: 2, e: 'BMW: Bread (left), Meal (center), Water (right).' },
    { q: 'Your meal arrives, but your host has not been served yet. What should you do?', o: ['Start eating before it gets cold', 'Wait until your host starts or tells you to begin', 'Ask the server to take it back', 'Start with just the bread'], a: 1, e: 'Wait for the host unless they invite you to go ahead.' },
    { q: 'You get an urgent text from your manager during dinner. What is the best move?', o: ['Reply under the table', 'Show the text to the table', 'Quietly excuse yourself and step away for a moment', 'Ignore your phone forever'], a: 2, e: 'If something truly can’t wait, apologise briefly and step away from the table.' },
    { q: 'You drop your fork on the floor. What now?', o: ['Pick it up and keep using it', 'Wipe it on your napkin', 'Leave it and quietly ask the server for a clean one', 'Use your hands'], a: 2, e: 'Let the server bring you a replacement; there is no need to draw attention.' },
    { q: 'You need to step away from the table for a few minutes. What do you do with your napkin?', o: ['Leave it on the table', 'Put it loosely on your chair', 'Take it with you', 'Tuck it under your plate'], a: 1, e: 'Placing it on your chair signals that you are coming back.' }
  ];
  const g3b = $('#g3body');
  if (g3b) {
    const sc = $('#g3score'); let i = 0, s = 0;
    const render = () => {
      if (i >= QZ.length) {
        const emoji = s === QZ.length ? '🌟' : s >= 4 ? '👏' : '📘';
        g3b.innerHTML = `<div class="result"><div class="badge">${emoji}</div><h3>${s} / ${QZ.length} correct</h3><p>${s >= 4 ? 'Great judgement at the table!' : 'Review the place setting above and try again.'}</p><button class="btn btn-dark" id="g3again" type="button">Try again</button></div>`;
        $('#g3again').addEventListener('click', () => { i = 0; s = 0; render(); });
        sc.textContent = 'Finished'; if (s >= 4) completed('g3'); return;
      }
      const it = QZ[i]; sc.textContent = `Question ${i + 1} / ${QZ.length}`;
      g3b.innerHTML = `<h4 style="font-family:var(--font-display);font-size:1.4rem;margin:0">${it.q}</h4><div class="options">${it.o.map((o, k) => `<button class="opt" data-k="${k}" type="button">${o}</button>`).join('')}</div><div class="explain" id="g3ex"></div><div style="margin-top:1rem"><button class="btn btn-dark" id="g3next" type="button" hidden>${i === QZ.length - 1 ? 'See result' : 'Next →'}</button></div>`;
      $$('.opt', g3b).forEach(b => b.addEventListener('click', () => {
        const k = +b.dataset.k; $$('.opt', g3b).forEach(x => x.disabled = true);
        $$('.opt', g3b)[it.a].classList.add('right'); if (k !== it.a) b.classList.add('wrong'); else s++;
        const ex = $('#g3ex'); ex.textContent = (k === it.a ? '✓ ' : '✗ ') + it.e; ex.classList.add('show');
        const n = $('#g3next'); n.hidden = false; n.focus(); n.addEventListener('click', () => { i++; render(); });
      }));
    };
    render();
  }

  /* ---------- game 4: course order ---------- */
  const COURSES = [
    { e: '🧻', t: 'Napkin on your lap' }, { e: '🥖', t: 'Bread & water' }, { e: '🥣', t: 'Appetizer or soup' },
    { e: '🍽️', t: 'Main course' }, { e: '🍰', t: 'Dessert' }, { e: '☕', t: 'Coffee & thank-you' }
  ];
  const g4 = $('#g4grid');
  if (g4) {
    const sc = $('#g4score'), fb = $('#g4fb'); let next = 0;
    const reset = () => {
      next = 0; sc.textContent = '0 / 6'; fb.textContent = ''; g4.innerHTML = '';
      shuffle(COURSES.map((c, idx) => ({ ...c, idx }))).forEach(c => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'dish';
        b.innerHTML = `<span class="num"></span><span class="e" aria-hidden="true">${c.e}</span>${c.t}`;
        b.addEventListener('click', () => {
          if (b.classList.contains('placed')) return;
          if (c.idx === next) {
            b.classList.add('placed'); b.querySelector('.num').textContent = ++next; sc.textContent = `${next} / 6`;
            fb.textContent = next < 6 ? 'Right! What comes next?' : 'Course complete — you know the flow of a meal! 🎉'; fb.className = 'feedback ok';
            if (next === 6) completed('g4');
          } else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450); fb.textContent = 'Not yet — think about what happens next.'; fb.className = 'feedback no'; }
        });
        g4.appendChild(b);
      });
    };
    $('#g4reset').addEventListener('click', reset); reset();
  }

  /* ---------- video lesson player ---------- */
  const SC = [
    { bg: '#123f31', art: ['⏰', '🚪', '🙂'], h: 'Arrive early', cap: 'Get there a few minutes ahead of time and put your phone on silent before you walk in.' },
    { bg: '#3b1a2a', art: ['🤝', '🪑', '🧻'], h: 'Let the host lead', cap: 'Sit when invited. Unfold your napkin and start eating after your host does.' },
    { bg: '#2f3d13', art: ['📖', '🍽️', '👌'], h: 'Order smart', cap: 'Pick a moderately priced dish that is easy to eat neatly. Save the messy favorites for another day.' },
    { bg: '#162a46', art: ['📵', '👀', '💬'], h: 'Phones away', cap: 'Keep your phone out of sight so your full attention stays on the people at the table.' },
    { bg: '#4a3a12', art: ['🍴', '🥖', '🥂'], h: 'Mind the table', cap: 'Outside-in for utensils, BMW for plates and glasses, and small bites so you can always join the conversation.' },
    { bg: '#0f3d2e', art: ['🙏', '💌', '⭐'], h: 'Close with thanks', cap: 'Thank your host and the server, then send a short, specific note within a day.' }
  ];
  const screen = $('#screen');
  if (screen) {
    const DUR = 7500, dotsEl = $('#pDots'), barEl = $('#pBar'), play = $('#pPlay');
    SC.forEach((s, i) => {
      const d = document.createElement('div'); d.className = 'scene'; d.setAttribute('aria-hidden', 'true');
      d.innerHTML = `<div><div class="art">${s.art.map(a => `<span>${a}</span>`).join('')}</div><div class="num">SCENE ${i + 1} OF ${SC.length}</div><h3>${s.h}</h3><p class="cap">${s.cap}</p></div>`;
      screen.appendChild(d);
      const b = document.createElement('b'); b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Go to scene ' + (i + 1)); b.tabIndex = 0;
      b.addEventListener('click', () => go(i)); b.addEventListener('keydown', e => { if (e.key === 'Enter') go(i); });
      dotsEl.appendChild(b);
    });
    const scenes = $$('.scene', screen), dots = $$('b', dotsEl);
    let cur = 0, t0 = 0, raf = 0, playing = false, elapsed = 0;
    function go(i) {
      cur = (i + SC.length) % SC.length; elapsed = 0; t0 = performance.now();
      scenes.forEach((s, k) => { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k !== cur); });
      dots.forEach((d, k) => d.classList.toggle('on', k <= cur));
      screen.style.setProperty('--scene-bg', SC[cur].bg);
      barEl.style.width = (cur / SC.length * 100) + '%';
    }
    function tick(now) {
      elapsed = now - t0;
      barEl.style.width = ((cur + Math.min(elapsed / DUR, 1)) / SC.length * 100) + '%';
      if (elapsed >= DUR) { if (cur === SC.length - 1) { stop(); go(0); return; } go(cur + 1); }
      raf = requestAnimationFrame(tick);
    }
    function start() { playing = true; play.textContent = '⏸'; play.setAttribute('aria-label', 'Pause'); t0 = performance.now() - elapsed; raf = requestAnimationFrame(tick); }
    function stop() { playing = false; play.textContent = '▶'; play.setAttribute('aria-label', 'Play'); cancelAnimationFrame(raf); }
    play.addEventListener('click', () => playing ? stop() : start());
    $('#pPrev').addEventListener('click', () => go(cur - 1));
    $('#pNext').addEventListener('click', () => go(cur + 1));
    $('#pTimeline').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); go(Math.floor((e.clientX - r.left) / r.width * SC.length)); });
    go(0);

    // optional real YouTube embed: set data-video-id on #ytWrap in index.html
    const yt = $('#ytWrap');
    if (yt && /^[\w./-]+\.(mp4|webm)$/i.test(yt.dataset.videoSrc || '')) {
      yt.hidden = false;
      yt.innerHTML = '<h3>Extra: AI-generated video</h3><video class="embed" controls preload="metadata" playsinline></video><p class="hint">AI-generated video with fictional people.</p>';
      yt.querySelector('video').src = yt.dataset.videoSrc;
    } else if (yt && /^[\w-]{11}$/.test(yt.dataset.videoId || '')) {
      yt.hidden = false;
      yt.innerHTML = `<h3>Extra: full video</h3><iframe class="embed" src="https://www.youtube-nocookie.com/embed/${yt.dataset.videoId}" title="Business dining etiquette video" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    }
  }

  /* ---------- Carreño flip cards ---------- */
  const CAR = [
    { es: '“No apoyemos nunca en la mesa todo el antebrazo, y en ningún caso pongamos sobre ella los codos en el momento de comer.”', ref: 'De la mesa, A §9', h: 'No elbows while eating', t: 'Do not lean your forearms or elbows on the table while you are eating.', b: 'Sit upright and relaxed — it looks confident and keeps your space tidy.' },
    { es: '“No comamos nunca aceleradamente ni demasiado despacio.”', ref: 'De la mesa, A §32', h: 'Match the group’s pace', t: 'Eating too fast makes you look greedy and keeps you out of the talk; eating too slowly leaves you finishing alone and slows everyone down.', b: 'At a business lunch, try to finish around the same time as your host.' },
    { es: '“Jamás hagamos variar de puesto el pan, que se coloca siempre a la izquierda, ni los vasos, las copas y las tazas, que se colocan siempre a la derecha.”', ref: 'De la mesa, A §25', h: 'Bread left, drinks right', t: 'Carreño already described what we now remember as BMW: bread to the left, glasses to the right — and do not move them around.', b: 'If you reach for the wrong glass, you may take someone else’s drink. Remember BMW!' },
    { es: '“…ella no tiene ni puede tener otro objeto que limpiarse los labios…”', ref: 'De los banquetes, §11', h: 'The napkin has one job', t: 'The napkin goes on your lap and is used to clean your lips — nothing else.', b: 'Dab, don’t scrub. Never use it as a handkerchief or to polish the silverware.' },
    { es: '“No incurramos nunca en la grave falta de llevar el cuchillo a la boca.”', ref: 'De la mesa, A §22', h: 'Knives stay off the lips', t: 'The knife divides food; the fork carries it to your mouth.', b: 'Cut a bite, set the knife on the plate, then lift the fork.' },
    { es: '“En la mesa debe sostenerse siempre una conversación ligera y agradable…”', ref: 'De los banquetes, §22', h: 'Keep the talk light', t: 'Conversation at the table should be pleasant and easy, avoiding heavy arguments and gloomy subjects.', b: 'Skip controversial topics early in the meal; ask the other person about their work and interests.' },
    { es: '“Dirijámonos siempre a los sirvientes para que nos proporcionen todo lo que nos veamos en la necesidad de pedir…”', ref: 'De los banquetes, §18', h: 'Ask the staff, don’t reach', t: 'If you need something, ask the server rather than stretching across other people. Speak in a low, courteous tone.', b: 'Never snap your fingers or interrupt a conversation; catch the server’s eye and say please and thank you.' },
    { es: '“Seamos, pues, sobrios y moderados en la mesa…”', ref: 'De los banquetes, §27', h: 'Moderation wins', t: 'Enjoy the meal, but keep control of how much you eat and drink. The point is the company.', b: 'One drink at most — or none. Staying sharp matters more than being a good sport.' },
    { es: '“…poniendo el tenedor y el cuchillo juntos, con el mango hacia nosotros, por ser éste el signo que indica a los sirvientes que deben mudarnos todo esto.”', ref: 'De la mesa, A §39', h: 'Say “I’m finished” with your cutlery', t: 'When you are done, place fork and knife together on the plate — it tells the staff they may clear.', b: 'Rest them crossed on the plate while you pause; together when finished.' }
  ];
  const fg = $('#flipGrid');
  if (fg) {
    CAR.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'flip reveal'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<div class="flip-inner"><div class="face front"><small>Carreño · ${c.ref}</small><div class="es">${c.es}</div><div class="tap">Tap to read it in English ↻</div></div><div class="face back"><small>In plain English</small><h3>${c.h}</h3><p>${c.t}</p><div class="biz"><strong>At a business meal:</strong> ${c.b}</div></div></div>`;
      b.addEventListener('click', () => { const on = b.classList.toggle('on'); b.setAttribute('aria-pressed', on); });
      fg.appendChild(b); io ? io.observe(b) : b.classList.add('in');
    });
  }

  /* ---------- survey page ---------- */
  const form = $('#surveyForm');
  if (form) {
    const out = $('#surveyOut');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const answered = $$('.survey-q', form).filter(q => $('input:checked', q) || ($('textarea', q) && $('textarea', q).value.trim()));
      const scores = $$('input[type=radio]:checked', form).map(r => +r.value);
      const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '–';
      out.hidden = false;
      out.innerHTML = `<h3>Thanks for reflecting! 🙌</h3><p>You answered ${answered.length} of ${$$('.survey-q', form).length} questions. Your average rating was <strong>${avg} / 5</strong>.</p><p class="hint">This form is a practice copy: nothing is sent anywhere, and your answers stay in your browser. If this were a real survey, your instructor would collect the results through the platform of their choice.</p>`;
      out.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      if (scores.length >= 5) confetti();
    });
    form.addEventListener('reset', () => { out.hidden = true; });
  }
})();
