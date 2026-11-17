/* הסכם · לוח הורים */
(function () {
  'use strict';

  var cfg = window.HESKEM_FIREBASE_CONFIG || {};
  var DEMO = !cfg.apiKey;
  var LIMITS = [15, 30, 45, 60, 90, 120, 180, 240];
  var BONUSES = [-15, 15, 30, 60];
  var PERM_NAMES = {
    accessibility: 'שירות נגישות (נעילת אפליקציות ומדידת זמן)',
    admin: 'מנהל מכשיר (הגנה מפני הסרה)',
    callScreening: 'סינון שיחות נכנסות',
    callRedirection: 'חסימת שיחות יוצאות'
  };

  var state = { user: null, family: null, childId: null, signup: false, filter: '', loadError: null };
  var renderPending = false;

  /* ---------- כלי עזר ---------- */
  function $(sel) { return document.querySelector(sel); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var kid = arguments[i];
      if (kid === null || kid === undefined || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return el;
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function newCode() {
    var a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return String(a[0] % 100000000).padStart(8, '0');
  }
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.hidden = true; }, 3500);
  }
  function ago(ms) {
    var min = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (min < 1) return 'עכשיו';
    if (min < 60) return 'לפני ' + min + ' דק׳';
    var hrs = Math.round(min / 60);
    if (hrs < 24) return 'לפני ' + hrs + ' שע׳';
    return 'לפני ' + Math.round(hrs / 24) + ' ימים';
  }

  /* ---------- שכבת נתונים: Firebase או הדגמה ---------- */
  function firebaseBackend() {
    firebase.initializeApp(cfg);
    var auth = firebase.auth();
    var db = firebase.database();
    var famRef = null;
    return {
      onAuth: function (cb) { auth.onAuthStateChanged(function (u) { cb(u ? { uid: u.uid, email: u.email } : null); }); },
      signIn: function (e, p) { return auth.signInWithEmailAndPassword(e, p); },
      signUp: function (e, p) { return auth.createUserWithEmailAndPassword(e, p); },
      signOut: function () { if (famRef) { famRef.off(); famRef = null; } return auth.signOut(); },
      watch: function (uid, cb) {
        if (famRef) famRef.off();
        famRef = db.ref('families/' + uid);
        famRef.on('value', function (s) { cb(s.val() || {}); }, function (err) { cb(null, err); });
      },
      update: function (updates) { return db.ref().update(updates); },
      newKey: function () { return db.ref().push().key; }
    };
  }

  function demoBackend() {
    var d = today();
    var tree = { families: { demo: { children: {
      c1: {
        name: 'ילד לדוגמה א׳', pairCode: '48213907',
        policy: {
          lockAll: false, lockSettings: true,
          apps: {
            'com,google,android,youtube': { limitMin: 60, bonusMin: 15, bonusDate: d },
            'com,zhiliaoapp,musically': { limitMin: 30 },
            'com,roblox,client': { locked: true, limitMin: 45 }
          },
          calls: { locked: false, schedule: { enabled: true, start: '08:00', end: '13:30' },
            allowed: { n1: { name: 'אבא', number: '050-0000001' }, n2: { name: 'אמא', number: '050-0000002' } } }
        },
        device: {
          info: { lastSeen: Date.now() - 40000, model: 'Galaxy A15', perms: { accessibility: true, admin: true, callScreening: true, callRedirection: true } },
          apps: {
            'com,google,android,youtube': { label: 'YouTube' }, 'com,zhiliaoapp,musically': { label: 'TikTok' },
            'com,roblox,client': { label: 'Roblox' }, 'com,whatsapp': { label: 'WhatsApp' },
            'com,android,chrome': { label: 'Chrome' }, 'com,google,android,apps,photos': { label: 'תמונות' },
            'com,spotify,music': { label: 'Spotify' }
          },
          usage: { date: d, apps: { 'com,google,android,youtube': 52, 'com,zhiliaoapp,musically': 31, 'com,whatsapp': 18, 'com,roblox,client': 12 } }
        }
      },
      c2: { name: 'ילד לדוגמה ב׳', pairCode: '70551236', policy: { lockAll: false } }
    } } }, pairing: {} };
    var listener = null;
    var n = 0;
    function setPath(path, val) {
      var parts = path.split('/');
      var node = tree;
      for (var i = 0; i < parts.length - 1; i++) {
        if (typeof node[parts[i]] !== 'object' || node[parts[i]] === null) node[parts[i]] = {};
        node = node[parts[i]];
      }
      if (val === null) delete node[parts[parts.length - 1]];
      else node[parts[parts.length - 1]] = val;
    }
    function emit() { if (listener) listener(JSON.parse(JSON.stringify(tree.families.demo || {}))); }
    return {
      onAuth: function (cb) { cb({ uid: 'demo', email: 'demo' }); },
      signIn: function () { return Promise.resolve(); },
      signUp: function () { return Promise.resolve(); },
      signOut: function () { toast('במצב הדגמה אין חשבון לצאת ממנו'); return Promise.resolve(); },
      watch: function (uid, cb) { listener = cb; emit(); },
      update: function (updates) {
        Object.keys(updates).forEach(function (p) { setPath(p, updates[p]); });
        emit();
        return Promise.resolve();
      },
      newKey: function () { n += 1; return 'demo' + n; }
    };
  }

  var backend = DEMO ? demoBackend() : firebaseBackend();

  function write(updates) {
    return backend.update(updates).catch(function () {
      toast('השינוי לא נשמר. בדוק את החיבור לאינטרנט ונסה שוב.');
    });
  }
  function childPath(sub) {
    return 'families/' + state.user.uid + '/children/' + state.childId + (sub ? '/' + sub : '');
  }

  /* ---------- כניסה ---------- */
  function authMessage(err) {
    var code = (err && err.code) || '';
    if (code.indexOf('invalid-credential') > -1 || code.indexOf('wrong-password') > -1 || code.indexOf('user-not-found') > -1)
      return 'האימייל או הסיסמה לא נכונים. בדוק ונסה שוב.';
    if (code.indexOf('email-already-in-use') > -1) return 'כבר יש חשבון עם האימייל הזה. עבור לכניסה.';
    if (code.indexOf('weak-password') > -1) return 'הסיסמה קצרה מדי. צריך לפחות 6 תווים.';
    if (code.indexOf('invalid-email') > -1) return 'כתובת האימייל לא תקינה.';
    if (code.indexOf('network') > -1) return 'אין חיבור לאינטרנט. נסה שוב בעוד רגע.';
    return 'הכניסה נכשלה. נסה שוב.';
  }
  function setupLogin() {
    var form = $('#login-form');
    var errBox = $('#login-error');
    var submit = $('#login-submit');
    function label() {
      $('#login-title').textContent = state.signup ? 'פתיחת חשבון הורים' : 'כניסת הורים';
      submit.textContent = state.signup ? 'פתח חשבון' : 'כניסה';
      $('#login-toggle').textContent = state.signup ? 'יש לי כבר חשבון, עבור לכניסה' : 'אין לי חשבון עדיין, פתח חשבון חדש';
      $('#password').setAttribute('autocomplete', state.signup ? 'new-password' : 'current-password');
    }
    $('#login-toggle').addEventListener('click', function () { state.signup = !state.signup; errBox.hidden = true; label(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#email').value.trim();
      var pass = $('#password').value;
      if (!email || pass.length < 6) {
        errBox.textContent = 'צריך למלא אימייל וסיסמה של 6 תווים לפחות.';
        errBox.hidden = false;
        return;
      }
      errBox.hidden = true;
      submit.disabled = true;
      submit.textContent = 'רגע...';
      var p = state.signup ? backend.signUp(email, pass) : backend.signIn(email, pass);
      p.catch(function (err) { errBox.textContent = authMessage(err); errBox.hidden = false; })
        .then(function () { submit.disabled = false; label(); });
    });
    label();
  }

  /* ---------- פעולות ---------- */
  function addChild(name) {
    var id = backend.newKey();
    var code = newCode();
    var updates = {};
    updates['pairing/' + code] = { uid: state.user.uid, childId: id };
    updates['families/' + state.user.uid + '/children/' + id] = {
      name: name, pairCode: code, policy: { lockAll: false, lockSettings: false }
    };
    state.childId = id;
    write(updates);
  }
  function deleteChild(child) {
    if (!window.confirm('למחוק את ' + child.name + ' וכל ההגדרות שלו? אי אפשר לבטל את זה.')) return;
    var updates = {};
    if (child.pairCode) updates['pairing/' + child.pairCode] = null;
    updates[childPath()] = null;
    state.childId = null;
    write(updates);
  }
  function renewCode(child) {
    if (!window.confirm('קוד חדש ינתק את הטלפון המחובר כרגע, ויהיה צריך להקליד בו את הקוד החדש. להמשיך?')) return;
    var code = newCode();
    var updates = {};
    if (child.pairCode) updates['pairing/' + child.pairCode] = null;
    updates['pairing/' + code] = { uid: state.user.uid, childId: state.childId };
    updates[childPath('pairCode')] = code;
    updates[childPath('device')] = null;
    write(updates);
  }
  function setPolicy(sub, value) {
    var u = {};
    u[childPath('policy/' + sub)] = value;
    return write(u);
  }
  function addBonus(key, rule, minutes) {
    var d = today();
    var current = rule.bonusDate === d ? (rule.bonusMin || 0) : 0;
    var u = {};
    u[childPath('policy/apps/' + key + '/bonusMin')] = current + minutes;
    u[childPath('policy/apps/' + key + '/bonusDate')] = d;
    write(u).then(function () {
      toast(minutes > 0 ? 'נוספו ' + minutes + ' דקות להיום' : 'ירדו ' + (-minutes) + ' דקות מהיום');
    });
  }

  /* ---------- רכיבים ---------- */
  function switchRow(title, desc, on, onToggle) {
    var btn = h('button', {
      class: 'switch', type: 'button', role: 'switch', 'aria-checked': on ? 'true' : 'false', 'aria-label': title,
      onclick: function () { onToggle(!on); }
    });
    return h('div', { class: 'switch-row' },
      h('div', { class: 'grow' }, h('h3', { text: title }), h('p', { class: 'muted small', text: desc })),
      h('span', { class: 'switch-hit' }, btn));
  }

  function appRow(key, label, rule, usedMin) {
    var d = today();
    var limit = (typeof rule.limitMin === 'number') ? rule.limitMin : null;
    var bonus = rule.bonusDate === d ? (rule.bonusMin || 0) : 0;
    var total = limit === null ? null : Math.max(0, limit + bonus);
    var over = total !== null && usedMin >= total;

    var stateText, stateClass = 'app-state';
    if (rule.locked) { stateText = 'נעול עכשיו'; stateClass += ' is-locked'; }
    else if (total !== null) { stateText = usedMin + ' מתוך ' + total + ' דק׳ היום'; if (over) stateClass += ' is-over'; }
    else if (usedMin > 0) stateText = usedMin + ' דק׳ היום';
    else stateText = 'ללא הגבלה';

    var row = h('div', { class: 'app-row', 'data-name': label.toLowerCase() },
      h('div', { class: 'app-top' },
        h('span', { class: 'app-name', dir: 'auto', text: label }),
        h('span', { class: stateClass, text: stateText })));

    if (total !== null) {
      var pct = total === 0 ? 100 : Math.min(100, Math.round(usedMin / total * 100));
      var fill = h('i');
      fill.style.width = pct + '%';
      row.appendChild(h('div', { class: 'bar' + (over ? ' is-over' : ''), role: 'img', 'aria-label': 'נוצלו ' + pct + ' אחוזים מהזמן' }, fill));
    }

    var select = h('select', {
      'aria-label': 'הקצבה יומית ל-' + label,
      onchange: function () {
        var v = select.value === '' ? null : Number(select.value);
        select.blur();
        setPolicy('apps/' + key + '/limitMin', v);
      }
    });
    select.appendChild(h('option', { value: '', text: 'ללא הגבלת זמן' }));
    var opts = LIMITS.slice();
    if (limit !== null && opts.indexOf(limit) === -1) opts.push(limit);
    opts.sort(function (a, b) { return a - b; }).forEach(function (m) {
      var txt = m < 60 ? m + ' דק׳ ביום' : (m % 60 === 0 ? (m / 60) + ' שע׳ ביום' : (m / 60).toFixed(1) + ' שע׳ ביום');
      select.appendChild(h('option', { value: String(m), text: txt, selected: limit === m }));
    });
    select.value = limit === null ? '' : String(limit);

    var controls = h('div', { class: 'app-controls' }, select);
    if (limit !== null) {
      BONUSES.forEach(function (m) {
        controls.appendChild(h('button', {
          class: 'btn ' + (m > 0 ? 'btn-bonus' : 'btn-minus'), type: 'button',
          'aria-label': (m > 0 ? 'הוסף ' + m + ' דקות ל-' : 'הורד ' + (-m) + ' דקות מ-') + label,
          onclick: function () { addBonus(key, rule, m); }
        }, (m > 0 ? '+' : '\u2212') + Math.abs(m)));
      });
    }
    controls.appendChild(h('button', {
      class: 'btn ' + (rule.locked ? 'btn-primary' : 'btn-danger'), type: 'button',
      onclick: function () { setPolicy('apps/' + key + '/locked', rule.locked ? null : true); }
    }, rule.locked ? 'פתח' : 'נעל עכשיו'));
    row.appendChild(controls);

    if (bonus !== 0) {
      row.appendChild(h('div', { class: 'small' },
        h('span', { class: bonus > 0 ? 'app-bonus' : 'app-minus', text: (bonus > 0 ? 'בונוס היום: ' + bonus : 'הורדה היום: ' + (-bonus)) + ' דק׳ ' }),
        h('button', { class: 'btn-link', type: 'button', onclick: function () { setPolicy('apps/' + key + '/bonusMin', 0); } }, 'אפס')));
    }
    return row;
  }

  function appsCard(child) {
    var policyApps = (child.policy && child.policy.apps) || {};
    var device = child.device || {};
    var deviceApps = device.apps || {};
    var usage = (device.usage && device.usage.date === today() && device.usage.apps) || {};

    var keys = {};
    Object.keys(deviceApps).forEach(function (k) { keys[k] = true; });
    Object.keys(policyApps).forEach(function (k) { keys[k] = true; });
    var items = Object.keys(keys).map(function (k) {
      var rule = policyApps[k] || {};
      return {
        key: k, rule: rule, used: usage[k] || 0,
        label: (deviceApps[k] && deviceApps[k].label) || k.replace(/,/g, '.'),
        active: !!rule.locked || typeof rule.limitMin === 'number' || (usage[k] || 0) > 0
      };
    }).sort(function (a, b) { return (b.used - a.used) || a.label.localeCompare(b.label, 'he'); });

    var card = h('section', { class: 'card' },
      h('h2', { text: 'אפליקציות' }),
      h('p', { class: 'muted', text: 'קובעים הקצבה יומית, מוסיפים בונוס, או נועלים ופותחים באותו רגע.' }));

    if (!items.length) {
      card.appendChild(h('p', { class: 'empty', text: 'רשימת האפליקציות תופיע כאן אחרי שהטלפון של הילד יתחבר.' }));
      return card;
    }

    var search = h('input', { type: 'search', dir: 'auto', placeholder: 'חיפוש אפליקציה', 'aria-label': 'חיפוש אפליקציה', value: state.filter });
    var activeList = h('div', { class: 'app-list' });
    var restList = h('div', { class: 'app-list' });
    items.forEach(function (it) { (it.active ? activeList : restList).appendChild(appRow(it.key, it.label, it.rule, it.used)); });
    var rest = h('details', { class: 'more' },
      h('summary', { text: 'שאר האפליקציות (' + restList.children.length + ')' }), restList);
    var none = h('p', { class: 'empty', text: 'לא נמצאה אפליקציה בשם הזה.', hidden: true });

    function applyFilter() {
      var q = search.value.trim().toLowerCase();
      state.filter = search.value;
      var shown = 0;
      card.querySelectorAll('.app-row').forEach(function (r) {
        var match = !q || r.getAttribute('data-name').indexOf(q) > -1;
        r.hidden = !match;
        if (match) shown += 1;
      });
      if (q) rest.open = true;
      none.hidden = shown > 0;
    }
    search.addEventListener('input', applyFilter);

    card.appendChild(search);
    if (activeList.children.length) card.appendChild(activeList);
    else card.appendChild(h('p', { class: 'empty', text: 'עוד לא הוגדרה הקצבה לאף אפליקציה. בחר אפליקציה מהרשימה למטה.' }));
    if (restList.children.length) card.appendChild(rest);
    card.appendChild(none);
    if (state.filter) applyFilter();
    return card;
  }

  function callsCard(child) {
    var calls = (child.policy && child.policy.calls) || {};
    var sched = calls.schedule || {};
    var allowed = calls.allowed || {};

    var card = h('section', { class: 'card' },
      h('h2', { text: 'שיחות טלפון' }),
      h('p', { class: 'muted', text: 'בזמן נעילה עוברות רק שיחות מהמספרים המאושרים. שיחות חירום פתוחות תמיד.' }));

    card.appendChild(switchRow('נעילת שיחות עכשיו', 'חוסם שיחות יוצאות ונכנסות עד שתפתח.', !!calls.locked,
      function (v) { setPolicy('calls/locked', v); }));
    card.appendChild(switchRow('נעילה בשעות קבועות', 'למשל בזמן בית הספר או בלילה.', !!sched.enabled,
      function (v) {
        var u = {};
        u[childPath('policy/calls/schedule/enabled')] = v;
        if (!sched.start) u[childPath('policy/calls/schedule/start')] = '08:00';
        if (!sched.end) u[childPath('policy/calls/schedule/end')] = '13:30';
        write(u);
      }));

    if (sched.enabled) {
      var start = h('input', { type: 'time', id: 'sched-start', value: sched.start || '08:00',
        onchange: function () { if (start.value) setPolicy('calls/schedule/start', start.value); } });
      var end = h('input', { type: 'time', id: 'sched-end', value: sched.end || '13:30',
        onchange: function () { if (end.value) setPolicy('calls/schedule/end', end.value); } });
      card.appendChild(h('div', { class: 'time-row' },
        h('label', { for: 'sched-start', text: 'משעה' }), start,
        h('label', { for: 'sched-end', text: 'עד שעה' }), end));
    }

    card.appendChild(h('h3', { text: 'מספרים מאושרים' }));
    var ids = Object.keys(allowed);
    if (!ids.length) card.appendChild(h('p', { class: 'muted small', text: 'עדיין אין מספרים. כדאי להוסיף את אבא ואמא כדי שהילד תמיד יוכל להשיג אתכם.' }));
    ids.forEach(function (id) {
      var n = allowed[id] || {};
      card.appendChild(h('div', { class: 'number-row' },
        h('span', { class: 'grow' }, h('strong', { dir: 'auto', text: n.name || 'ללא שם' }), ' · ', h('bdi', { text: n.number || '' })),
        h('button', { class: 'btn btn-quiet', type: 'button', 'aria-label': 'הסר את ' + (n.name || n.number),
          onclick: function () { setPolicy('calls/allowed/' + id, null); } }, 'הסר')));
    });

    var nameIn = h('input', { type: 'text', id: 'num-name', dir: 'auto', maxlength: '30' });
    var numIn = h('input', { type: 'tel', id: 'num-number', dir: 'ltr', inputmode: 'tel', maxlength: '20' });
    var err = h('p', { class: 'field-error', role: 'alert', hidden: true });
    var form = h('form', { class: 'inline-form', novalidate: true,
      onsubmit: function (e) {
        e.preventDefault();
        var digits = numIn.value.replace(/\D/g, '');
        if (digits.length < 7) { err.textContent = 'המספר קצר מדי. הקלד מספר טלפון מלא.'; err.hidden = false; numIn.focus(); return; }
        err.hidden = true;
        var name = nameIn.value.trim();
        var number = numIn.value.trim();
        nameIn.value = ''; numIn.value = '';
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        setPolicy('calls/allowed/' + backend.newKey(), { name: name, number: number });
      } },
      h('div', null, h('label', { for: 'num-name', text: 'שם' }), nameIn),
      h('div', null, h('label', { for: 'num-number', text: 'מספר טלפון' }), numIn),
      h('button', { class: 'btn btn-primary', type: 'submit' }, 'הוסף מספר'));
    card.appendChild(form);
    card.appendChild(err);
    return card;
  }

  function pairCard(child) {
    return h('section', { class: 'card' },
      h('h2', { text: 'חיבור הטלפון של ' + child.name }),
      h('p', { class: 'muted', text: 'הטלפון עדיין לא מחובר. כך מחברים אותו:' }),
      h('ol', { class: 'steps' },
        h('li', { text: 'מתקינים את אפליקציית "הסכם" בטלפון של הילד.' }),
        h('li', { text: 'פותחים אותה ומקלידים את הקוד הזה:' })),
      h('div', { class: 'pair-code', text: child.pairCode || '--------' }),
      h('ol', { class: 'steps', start: '3' },
        h('li', { text: 'מאשרים את ארבע ההרשאות שהאפליקציה מבקשת.' }),
        h('li', { text: 'חוזרים לכאן. רשימת האפליקציות תופיע בתוך דקה.' })));
  }

  function childView(child) {
    var frag = document.createDocumentFragment();
    var policy = child.policy || {};
    var info = (child.device && child.device.info) || null;
    var online = info && info.lastSeen && (Date.now() - info.lastSeen) < 3 * 60000;

    frag.appendChild(h('div', { class: 'child-head' },
      h('h1', { dir: 'auto', text: child.name || 'ללא שם' }),
      info
        ? h('span', { class: 'pill ' + (online ? 'pill-ok' : ''), text: online ? 'מחובר' : 'נראה לאחרונה ' + ago(info.lastSeen || 0) })
        : h('span', { class: 'pill pill-warn', text: 'ממתין לחיבור' }),
      info && info.model ? h('span', { class: 'muted small' }, h('bdi', { text: info.model })) : null));

    if (online && info.current) {
      var apps = (child.device && child.device.apps) || {};
      var openLabel = (apps[info.current] && apps[info.current].label) || info.current.replace(/,/g, '.');
      frag.appendChild(h('p', { class: 'muted small' }, 'פתוח עכשיו בטלפון: ', h('strong', { dir: 'auto', text: openLabel })));
    }

    if (!info) frag.appendChild(pairCard(child));

    if (info && info.perms) {
      var missing = Object.keys(PERM_NAMES).filter(function (k) { return info.perms[k] === false; });
      if (missing.length) {
        var ul = h('ul');
        missing.forEach(function (k) { ul.appendChild(h('li', { text: PERM_NAMES[k] })); });
        frag.appendChild(h('section', { class: 'card notice', role: 'alert' },
          h('h3', { text: 'חסרות הרשאות בטלפון של הילד' }),
          h('p', { class: 'small', text: 'בלי ההרשאות האלה חלק מהנעילות לא יעבדו. פתח את "הסכם" בטלפון של הילד ואשר אותן:' }), ul));
      }
    }

    var quick = h('section', { class: 'card' }, h('h2', { text: 'נעילה מהירה' }),
      h('p', { class: 'muted', text: 'השינוי מגיע לטלפון בתוך שניות, גם באמצע שימוש.' }));
    quick.appendChild(switchRow('נעילת כל האפליקציות', 'הטלפון נשאר פתוח רק לחיוג. מתאים כשההסכם הופר.', !!policy.lockAll,
      function (v) { setPolicy('lockAll', v); }));
    quick.appendChild(switchRow('נעילת ההגדרות', 'מונע מהילד לבטל הרשאות או להסיר את האפליקציה. להפעיל אחרי שסיימת את ההתקנה.', !!policy.lockSettings,
      function (v) { setPolicy('lockSettings', v); }));
    frag.appendChild(quick);

    frag.appendChild(appsCard(child));
    frag.appendChild(callsCard(child));

    frag.appendChild(h('section', { class: 'card' },
      h('h2', { text: 'ניהול' }),
      h('p', { class: 'muted', text: 'קוד החיבור הנוכחי: ' }, h('bdi', { text: child.pairCode || '' })),
      h('div', { class: 'row-actions' },
        h('button', { class: 'btn', type: 'button', onclick: function () { renewCode(child); } }, 'צור קוד חיבור חדש'),
        h('button', { class: 'btn btn-danger', type: 'button', onclick: function () { deleteChild(child); } }, 'מחק את הילד'))));
    return frag;
  }

  /* ---------- ציור ---------- */
  function render() {
    renderPending = false;
    var loggedIn = !!state.user;
    $('#login').hidden = loggedIn;
    $('#app').hidden = !loggedIn;
    if (!loggedIn) return;
    $('#demo-badge').hidden = !DEMO;

    var tabs = $('#tabs');
    var main = $('#main');
    tabs.textContent = '';
    main.textContent = '';

    if (state.loadError) {
      main.appendChild(h('section', { class: 'card' },
        h('h2', { text: 'לא הצלחנו לטעון את הנתונים' }),
        h('p', { class: 'muted', text: 'בדוק את החיבור לאינטרנט ואת כללי האבטחה ב-Firebase, ואז רענן את הדף.' }),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { location.reload(); } }, 'רענן')));
      return;
    }
    if (state.family === null) {
      main.appendChild(h('p', { class: 'empty', text: 'טוען...' }));
      return;
    }

    var children = state.family.children || {};
    var ids = Object.keys(children);
    if (!state.childId || !children[state.childId]) state.childId = ids[0] || null;

    ids.forEach(function (id) {
      tabs.appendChild(h('button', {
        class: 'tab', type: 'button', role: 'tab', 'aria-selected': id === state.childId ? 'true' : 'false', dir: 'auto',
        onclick: function () { state.childId = id; state.filter = ''; render(); }
      }, children[id].name || 'ללא שם'));
    });
    tabs.appendChild(h('button', { class: 'tab tab-add', type: 'button', onclick: openChildDialog }, '+ הוסף ילד'));

    if (!state.childId) {
      main.appendChild(h('section', { class: 'card' },
        h('h2', { text: 'מתחילים' }),
        h('p', { class: 'muted', text: 'הוסף את הילד הראשון כדי לקבל קוד חיבור לטלפון שלו.' }),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: openChildDialog }, 'הוסף ילד')));
      return;
    }
    main.appendChild(childView(children[state.childId]));
  }

  // לא מציירים מחדש בזמן שההורה מקליד בשדה, כדי שלא יאבד את מה שכתב
  function requestRender() {
    var a = document.activeElement;
    var typing = a && $('#main').contains(a) && (a.tagName === 'INPUT' || a.tagName === 'SELECT');
    if (typing) { renderPending = true; return; }
    render();
  }

  function openChildDialog() {
    var dlg = $('#child-dialog');
    $('#child-name').value = '';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    $('#child-name').focus();
  }

  /* ---------- הפעלה ---------- */
  function start() {
    setupLogin();
    $('#signout').addEventListener('click', function () { backend.signOut(); });
    $('#main').addEventListener('focusout', function () {
      setTimeout(function () { if (renderPending) requestRender(); }, 0);
    });
    $('#child-cancel').addEventListener('click', function () { $('#child-dialog').close(); });
    $('#child-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#child-name').value.trim();
      if (!name) { $('#child-name').focus(); return; }
      $('#child-dialog').close();
      addChild(name);
    });

    backend.onAuth(function (user) {
      state.user = user;
      state.family = null;
      state.loadError = null;
      state.childId = null;
      render();
      if (user) backend.watch(user.uid, function (val, err) {
        if (err) { state.loadError = err; render(); return; }
        state.family = val;
        requestRender();
      });
    });

    // רענון חיווי "מחובר" פעם בדקה
    setInterval(function () { if (state.user && state.family) requestRender(); }, 60000);
  }

  start();
})();
