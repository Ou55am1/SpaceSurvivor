// Weapon.js
class Weapon {
    constructor(parent) {
        this.parent = parent; // Attached to player
        this.cooldown = 0;
        this.fireRate = 20; // Frames between shots
        this.range = 300;
    }

    update(closestEnemy, bullets) {
        if (this.cooldown > 0) {
            this.cooldown--;
        }

        if (this.cooldown <= 0 && closestEnemy) {
            let d = dist(this.parent.pos.x, this.parent.pos.y, closestEnemy.pos.x, closestEnemy.pos.y);
            if (d < this.range) {
                this.shoot(closestEnemy, bullets);
                this.cooldown = this.fireRate;
            }
        }
    }

    shoot(target, bullets) {
        if (typeof soundManager !== 'undefined') soundManager.playShoot();
        let direction = p5.Vector.sub(target.pos, this.parent.pos);
        // x, y, dir, isEnemy, size, damage, ownerType
        bullets.push(new Projectile(this.parent.pos.x, this.parent.pos.y, direction, false, 25, 0, 'PLAYER'));
    }
}
