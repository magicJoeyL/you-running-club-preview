const filters = document.querySelector('.news-filters');
const cards = [...document.querySelectorAll('#story-grid .news-card')];
const count = document.querySelector('#story-count');
if (filters && cards.length) {
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const category = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = category !== '全部' && card.dataset.category !== category; });
    count.textContent = `共${cards.filter(card => !card.hidden).length}篇`;
  });
}
