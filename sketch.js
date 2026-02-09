// sketch.js
let player;
let enemies = [];
let obstacles = [];
let bullets = [];
let enemyBullets = [];
let particles = [];
let orbs = [];
let mapWidth = 2000;
let mapHeight = 2000;
let starField;
let weapon;

// Advanced AI
let helpers = [];
let boss = null;
let formationMode = "SNAKE"; // SNAKE, FLOCK
let upgradeManager;

// Game State
let gameState = "MENU"; // MENU, PLAYING, GAMEOVER
let isPaused = false;
let score = 0;
let highScore = localStorage.getItem("spaceSurvivorHighScore") || 0;
let level = 1;
let xp = 0;
let nextLevelXp = 100;
let shakeAmount = 0;
let debugLog = [];

function logToScreen(msg) {
    debugLog.push(msg);
    if (debugLog.length > 8) debugLog.shift();
    console.warn("LOG:", msg); // Keep in browser console too
}

// Override console
const originalLog = console.log;
const originalError = console.error;
console.log = function (...args) {
    logToScreen(args.join(' '));
    originalLog.apply(console, args);
};
console.error = function (...args) {
    logToScreen("ERR: " + args.join(' '));
    originalError.apply(console, args);
};

window.onerror = function (msg, url, line) {
    logToScreen("Uncaught: " + msg + " @" + line);
    return false;
};

function mouseReleased() {
    // 1. Initialize Sound on first interaction
    if (typeof initSound === 'function') {
        let ctx = getAudioContext();
        if (ctx.state !== 'running') {
            initSound(); // Correctly resumes now
        }
    }

    if (upgradeManager && upgradeManager.active) {
        upgradeManager.handleClick();
        return;
    }

    if (gameState === "MENU") {
        if (abs(mouseX - width / 2) < 100 && abs(mouseY - (height / 2 + 80)) < 30) {
            resetGame();
        }
    } else if (gameState === "GAMEOVER") {
        if (abs(mouseX - width / 2) < 100 && abs(mouseY - (height / 2 + 130)) < 30) {
            resetGame();
        }
        if (abs(mouseX - width / 2) < 100 && abs(mouseY - (height / 2 + 210)) < 30) {
            gameState = "MENU";
            if (typeof soundManager !== 'undefined') soundManager.startMusic();
        }
    }
}

function checkHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("spaceSurvivorHighScore", highScore);
    }
}

function resetGame() {
    score = 0;
    level = 1;
    xp = 0;
    nextLevelXp = 100;
    gameState = "PLAYING";

    // Reset Entities
    player = new Player(mapWidth / 2, mapHeight / 2);
    weapon = new Weapon(player);
    enemies = [];
    bullets = [];
    enemyBullets = [];
    particles = [];
    orbs = [];
    helpers = [];
    boss = null;

    // Initial Helper
    helpers.push(new Helper(player.pos.x, player.pos.y));

    if (typeof soundManager !== 'undefined') {
        soundManager.startMusic(); // Restart music if stopped
        soundManager.setBossMode(false);
    }
}

function preload() {
    preloadAssets();
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    textFont('Courier New'); // Sci-fi Font

    // 1. Initialize Assets
    initAssets();

    // Initialize Upgrade System
    upgradeManager = new UpgradeManager();

    // 2. Create Player & Weapon
    player = new Player(mapWidth / 2, mapHeight / 2);
    weapon = new Weapon(player);

    // 3. Create Obstacles
    for (let i = 0; i < 30; i++) {
        let x = random(mapWidth);
        let y = random(mapHeight);
        if (dist(x, y, player.pos.x, player.pos.y) > 300) {
            obstacles.push(new Obstacle(x, y, random(40, 80)));
        }
    }

    // Initial Helper
    helpers.push(new Helper(player.pos.x, player.pos.y));

    // 4. Create Background
    starField = createGraphics(mapWidth, mapHeight);
    starField.background(10, 10, 20);
    starField.noStroke();
    starField.fill(255, 255, 255, 100);
    for (let i = 0; i < 1000; i++) {
        starField.circle(random(mapWidth), random(mapHeight), random(1, 3));
    }
}

function draw() {
    rectMode(CORNER); // Reset defaults
    background(0);

    if (gameState === "MENU") {
        drawMenu();
        return;
    }

    push();

    // Screen Shake (Apply only if not paused to avoid jitter while paused)
    if (!isPaused) {
        let shakeX = random(-shakeAmount, shakeAmount);
        let shakeY = random(-shakeAmount, shakeAmount);
        translate(width / 2 - player.pos.x + shakeX, height / 2 - player.pos.y + shakeY);
        shakeAmount = max(0, shakeAmount - 1); // Decay shake
    } else {
        // Just translate to player pos without shake
        translate(width / 2 - player.pos.x, height / 2 - player.pos.y);
    }

    // Draw Background
    imageMode(CORNER);
    if (assets.bgImage) {
        image(assets.bgImage, 0, 0, mapWidth, mapHeight);
    } else {
        image(starField, 0, 0);
    }

    // Draw Map Border
    noFill(); stroke(0, 255, 255, 100); strokeWeight(5); // Cyan border
    rect(0, 0, mapWidth, mapHeight);

    // --- LOGIC UPDATES (Only if NOT PAUSED) ---
    if (gameState === "PLAYING" && !isPaused) {

        // 1. Update Obstacles
        for (let obs of obstacles) {
            obs.update(mapWidth, mapHeight);
        }

        // 2. Update Player
        player.update(obstacles);
        player.constrain(mapWidth, mapHeight);

        // 3. Weapon & Target Selection
        let closestEnemy = getClosestEnemy(player);
        let closestTarget = closestEnemy;

        if (boss) {
            let dToBoss = dist(player.pos.x, player.pos.y, boss.pos.x, boss.pos.y);
            let dToEnemy = closestEnemy ? dist(player.pos.x, player.pos.y, closestEnemy.pos.x, closestEnemy.pos.y) : Infinity;
            if (dToBoss < dToEnemy) closestTarget = boss;
        }
        weapon.update(closestTarget, bullets);

        // 4. Spawn Enemies
        let maxEnemies = (boss) ? 5 : 20 + level * 3;
        let spawnRate = max(20, 60 - level * 3);
        if (enemies.length < maxEnemies && frameCount % spawnRate == 0) {
            spawnEnemy();
        }

        // 5. Boss Logic
        if (boss) {
            boss.update(player, enemyBullets, obstacles);
            // Collision Player vs Boss
            if (dist(boss.pos.x, boss.pos.y, player.pos.x, player.pos.y) < boss.r + player.size / 2) {
                player.takeDamage(1);
            }
        }

        // 6. Helper Logic
        for (let i = 0; i < helpers.length; i++) {
            let h = helpers[i];
            let snakeTarget = null;
            if (formationMode === "SNAKE") {
                snakeTarget = (i === 0) ? player.pos : helpers[i - 1].pos;
            }
            h.update(player, helpers, boss, formationMode, bullets, obstacles, snakeTarget);

            if (!boss && formationMode !== "ATTACK") {
                let closest = getClosestEnemy(h);
                if (closest && dist(closest.pos.x, closest.pos.y, player.pos.x, player.pos.y) < 600) {
                    h.shoot(closest, bullets);
                }
            }
        }

        // 7. Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].finished()) particles.splice(i, 1);
        }

        // 8. Bullets (Player)
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.update();
            if (b.toDelete) {
                bullets.splice(i, 1);
                continue;
            }
            // Logic: Boss Hit
            if (boss && b.hits(boss)) {
                boss.health -= b.damage;
                bullets.splice(i, 1);
                particles.push(new Particle(b.pos.x, b.pos.y, [255, 50, 50]));
                if (boss.health <= 0) {
                    killBoss();
                    if (typeof soundManager !== 'undefined') {
                        soundManager.playLevelUp();
                        soundManager.setBossMode(false);
                    }
                }
                continue;
            }
            // Logic: Enemy Hit
            for (let j = enemies.length - 1; j >= 0; j--) {
                let e = enemies[j];
                if (b.hits(e)) {
                    e.health -= b.damage;
                    if (e.health <= 0) {
                        for (let p = 0; p < 8; p++) particles.push(new Particle(e.pos.x, e.pos.y, [50, 255, 50]));
                        shakeAmount += 2;
                        orbs.push(new Orb(e.pos.x, e.pos.y));
                        enemies.splice(j, 1);
                        score += 10 * level;
                        if (typeof soundManager !== 'undefined') soundManager.playExplosion();
                    }
                    bullets.splice(i, 1);
                    break;
                }
            }
        }

        // 9. Enemy Bullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            let b = enemyBullets[i];
            b.update();
            if (b.toDelete) {
                enemyBullets.splice(i, 1);
                continue;
            }
            if (dist(b.pos.x, b.pos.y, player.pos.x, player.pos.y) < player.size / 2 + b.r) {
                player.takeDamage(b.damage);
                shakeAmount += 10;
                for (let p = 0; p < 5; p++) particles.push(new Particle(player.pos.x, player.pos.y, [255, 200, 50]));
                enemyBullets.splice(i, 1);
                if (player.health <= 0) {
                    gameState = "GAMEOVER";
                    checkHighScore();
                    if (typeof soundManager !== 'undefined') soundManager.playGameOver();
                }
            }
        }

        // 10. Orbs
        for (let i = orbs.length - 1; i >= 0; i--) {
            let orb = orbs[i];
            orb.update(player);
            if (dist(player.pos.x, player.pos.y, orb.pos.x, orb.pos.y) < player.size) {
                xp += orb.value;
                orbs.splice(i, 1);
                checkLevelUpTrigger();
                if (typeof soundManager !== 'undefined') soundManager.playCollect();
            }
        }

        // 11. Enemies Update & Collision
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            e.update(player.pos, enemies, obstacles, enemyBullets);

            // Player vs Enemy Collision
            if (dist(e.pos.x, e.pos.y, player.pos.x, player.pos.y) < e.r + player.size / 2) {
                if (e.isKamikaze) {
                    player.takeDamage(e.damage);
                    shakeAmount += 20;
                    e.health = 0;
                    for (let p = 0; p < 15; p++) particles.push(new Particle(e.pos.x, e.pos.y, [255, 50, 0]));
                    if (typeof soundManager !== 'undefined') soundManager.playExplosion();
                } else {
                    player.takeDamage(e.damage);
                    shakeAmount += 5;
                    let pushVec = p5.Vector.sub(e.pos, player.pos).setMag(10);
                    e.pos.add(pushVec);
                }
                if (e.health <= 0) {
                    enemies.splice(i, 1);
                    if (!e.isKamikaze) {
                        for (let p = 0; p < 8; p++) particles.push(new Particle(e.pos.x, e.pos.y, [50, 255, 50]));
                        if (typeof soundManager !== 'undefined') soundManager.playExplosion();
                    }
                    score += 10 * level;
                }
                if (player.health <= 0) {
                    gameState = "GAMEOVER";
                    checkHighScore();
                    if (typeof soundManager !== 'undefined') soundManager.playGameOver();
                }
            }
        }
    } // END OF IF (!ISPAUSED)

    // --- DRAWING (ALWAYS RENDER) ---
    // Entities
    for (let obs of obstacles) obs.show();
    for (let h of helpers) h.show();
    for (let i = orbs.length - 1; i >= 0; i--) orbs[i].show(); // Show orbs before enemies? or after? Doesn't matter much.
    if (boss) boss.show();
    for (let e of enemies) e.show();
    player.show();
    for (let p of particles) p.show();
    for (let b of bullets) b.show();
    for (let b of enemyBullets) b.show();

    pop(); // Restore transform matrix for UI

    // UI Overlay (HUD + Pause Menu)
    drawUI();

    // Explicit Pause Overlay (If not inside drawUI, let's keep it here for safety)
    if (isPaused && gameState === "PLAYING") {
        // Dim Background
        fill(0, 0, 0, 150);
        rectMode(CORNER);
        rect(0, 0, width, height);

        rectMode(CENTER);

        // PAUSED Title
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = "cyan";
        textAlign(CENTER, CENTER);
        textSize(80); textStyle(BOLD);
        fill(0, 255, 255);
        text("PAUSED", width / 2, height / 2 - 50);

        // CONTINUE BUTTON (Green Neon Frame)
        let btnY = height / 2 + 50;
        drawingContext.shadowColor = "lime"; // Green Glow

        // Frame
        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rect(width / 2, btnY, 450, 60, 10);

        // Text
        noStroke();
        fill(0, 255, 0);
        textSize(30);
        text("PRESS 'P' TO CONTINUE", width / 2, btnY);

        drawingContext.shadowBlur = 0;
    }
}


function spawnEnemy() {
    let angle = random(TWO_PI);
    let r = random(500, 800);
    let x = player.pos.x + r * cos(angle);
    let y = player.pos.y + r * sin(angle);
    x = constrain(x, 0, mapWidth);
    y = constrain(y, 0, mapHeight);
    enemies.push(new Enemy(x, y, level));
}

function getClosestEnemy(origin) {
    let closest = null;
    let recordDist = Infinity;
    for (let e of enemies) {
        let d = dist(origin.pos.x, origin.pos.y, e.pos.x, e.pos.y);
        if (d < recordDist) {
            recordDist = d;
            closest = e;
        }
    }
    return closest;
}

// Logic: when XP full, Spawn Boss.
function checkLevelUpTrigger() {
    if (xp >= nextLevelXp) {
        if (!boss) {
            spawnBoss();
        }
        xp = nextLevelXp; // Cap XP until boss dead
    }
}

function spawnBoss() {
    boss = new Boss(mapWidth / 2, mapHeight / 2, level);
    shakeAmount += 20; // Roar!
    if (typeof soundManager !== 'undefined') soundManager.setBossMode(true);
}

function killBoss() {
    boss = null;

    // Actual Level Up
    level++;
    xp = 0;
    nextLevelXp = Math.floor(nextLevelXp * 1.5);
    weapon.fireRate = max(5, weapon.fireRate - 2);
    player.health = player.maxHealth; // Full Heal

    // Add Helper
    helpers.push(new Helper(player.pos.x, player.pos.y));

    shakeAmount += 30; // Victory Shake

    // Clear projectiles
    enemyBullets = [];
}

function keyPressed() {
    // Audio Init on first keypress
    if (typeof initSound === 'function') {
        let ctx = getAudioContext();
        if (ctx.state !== 'running') {
            initSound();
        }
    }

    if (gameState === "MENU") {
        if (key === 's' || key === 'S') {
            resetGame();
        }
    } else if (gameState === "PLAYING") {
        if (key === 'p' || key === 'P') {
            isPaused = !isPaused;
        }
        if (key === 'h' || key === 'H') {
            formationMode = (formationMode === "SNAKE") ? "FLOCK" : "SNAKE";
        }
    } else if (gameState === "GAMEOVER") {
        if (key === 's' || key === 'S') {
            resetGame();
        }
        if (key === 'm' || key === 'M') {
            gameState = "MENU";
            if (typeof soundManager !== 'undefined') soundManager.startMusic();
        }
    }
}

function drawUI() {
    if (gameState === "PLAYING") {
        // UI Backdrop
        fill(0, 0, 0, 150);
        noStroke();
        rect(10, 10, 260, 200, 10);

        fill(255); textSize(20); textAlign(LEFT, TOP); textStyle(BOLD);
        text("SCORE: " + score, 30, 30);
        text("LVL: " + level, 30, 60);

        // Mode
        textSize(15); fill(150, 255, 150);
        text("HELPERS: " + helpers.length, 30, 160);
        text("MODE (H): " + formationMode, 30, 180);
        text("P: PAUSE", 30, 200);

        // XP Bar Glow
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = "cyan";

        // XP Bar
        noFill(); stroke(0, 255, 255); strokeWeight(2);
        rect(30, 100, 200, 15);
        fill(0, 255, 255); noStroke();
        let xpW = map(xp, 0, nextLevelXp, 0, 200);
        rect(30, 100, xpW, 15);

        // Boss Warning
        if (boss) {
            fill(255, 100, 100);
            textSize(15);
            text("BOSS BATTLE!", 30, 90); // Warning
        }

        // Health Bar Glow
        drawingContext.shadowColor = "red";

        // Health Bar (Red)
        noFill(); stroke(255, 50, 50); strokeWeight(2);
        rect(30, 130, 200, 15);
        fill(255, 50, 50); noStroke();
        let hpW = map(player.health, 0, player.maxHealth, 0, 200);
        rect(30, 130, hpW, 15);

        // Reset Glow
        drawingContext.shadowBlur = 0;

        fill(255); textSize(12); noStroke();
        text(Math.ceil(player.health) + " / " + player.maxHealth, 100, 131);

    } else if (gameState === "GAMEOVER") {
        fill(0, 0, 0, 200);
        rectMode(CORNER); // Reset for backdrop
        rect(0, 0, width, height);

        rectMode(CENTER); // UI Elements
        textAlign(CENTER, CENTER);

        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = "red";

        fill(255, 50, 50);
        textSize(80); textStyle(BOLD);
        text("GAME OVER", width / 2, height / 2 - 50);

        drawingContext.shadowBlur = 0;

        fill(255); textSize(30);
        text("FINAL SCORE: " + score, width / 2, height / 2 + 30);

        fill(255, 215, 0); // Gold
        textSize(20);
        text("HIGH SCORE: " + highScore, width / 2, height / 2 + 70);

        // Buttons logic replaced by keys

        // REPLAY BUTTON (Green Neon)
        let replayY = height / 2 + 130;

        // Glow
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = "lime";

        // Frame
        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rect(width / 2, replayY, 400, 50, 10);

        // Text
        noStroke();
        fill(0, 255, 0);
        textSize(25); textStyle(BOLD);
        text("PRESS 'S' TO REPLAY", width / 2, replayY);
        drawingContext.shadowBlur = 0;

        // MENU BUTTON (Cyan Neon)
        let menuY = height / 2 + 200;

        // Glow
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = "cyan";

        // Frame
        noFill();
        stroke(0, 255, 255);
        strokeWeight(2);
        rect(width / 2, menuY, 400, 50, 10);

        // Text
        noStroke();
        fill(0, 255, 255);
        textSize(25);
        text("PRESS 'M' FOR MENU", width / 2, menuY);
        drawingContext.shadowBlur = 0;
    }
}

function drawMenu() {
    // Dynamic Background
    imageMode(CORNER);
    image(starField, 0, 0);

    // Grouping for Vertical Centering
    // Total estimated height: Logo(350) + Gap(30) + Panel(220) + Gap(30) + Button(60) = ~700px
    // Center point should be around height/2

    // Logo
    imageMode(CENTER);
    if (assets.logo) {
        // Float effect
        let y = height / 2 - 220 + sin(frameCount * 0.02) * 10;

        // Render Logo (300x300 to be more compact)
        image(assets.logo, width / 2, y, 300, 300);

    } else {
        textAlign(CENTER, CENTER);
        fill(0, 255, 255); textSize(60);
        text("SPACE SURVIVOR", width / 2, height / 2 - 200);
        textSize(15); fill(150, 150, 255);
        text("v1.3 (BUTTON MOVED)", width / 2, height / 2 - 170);

        // Audio Status Warning
        if (getAudioContext().state !== 'running') {
            textSize(20); fill(255, 100, 100);
            text("AUDIO: " + getAudioContext().state + " (CLICK)", width / 2, height / 2 - 150);
        } else {
            textSize(15); fill(100, 255, 100);
            text("AUDIO: RUNNING", width / 2, height / 2 - 150);
        }
    }

    // RENDER DEBUG LOG (ALWAYS)
    fill(0, 0, 0, 150);
    rectMode(CORNER);
    rect(0, height - 150, width, 150);
    fill(255);
    textSize(12);
    textAlign(LEFT, TOP);
    for (let i = 0; i < debugLog.length; i++) {
        text(debugLog[i], 10, height - 140 + i * 16);
    }
    textAlign(CENTER, CENTER); // Reset
    rectMode(CENTER);

    rectMode(CENTER);
    textAlign(CENTER, CENTER);

    // INSTRUCTIONS & TIPS PANEL (Yellow Neon)
    let panelHeight = 240; // Increased to give room at bottom
    let instrY = height / 2 + 50; // Centered roughly

    // Panel Glow
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "yellow";

    // Panel Stroke
    noFill();
    stroke(255, 255, 0); // Yellow Stroke
    strokeWeight(2);
    rect(width / 2, instrY, 600, panelHeight, 10);

    // --- CONTROLS --- (Neon Glow)
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "yellow";

    noStroke();
    fill(255, 255, 0); textSize(20); textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("--- CONTROLS ---", width / 2, instrY - 80);

    // KEEP GLOW FOR BODY TEXT
    textSize(16); textStyle(NORMAL);
    // CENTER ALIGNMENT FOR CONTROLS
    fill(255, 255, 200); // Pale Yellow
    text("⌨️  ARROWS / WASD : MOVE", width / 2, instrY - 50);
    text("🔥  AUTO-FIRE : AUTOMATIC", width / 2, instrY - 25);
    text("⌨️  S : START / REPLAY", width / 2, instrY);
    text("⌨️  H : TOGGLE FORMATION", width / 2, instrY + 25);
    text("⌨️  P : PAUSE GAME", width / 2, instrY + 50);

    // --- TIPS --- (Neon Glow)
    fill(255, 255, 0); textSize(20); textStyle(BOLD);
    text("--- TIPS ---", width / 2, instrY + 80);

    // KEEP GLOW FOR TIPS TEXT
    textSize(15); textStyle(ITALIC);
    fill(200, 255, 200);
    text("💡 Collect ORBS to Level Up & Kill BOSS for Helpers!", width / 2, instrY + 90); // moved up slightly
    text("⚠️ RED Enemies Explode! BIG Enemies are TANKS!", width / 2, instrY + 100);

    drawingContext.shadowBlur = 0; // Reset only after all panel text is done

    // START BUTTON (Cyan Neon) - PLACED BELOW PANEL
    let btnY = instrY + panelHeight / 2 + 50;

    // Glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "cyan";

    // Frame
    noFill();
    stroke(0, 255, 255);
    strokeWeight(2);
    rect(width / 2, btnY, 400, 60, 10); // Neon Frame

    // Text
    noStroke();
    fill(0, 255, 255);
    textAlign(CENTER, CENTER);
    textSize(30); textStyle(BOLD);
    text("Press ' S ' to Start", width / 2, btnY);
    drawingContext.shadowBlur = 0;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
