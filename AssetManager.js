// AssetManager.js
// Responsible for creating graphics without external files

let assets = {};

function initAssets() {
    assets.player = createSpaceshipGraphic(45);
    assets.enemy = createAlienGraphic(30);
    assets.obstacle = createAsteroidGraphic(60); // Base size
    assets.projectile = createProjectileGraphic(10, 20);
    assets.enemyProjectile = createEnemyProjectileGraphic(10, 20);
    assets.orb = createOrbGraphic(15);
    assets.helper = createHelperGraphic(30);
    assets.boss = createBossGraphic(150);
}

function preloadAssets() {
    // Attempt to load images.
    // NOTE: These files must exist in the project folder for this to work.
    try {
        // Correct filenames based on user feedback (Capitalized)
        assets.playerImage = loadImage('Player.png');
        assets.bgImage = loadImage('background.png');
        assets.helperImage = loadImage('Helper.png');
        assets.helperImage = loadImage('Helper.png');
        assets.helperImage = loadImage('Helper.png');
        assets.bossImage = loadImage('Boss.png');
        assets.logo = loadImage('logo-removebg.png');
        assets.orbImage = loadImage('Orb.png');

        // Projectiles
        assets.projectileImage = loadImage('Projectile.png');
        assets.helperProjectileImage = loadImage('HelperProjectile.png');
        assets.enemyProjectileImage = loadImage('EnemyProjectile.png');
        assets.bossProjectileImage = loadImage('BossProjectile.png');

        assets.enemyImages = [];
        assets.obstacleImages = [];

        // Try loading numbered variations
        let safeLoad = (name, arr) => {
            // We use the p5 error callback to catch 404s without crashing
            loadImage(name,
                (img) => arr.push(img),
                (err) => console.log("Failed to load: " + name)
            );
        };

        // Load existing variants (Enemy1..3)
        safeLoad('Enemy1.png', assets.enemyImages);
        safeLoad('Enemy2.png', assets.enemyImages);
        safeLoad('Enemy3.png', assets.enemyImages);

        // Load existing variants (Obstacle1..3)
        safeLoad('Obstacle1.png', assets.obstacleImages);
        safeLoad('Obstacle2.png', assets.obstacleImages);
        safeLoad('Obstacle3.png', assets.obstacleImages);

    } catch (e) {
        console.log("Images not found, using procedural graphics.");
    }
}

function createSpaceshipGraphic(s) {
    let pg = createGraphics(s, s);
    pg.translate(s / 2, s / 2);
    pg.noStroke();

    // Body
    pg.fill(200);
    pg.triangle(0, -s * 0.4, -s * 0.3, s * 0.3, s * 0.3, s * 0.3);

    // Cockpit
    pg.fill(0, 200, 255);
    pg.ellipse(0, 0, s * 0.15, s * 0.3);

    // Engines
    pg.fill(255, 100, 0);
    pg.rect(-s * 0.15, s * 0.3, s * 0.1, s * 0.1);
    pg.rect(s * 0.05, s * 0.3, s * 0.1, s * 0.1);

    return pg;
}

function createAlienGraphic(s) {
    let pg = createGraphics(s, s);
    pg.translate(s / 2, s / 2);
    pg.noStroke();

    // Blob Body
    pg.fill(50, 255, 50);
    pg.circle(0, 0, s * 0.8);

    // Eyes
    pg.fill(255);
    pg.circle(-s * 0.2, -s * 0.1, s * 0.25);
    pg.circle(s * 0.2, -s * 0.1, s * 0.25);

    pg.fill(0);
    pg.circle(-s * 0.2, -s * 0.1, s * 0.1);
    pg.circle(s * 0.2, -s * 0.1, s * 0.1);

    return pg;
}

function createAsteroidGraphic(s) {
    let pg = createGraphics(s, s);
    pg.translate(s / 2, s / 2);
    pg.noStroke();
    pg.fill(100);

    pg.beginShape();
    // Create a rough circle
    for (let a = 0; a < TWO_PI; a += 0.8) {
        let r = s * 0.4 + random(-5, 5);
        let x = r * cos(a);
        let y = r * sin(a);
        pg.vertex(x, y);
    }
    pg.endShape(CLOSE);

    // Craters
    pg.fill(80);
    pg.circle(s * 0.1, -s * 0.1, s * 0.15);
    pg.circle(-s * 0.2, s * 0.2, s * 0.1);

    return pg;
}

function createProjectileGraphic(w, h) {
    let pg = createGraphics(w, h * 2); // Longer
    pg.translate(w / 2, h);
    pg.noStroke();

    // Core
    pg.fill(255);
    pg.rect(-w / 4, -h, w / 2, h * 2, 5);

    // Glow
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "yellow";
    pg.fill(255, 255, 0); // Yellow
    pg.rect(-w / 2, -h, w, h * 2, 5);
    drawingContext.shadowBlur = 0; // Reset

    return pg;
}

function createOrbGraphic(s) {
    let pg = createGraphics(s, s);
    pg.translate(s / 2, s / 2);
    pg.noStroke();
    pg.fill(0, 255, 255); // Cyan XP
    pg.circle(0, 0, s);
    return pg;
}

function createEnemyProjectileGraphic(w, h) {
    let s = max(w, h);
    let pg = createGraphics(s * 2, s * 2);
    pg.translate(s, s);
    pg.noStroke();

    // Glow
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "red";

    // Organic Plasma Shape
    pg.fill(255, 50, 50); // Red
    pg.beginShape();
    for (let a = 0; a < TWO_PI; a += 0.5) {
        let r = s / 2 + random(-2, 2);
        pg.vertex(r * cos(a), r * sin(a));
    }
    pg.endShape(CLOSE);

    drawingContext.shadowBlur = 0;
    return pg;
}

function createHelperGraphic(s) {
    let pg = createGraphics(s, s);
    pg.translate(s / 2, s / 2);
    pg.noStroke();
    pg.fill(50, 100, 255); // Blue
    pg.rectMode(CENTER);
    pg.rect(0, 0, s * 0.6, s * 0.6);
    pg.fill(200);
    pg.circle(0, 0, s * 0.3); // Eye
    return pg;
}

function createBossGraphic(s) {
    let pg = createGraphics(s, s);
    pg.translate(s / 2, s / 2);
    pg.noStroke();

    // Body
    pg.fill(50, 0, 0); // Dark Red
    pg.beginShape();
    pg.vertex(0, -s * 0.4);
    pg.vertex(s * 0.4, 0);
    pg.vertex(0, s * 0.4);
    pg.vertex(-s * 0.4, 0);
    pg.endShape(CLOSE);

    // Core
    pg.fill(255, 0, 0);
    pg.circle(0, 0, s * 0.3);

    return pg;
}
