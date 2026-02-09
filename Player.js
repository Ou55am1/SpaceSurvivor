// Player.js
class Player extends Vehicle {
    constructor(x, y) {
        super(x, y); // Init Vehicle

        this.size = 80; // Dimensions
        this.maxSpeed = 5; // Vehicle property

        // Health System
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.invincible = false;
        this.invincibilityTimer = 0;
    }

    update(obstacles) {
        this.handleInput();

        // Potential future position for collisions
        let futurePos = p5.Vector.add(this.pos, this.vel);

        // Obstacle Collision (Simple "Push Back")
        for (let obs of obstacles) {
            let d = dist(futurePos.x, futurePos.y, obs.pos.x, obs.pos.y);
            if (d < this.size / 2 + obs.r) {
                // Push out
                let pushVec = p5.Vector.sub(this.pos, obs.pos);
                pushVec.setMag(this.maxSpeed);
                this.vel.add(pushVec);
            }
        }

        // Apply Physics via Parent
        // Note: Vehicle.update() adds acc to vel, then vel to pos.
        // handleInput sets vel directly, which is fine.
        super.update();

        // Invincibility Cooldown
        if (this.invincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }
    }

    takeDamage(amount) {
        if (this.invincible) return;

        this.health -= amount;
        this.invincible = true;
        this.invincibilityTimer = 60; // 1 second invincibility
    }

    handleInput() {
        this.vel.set(0, 0); // Reset for crisp movement
        if (keyIsDown(87) || keyIsDown(UP_ARROW)) this.vel.y = -this.maxSpeed;
        if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.vel.y = this.maxSpeed;
        if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.vel.x = -this.maxSpeed;
        if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.vel.x = this.maxSpeed;

        if (this.vel.magSq() > 0) this.vel.normalize().mult(this.maxSpeed);
    }

    constrain(w, h) {
        this.pos.x = constrain(this.pos.x, this.size / 2, w - this.size / 2);
        this.pos.y = constrain(this.pos.y, this.size / 2, h - this.size / 2);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);

        if (this.invincible && frameCount % 4 < 2) {
            tint(255, 100, 100);
        }

        if (this.vel.x < 0) scale(-1, 1);

        imageMode(CENTER);
        if (assets.playerImage) {
            image(assets.playerImage, 0, 0, this.size, this.size);
        } else {
            image(assets.player, 0, 0, this.size, this.size);
        }
        pop();
    }
}
