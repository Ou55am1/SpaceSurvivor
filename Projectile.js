// Projectile.js
class Projectile extends Vehicle {
    constructor(x, y, targetVec, isEnemy = false, size = 10, damage = 0, ownerType = null) {
        super(x, y);

        // Safety check for targetVec
        let v = (targetVec && targetVec.copy) ? targetVec.copy() : p5.Vector.random2D();
        this.vel = v.normalize().mult(isEnemy ? 6 : 10);
        this.r = size;
        this.maxSpeed = 20;

        this.damage = damage || (isEnemy ? 10 : 25);
        this.toDelete = false;
        this.lifetime = 60; // Frames to live
        this.isEnemy = isEnemy;

        // Determine type if not specified
        if (ownerType) {
            this.ownerType = ownerType;
        } else {
            this.ownerType = isEnemy ? 'ENEMY' : 'PLAYER';
        }
    }

    update() {
        super.update(); // Physics

        this.lifetime--;
        if (this.lifetime < 0) {
            this.toDelete = true;
        }
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() + PI / 2);
        imageMode(CENTER);

        let img;
        switch (this.ownerType) {
            case 'HELPER':
                img = assets.helperProjectileImage;
                break;
            case 'BOSS':
                img = assets.bossProjectileImage;
                break;
            case 'ENEMY':
                img = assets.enemyProjectileImage;
                break;
            case 'PLAYER':
            default:
                img = assets.projectileImage;
                break;
        }

        if (img) {
            image(img, 0, 0, this.r, this.r * 2);
        } else {
            // Fallback
            if (this.isEnemy) {
                image(assets.enemyProjectile, 0, 0, this.r, this.r * 2);
            } else {
                image(assets.projectile, 0, 0, this.r, this.r * 2);
            }
        }
        pop();
    }

    hits(enemy) {
        let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
        return d < this.r + enemy.r;
    }
}
