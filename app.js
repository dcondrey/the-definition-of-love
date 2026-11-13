const privacyPanel = document.getElementById('privacy-panel');
const openPrivacy = document.getElementById('open-privacy');
const closePrivacy = document.getElementById('close-privacy');
if (privacyPanel && openPrivacy && closePrivacy) {
  openPrivacy.addEventListener('click', () => {
    if (typeof privacyPanel.showModal === 'function') privacyPanel.showModal();
    else privacyPanel.setAttribute('open', '');
  });
  closePrivacy.addEventListener('click', () => privacyPanel.close());
  privacyPanel.addEventListener('click', (e) => {
    const r = privacyPanel.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) privacyPanel.close();
  });
}

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
