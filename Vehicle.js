// Vehicle.js
// Base class for all moving entities using Craig Reynolds' Steering Behaviors
// IMMUTABLE BASE CLASS - DO NOT MODIFY

class Vehicle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 5;
        this.maxForce = 0.1;
        this.r = 16;
    }

    // Physics Engine
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0); // Reset acceleration
    }

    applyForce(force) {
        this.acc.add(force);
    }

    // --- Steering Behaviors ---

    // Seek: Steer towards a target
    seek(target) {
        let desired = p5.Vector.sub(target, this.pos);
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    // Arrive: Seek with deceleration when close
    arrive(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();

        if (d < 100) {
            let m = map(d, 0, 100, 0, this.maxSpeed);
            desired.setMag(m);
        } else {
            desired.setMag(this.maxSpeed);
        }

        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    // Flee: Steer away from a target
    flee(target) {
        let desired = p5.Vector.sub(this.pos, target); // Opposite direction
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    // Avoid: Steer away from obstacles
    avoid(obstacles) {
        let perception = this.r + 50;
        let steer = createVector(0, 0);
        let count = 0;

        for (let obs of obstacles) {
            let d = p5.Vector.dist(this.pos, obs.pos);
            if (d < obs.r + perception) {
                let diff = p5.Vector.sub(this.pos, obs.pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer.div(count);
            steer.setMag(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    // Separate: Avoid crowding
    separate(vehicles) {
        let desiredseparation = this.r * 2.5;
        let sum = createVector();
        let count = 0;
        for (let other of vehicles) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < desiredseparation)) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d);
                sum.add(diff);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);
            return steer;
        }
        return createVector(0, 0);
    }

    // Align: Steer towards average heading of neighbors
    align(vehicles) {
        let neighbordist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let other of vehicles) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(other.vel);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);
            return steer;
        }
        return createVector(0, 0);
    }

    // Cohesion: Steer towards center of mass of neighbors
    cohesion(vehicles) {
        let neighbordist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let other of vehicles) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(other.pos);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);
        }
        return createVector(0, 0);
    }

    edges() {
        // Optional: Can be overridden or used as is for wrapping
        let buffer = this.r;
        if (this.pos.x > width + buffer) this.pos.x = -buffer;
        else if (this.pos.x < -buffer) this.pos.x = width + buffer;
        if (this.pos.y > height + buffer) this.pos.y = -buffer;
        else if (this.pos.y < -buffer) this.pos.y = height + buffer;
    }

    show() {
        // Abstract method - Override in child classes
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        fill(200);
        triangle(0, -5, 0, 5, 10, 0);
        pop();
    }
}
