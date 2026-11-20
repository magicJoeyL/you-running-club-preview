(() => {
  const form = document.querySelector('#season-filters');
  if (!form) return;
  const search = document.querySelector('#record-search');
  const month = document.querySelector('#record-month');
  const kind = document.querySelector('#record-kind');
  const records = [...document.querySelectorAll('.season-record')];
  const count = document.querySelector('#record-count');
  const empty = document.querySelector('#season-empty');
  function filter() {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const record of records) {
      const match = (month.value === 'all' || record.dataset.month === month.value) &&
        (kind.value === 'all' || record.dataset.kind === kind.value) &&
        words.every(word => record.dataset.search.toLocaleLowerCase().includes(word));
      record.hidden = !match;
      if (match) shown++;
    }
    count.textContent = shown + '篇图文';
    empty.hidden = shown > 0;
  }
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('reset', () => {
    search.value = ''; month.value = 'all'; kind.value = 'all'; filter();
  });
  filter();
})();
