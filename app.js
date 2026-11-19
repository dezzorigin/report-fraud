/* Report Fraud — penjelajah subdomain.
   Data: full_hosts_scan_usk.txt (Bagian 3), dimuat saat runtime dan
   diparse di browser. Tidak ada data lain yang ditambahkan.
   Klasifikasi (lihat docs/API.md): label `dev` di awal/akhir nama ->
   Dev & staging; awalan webmail. -> Webmail; awalan mail. -> Mail;
   mengandung kode fakultas -> Fakultas; entri wildcard (*) -> Lainnya;
   sisanya -> Layanan. */
'use strict';

var PAGE_SIZE = 50;
var FACULTY = ['fk', 'fkip', 'feb', 'fh', 'ft', 'fmipa', 'fkp', 'fkh', 'fkg', 'fisip', 'fp', 'tp', 'sps'];

var state = { hosts: [], query: '', filter: 'semua', page: 1, loaded: false };

function el(id) { return document.getElementById(id); }

function classify(host) {
  if (host.indexOf('*') !== -1) return 'lainnya';
  var labels = host.toLowerCase().split('.');
  for (var i = 0; i < labels.length; i++) {
    var lab = labels[i];
    if (lab === 'dev' || lab.indexOf('dev') === 0 || lab.slice(-3) === 'dev') return 'dev';
  }
  if (labels[0] === 'webmail') return 'webmail';
  if (labels[0] === 'mail') return 'mail';
  for (var j = 0; j < labels.length; j++) {
    if (FACULTY.indexOf(labels[j]) !== -1) return 'fakultas';
  }
  return 'layanan';
}

function suffixNote(raw, host) {
  var idx = raw.indexOf(':');
  if (idx === -1) return '';
  var suf = raw.slice(idx + 1);
  if (/^\d+\.\d+\.\d+\.\d+$/.test(suf)) return 'IP ' + suf;
  if (suf.indexOf('google') !== -1) return 'MX Google';
  if (suf === host) return 'rujukan silang';
  return 'catatan: ' + suf;
}

function parseHosts(text) {
  var lines = text.split(/\r?\n/);
  var start = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('PART 3') !== -1) { start = i + 1; break; }
  }
  if (start === -1) throw new Error('Bagian 3 tidak ditemukan di data mentah');
  var out = [];
  for (var j = start; j < lines.length; j++) {
    var raw = lines[j].trim();
    if (!raw) continue;
    var host = raw.split(':')[0];
    out.push({ raw: raw, host: host, cat: classify(host), note: suffixNote(raw, host) });
  }
  return out;
}

function filtered() {
  var q = state.query.trim().toLowerCase();
  return state.hosts.filter(function (h) {
    if (state.filter !== 'semua' && h.cat !== state.filter) return false;
    if (q && h.host.toLowerCase().indexOf(q) === -1 && h.raw.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}

var CAT_LABEL = { semua: 'Semua', dev: 'Dev & staging', webmail: 'Webmail', mail: 'Mail', fakultas: 'Fakultas', layanan: 'Layanan', lainnya: 'Lainnya' };

function render() {
  var list = el('host-list');
  var items = filtered();
  var pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (state.page > pages) state.page = pages;
  var start = (state.page - 1) * PAGE_SIZE;
  var slice = items.slice(start, start + PAGE_SIZE);

  list.innerHTML = '';
  if (slice.length === 0) {
    var li = document.createElement('li');
    li.textContent = 'Tidak ada host yang cocok dengan pencarian/filter ini.';
    list.appendChild(li);
  } else {
    slice.forEach(function (h) {
      var row = document.createElement('li');
      var name = document.createElement('span');
      name.className = 'host-name';
      name.textContent = h.host;
      row.appendChild(name);
      var note = document.createElement('span');
      note.className = 'host-note';
      note.textContent = h.note;
      row.appendChild(note);
      var cat = document.createElement('span');
      cat.className = 'host-cat' + (h.cat === 'dev' ? ' host-cat-dev' : '');
      cat.textContent = CAT_LABEL[h.cat];
      row.appendChild(cat);
      list.appendChild(row);
    });
  }

  el('explorer-meta').textContent =
    'Menampilkan ' + (items.length === 0 ? 0 : start + 1) + '–' + Math.min(start + PAGE_SIZE, items.length) +
    ' dari ' + items.length + ' host' +
    (state.filter !== 'semua' || state.query ? ' (difilter dari 893 host di lampiran)' : ' di lampiran') +
    ' · data: full_hosts_scan_usk.txt, 29 April 2026.';
  el('pager').hidden = items.length <= PAGE_SIZE;
  el('pager-info').textContent = 'Halaman ' + state.page + ' dari ' + pages;
  el('pager-prev').disabled = state.page <= 1;
  el('pager-next').disabled = state.page >= pages;
}

function renderChips() {
  var counts = { semua: state.hosts.length };
  state.hosts.forEach(function (h) { counts[h.cat] = (counts[h.cat] || 0) + 1; });
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    var key = chip.getAttribute('data-filter');
    chip.textContent = CAT_LABEL[key] + ' (' + (counts[key] || 0) + ')';
    chip.disabled = false;
  });
}

function init() {
  var input = el('cari');
  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.query = input.value;
      state.page = 1;
      render();
    }, 120);
  });
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.filter = chip.getAttribute('data-filter');
      state.page = 1;
      document.querySelectorAll('.chip').forEach(function (c) {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      render();
    });
  });
  el('pager-prev').addEventListener('click', function () {
    if (state.page > 1) { state.page -= 1; render(); el('penjelajah').scrollIntoView({ behavior: 'smooth' }); }
  });
  el('pager-next').addEventListener('click', function () {
    state.page += 1; render(); el('penjelajah').scrollIntoView({ behavior: 'smooth' });
  });

  // Tombol salin (bukti temuan A).
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      function done() {
        btn.textContent = 'Disalin';
        setTimeout(function () { btn.textContent = 'Salin URL'; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* abaikan */ }
        document.body.removeChild(ta);
        done();
      }
    });
  });

  fetch('full_hosts_scan_usk.txt')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function (text) {
      state.hosts = parseHosts(text);
      state.loaded = true;
      input.disabled = false;
      renderChips();
      render();
    })
    .catch(function () {
      el('explorer-meta').textContent = 'Data lampiran gagal dimuat.';
      el('explorer-error').hidden = false;
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
