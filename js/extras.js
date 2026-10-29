/* ============ Extras: progress, text size, video player, video quiz ============ */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } };

  /* ---------- toast ---------- */
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  /* ---------- progress shared by all pages ---------- */
  const TOTAL = ['g1', 'g2', 'g3', 'g4', 'sim', 'video'];
  const NAMES = { g1: 'Set the table', g2: 'Do or don\'t', g3: 'What would you do?', g4: 'Meal order', sim: 'Client simulator', video: 'Video quiz' };
  const progress = new Set(lsGet('bt-progress', []).filter(x => TOTAL.includes(x)));
  let chip;
  function render() {
    if (chip) { $('b', chip).textContent = progress.size; chip.setAttribute('aria-label', `Your progress: ${progress.size} of ${TOTAL.length} activities completed`); chip.classList.toggle('full', progress.size === TOTAL.length); }
    const games = ['g1', 'g2', 'g3', 'g4'].filter(x => progress.has(x)).length;
    const bc = $('#badgeCount'); if (bc) bc.textContent = games;
    const bt = $('#badgeText');
    if (bt && games === 4) bt.innerHTML = '🎉 <strong>You did it!</strong> You are officially Dinner-Ready. Try the <a href="simulator.html">client simulator</a>, then take the <a href="survey.html">short survey</a>.';
  }
  window.BT = {
    mark(id, opts = {}) {
      if (!TOTAL.includes(id) || progress.has(id)) return false;
      progress.add(id); lsSet('bt-progress', [...progress]); render();
      if (!opts.quiet && window.BTconfetti) window.BTconfetti();
      toast(`🏅 ${NAMES[id]} complete — ${progress.size} / ${TOTAL.length}`);
      if (progress.size === TOTAL.length) setTimeout(() => toast('🌟 Everything done! You are Dinner-Ready.'), 3400);
      return true;
    }
  };

  /* ---------- header tools: progress chip + text size ---------- */
  const navWrap = $('.nav .wrap'), menuBtn = $('.menu-btn');
  if (navWrap && menuBtn) {
    const tools = document.createElement('div'); tools.className = 'nav-tools';
    tools.innerHTML = `<div class="size-ctl" role="group" aria-label="Text size"><button type="button" id="szDown" aria-label="Smaller text">A−</button><button type="button" id="szUp" aria-label="Larger text">A+</button></div><a class="chip-progress" href="index.html#games" title="Your progress"><span aria-hidden="true">🏅</span> <b>0</b>/${TOTAL.length}</a>`;
    navWrap.insertBefore(tools, menuBtn);
    chip = $('.chip-progress', tools);
    let scale = Math.min(140, Math.max(90, +lsGet('bt-scale', 100) || 100));
    const apply = () => { document.documentElement.style.fontSize = scale + '%'; };
    apply();
    $('#szUp').addEventListener('click', () => { scale = Math.min(140, scale + 10); apply(); lsSet('bt-scale', scale); toast(`Text size ${scale}%`); });
    $('#szDown').addEventListener('click', () => { scale = Math.max(90, scale - 10); apply(); lsSet('bt-scale', scale); toast(`Text size ${scale}%`); });
  }
  render();

  /* ---------- back-to-top button ---------- */
  const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'fab'; fab.setAttribute('aria-label', 'Back to top'); fab.textContent = '↑';
  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.body.appendChild(fab);
  addEventListener('scroll', () => fab.classList.toggle('show', scrollY > 700), { passive: true });

  /* ---------- video lesson ---------- */
  const v = $('#mainVideo');
  if (!v) return;
  // Start times (seconds) follow the on-screen captions of video/lesson.mp4.
  const CH = [
    [0, '⏰', 'Arrive early', 'Get there a few minutes ahead of time.'],
    [2, '📵', 'Silence your phone', 'Silence it before you walk in, and keep it away from the table.'],
    [3, '😊', 'Polite smile', 'Greet people warmly and stay relaxed and friendly.'],
    [8, '🤝', 'Greet standing', 'Stand to welcome your guest.'],
    [9, '🪑', 'Guest sits first', 'Offer your guest the seat first, then take yours.'],
    [11, '🧻', 'Napkin on your lap', 'Once you are seated, unfold your napkin onto your lap.'],
    [12, '⏳', 'Start with your host', 'Wait for your host to begin before you start eating.'],
    [13, '🍴', 'Work from the outside in', 'Use the outermost utensil first and move toward the plate.'],
    [15, '🥖', 'Remember BMW', 'Bread on the left, Meal in the center, Water on the right.'],
    [17, '💬', 'Keep it light', 'Open with easy, friendly small talk.'],
    [18, '📊', 'Host leads into business', 'Turn to business only when your host steers the conversation there.'],
    [20, '🙂', 'Thank the staff', 'Be courteous to the servers.'],
    [21, '💌', 'Thank your host', 'Thank them in person and follow up with a note.']
  ];
  const list = $('#chapters'), now = $('#nowTip'), learnedEl = $('#learnedCount');
  const learned = new Set(lsGet('bt-learned', []).filter(i => Number.isInteger(i) && i >= 0 && i < CH.length));
  const end = i => (i + 1 < CH.length ? CH[i + 1][0] : (v.duration || 22.8));
  const fmt = t => `0:${String(Math.floor(t)).padStart(2, '0')}`;
  let active = -1;

  CH.forEach((c, i) => {
    const li = document.createElement('li'); li.className = 'chapter';
    li.innerHTML = `<button type="button" class="ch-seek"><span class="ch-ico" aria-hidden="true">${c[1]}</span><span class="ch-txt"><b></b><small></small></span><span class="ch-time">${fmt(c[0])}</span></button><button type="button" class="ch-learn" aria-pressed="false" aria-label="Mark as learned" title="Mark as learned">✓</button>`;
    $('b', li).textContent = c[2]; $('small', li).textContent = c[3];
    $('.ch-seek', li).addEventListener('click', () => { v.currentTime = c[0] + .05; v.play().catch(() => {}); });
    $('.ch-learn', li).addEventListener('click', e => {
      const on = !learned.has(i); on ? learned.add(i) : learned.delete(i);
      e.currentTarget.setAttribute('aria-pressed', on); li.classList.toggle('learned', on);
      lsSet('bt-learned', [...learned]); count();
    });
    if (learned.has(i)) { li.classList.add('learned'); $('.ch-learn', li).setAttribute('aria-pressed', 'true'); }
    list.appendChild(li);
  });
  const items = $$('.chapter', list);
  function count() { learnedEl.textContent = `${learned.size} / ${CH.length} learned`; }
  count();

  function setActive(i) {
    if (i === active) return; active = i;
    items.forEach((li, k) => li.classList.toggle('now', k === i));
    if (i >= 0) {
      now.innerHTML = `<span class="now-ico"></span><div><b class="now-title"></b><span class="now-desc"></span></div>`;
      $('.now-ico', now).textContent = CH[i][1]; $('.now-title', now).textContent = CH[i][2]; $('.now-desc', now).textContent = CH[i][3];
      now.classList.remove('pop'); void now.offsetWidth; now.classList.add('pop');
    }
  }
  v.addEventListener('timeupdate', () => {
    const t = v.currentTime; let i = 0; for (let k = 0; k < CH.length; k++) if (t >= CH[k][0]) i = k;
    if ($('#vLoop').checked && t >= end(i) - .15 && !v.paused) { v.currentTime = CH[i][0] + .05; return; }
    setActive(i);
    const pct = Math.max(0, Math.min(100, (t - CH[i][0]) / (end(i) - CH[i][0]) * 100));
    items[i].style.setProperty('--p', pct + '%');
  });
  v.addEventListener('ended', () => { items.forEach(li => li.style.removeProperty('--p')); toast('Video finished — test yourself with the quiz!'); openQuiz(); });
  $('#vSpeed').addEventListener('change', e => { v.playbackRate = +e.target.value; });

  // hero card + hero button jump into the video
  const goVideo = (play) => {
    const tab = $('#t-video'); if (tab) tab.click();
    $('#video').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (play) setTimeout(() => v.play().catch(() => {}), reduceMotion ? 0 : 600);
  };
  const hp = $('#heroPlay'); if (hp) hp.addEventListener('click', () => goVideo(true));

  /* ---------- video quiz ---------- */
  const Q = [
    { q: 'Where does your napkin go once you are seated?', o: ['Tucked into your collar', 'On your lap', 'On the table next to the fork', 'Under your plate'], a: 1, e: 'Unfold it onto your lap once you are seated.' },
    { q: 'When should you start eating?', o: ['As soon as your food arrives', 'When your host starts', 'After everyone has finished their bread', 'Before the others, to keep it hot'], a: 1, e: 'Follow your host’s lead.' },
    { q: 'Which fork do you pick up first?', o: ['The outermost one', 'The one closest to the plate', 'The biggest one', 'Any — it does not matter'], a: 0, e: 'Work from the outside in.' },
    { q: 'What does “BMW” remind you of?', o: ['Bread, Meal, Water', 'Bring, Munch, Wait', 'Butter, Milk, Wine', 'Bread, Main, Wine'], a: 0, e: 'Bread (left), Meal (center), Water (right).' },
    { q: 'Who takes a seat first?', o: ['You, since you booked the table', 'Your guest', 'Whoever is hungriest', 'The server decides'], a: 1, e: 'Offer your guest the seat first, then take yours.' },
    { q: 'When do you move on to business?', o: ['Right after sitting down', 'Never — keep it social', 'After light conversation, when the host leads', 'When the check arrives'], a: 2, e: 'Start light, and let the host steer the talk toward business.' }
  ];
  const qb = $('#vquiz'); let qi = 0, qs = 0;
  function openQuiz() { qb.hidden = false; qi = 0; qs = 0; renderQ(); qb.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }
  $('#vQuizBtn').addEventListener('click', openQuiz);
  function renderQ() {
    if (qi >= Q.length) {
      const pass = qs >= 5;
      qb.innerHTML = `<div class="result"><div class="badge" style="font-size:4rem">${pass ? '🏆' : '📘'}</div><h3></h3><p></p><div class="cta-row" style="justify-content:center"></div></div>`;
      $('h3', qb).textContent = `${qs} / ${Q.length} correct`;
      $('p', qb).textContent = pass ? 'You know the essentials from the video!' : 'Watch the chapters you missed and try again — you need 5 correct to pass.';
      const row = $('.cta-row', qb);
      const again = document.createElement('button'); again.type = 'button'; again.className = 'btn btn-dark'; again.textContent = 'Try again'; again.addEventListener('click', () => { qi = 0; qs = 0; renderQ(); });
      const rewatch = document.createElement('button'); rewatch.type = 'button'; rewatch.className = 'btn btn-ghost'; rewatch.style.cssText = 'color:var(--green-800);border-color:var(--green-800)'; rewatch.textContent = 'Rewatch the video'; rewatch.addEventListener('click', () => { v.currentTime = 0; goVideo(true); });
      row.append(again, rewatch);
      if (pass) { window.BT.mark('video'); const nx = document.createElement('a'); nx.className = 'btn btn-gold'; nx.href = 'simulator.html'; nx.textContent = 'Next: client simulator →'; row.appendChild(nx); }
      return;
    }
    const it = Q[qi];
    qb.innerHTML = `<div class="game-head"><h3>Test yourself</h3><span class="score"></span></div><h4 class="qtext"></h4><div class="options"></div><div class="explain"></div><div style="margin-top:1rem"><button class="btn btn-dark" type="button" hidden></button></div>`;
    $('.score', qb).textContent = `Question ${qi + 1} / ${Q.length}`; $('.qtext', qb).textContent = it.q;
    const opts = $('.options', qb), ex = $('.explain', qb), nx = $('button.btn', qb); nx.textContent = qi === Q.length - 1 ? 'See result' : 'Next →';
    it.o.forEach((o, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = o;
      b.addEventListener('click', () => {
        $$('.opt', opts).forEach(x => x.disabled = true); $$('.opt', opts)[it.a].classList.add('right');
        if (k === it.a) qs++; else b.classList.add('wrong');
        ex.textContent = (k === it.a ? '✓ ' : '✗ ') + it.e; ex.classList.add('show'); nx.hidden = false; nx.focus();
      });
      opts.appendChild(b);
    });
    nx.addEventListener('click', () => { qi++; renderQ(); });
  }
})();
