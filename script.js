const items = document.querySelector('.items');

let isDown = false;
let startX;
let scrollLeft;

items.addEventListener('mousedown', (e) => {
  isDown = true;
  items.classList.add('active');
  startX = e.pageX - items.offsetLeft;
  scrollLeft = items.scrollLeft;
});

items.addEventListener('mouseleave', () => {
  isDown = false;
  items.classList.remove('active');
});

items.addEventListener('mouseup', () => {
  isDown = false;
  items.classList.remove('active');
});

items.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - items.offsetLeft;
  const walk = (x - startX); // how far mouse moved
  items.scrollLeft = scrollLeft - walk;
});
