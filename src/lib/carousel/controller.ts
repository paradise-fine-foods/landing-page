export const nextIndex = (current: number, count: number): number =>
  Math.min(current + 1, Math.max(0, count - 1));

export const previousIndex = (current: number): number => Math.max(0, current - 1);

export interface CarouselController { dispose(): void }
export interface CarouselOptions { reduceMotion: boolean }

export function createCarousel(root: HTMLElement, options: CarouselOptions): CarouselController {
  const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]');
  const controls = root.querySelector<HTMLElement>('[data-carousel-controls]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-carousel-item]')];
  const previous = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  if (!viewport || !controls || !previous || !next || !status || items.length === 0) {
    return { dispose() {} };
  }

  let index = 0;
  let disposed = false;
  const removers: Array<() => void> = [];
  const statusTemplate = status.dataset.carouselStatusTemplate;
  const update = () => {
    status.textContent = statusTemplate
      ? statusTemplate.replace('{current}', String(index + 1)).replace('{total}', String(items.length))
      : `${index + 1} / ${items.length}`;
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
  };
  const moveTo = (nextValue: number) => {
    const clamped = Math.max(0, Math.min(nextValue, items.length - 1));
    if (clamped === index) return;
    index = clamped;
    update();
    items[index].scrollIntoView({
      behavior: options.reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  };
  const onPrevious = () => moveTo(previousIndex(index));
  const onNext = () => moveTo(nextIndex(index, items.length));
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    moveTo(event.key === 'ArrowLeft' ? previousIndex(index) : nextIndex(index, items.length));
  };
  const onScroll = () => {
    const origin = items[0].offsetLeft;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (const [itemIndex, item] of items.entries()) {
      const itemDistance = Math.abs((item.offsetLeft - origin) - viewport.scrollLeft);
      if (itemDistance < distance) {
        closest = itemIndex;
        distance = itemDistance;
      }
    }
    if (closest !== index) {
      index = closest;
      update();
    }
  };
  const listen = <K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, listener as EventListener, options);
    removers.push(() => target.removeEventListener(type, listener as EventListener, options));
  };

  try {
    listen(previous, 'click', onPrevious);
    listen(next, 'click', onNext);
    listen(viewport, 'keydown', onKeydown);
    listen(viewport, 'scroll', onScroll, { passive: true });
    update();
    controls.hidden = false;
  } catch {
    for (const remove of removers.splice(0).reverse()) remove();
  }

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const remove of removers.splice(0).reverse()) remove();
    },
  };
}
