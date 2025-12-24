/* =====================================================
   PERFORMANCE DETECT (60Hz / 120Hz)
===================================================== */
const isHighRefresh =
    /iPhone/.test(navigator.userAgent) &&
    window.matchMedia("(min-resolution: 2dppx)").matches;

const SNOW_INTERVAL = isHighRefresh ? 350 : 200;
const GIFT_INTERVAL = isHighRefresh ? 2000 : 2000;
const MAX_SNOW = isHighRefresh ? 60 : 100;
const MAX_GIFT = 5;

/* =====================================================
   GLOBAL STATE
===================================================== */
let snowCount = 0;
let giftCount = 0;
let firstClickGift = true;
let isLetterShown = false;
let currentImageIndex = 0;

/* =====================================================
   IMAGE LIST
===================================================== */
const NUMBER_OF_IMAGES = 15;
const randomImages = Array.from(
    { length: NUMBER_OF_IMAGES },
    (_, i) => `images/a${i + 1}.jpg`
);

/* =====================================================
   POPUP LAYER (ẢNH / HỘP QUÀ)
===================================================== */
const popupLayer = document.createElement("div");
popupLayer.style.cssText = `
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  flex-direction: column;
  background: rgba(0,0,0,0.45);
`;
document.body.appendChild(popupLayer);

const popupImg = document.createElement("img");
popupImg.style.cssText = `
  width: 260px;
  border-radius: 14px;
  transition: 0.4s ease;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(255,255,255,0.6);
`;
popupLayer.appendChild(popupImg);

/* =====================================================
   POPUP LETTER
===================================================== */
const giftPopup = document.querySelector(".gift-popup");
const closeBtn = document.createElement("button");
closeBtn.className = "popup-close-btn";
closeBtn.innerHTML = "&times;";
closeBtn.onclick = () => (giftPopup.style.display = "none");

function showGiftMessage(message) {
    popupLayer.style.display = "none";
    giftPopup.innerHTML = "";
    giftPopup.appendChild(closeBtn);

    const p = document.createElement("p");
    p.innerHTML = message;
    giftPopup.appendChild(p);

    giftPopup.style.display = "block";
    isLetterShown = true;
}

/* =====================================================
   FLYING LETTER
===================================================== */
function flyingLetter() {
    const letter = document.createElement("div");
    letter.textContent = "✉️";
    letter.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    transition: 1.2s ease-out;
    z-index: 999999;
  `;
    document.body.appendChild(letter);

    requestAnimationFrame(() => {
        letter.style.transform = "translate(-50%, -200%) rotate(-25deg)";
        letter.style.opacity = "0";
    });

    setTimeout(() => letter.remove(), 1500);
}

/* =====================================================
   SNOW (RAF)
===================================================== */
const snowContainer = document.querySelector(".snow-container");

function createSnow() {
    if (snowCount >= MAX_SNOW) return;
    snowCount++;

    const snow = document.createElement("div");
    snow.className = "snow";
    const x = Math.random() * window.innerWidth;
    const size = Math.random() * 3 + 2;
    const duration = Math.random() * 5 + 8;

    snow.style.width = snow.style.height = size + "px";
    snowContainer.appendChild(snow);

    let start = null;
    function fall(t) {
        if (!start) start = t;
        const p = (t - start) / (duration * 1000);
        if (p >= 1) {
            snow.remove();
            snowCount--;
            return;
        }
        snow.style.transform = `translate3d(${x}px,${
            p * window.innerHeight
        }px,0)`;
        requestAnimationFrame(fall);
    }
    requestAnimationFrame(fall);
}
setInterval(createSnow, SNOW_INTERVAL);

/* =====================================================
   GIFT FALL (RAF)
===================================================== */
const fallingAssets = [
    { src: "images/b1.png", w: 120 },
    { src: "images/b2.png", w: 150 },
    { src: "images/b3.png", w: 100 },
];

function createGift() {
    if (giftCount >= MAX_GIFT) return;
    giftCount++;

    const gift = document.createElement("div");
    gift.className = "gift";

    const asset =
        fallingAssets[Math.floor(Math.random() * fallingAssets.length)];
    gift.style.backgroundImage = `url(${asset.src})`;
    gift.style.width = gift.style.height = asset.w + "px";

    const x = Math.random() * (window.innerWidth - asset.w);
    document.body.appendChild(gift);

    let y = -100;
    let speed = 0.8;

    gift.onclick = () => {
        popupLayer.style.display = "flex";

        if (isLetterShown) {
            popupImg.src = randomImages[currentImageIndex];
            currentImageIndex = (currentImageIndex + 1) % randomImages.length;

            setTimeout(() => (popupLayer.style.display = "none"), 1800);
        } else if (firstClickGift) {
            popupImg.src = "images/close.png";
            firstClickGift = false;
        }

        gift.remove();
        giftCount--;
    };

    function fall() {
        y += speed;
        speed += 0.005;
        gift.style.transform = `translate3d(${x}px,${y}px,0)`;
        if (y < window.innerHeight + 100) {
            requestAnimationFrame(fall);
        } else {
            gift.remove();
            giftCount--;
        }
    }
    requestAnimationFrame(fall);
}
setInterval(createGift, GIFT_INTERVAL);

/* =====================================================
   POPUP IMAGE CLICK
===================================================== */
popupImg.onclick = () => {
    if (isLetterShown) return;

    popupImg.style.opacity = 0;
    setTimeout(() => {
        popupImg.src = "images/hopopen.png";
        popupImg.style.opacity = 1;
        flyingLetter();

        setTimeout(() => {
            showGiftMessage(
                `Merry Christmas, my love ❤️

Chúc anh một mùa Noel bình an, ấm áp giữa những bộn bề cuối năm vẫn giữ được nụ cười. Mong anh luôn vững vàng trên con đường mình chọn, và có được thành công với những gì đang cố gắng.

Mong tình yêu của chúng mình lớn lên cùng năm tháng, sau những va vấp vẫn chọn nắm tay nhau, bằng sự tin tưởng và chân thành.

Mong chúng ta sẽ đồng hành cùng nhau ở những mùa giáng sinh sau. Anh nhé!`
            );
        }, 500);
    }, 300);
};

/* =====================================================
   FIREWORK (SINGLE RAF LOOP)
===================================================== */
const fireContainer = document.querySelector(".fireworks-container");
let particles = [];

function createFirework(x, y) {
    for (let i = 0; i < 25; i++) {
        const p = document.createElement("div");
        p.className = "firework-particle";
        fireContainer.appendChild(p);

        const a = (i / 25) * Math.PI * 2;
        particles.push({
            el: p,
            x,
            y,
            vx: Math.cos(a) * (2 + Math.random() * 2),
            vy: Math.sin(a) * (2 + Math.random() * 2),
            life: 60,
        });
    }
}

function fireworkLoop() {
    particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
        if (p.life <= 0) {
            p.el.remove();
            return false;
        }
        return true;
    });
    requestAnimationFrame(fireworkLoop);
}
requestAnimationFrame(fireworkLoop);

document.addEventListener("click", (e) => {
    if (e.target.closest(".gift-popup")) return;
    createFirework(e.pageX, e.pageY);
});

/* =====================================================
   SANTA (RAF)
===================================================== */
const santa = document.querySelector(".santa-container");
let sx = -300;

function santaFly() {
    sx += 1.2;
    if (sx > window.innerWidth + 300) sx = -300;
    santa.style.transform = `translate3d(${sx}px,0,0)`;
    requestAnimationFrame(santaFly);
}
requestAnimationFrame(santaFly);

/* =====================================================
   MUSIC
===================================================== */
const btn = document.querySelector(".music-toggle");
const audio = document.getElementById("bgMusic");

btn.onclick = () => {
    audio.paused ? audio.play() : audio.pause();
    btn.textContent = audio.paused ? "🔈" : "🔊";
};

/* =====================================================
   COUNTDOWN
===================================================== */
function updateCountdown() {
    const christmas = new Date(new Date().getFullYear(), 11, 25);
    const now = new Date();
    const diff = christmas - now;

    document.getElementById("days").textContent = Math.floor(diff / 86400000)
        .toString()
        .padStart(2, "0");
    document.getElementById("hours").textContent = Math.floor(
        (diff / 3600000) % 24
    )
        .toString()
        .padStart(2, "0");
    document.getElementById("minutes").textContent = Math.floor(
        (diff / 60000) % 60
    )
        .toString()
        .padStart(2, "0");
    document.getElementById("seconds").textContent = Math.floor(
        (diff / 1000) % 60
    )
        .toString()
        .padStart(2, "0");
}
setInterval(updateCountdown, 1000);
