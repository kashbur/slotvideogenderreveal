// Slot Machine JS with Glare Effect Integration

const icons = [
  "img/blue7.png",
  "img/bluefoot.png",
  "img/boy.png",
  "img/girl.png",
  "img/heart.png",
  "img/pink7.png",
  "img/pinkfoot.png",
  "img/red7.png"
];

const strips = document.querySelectorAll('.strip');
const speeds = [35, 38, 40];
const reels = [];
let rafId = null;
let isSpinning = false;
let spinCount = 0;
let dimensionsReady = false;
const handle = document.getElementById('handle');

function getColorType(url) {
  if (url.includes("blue") || url.includes("boy")) return "blue";
  if (url.includes("pink") || url.includes("girl")) return "pink";
  return "neutral";
}

function selectIcons() {
  let picked;
  do {
    picked = [
      icons[Math.floor(Math.random() * icons.length)],
      icons[Math.floor(Math.random() * icons.length)],
      icons[Math.floor(Math.random() * icons.length)],
    ];
  } while (
    spinCount < 3 &&
    (picked.every(icon => getColorType(icon) === "blue") ||
     picked.every(icon => getColorType(icon) === "pink"))
  );
  return picked;
}

window.addEventListener('load', () => {
  const initPromises = [];

  strips.forEach((strip, i) => {
    const fragment = document.createDocumentFragment();
    for (let j = 0; j < 30; j++) {
      const img = document.createElement("img");
      img.src = icons[j % icons.length];
      fragment.appendChild(img);
    }
    strip.appendChild(fragment);

    const clone = strip.cloneNode(true);
    clone.style.display = 'none';
    strip.parentNode.appendChild(clone);

    const images = strip.querySelectorAll("img");

    const reel = {
      strip,
      clone,
      height: 0,
      pos: 0,
      speed: speeds[i],
      spinning: false,
      images,
      iconHeight: 0
    };
    reels.push(reel);

    const loadPromise = Promise.all(
      Array.from(images).map(img => new Promise(res => {
        if (img.complete) res();
        else img.addEventListener('load', res, { once: true });
      }))
    ).then(() => {
      reel.height = strip.scrollHeight;
      reel.iconHeight = images[0]?.offsetHeight || 0;
    });

    initPromises.push(loadPromise);
  });

  Promise.all(initPromises).then(() => {
    dimensionsReady = true;
  });
});

function animate() {
  let anySpinning = false;
  reels.forEach(reel => {
    if (!reel.spinning) return;

    reel.pos += reel.speed;
    const scrollH = reel.height;

    if (reel.pos >= scrollH) reel.pos -= scrollH;

    reel.strip.style.transform = `translateY(${-reel.pos}px)`;
    reel.clone.style.transform = `translateY(${-reel.pos + scrollH}px)`;

    anySpinning = true;
  });

  if (anySpinning) rafId = requestAnimationFrame(animate);
}

function alignToIcon(reel, targetURL) {
  const imgs = reel.images;
  const iconHeight = reel.iconHeight;
  const containerHeight = reel.strip.parentNode.offsetHeight;
  const centerOffset = containerHeight / 2 - iconHeight / 2;

  for (let i = 10; i < imgs.length; i++) {
    if (imgs[i].src.includes(targetURL)) {
      const offset = i * iconHeight;
      reel.pos = offset - centerOffset;
      reel.strip.style.transform = `translateY(${-reel.pos}px)`;
      reel.clone.style.transform = `translateY(${-reel.pos + reel.height}px)`;
      break;
    }
  }
}

function startSpin() {
  if (isSpinning || !dimensionsReady) return;
  isSpinning = true;
  spinCount++;

  const chosen = selectIcons();

  reels.forEach((reel, i) => {
    reel.spinning = true;
    reel.strip.classList.add('spinning');
    reel.clone.classList.add('spinning');
    reel.clone.style.display = '';
  });

  const reelContainers = document.querySelectorAll('.reel-container');
  reelContainers.forEach(container => container.classList.add('glare-active'));

  animate();

  const delays = [1000, 1200, 1400];
  delays.forEach((delay, i) => {
    setTimeout(() => {
      reels[i].spinning = false;
      reels[i].strip.classList.remove('spinning');
      reels[i].clone.classList.remove('spinning');
      alignToIcon(reels[i], chosen[i]);
      reels[i].clone.style.display = 'none';

      if (i === reels.length - 1) {
        cancelAnimationFrame(rafId);
        isSpinning = false;
        reelContainers.forEach(container => container.classList.remove('glare-active'));
      }
    }, delay);
  });
}

function pullHandleAndSpin() {
  if (isSpinning || !dimensionsReady) return;
  handle.classList.add('pulled');
  setTimeout(() => handle.classList.remove('pulled'), 250);
  startSpin();
}

const spinButton = document.getElementById('spinButton');
if (spinButton) {
  spinButton.addEventListener('click', pullHandleAndSpin);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    pullHandleAndSpin();
  }
});
