// Boss.js
class Boss extends Vehicle {
    constructor(x, y, level) {
        super(x, y);
        this.r = 150; // Increased size (was 75)
        this.maxHealth = 1000 * level; // Massive HP scaling
        this.health = this.maxHealth;
        this.maxSpeed = 1.5;
        this.attackTimer = 0;
        this.damage = 15 + (level * 5); // Heavy damage
    }

    update(player, enemyBullets, obstacles) {
        // Simple Chase logic converted to Steering
        // Instead of manually setting position, we Seek
        let seekForce = this.seek(player.pos);
        seekForce.mult(0.5); // Boss is heavy/slow
        this.applyForce(seekForce);

        // Interaction with Obstacles (Boss plows through them)
        if (obstacles) {
            for (let obs of obstacles) {
                let d = dist(this.pos.x, this.pos.y, obs.pos.x, obs.pos.y);
                if (d < this.r + obs.r + 30) {
                    // PUSH OBSTACLE AWAY
                    let pushVec = p5.Vector.sub(obs.pos, this.pos);
                    pushVec.setMag(2.0); // Strong push force
                    obs.applyForce(pushVec);
                }
            }
        }

        // Physics Integration
        super.update();

        // Attack Logic
        this.attackTimer++;
        if (this.attackTimer > 100) {
            this.fireAttack(enemyBullets);
            this.attackTimer = 0;
        }
    }

    fireAttack(enemyBullets) {
        // Circular Burst
        for (let a = 0; a < TWO_PI; a += PI / 8) {
            let dir = p5.Vector.fromAngle(a);
            // x, y, dir, isEnemy, size, damage, ownerType
            enemyBullets.push(new Projectile(this.pos.x, this.pos.y, dir, true, 40, this.damage, 'BOSS'));
        }
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        imageMode(CENTER);

        // Boss Image verification used in previous edits
        if (assets.bossImage && assets.bossImage.width > 1) {
            image(assets.bossImage, 0, 0, this.r * 2, this.r * 2);
        } else {
            image(assets.boss, 0, 0, this.r * 2, this.r * 2);
        }

        // Health Bar
        noStroke();
        fill(100);
        rect(-50, -60, 100, 10);
        fill(255, 0, 0);
        let hpW = map(this.health, 0, this.maxHealth, 0, 100);
        rect(-50, -60, hpW, 10);

        pop();
    }
}
