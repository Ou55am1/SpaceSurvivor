// Particle.js
class Particle extends Vehicle {
    constructor(x, y, colorVal) {
        super(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 5));
        this.alpha = 255;
        this.colorVal = colorVal || [255, random(100, 200), 50];
        this.size = random(5, 15);
        this.decay = random(5, 10);
    }

    update() {
        this.vel.mult(0.9); // Friction
        super.update(); // Physics Integration

        this.alpha -= this.decay;
        this.size *= 0.95; // Shrink
    }

    show() {
        noStroke();
        // Glow effect
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = color(this.colorVal[0], this.colorVal[1], this.colorVal[2]);

        fill(this.colorVal[0], this.colorVal[1], this.colorVal[2], this.alpha);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.size, this.size); // Square sparks

        drawingContext.shadowBlur = 0;
    }

    finished() {
        return this.alpha <= 0;
    }
}
