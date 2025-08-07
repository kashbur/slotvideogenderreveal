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

strips.forEach((strip, i) => {
  for (let j = 0; j < 30; j++) {
    const img = document.createElement("img");
    img.src = icons[j % icons.length];
    strip.appendChild(img);
  }
  const clone = strip.cloneNode(true);
  strip.parentNode.appendChild(clone);
  const images = strip.querySelectorAll("img");
  const iconHeight = images[0].offsetHeight;
  reels.push({ strip, clone, pos: 0, speed: speeds[i], spinning: false, images, iconHeight });
});

function animate() {
  let anySpinning = false;
  reels.forEach(reel => {
    if (!reel.spinning) return;

    reel.pos += reel.speed;
    const scrollH = reel.strip.scrollHeight;

    if (reel.pos >= scrollH) reel.pos = 0;

    reel.strip.style.transform = `translateY(${-reel.pos}px)`;
    reel.clone.style.transform = `translateY(${-reel.pos + scrollH}px)`;

    anySpinning = true;
  });

  if (anySpinning) rafId = requestAnimationFrame(animate);
}

function alignToIcon(reel, targetURL) {
  const imgs = reel.images;
  const iconHeight = reel.iconHeight;
  const centerOffset = reel.strip.offsetHeight / 2 - iconHeight / 2;

  for (let i = 10; i < imgs.length; i++) {
    if (imgs[i].src.includes(targetURL)) {
      const offset = i * iconHeight;
      reel.pos = offset - centerOffset;
      reel.strip.style.transform = `translateY(${-reel.pos}px)`;
      reel.clone.style.transform = `translateY(${-reel.pos + reel.strip.scrollHeight}px)`;
      break;
    }
  }
}

function startSpin() {
  if (isSpinning) return;
  isSpinning = true;
  spinCount++;

  const chosen = selectIcons();

  reels.forEach((reel, i) => {
    reel.spinning = true;
    reel.strip.classList.add('spinning');
    reel.clone.classList.add('spinning');
  });

  animate();

  const delays = [1000, 1200, 1400];
  delays.forEach((delay, i) => {
    setTimeout(() => {
      reels[i].spinning = false;
      reels[i].strip.classList.remove('spinning');
      reels[i].clone.classList.remove('spinning');
      alignToIcon(reels[i], chosen[i]);

      if (i === reels.length - 1) {
        cancelAnimationFrame(rafId);
        isSpinning = false;
      }
    }, delay);
  });
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    startSpin();
  }
});
