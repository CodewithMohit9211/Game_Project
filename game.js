const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const livesEl = document.getElementById("lives");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");

let lives = 3;
let score = 0;
let level = 1;

const gravity = 0.6;
const groundY = 350;

/* PLAYER */
const player = {
  x: 50, y: 300, w: 30, h: 40,
  vx: 0, vy: 0,
  speed: 4, jump: -12,
  onGround: false
};

/* LEVEL DATA (5 LEVELS) */
const levels = [
  {
    platforms: [
      { x: 0, y: groundY, w: 2000, h: 50 },
      { x: 300, y: 280, w: 120, h: 20 }
    ],
    enemies: [{ x: 400, y: 320 }]
  },
  {
    platforms: [
      { x: 0, y: groundY, w: 2000, h: 50 },
      { x: 250, y: 260, w: 120, h: 20 },
      { x: 550, y: 220, w: 120, h: 20 }
    ],
    enemies: [{ x: 500, y: 320 }, { x: 750, y: 320 }]
  },
  {
    platforms: [
      { x: 0, y: groundY, w: 2000, h: 50 },
      { x: 200, y: 260, w: 120, h: 20 },
      { x: 500, y: 230, w: 120, h: 20 },
      { x: 800, y: 200, w: 120, h: 20 }
    ],
    enemies: [{ x: 450, y: 320 }, { x: 700, y: 320 }]
  },
  {
    platforms: [
      { x: 0, y: groundY, w: 2500, h: 50 },
      { x: 400, y: 260, w: 120, h: 20 },
      { x: 700, y: 230, w: 120, h: 20 }
    ],
    enemies: [{ x: 500, y: 320 }, { x: 900, y: 320 }, { x: 1200, y: 320 }]
  },
  {
    platforms: [
      { x: 0, y: groundY, w: 3000, h: 50 },
      { x: 300, y: 260, w: 120, h: 20 },
      { x: 700, y: 230, w: 120, h: 20 },
      { x: 1100, y: 200, w: 120, h: 20 }
    ],
    enemies: [
      { x: 600, y: 320 },
      { x: 1000, y: 320 },
      { x: 1400, y: 320 }
    ]
  }
];

let platforms = [];
let enemies = [];

/* LOAD LEVEL */
function loadLevel(n) {
  platforms = JSON.parse(JSON.stringify(levels[n - 1].platforms));
  enemies = levels[n - 1].enemies.map(e => ({
    ...e,
    w: 32, h: 32,
    dir: -1,
    state: "walk", // walk | shell
    speed: 1.5
  }));
  player.x = 50;
  player.y = 300;
}

/* CONTROLS */
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

/* GAME LOOP */
function update() {
  // Player movement
  player.vx = 0;
  if (keys["ArrowRight"]) player.vx = player.speed;
  if (keys["ArrowLeft"]) player.vx = -player.speed;
  if (keys["Space"] && player.onGround) {
    player.vy = player.jump;
    player.onGround = false;
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // Platform collision
  player.onGround = false;
  platforms.forEach(p => {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y + player.h < p.y + 10 &&
      player.y + player.h + player.vy >= p.y
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  });

  // Enemies
  enemies.forEach(e => {
    e.x += e.dir * e.speed;

    if (e.x < 0 || e.x > 2800) e.dir *= -1;

    // Collision
    if (
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ) {
      if (player.vy > 0) {
        if (e.state === "walk") {
          e.state = "shell";
          e.speed = 0;
          score += 100;
        } else {
          e.speed = 6;
          e.dir = player.x < e.x ? 1 : -1;
        }
        player.vy = -8;
      } else {
        loseLife();
      }
    }
  });

  // Camera
  if (player.x > 400) {
    const dx = player.x - 400;
    player.x = 400;
    platforms.forEach(p => p.x -= dx);
    enemies.forEach(e => e.x -= dx);
  }

  // Level end
  if (player.x > 750 && enemies.length === 0) {
    level++;
    if (level > 5) {
      alert("🎉 YOU WIN! 🎉");
      location.reload();
    }
    loadLevel(level);
  }

  draw();
  requestAnimationFrame(update);
}

/* DRAW */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "green";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  enemies.forEach(e => {
    ctx.fillStyle = e.state === "shell" ? "darkgreen" : "brown";
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });

  livesEl.textContent = lives;
  scoreEl.textContent = score;
  levelEl.textContent = level;
}

/* LIFE LOST */
function loseLife() {
  lives--;
  if (lives <= 0) {
    alert("Game Over");
    location.reload();
  }
  loadLevel(level);
}

/* START */
loadLevel(1);
update();
