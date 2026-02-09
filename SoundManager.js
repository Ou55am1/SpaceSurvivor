// SoundManager.js
// Procedural Sound Generation using p5.sound
// Features: SFX (Shoot, Explode, Collect) + Dynamic BGM (Normal/Boss)

let soundManager;

class SoundManager {
    constructor() {
        this.ready = false;
        this.bgmOscs = [];
        this.bossMode = false;
        this.currentMeasure = 0;
        this.isPlayingMusic = false;
        this.musicInterval = null;

        try {
            this.audioContext = getAudioContext();
            this.masterVol = 0.3;
            outputVolume(this.masterVol);
        } catch (e) {
            console.warn("Audio Context setup warning:", e);
        }
    }

    resumeAudio() {
        if (this.ready && getAudioContext().state === 'running') {
            console.log("Audio already running.");
            return;
        }

        console.log("Attempting userStartAudio()...");
        try {
            userStartAudio().then(() => {
                this.ready = true;
                console.log("SUCCESS: userStartAudio resolved.");
                console.log("Context State: " + getAudioContext().state);
                this.startMusic();
            }).catch(e => {
                console.error("FAIL: userStartAudio rejected: " + e);
            });
        } catch (e) {
            console.error("FAIL: userStartAudio crash: " + e);
        }
    }

    // --- SFX ---

    playShoot() {
        if (!this.ready) return;
        let osc = new p5.Oscillator('square');
        osc.start();
        osc.freq(800);
        osc.amp(0.05);
        osc.freq(100, 0.1);
        osc.amp(0, 0.1);
        setTimeout(() => osc.stop(), 100);
    }

    playExplosion() {
        if (!this.ready) return;
        let noise = new p5.Noise('brown');
        noise.start();
        noise.amp(0.2);
        noise.amp(0, 0.3);
        setTimeout(() => noise.stop(), 300);
    }

    playCollect() {
        if (!this.ready) return;
        let osc = new p5.Oscillator('sine');
        osc.start();
        osc.freq(1200);
        osc.amp(0.05);
        osc.freq(1800, 0.1);
        osc.amp(0, 0.1);
        setTimeout(() => osc.stop(), 100);
    }

    playLevelUp() {
        if (!this.ready) return;
        let notes = [523, 659, 783, 1046, 1318];
        let t = 0;
        notes.forEach(f => {
            setTimeout(() => {
                let osc = new p5.Oscillator('triangle');
                osc.start();
                osc.freq(f);
                osc.amp(0.1);
                osc.amp(0, 0.2);
                setTimeout(() => osc.stop(), 200);
            }, t);
            t += 100;
        });
    }

    playBossAlert() {
        if (!this.ready) return;
        // Siren sound
        let osc = new p5.Oscillator('sawtooth');
        osc.start();
        osc.freq(400);
        osc.amp(0.2);
        osc.freq(800, 1.0); // Sweep up
        setTimeout(() => {
            osc.freq(400, 1.0); // Sweep down
            osc.amp(0, 1.0);
            setTimeout(() => osc.stop(), 1000);
        }, 1000);
    }

    playGameOver() {
        if (!this.ready) return;
        this.stopMusic();

        // Sad drone
        let osc = new p5.Oscillator('triangle');
        osc.start();
        osc.freq(150);
        osc.amp(0.3);
        osc.freq(50, 2.0); // Slow pitch drop
        osc.amp(0, 2.0);
        setTimeout(() => osc.stop(), 2000);
    }

    // --- MUSIC SYSTEM (Procedural Sequencer) ---

    startMusic() {
        if (!this.ready || this.isPlayingMusic) return;
        this.isPlayingMusic = true;

        let tempo = 250; // ms per beat (approx 240 BPM eighth notes)
        this.musicInterval = setInterval(() => this.stepMusic(), tempo);
    }

    stopMusic() {
        if (this.musicInterval) clearInterval(this.musicInterval);
        this.isPlayingMusic = false;
    }

    setBossMode(isBoss) {
        if (this.bossMode === isBoss) return;
        this.bossMode = isBoss;
        if (isBoss) this.playBossAlert();
    }

    stepMusic() {
        this.currentMeasure++;

        // Bassline (Every beat)
        let bassFreq = this.bossMode ? 55 : 65; // Lower/Faster for boss? No, different key.
        // Boss: A1 (55Hz), Normal: C2 (65Hz)

        let osc = new p5.Oscillator(this.bossMode ? 'sawtooth' : 'sine');
        osc.start();
        osc.freq(bassFreq);
        osc.amp(0.2);
        osc.amp(0, 0.1); // Short pluck
        setTimeout(() => osc.stop(), 100);

        // Hi-hat (Every off-beat)
        if (this.currentMeasure % 2 !== 0) {
            let noise = new p5.Noise('white');
            noise.start();
            noise.amp(0.05);
            noise.amp(0, 0.05);
            setTimeout(() => noise.stop(), 50);
        }

        // Melody (Random procedural arpeggio)
        if (this.currentMeasure % 4 === 0) {
            let scale = this.bossMode ? [220, 261, 311, 329] : [261, 329, 392, 523]; // Minor vs Major ish
            let note = random(scale);
            let mel = new p5.Oscillator('square');
            mel.start();
            mel.freq(note);
            mel.amp(0.05);
            mel.amp(0, 0.2);
            setTimeout(() => mel.stop(), 200);
        }
    }
}

function initSound() {
    if (!soundManager) {
        soundManager = new SoundManager();
        console.log("SoundManager created. Waiting for interaction to resume AudioContext.");
    }
    // Try to resume immediately on every call (interaction)
    soundManager.resumeAudio();
}
