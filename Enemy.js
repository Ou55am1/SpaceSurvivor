// Enemy.js
class Enemy extends Vehicle {
    constructor(x, y, level = 1) {
        super(x, y); // Parent Constructor

        this.variant = floor(random(3)); // 0: Sniper, 1: Tank, 2: Kamikaze
        this.level = level;

        // Default Defaults
        this.r = 30;
        this.maxSpeed = 2;
        this.maxForce = 0.1;
        this.health = 10;
        this.damage = 10;
        this.scoreValue = 10;

        // --- DIFFERENTIATION ---
        if (this.variant === 0) {
            // SNIPER (Enemy_1)
            // Strategy: Keep distance, Shoot precision
            this.maxSpeed = 2 + (level * 0.1);
            this.health = 20 + (level * 5);
            this.r = 35;
            this.shootTimer = random(60, 120);
            this.shootingRange = 500;
            this.idealDistance = 300; // Tries to stay at this range
            this.damage = 10 + level;

        } else if (this.variant === 1) {
            // TANK (Enemy_2)
            // Strategy: Sponge, Shield
            this.maxSpeed = 1 + (level * 0.05); // Very Slow
            this.health = 50 + (level * 20); // HUGE HP
            this.r = 50; // Big
            this.shootTimer = 9999; // Rarely shoots (or never)
            this.damage = 20 + level; // Heavy collision damage

        } else if (this.variant === 2) {
            // KAMIKAZE (Enemy_3)
            // Strategy: Rush, Explode
            this.maxSpeed = 4 + (level * 0.3); // FAST
            this.health = 5 + (level * 2); // Glass Cannon
            this.r = 25; // Small
            this.shootTimer = 9999; // Doesn't shoot, is the bullet
            this.damage = 40 + (level * 5); // EXPLOSIVE DAMAGE
            this.isKamikaze = true;
        }
    }

    update(target, enemies, obstacles, enemyBullets) {
        // Safe target extraction
        let t = target.pos || target;

        // 1. Calculate Forces based on Type
        let fSeek = createVector(0, 0);
        let fSeparate = this.separate(enemies);
        let fAvoid = this.avoid(obstacles);

        // BEHAVIORS
        if (this.variant === 0) { // SNIPER
            // Seek but stop at distance
            let d = dist(this.pos.x, this.pos.y, t.x, t.y);
            if (d < this.idealDistance) {
                // Too close? Flee/Stop
                let fFlee = this.flee(t);
                fSeek.add(fFlee);
            } else {
                // Too far? Seek
                fSeek = this.seek(t);
            }
        }
        else if (this.variant === 1) { // TANK
            // Just plow through, weak avoidance
            fSeek = this.seek(t);
            fAvoid.mult(0.5); // Tanks don't care much about obstacles
        }
        else if (this.variant === 2) { // KAMIKAZE
            // Aggressive Seek
            fSeek = this.seek(t);
            fSeek.mult(2.0); // VERY want to hit player
            fSeparate.mult(0.2); // Swarm (don't separate much)
        }

        fSeek.mult(1.0);
        fSeparate.mult(1.5);
        fAvoid.mult(3.0);

        this.applyForce(fSeek);
        this.applyForce(fSeparate);
        this.applyForce(fAvoid);

        // 2. Physics
        super.update();

        // 3. Shooting Logic
        if (enemyBullets && !this.isKamikaze && this.variant !== 1) { // Kamikaze & Tank don't shoot normally
            this.shootTimer--;
            if (this.shootTimer <= 0) {
                this.fireAt(target, enemyBullets);
            }
        }
    }

    fireAt(target, enemyBullets) {
        let t = target.pos || target;
        let d = dist(this.pos.x, this.pos.y, t.x, t.y);

        if (d < this.shootingRange) {
            let dir = p5.Vector.sub(t, this.pos);
            // Snipers shoot faster projectiles
            let speed = (this.variant === 0) ? 12 : 8;
            enemyBullets.push(new Projectile(this.pos.x, this.pos.y, dir, true, speed, this.damage));
            this.shootTimer = random(100, 200);
        }
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);

        // Kamikaze Flashing Effect
        if (this.isKamikaze && frameCount % 10 < 5) {
            tint(255, 100, 100); // Flash Red
        }

        if (this.vel.x < 0) scale(-1, 1);
        imageMode(CENTER);

        if (assets.enemyImages && assets.enemyImages.length > 0) {
            // Use variant specific image
            // Ensure variant maps roughly to 0, 1, 2 index
            // Assets might be loaded as [Enemy1, Enemy2, Enemy3]
            // variant 0 -> Enemy1
            let imgIndex = this.variant % assets.enemyImages.length;
            let img = assets.enemyImages[imgIndex];

            if (img) image(img, 0, 0, this.r * 2, this.r * 2);
            else {
                fill(255, 0, 0); circle(0, 0, this.r * 2); // Fallback
            }
        } else {
            fill(255, 0, 0); circle(0, 0, this.r * 2); // Fallback
        }
        pop();
    }

    // Add flee behavior for Snipers
    flee(target) {
        let desired = p5.Vector.sub(this.pos, target);
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }
}
