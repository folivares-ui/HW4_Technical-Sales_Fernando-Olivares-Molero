/* ============ Client lunch simulator ============ */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // r = rapport change, p = professionalism change, ok = good choice
  const SCENES = [
    { room: 'The entrance', narr: 'You arrive five minutes early. Ms. Rivera walks in right on time.', say: 'Hello! Thank you for inviting me today.',
      ch: [
        { t: 'Stand, smile, offer a firm handshake: “Thank you for coming, Ms. Rivera.”', r: 12, p: 10, ok: 1, fb: 'A warm, standing greeting with a handshake sets a respectful tone from the first second.' },
        { t: 'Wave from your seat while you finish a text.', r: -10, p: -12, fb: 'Finishing a text while she arrives says she is not your priority. Stand, put the phone away, and greet her.' },
        { t: 'Hug her and say “Great to see you, buddy!”', r: -6, p: -8, fb: 'Too casual for a first business meeting. Match her level of formality until she signals otherwise.' }
      ] },
    { room: 'Taking your seats', narr: 'The host guides the seating at a business meal — and today, that is you.', say: 'Where would you like me to sit?',
      ch: [
        { t: 'Offer her the seat with the best view, and sit once she has sat.', r: 10, p: 10, ok: 1, fb: 'Letting the guest sit first and choosing the better seat for her is classic good hosting.', tip: 'Carreño has the people present wait standing until the hostess sits, and then everyone sits (“De los banquetes”, §9–10).' },
        { t: 'Sit down immediately and grab the menu.', r: -8, p: -10, fb: 'Sitting first and diving into the menu leaves your guest standing awkwardly.' },
        { t: 'Take the best seat yourself — you reserved the table, after all.', r: -5, p: -8, fb: 'As host, give your guest the best seat, not yourself.' }
      ] },
    { room: 'Phone check', narr: 'You sit down. Your phone buzzes with a notification. Ms. Rivera unfolds her napkin onto her lap.', say: '(She smiles and waits for you to settle in.)',
      ch: [
        { t: 'Silence the phone, put it away, and put your napkin on your lap.', r: 10, p: 12, ok: 1, fb: 'Phone away, napkin on your lap: you are giving her your full attention.', tip: 'For Carreño the napkin goes over your knees and has only one job, cleaning your lips (“De los banquetes”, §11).' },
        { t: 'Leave the phone face-down on the table “just in case”.', r: -6, p: -8, fb: 'A phone on the table, even face-down, signals that something might be more important than her.' },
        { t: 'Quickly glance at the notification.', r: -12, p: -15, fb: 'The first thing she sees you do at the table is check your phone. That is a hard impression to undo.' }
      ] },
    { room: 'Small talk', narr: 'Business is not on the table yet. The conversation is just warming up.', say: 'I just flew in this morning. The city is lovely.',
      ch: [
        { t: 'Ask an open question about her trip and genuinely listen.', r: 12, p: 8, ok: 1, fb: 'Open questions invite her to talk, and listening builds trust.', tip: 'Carreño recommends a light, pleasant conversation at the table, free of heavy or gloomy topics (“De los banquetes”, §22).' },
        { t: 'Say “Great! So, about my proposal…”', r: -8, p: -6, fb: 'Pitching in the first minute feels pushy. Let the conversation warm up first.' },
        { t: 'Start a heated debate about politics to “break the ice”.', r: -12, p: -12, fb: 'Controversial topics are a gamble you cannot win at a business meal.' }
      ] },
    { room: 'Ordering', narr: 'The server hands over the menus. Ms. Rivera studies hers.', say: 'I\'m torn. What do you recommend?',
      ch: [
        { t: 'Suggest a popular mid-priced dish, and pick something easy to eat for yourself.', r: 10, p: 10, ok: 1, fb: 'A moderately priced, tidy-to-eat dish keeps the meal relaxed and shows consideration.' },
        { t: '“Honestly, I\'m not hungry. Get whatever you want.”', r: -5, p: -5, fb: 'Being vague leaves her with no guidance, and skipping the meal makes her feel awkward for eating.' },
        { t: '“You HAVE to try the wine and the lobster!”', r: -10, p: -8, fb: 'Pressuring a guest toward pricey items or drinks makes her uncomfortable.' }
      ] },
    { room: 'Drinks', narr: 'The server returns to take the drink order.', say: 'I\'ll just have sparkling water, thanks.',
      ch: [
        { t: '“Perfect — I\'ll join you with sparkling water.”', r: 10, p: 10, ok: 1, fb: 'Respecting her choice and matching it keeps everything comfortable.', tip: 'Carreño: do not insist on a second offer of drink (“De los banquetes”, §14), and never press guests to drink more than they wish (§26).' },
        { t: '“Come on, at least one glass of wine with me!”', r: -12, p: -12, fb: 'Insisting on alcohol is pressure. Accept her choice graciously.', tip: 'Carreño calls it a serious fault for a host to push guests to drink more than they want (“De los banquetes”, §26).' },
        { t: 'Order a large cocktail for yourself and a second one right away.', r: -8, p: -10, fb: 'At a business meal, you want a clear head. One drink at most — or none.' }
      ] },
    { room: 'Bread basket', narr: 'The bread arrives. Ms. Rivera tears a small piece, butters it, and compliments the bread.', say: 'These rolls are wonderful!',
      ch: [
        { t: 'Tear a bite-size piece, butter only that piece over your bread plate.', r: 8, p: 10, ok: 1, fb: 'Tearing and buttering one bite at a time is the neat classic. And remember: your bread plate is on the left (BMW).', tip: 'Carreño says bread is held in one hand and broken by hand, not cut with a knife (“De la mesa”, A §26–28).' },
        { t: 'Cut the whole roll in half with your knife and butter both halves.', r: -5, p: -8, fb: 'Cutting the roll in half is less tidy than tearing a bite at a time.' },
        { t: 'Answer her with your mouth full of bread.', r: -10, p: -10, fb: 'Never talk with your mouth full — wait until you swallow.' }
      ] },
    { room: 'Time for business', narr: 'The orders are in. The small talk has done its job.', say: 'So… what did you want to discuss?',
      ch: [
        { t: 'Give a clear two-minute overview and ask about her priorities.', r: 12, p: 12, ok: 1, fb: 'Brief and client-focused — exactly what a busy decision-maker wants to hear.' },
        { t: 'Pull out your laptop and start a 20-slide presentation.', r: -10, p: -8, fb: 'A table is for conversation. Save the slides for the office.' },
        { t: '“Oh, let\'s not talk shop at all today!”', r: -4, p: -6, fb: 'She asked you directly. Dodging the question wastes the reason for the meeting.' }
      ] },
    { room: 'A mishap', narr: 'The server brings the wrong dish and, in the rush, spills a little water on the table.', say: '(Ms. Rivera looks at you to see how you will react.)',
      ch: [
        { t: 'Stay calm, politely mention it to the server, say thank you, and keep the conversation going.', r: 12, p: 12, ok: 1, fb: 'Calm, courteous handling of a mishap is exactly what clients look for in a partner.', tip: 'Carreño: a good host stays unfazed and kind even if the server drops a dish (“De los banquetes”, §20), and guests ask staff in a low, courteous voice (§18–19).' },
        { t: 'Snap at the server: “Can\'t you get anything right?”', r: -15, p: -15, fb: 'Rudeness to staff is one of the quickest ways to lose a client\'s respect.', tip: 'Carreño says hosts never scold servers at the table (“De los banquetes”, §20).' },
        { t: 'Complain loudly to Ms. Rivera about how bad the service is.', r: -10, p: -10, fb: 'Making her sit through your complaints turns the lunch sour.' }
      ] },
    { room: 'The check', narr: 'The plates are cleared. The server approaches with the check.', say: 'That was lovely. Let me at least get the tip!',
      ch: [
        { t: 'Smile: “It\'s my pleasure — you\'re my guest today.” Settle the bill discreetly.', r: 12, p: 12, ok: 1, fb: 'The host who invited pays, and does it without drama. A calm, gracious refusal of her offer wraps up the meal nicely.' },
        { t: 'Slide the check across the table to her.', r: -15, p: -15, fb: 'If you invited her, the bill is yours.' },
        { t: 'Calculate each item out loud and split it down to the cent.', r: -10, p: -8, fb: 'Counting pennies at a client lunch looks petty.' }
      ] },
    { room: 'Goodbye', narr: 'You both stand up and gather your things.', say: 'Thank you again. I\'ll be in touch.',
      ch: [
        { t: 'Thank her, walk her to the door, and plan a specific thank-you note for tomorrow.', r: 10, p: 10, ok: 1, fb: 'A warm goodbye and a prompt, specific thank-you note are what she will remember.' },
        { t: 'Rush off — you have another meeting.', r: -10, p: -8, fb: 'Rushing away makes the meal look like a box you had to check.' },
        { t: 'Push her: “So when can you sign the contract?”', r: -8, p: -8, fb: 'Let her decide in her own time. Pressure at the door can undo a great lunch.' }
      ] }
  ];

  const els = ['room', 'narr', 'bubble', 'choices', 'fb', 'end'].reduce((o, k) => (o[k] = $('#' + k), o), {});
  const meters = { r: $('#mR'), p: $('#mP'), d: $('#mD') }, vals = { r: $('#vR'), p: $('#vP'), d: $('#vD') };
  const avatar = $('#avatar'), clientEl = document.querySelector('.client');
  let i = 0, R = 50, P = 50, good = 0, typingTimer = 0, log = [];
  const clamp = n => Math.max(0, Math.min(100, n));

  function setMood(m) {
    const mouth = $('#mouth'), bL = $('#bL'), bR = $('#bR');
    if (m === 'happy') { mouth.setAttribute('d', 'M84 116q16 18 32 0'); bL.setAttribute('d', 'M74 79q10-8 20-2'); bR.setAttribute('d', 'M106 77q10-6 20 2'); }
    else if (m === 'upset') { mouth.setAttribute('d', 'M86 124q14-12 28 0'); bL.setAttribute('d', 'M74 76q10 6 20 6'); bR.setAttribute('d', 'M106 82q10 0 20-6'); }
    else { mouth.setAttribute('d', 'M88 120h24'); bL.setAttribute('d', 'M74 80q10-4 20 0'); bR.setAttribute('d', 'M106 80q10-4 20 0'); }
  }
  function updateMeters() {
    const d = Math.round(R * .6 + P * .4);
    meters.r.style.width = R + '%'; meters.p.style.width = P + '%'; meters.d.style.width = d + '%';
    vals.r.textContent = R; vals.p.textContent = P; vals.d.textContent = d + '%';
  }
  function say(text) {
    clearInterval(typingTimer); els.bubble.textContent = '';
    if (reduceMotion) { els.bubble.textContent = text; return; }
    els.bubble.classList.add('typing'); let k = 0;
    typingTimer = setInterval(() => { els.bubble.textContent = text.slice(0, ++k); if (k >= text.length) { clearInterval(typingTimer); els.bubble.classList.remove('typing'); } }, 22);
  }
  function show() {
    const s = SCENES[i];
    els.room.textContent = `Scene ${i + 1} / ${SCENES.length} · ${s.room}`;
    els.narr.textContent = s.narr; els.fb.hidden = true; els.end.hidden = true;
    setMood(R + P >= 105 ? 'happy' : R + P < 75 ? 'upset' : 'neutral');
    say(s.say); els.choices.innerHTML = '';
    shuffle(s.ch).forEach((c, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'choice'; b.dataset.n = k + 1; b.textContent = c.t;
      b.addEventListener('click', () => pick(c, b)); els.choices.appendChild(b);
    });
    updateMeters();
  }
  function pick(c, btn) {
    document.querySelectorAll('.choice').forEach(x => x.disabled = true);
    btn.classList.add('picked'); const bad = c.r + c.p < 0; if (bad) btn.classList.add('bad');
    R = clamp(R + c.r); P = clamp(P + c.p); if (c.ok) good++;
    log.push({ scene: SCENES[i].room, ok: !!c.ok, fb: c.fb });
    updateMeters(); setMood(bad ? 'upset' : 'happy');
    clientEl.classList.remove('bounce'); void clientEl.offsetWidth; clientEl.classList.add('bounce');
    const sign = n => (n >= 0 ? '+' : '') + n;
    els.fb.className = 'fb-panel' + (bad ? ' bad' : ''); els.fb.hidden = false;
    els.fb.innerHTML = `<h3>${c.ok ? '✓ Great choice' : bad ? '✗ That cost you' : '≈ Could be better'}</h3><div class="delta"><span class="${c.r >= 0 ? 'up' : 'down'}">Rapport ${sign(c.r)}</span><span class="${c.p >= 0 ? 'up' : 'down'}">Professionalism ${sign(c.p)}</span></div><p></p>${c.tip ? '<div class="tip"></div>' : ''}<button class="btn btn-dark" id="nextBtn" type="button"></button>`;
    els.fb.querySelector('p').textContent = c.fb;
    if (c.tip) els.fb.querySelector('.tip').textContent = '📜 ' + c.tip;
    const nb = $('#nextBtn'); nb.textContent = i === SCENES.length - 1 ? 'See the outcome →' : 'Next scene →'; nb.focus();
    nb.addEventListener('click', () => { i++; i < SCENES.length ? (show(), window.scrollTo({ top: document.querySelector('.sim').offsetTop - 80, behavior: reduceMotion ? 'auto' : 'smooth' })) : finish(); });
  }
  function finish() {
    const deal = Math.round(R * .6 + P * .4);
    const rank = deal >= 85 ? ['🏆', 'Table Pro — she signs!', 'Ms. Rivera was impressed by your poise. She calls the next morning to move forward.']
      : deal >= 65 ? ['🌟', 'Promising — she will follow up', 'The lunch went well. A strong thank-you note could tip the decision your way.']
      : deal >= 40 ? ['🤔', 'Needs polish — she hesitates', 'Some moments held you back. Review the place setting and replay.']
      : ['😬', 'Table disaster', 'Ms. Rivera politely declines. Do not worry: this is why we practise.'];
    setMood(deal >= 65 ? 'happy' : deal >= 40 ? 'neutral' : 'upset');
    say(deal >= 65 ? 'Thank you, this was a wonderful lunch.' : deal >= 40 ? 'Thank you. I\'ll think it over.' : 'Thanks for lunch. I\'ll let you know.');
    els.choices.innerHTML = ''; els.fb.hidden = true; els.end.hidden = false;
    const missed = log.filter(x => !x.ok);
    els.end.innerHTML = `<div class="big">${rank[0]}</div><h2>${rank[1]}</h2><p>${rank[2]}</p><div class="stats"><div><b>${R}</b>Rapport</div><div><b>${P}</b>Professionalism</div><div><b>${deal}%</b>Deal chance</div><div><b>${good}/${SCENES.length}</b>Best choices</div></div>${missed.length ? '<h3 style="color:var(--gold)">Moments to review</h3><ul></ul>' : '<p>You chose the best option in every scene — flawless!</p>'}<div class="cta-row" style="justify-content:center"><button class="btn btn-gold" id="again" type="button">Play again</button><a class="btn btn-ghost" href="index.html#games">Back to the games</a></div>`;
    const ul = els.end.querySelector('ul'); if (ul) missed.forEach(m => { const li = document.createElement('li'); li.textContent = `${m.scene}: ${m.fb}`; ul.appendChild(li); });
    $('#again').addEventListener('click', () => { i = 0; R = 50; P = 50; good = 0; log = []; show(); });
    els.end.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    if (deal >= 65 && window.BT) window.BT.mark('sim', { quiet: true });
    if (deal >= 65) { const c = document.getElementById('confetti'); if (c) { /* reuse confetti from app.js via a fake survey submit is not possible; draw minimal burst */ burst(c); } }
  }
  function burst(c) {
    if (reduceMotion) return; const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const cols = ['#c9a24b', '#7a1f33', '#1f6b50', '#f1e3bb', '#fff'];
    const ps = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .4, r: 4 + Math.random() * 6, vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4, col: cols[(Math.random() * cols.length) | 0], rot: Math.random() * 6 }));
    let t = 0; (function f() { ctx.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.rot += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); }); if (++t < 160) requestAnimationFrame(f); else ctx.clearRect(0, 0, c.width, c.height); })();
  }
  show();
})();
