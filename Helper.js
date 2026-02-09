// Helper.js
class Helper extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.r = 30; // Up from 15
        this.maxSpeed = 6;
        this.maxForce = 0.15;
        this.shootTimer = 10;
    }

    // We modify update to accept arguments, calculate specific forces, then call super.update()
    update(player, helpers, boss, formation, bullets, obstacles, snakeTarget) {

        // 1. Obstacle Avoidance (Always active)
        if (obstacles) {
            let avoidForce = this.avoid(obstacles);
            avoidForce.mult(3.0);
            this.applyForce(avoidForce);
        }

        // 2. Boss Mode
        if (boss) {
            let seekBoss = this.seek(boss.pos);
            let sep = this.separate(helpers);
            seekBoss.mult(1.5);
            sep.mult(2.0);
            this.applyForce(seekBoss);
            this.applyForce(sep);
            this.shoot(boss, bullets);

        } else if (formation === "SNAKE") {
            // Snake Mode
            if (snakeTarget) {
                let seekForce = this.seek(snakeTarget);
                seekForce.mult(3.0); // Stronger seek to maintain chain

                // Maintain distance from target (Head Separation)
                let d = dist(this.pos.x, this.pos.y, snakeTarget.x, snakeTarget.y);
                if (d < 80) { // Keep 80px distance
                    let fleeForce = this.flee(snakeTarget);
                    fleeForce.mult(5.0); // Strong push back
                    this.applyForce(fleeForce);
                }

                this.applyForce(seekForce);
            }
            // Separation
            let sep = this.separate(helpers);
            sep.mult(2.5); // Balanced separation
            this.applyForce(sep);

        } else {
            // Flock Mode
            let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
            let seekForce;

            // Personal Space Logic: If too close, Flee! Else, Seek.
            if (d < 100) {
                seekForce = this.flee(player.pos);
                seekForce.mult(2.0); // Get away fast!
            } else {
                seekForce = this.seek(player.pos);
                seekForce.mult(1.0); // Gently follow
                // Or arrive? Arrive slows down. Seek is fine if we switch to flee.
            }

            let sepForce = this.separate(helpers);
            // No Cohesion as per user request to avoid clumping
            // let cohForce = this.cohesion(helpers);

            sepForce.mult(3.0); // Strong separation from other helpers
            // cohForce.mult(0.1);

            this.applyForce(seekForce);
            this.applyForce(sepForce);
            // this.applyForce(cohForce);
        }

        // 3. Physics (Parent)
        super.update();

        // 4. Cool-downs
        if (this.shootTimer > 0) this.shootTimer--;
    }

    shoot(target, bullets) {
        if (this.shootTimer <= 0) {
            let dir = p5.Vector.sub(target.pos, this.pos);
            // x, y, target, isEnemy, size, damage, ownerType
            bullets.push(new Projectile(this.pos.x, this.pos.y, dir, false, 25, 0, 'HELPER'));
            this.shootTimer = 40;
        }
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        imageMode(CENTER);
        if (assets.helperImage && assets.helperImage.width > 1) {
            image(assets.helperImage, 0, 0, this.r * 2, this.r * 2);
        } else {
            image(assets.helper, 0, 0, this.r * 2, this.r * 2);
        }
        pop();
    }
}
