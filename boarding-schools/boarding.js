/* Progressive enhancement: profiles and directory remain readable without JS. */
(async () => {
  'use strict';
  const lang = document.body.dataset.lang === 'en' ? 'en' : 'ko';
  const t = (ko, en) => lang === 'en' ? en : ko;
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params = new URLSearchParams(location.search);
  const mode = document.body.dataset.boardingPage;
  const status = document.createElement('p');
  status.className = 'boarding-status'; status.setAttribute('role', 'status');
  document.querySelector('main').append(status);
  let schools;
  try {
    const response = await fetch('/boarding-schools/schools.json');
    if (!response.ok) throw new Error('School data unavailable');
    schools = (await response.json()).schools;
  } catch {
    const error = document.querySelector('[data-guide-error]') || status;
    error.hidden = false;
    error.textContent = t('학교 데이터를 불러오지 못했습니다. 페이지를 새로고침하거나 학교 상세 페이지를 확인해 주세요.', 'School data could not be loaded. Reload or read the school profiles.');
    document.querySelectorAll('[data-compare-add], [data-add-selected], [data-copy-comparison]').forEach(b => { b.disabled = true; });
    return;
  }
  const bySlug = new Map(schools.map(s => [s.slug, s]));
  const normalise = raw => Array.isArray(raw) ? [...new Set(raw.filter(x => bySlug.has(x)))].slice(0, 3) : [];
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('mep-school-comparison') || '[]'); } catch {}
  let selected = normalise(params.has('schools') ? params.get('schools').split(',') : saved);
  const comparisonUrl = () => '/boarding-schools/compare/?schools=' + selected.join(',');
  const factHtml = fact => {
    if (!fact) return `<span class="unverified">${t('정보 확인 중', 'Not currently verified')}</span>`;
    const year = fact.year && !fact.en.includes(fact.year) ? `<small>${escape(fact.year)}</small>` : '';
    const note = fact.basis ? `<small>${escape(fact.basis[lang])}</small>` : '';
    return escape(fact[lang]) + year + note + (fact.vat ? `<small>${t('VAT 포함 (과세 항목 기준)', 'VAT included where applicable')}</small>` : '') +
      `<small class="school-source"><a href="${escape(fact.source)}" target="_blank" rel="noopener">${t('공식 출처 ↗', 'Official source ↗')}</a> · ${t('확인', 'Checked')} ${escape(fact.verified)}</small>`;
  };
  const compareFields = [
    ['지역','Location','location'], ['학교 유형','School type','gender'],
    ['연령·학년 범위','Age / year scope','ages'], ['기숙 형태','Boarding','boarding'],
    ['연간 수업·기숙학비','Annual tuition & boarding','fees'], ['학업 과정','Programmes','programmes'],
    ['시험 결과 · 지표·연도 확인','Exam results · check metric and year','results'],
    ['대학 진학','University destinations','destinations'], ['입학 학년','Entry years','entry'],
    ['지원·평가·면접','Application & assessments','admissions'], ['영어 요건','English requirements','english'],
    ['EAL / 영어 지원','EAL / English support','eal'], ['학습 지원','Learning support','learning'],
    ['활동·프로그램','Activities / programmes','activities']
  ];
  function mobilePair() {
    const pair = (document.querySelector('#compare-pair')?.value || '0,1').split(',').map(Number);
    document.querySelectorAll('[data-school-column]').forEach(cell => {
      cell.classList.toggle('mobile-hidden', !pair.includes(Number(cell.dataset.schoolColumn)));
    });
  }
  function renderTable() {
    const host = document.querySelector('[data-comparison-table]');
    if (!host) return;
    const chosen = selected.map(slug => bySlug.get(slug));
    document.querySelector('[data-comparison-status]').textContent = chosen.length ?
      t(`${chosen.length}개 학교 선택 · 순위순이 아닙니다.`, `${chosen.length} schools selected · no ranking.`) :
      t('비교할 학교를 선택해 주세요.', 'Choose schools to begin your comparison.');
    const pairWrap = document.querySelector('[data-mobile-pair]');
    pairWrap.hidden = chosen.length < 3;
    const pairSelect = document.querySelector('#compare-pair');
    const oldPair = pairSelect.value;
    pairSelect.innerHTML = chosen.length === 3 ? [[0,1],[0,2],[1,2]].map(pair =>
      `<option value="${pair.join(',')}">${pair.map(i => escape(chosen[i].name)).join(' / ')}</option>`).join('') : '';
    if ([...pairSelect.options].some(o => o.value === oldPair)) pairSelect.value = oldPair;
    host.innerHTML = chosen.length ? `<table class="comparison-table"><caption>${t('학교별 공식 정보 비교', 'Official school information comparison')}</caption><thead><tr><th scope="col">${t('비교 항목','Details')}</th>${chosen.map((s,i) => `<th scope="col" data-school-column="${i}"><a href="/boarding-schools/${s.slug}/">${escape(s.name)}</a><button type="button" data-compare-remove="${s.slug}" aria-label="${escape(t(s.name+' 비교에서 삭제', 'Remove '+s.name+' from comparison'))}">${t('삭제','Remove')} ×</button></th>`).join('')}</tr></thead><tbody>${compareFields.map(([ko,en,key]) => `<tr><th scope="row">${t(ko,en)}</th>${chosen.map((s,i) => `<td data-school-column="${i}">${factHtml(s.facts[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '';
    const share = document.querySelector('#share-url');
    share.value = new URL(comparisonUrl(), location.origin).href;
    document.querySelector('[data-copy-comparison]').disabled = !selected.length;
    mobilePair();
  }
  function sync() {
    try { localStorage.setItem('mep-school-comparison', JSON.stringify(selected)); } catch {}
    document.querySelectorAll('[data-compare-add]').forEach(button => {
      const active = selected.includes(button.dataset.compareAdd);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = !active && selected.length >= 3;
      button.textContent = active ? t('비교에서 삭제', 'Remove from Comparison') :
        t(mode === 'profile' ? '학교 비교하기' : '비교에 추가', mode === 'profile' ? 'Compare This School' : 'Add to Comparison');
    });
    document.querySelectorAll('[data-compare-link]').forEach(link => { link.href = comparisonUrl(); });
    document.querySelectorAll('[data-selection-summary]').forEach(node => { node.textContent = ` ${selected.length} / 3`; });
    document.querySelectorAll('[data-selected-schools]').forEach(node => {
      node.innerHTML = selected.map(slug => `<button type="button" data-compare-remove="${slug}" aria-label="${escape(t(bySlug.get(slug).name+' 비교에서 삭제', 'Remove '+bySlug.get(slug).name+' from comparison'))}">${escape(bySlug.get(slug).name)} <span aria-hidden="true">×</span></button>`).join('');
    });
    const chooser = document.querySelector('#compare-school');
    if (chooser) [...chooser.options].forEach(o => { o.disabled = selected.includes(o.value); });
    if (mode === 'compare' || params.has('schools')) {
      const url = new URL(location.href); url.searchParams.set('schools', selected.join(',')); history.replaceState(null,'',url);
    }
    renderTable();
  }
  function add(slug) {
    if (!bySlug.has(slug) || selected.includes(slug)) return;
    if (selected.length >= 3) { status.textContent = t('최대 3개 학교까지 비교할 수 있습니다. 먼저 한 학교를 삭제해 주세요.', 'You can compare up to three schools. Remove one first.'); return; }
    selected.push(slug); sync();
    status.textContent = t(`${bySlug.get(slug).name} 추가됨 · ${selected.length}/3`, `${bySlug.get(slug).name} added · ${selected.length}/3`);
  }
  document.addEventListener('click', event => {
    const remove = event.target.closest('[data-compare-remove]');
    const button = event.target.closest('[data-compare-add]');
    const slug = remove?.dataset.compareRemove || button?.dataset.compareAdd;
    if (!slug) return;
    if (remove || selected.includes(slug)) {
      selected = selected.filter(s => s !== slug); sync();
      status.textContent = t(`${bySlug.get(slug).name} 삭제됨`, `${bySlug.get(slug).name} removed`);
    } else add(slug);
  });
  document.querySelector('[data-add-selected]')?.addEventListener('click', () => {
    const chooser = document.querySelector('#compare-school');
    if (!chooser.value) { status.textContent = t('학교를 먼저 선택해 주세요.', 'Select a school first.'); chooser.focus(); return; }
    add(chooser.value); chooser.value = '';
  });
  document.querySelector('#compare-pair')?.addEventListener('change', mobilePair);
  document.querySelector('[data-copy-comparison]')?.addEventListener('click', async () => {
    const input = document.querySelector('#share-url');
    const message = document.querySelector('[data-copy-status]');
    try { await navigator.clipboard.writeText(input.value); message.textContent = t('링크를 복사했습니다.', 'Link copied.'); }
    catch { input.focus(); input.select(); message.textContent = t('선택된 링크를 복사해 주세요.', 'Copy the selected link.'); }
  });
  document.querySelectorAll('option[data-ko]').forEach(o => { o.textContent = o.dataset[lang]; });
  const form = document.querySelector('[data-school-filters]');
  if (form) {
    const normal = v => v.toLowerCase().replace(/[’‘']/g, '');
    const controls = [...form.elements].filter(c => c.name);
    controls.forEach(c => { c.value = params.get(c.name) || ''; });
    function filter() {
      const values = Object.fromEntries(new FormData(form)); let count = 0;
      schools.forEach(s => {
        const f = s.facts;
        const fee = f.fees?.value;
        const bounds = values.fee ? values.fee.split('-').map(Number) : null;
        const matches = (!values.q || normal(s.name).includes(normal(values.q.trim()))) &&
          (!values.county || f.location?.value === values.county) &&
          (!values.gender || f.gender?.value === values.gender) &&
          (!values.entry || f.entry?.value?.includes(Number(values.entry))) &&
          (!values.programme || f.programmes?.value?.includes(values.programme)) &&
          (!values.boarding || f.boarding?.value?.includes(values.boarding)) &&
          (!bounds || (Number.isFinite(fee) && fee >= bounds[0] && fee < bounds[1]));
        document.querySelector(`[data-school="${s.slug}"]`).hidden = !matches;
        if (matches) count++;
      });
      document.querySelector('[data-result-count]').textContent = t(`${count}개 학교`, `${count} schools`);
      document.querySelector('[data-no-results]').hidden = count !== 0;
      const url = new URL(location.href);
      controls.forEach(c => { if (c.value) url.searchParams.set(c.name,c.value); else url.searchParams.delete(c.name); });
      history.replaceState(null,'',url);
    }
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('input', filter);
    form.addEventListener('change', filter);
    form.addEventListener('reset', () => setTimeout(filter,0));
    filter();
  }
  sync();
})();
