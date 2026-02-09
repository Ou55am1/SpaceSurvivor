// Orb.js - Experience Drop
class Orb extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.r = 15; // Increased size (was 8)
        this.value = 10;
        this.magnetized = false;
        this.maxSpeed = 8;
    }

    update(player) {
        let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);

        // Magnet effect when close
        if (d < 100) {
            this.magnetized = true;
        }

        if (this.magnetized) {
            // Use Steering Behavior for Magnetism!
            let seekForce = this.seek(player.pos);
            seekForce.mult(2.0); // Strong attraction
            this.applyForce(seekForce);
        }

        super.update();
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        imageMode(CENTER);

        // Neon Glow Effect
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = "cyan";

        if (assets.orbImage && assets.orbImage.width > 1) {
            image(assets.orbImage, 0, 0, this.r * 2.5, this.r * 2.5);
        } else {
            image(assets.orb, 0, 0, this.r * 2, this.r * 2);
        }

        // Reset Glow (Important so it doesn't affect other things if context leaks, though push/pop handles it usually)
        drawingContext.shadowBlur = 0;
        pop();
    }
}
