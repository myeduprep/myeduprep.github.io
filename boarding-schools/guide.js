/* Interactions use the same structured records as the generated static pages. */
(() => {
  'use strict';
  const schools = window.MEP_SCHOOLS || [];
  const labels = window.MEP_SCHOOL_LABELS || {};
  const english = document.body.dataset.lang === 'en';
  const t = (ko, en) => english ? en : ko;
  const known = f => f && f.value !== null && f.verifiedAt && f.sourceUrl;
  const key = 'mep-school-comparison';
  const ids = new Set(schools.map(s => s.id));
  let selected = [];
  try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) selected = saved; } catch {}
  const params = new URLSearchParams(location.search);
  if (params.has('schools')) selected = params.get('schools').split(',');
  selected = [...new Set(selected.filter(id => typeof id === 'string' && ids.has(id)))].slice(0, 3);
  function feedback(message) { document.querySelectorAll('[data-selection-feedback]').forEach(el => { el.textContent = message; }); }
  function comparisonUrl() { return '/boarding-schools/compare/?schools=' + selected.join(','); }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(selected)); } catch {}
    document.querySelectorAll('[data-compare-link]').forEach(link => { link.href = comparisonUrl(); });
    document.querySelectorAll('[data-selection-summary]').forEach(el => { el.textContent = t('선택한 학교', 'Selected schools') + `: ${selected.length} / 3`; });
    document.querySelectorAll('[data-compare-add]').forEach(button => {
      const active = selected.includes(button.dataset.compareAdd);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? t('비교에서 제외', 'Remove from Comparison') : t('비교에 추가', 'Add to Comparison');
    });
    if (document.body.dataset.guide === 'compare') {
      history.replaceState(null, '', comparisonUrl()); renderComparison();
    }
  }
  function add(id) {
    if (!ids.has(id) || selected.includes(id)) return;
    if (selected.length >= 3) { feedback(t('최대 3개 학교까지 비교할 수 있습니다. 먼저 선택한 학교를 제외해 주세요.', 'You can compare up to three schools. Remove a selected school first.')); return; }
    selected.push(id); feedback(t('학교를 비교에 추가했습니다.', 'School added to comparison.')); save();
  }
  document.querySelectorAll('[data-compare-add]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.compareAdd;
    if (selected.includes(id)) { selected = selected.filter(x => x !== id); feedback(t('학교를 비교에서 제외했습니다.', 'School removed from comparison.')); save(); } else add(id);
  }));
  const picker = document.querySelector('#school-picker');
  document.querySelector('[data-picker-add]')?.addEventListener('click', () => {
    if (!picker.value) { feedback(t('추가할 학교를 선택해 주세요.', 'Choose a school to add.')); return; }
    add(picker.value);
  });
  document.querySelector('[data-share]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(new URL(comparisonUrl(), location.origin).href); feedback(t('비교 링크를 복사했습니다.', 'Comparison link copied.')); }
    catch { feedback(t('주소창의 링크를 복사하여 공유해 주세요.', 'Copy the address bar URL to share this comparison.')); }
  });
  function renderFact(cell, field, key) {
    if (!known(field)) { cell.textContent = t('정보 확인 중', 'Not currently verified'); cell.classList.add('school-unknown'); return; }
    const value = field.value;
    const enums = {girls: t('여학교','Girls'), boys: t('남학교','Boys'), coeducational: t('남녀공학','Co-educational'), full: t('풀보딩','Full boarding'), weekly: t('주간 보딩','Weekly boarding'), flexible: t('유연 보딩','Flexible boarding')};
    cell.textContent = typeof value === 'object' && !Array.isArray(value) ? value[english ? 'en' : 'ko'] : Array.isArray(value) ? value.map(v => enums[v] || v).join(', ') : key === 'fees' ? '£' + value.toLocaleString('en-GB') : enums[value] || String(value);
    const meta = document.createElement('small'); meta.className = 'school-source';
    meta.textContent = [field.academicYear, field.verifiedAt].filter(Boolean).join(' · ') + ' · ';
    const source = document.createElement('a');
    if (/^https:\/\//.test(field.sourceUrl)) source.href = field.sourceUrl;
    source.textContent = t('공식 출처', 'Official source'); source.target = '_blank'; source.rel = 'noopener noreferrer';
    meta.append(source); cell.append(meta);
  }
  function renderComparison() {
    const table = document.querySelector('.school-compare-table'); if (!table) return;
    const items = selected.map(id => schools.find(s => s.id === id));
    table.hidden = !items.length; document.querySelector('[data-compare-empty]').hidden = !!items.length;
    table.style.setProperty('--school-count', String(items.length));
    const head = table.querySelector('thead'); const body = table.querySelector('tbody'); head.replaceChildren(); body.replaceChildren();
    const row = document.createElement('tr'); const first = document.createElement('th'); first.scope = 'col'; first.textContent = t('비교 항목', 'Compare'); row.append(first);
    for (const school of items) {
      const th = document.createElement('th'); th.scope = 'col';
      const link = document.createElement('a'); link.href = `/boarding-schools/${school.id}/`; link.textContent = school.name;
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'school-remove'; remove.textContent = t('제외', 'Remove'); remove.setAttribute('aria-label', `${school.name} ${t('비교에서 제외', 'remove from comparison')}`);
      remove.addEventListener('click', () => { selected = selected.filter(id => id !== school.id); save(); }); th.append(link, remove); row.append(th);
    }
    head.append(row);
    for (const field of ['location','gender','ageRange','boarding','fees','feeNotes','vat','programmes','results','destinations','application','entry','assessments','interviews','international','english','eal','learning','facilities']) {
      const tr = document.createElement('tr'); const th = document.createElement('th'); th.scope = 'row'; th.textContent = labels[field][english ? 1 : 0]; tr.append(th);
      for (const school of items) { const td = document.createElement('td'); renderFact(td, school.facts[field], field); tr.append(td); } body.append(tr);
    }
    for (const option of picker.options) option.disabled = selected.includes(option.value);
  }
  const form = document.querySelector('[data-school-filters]');
  if (form) {
    const county = form.querySelector('[data-filter="location"]');
    const counties = [...new Set(schools.filter(s => known(s.facts.location)).map(s => s.facts.location.value))].sort();
    for (const name of counties) { const option = document.createElement('option'); option.value = name; option.textContent = name; county.append(option); }
    // No county is guessed when official verification is unavailable.
    if (!counties.length) { const option = document.createElement('option'); option.value = 'unknown'; option.textContent = t('정보 확인 중', 'Not currently verified'); county.append(option); }
    function filter() {
      const filters = Object.fromEntries([...form.querySelectorAll('[data-filter]')].map(input => [input.dataset.filter, input.value.trim()]));
      let count = 0;
      for (const school of schools) {
        let match = !filters.search || school.name.normalize('NFKC').toLowerCase().replace(/[’']/g,'').includes(filters.search.normalize('NFKC').toLowerCase().replace(/[’']/g,''));
        for (const field of ['location','gender','age','programmes','fees','boarding']) {
          if (!filters[field]) continue;
          const fact = school.facts[field]; if (!known(fact)) { match = false; continue; }
          const value = fact.value;
          if (field === 'fees') { const [min,max] = filters.fees.split('-').map(Number); if (typeof value !== 'number' || !fact.academicYear || value < min || value >= max) match = false; }
          else if (field === 'age') { if (!Array.isArray(value) || !value.includes(Number(filters.age))) match = false; }
          else if (Array.isArray(value) ? !value.includes(filters[field]) : value !== filters[field]) match = false;
        }
        document.querySelector(`[data-school-card="${school.id}"]`).hidden = !match; if (match) count++;
      }
      document.querySelector('[data-results-count]').textContent = t(`${count}개 학교`, `${count} schools`);
      document.querySelector('[data-no-results]').hidden = count > 0;
    }
    form.addEventListener('input', filter); form.addEventListener('change', filter);
    form.addEventListener('reset', () => { setTimeout(filter, 0); }); filter();
  }
  save();
})();
