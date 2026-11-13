(function rotatePraise() {
  const list = document.getElementById('praise-list');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('li'));
  if (items.length < 2) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  let i = 0;
  setInterval(() => {
    const cur = items[i];
    i = (i + 1) % items.length;
    const next = items[i];
    cur.removeAttribute('aria-current');
    cur.setAttribute('hidden', '');
    next.removeAttribute('hidden');
    requestAnimationFrame(() => next.setAttribute('aria-current', 'true'));
  }, 7000);
})();

(function revealContact() {
  const el = document.getElementById('contact-link');
  if (!el) return;
  try {
    const u = atob(el.dataset.u);
    const d = atob(el.dataset.d);
    const s = el.dataset.s ? atob(el.dataset.s) : '';
    const addr = u + '@' + d;
    el.textContent = addr;
    el.href = 'mailto:' + addr + (s ? '?subject=' + encodeURIComponent(s) : '');
    el.removeAttribute('data-u');
    el.removeAttribute('data-d');
    el.removeAttribute('data-s');
  } catch (_) { /* leave fallback text */ }
})();

function wirePanel(openerId, panelId) {
  const opener = document.getElementById(openerId);
  const panel = document.getElementById(panelId);
  if (!opener || !panel) return;
  opener.addEventListener('click', () => {
    if (typeof panel.showModal === 'function') panel.showModal();
    else panel.setAttribute('open', '');
  });
  panel.addEventListener('click', (e) => {
    const r = panel.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) panel.close();
  });
}
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.getAttribute('data-close'));
    if (target) target.close();
  });
});
wirePanel('open-privacy', 'privacy-panel');
wirePanel('open-inquiries', 'inquiries-panel');

const form = document.getElementById('waitlist');
const status = document.getElementById('status');
const btn = form.querySelector('button');
const endpoint = (window.SUPABASE_URL || '').replace(/\/$/, '') + '/functions/v1/waitlist-signup';
const anonKey = window.SUPABASE_ANON_KEY || '';

function setStatus(msg, kind) {
  status.textContent = msg;
  status.className = 'status' + (kind ? ' ' + kind : '');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const email = String(fd.get('email') || '').trim();
  const trap = String(fd.get('website') || '').trim();

  if (trap) { setStatus('Thank you. You’re on the list.', 'success'); form.reset(); return; }
  if (!name) { setStatus('Please enter your name.', 'error'); form.elements.name.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !form.elements.email.checkValidity()) {
    setStatus('Please enter a valid email address.', 'error');
    form.elements.email.focus();
    return;
  }

  if (!window.SUPABASE_URL || window.SUPABASE_URL.indexOf('__SUPABASE_URL__') === 0) {
    setStatus('Signup is not connected yet. Please check back soon.', 'error');
    return;
  }

  btn.disabled = true;
  setStatus('Sending…');
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + anonKey,
        'apikey': anonKey,
      },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data.error || 'We could not save your signup right now. Please try again.', 'error');
      btn.disabled = false;
      return;
    }
    form.reset();
    setStatus(data.message || 'Thank you. You’re on the list.', 'success');
  } catch (err) {
    setStatus('Network error. Please try again.', 'error');
    btn.disabled = false;
  }
});
