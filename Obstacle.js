// Obstacle.js
class Obstacle extends Vehicle {
    constructor(x, y, r) {
        super(x, y);
        this.r = r;
        this.vel = p5.Vector.random2D().mult(random(0.5, 1.5));
        this.maxSpeed = 2; // Limit drift speed
        this.variant = floor(random(0, 100));
    }

    update(w, h) {
        // Physics
        super.update();

        // Wrap around map
        if (this.pos.x < -this.r) this.pos.x = w + this.r;
        if (this.pos.x > w + this.r) this.pos.x = -this.r;
        if (this.pos.y < -this.r) this.pos.y = h + this.r;
        if (this.pos.y > h + this.r) this.pos.y = -this.r;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.pos.x * 0.01); // Spin slightly
        imageMode(CENTER);

        if (assets.obstacleImages && assets.obstacleImages.length > 0) {
            let img = assets.obstacleImages[this.variant % assets.obstacleImages.length];
            if (img && img.width > 1) {
                image(img, 0, 0, this.r * 2, this.r * 2);
            } else {
                image(assets.obstacle, 0, 0, this.r * 2, this.r * 2);
            }
        } else {
            if (assets.obstacle) image(assets.obstacle, 0, 0, this.r * 2, this.r * 2);
            else { fill(100); circle(0, 0, this.r * 2); } // Fallback
        }

        // Debug Hitbox
        // noFill(); stroke(255,0,0); circle(0,0, this.r*2);
        pop();
    }
}
