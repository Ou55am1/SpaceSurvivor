# 🚀 Space Survivor AI

> *Survive the Void | Command your AI Drone Fleet | Conquer the Galaxy*

**Space Survivor AI** is an action-packed, sci-fi survival game built with **p5.js**. Pilot your ship through infinite space, battle waves of intelligent alien enemies, recruit AI helpers, and survive as long as possible!

---

## 🔗 Quick Links
-   📺 **YouTube Demo**: [Watch Gameplay Video](https://youtu.be/u9lt_L5ncHM)
-   🎮 **Play on Itch.io**: [Space Survivor Web Build](https://ou55ama.itch.io/space-survivor)

---

## 🎮 Features

### 1. **Dynamic Combat System**
-   **Auto-Fire Mechanism**: Focus on dodging while your ship automatically targets the nearest threat.
-   **Varied Enemy Types**:
    -   🔴 **Kamikaze**: Fast, aggressive units that explode on impact.
    -   🛡️ **Tank**: Massive, slow enemies with high health that act as shields.
    -   🎯 **Sniper**: Ranged attackers that keep their distance and shoot precision bolts.
-   **Boss Battles**: Every level up triggers an epic Boss fight. Defeat it to progress!

### 2. **Advanced AI Helpers**
-   Recruit **Helper Drones** that fight alongside you.
-   **Formation Control** (Toggle with `H`):
    -   🐍 **Snake Mode**: Helpers follow you in a strictly ordered line.
    -   🦅 **Flock Mode**: Helpers disperse and swarm around you dynamically.
-   Helpers automatically acquire targets and defend the player.

### 3. **Immersive Visuals & Audio**
-   **Neon Aesthetic**: Glowing UI, vibrant projectiles, and retro-futuristic styling.
-   **Particle Effects**: Explosions, sparks, and trails for a juicy game feel.
-   **Screen Shake**: Dynamic camera impact on damage and explosions.
-   **Soundtrack**: Integrated sound effects and background music (requires user interaction to start).

### 4. **Progression System**
-   **XP & Leveling**: Collect Orbs dropped by enemies to level up.
-   **Scaling Difficulty**: Enemies become faster and stronger as you survive longer.
-   **High Score**: Your best survival run is saved locally.

---

## 🕹️ Controls

| Key | Action |
| :---: | :--- |
| **ARROWS** / **WASD** | 🛸 **Move** your Ship |
| **S** | ▶️ **Start Game** / 🔄 **Replay** / ▶️ **Continue** (from Pause) |
| **P** | ⏸️ **Pause Game** |
| **H** | 🤖 **Toggle Formation** (Snake / Flock) |

---

## 🚀 How to Play

1.  **Start**: Open `index.html` in a modern web browser.
2.  **Survive**: Dodge enemies and obstacles (asteroids).
3.  **Fight**: Your ship shoots automatically.
4.  **Farm XP**: Collect the glowing orbs dropped by destroyed enemies.
5.  **Grow**: Killing a Boss grants you a new Helper Drone.
6.  **Pause**: Need a break? Press **P**. Press **P** or **S** to resume.

---

## 🛠️ Installation & Setup

### Option 1: Direct Open
Simply double-click `index.html`. 
*(Note: Some browsers may restrict audio or local image loading for security reasons).*

### Option 2: Local Server (Recommended)
For the best experience, run a local server:

**Using Python:**
```bash
cd SpaceSurvivorAI
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Using VS Code Live Server:**
Right-click `index.html` and select "Open with Live Server".

---

## 💻 Technologies Used

-   **JavaScript (ES6+)**
-   **[p5.js](https://p5js.org/)**: Creative Coding Framework
-   **p5.sound**: Audio processing

---

## 📂 Project Structure

-   `sketch.js`: Main game loop and logic.
-   `Player.js`, `Enemy.js`, `Boss.js`: Character classes.
-   `Vehicle.js`: Base class for physics-based movement (Seek, Arrive, Separate).
-   `Helper.js`: AI logic for friendly drones.
-   `Particle.js`: Visual effects system.
-   `AssetManager.js`: Handles images and sounds.

---


---

## 🧠 Implémentation Technique & Concepts du Cours

Ce projet met en pratique les algorithmes de **Steering Behaviors** (Comportements de Pilotage) vus en cours, en les intégrant dans un environnement de jeu complexe.

Voici la correspondance entre les **TPs du cours** et les fonctionnalités de **Space Survivor AI** :

### 1. **Seek (Chercher) & Flee (Fuir)** _(TP 1)_
*   **Seek** : Utilisé par tous les **Ennemis** pour traquer le joueur.
    *   *Code* : `Enemy.js` utilise `this.seek(player.pos)`.
*   **Flee** : Utilisé par le **Sniper** lorsqu'il est trop proche du joueur (maintien de distance de sécurité).
    *   *Code* : `Enemy.js` (variant 0) utilise `this.flee(target)`.

### 2. **Pursue (Poursuivre) & Evade (Évader)** _(TP 2)_
*   L'IA des **Helpers** (Drones) utilise une logique prédictive pour anticiper les mouvements des ennemis et se positionner, ou pour fuir le chef de file en mode "Snake" afin de garder une distance constante.

### 3. **Arrival (Arrivée)** _(TP 3)_
*   La classe de base `Vehicle.js` implémente la méthode `arrive(target)`, permettant un ralentissement progressif à l'approche d'une cible (utilisé pour des mouvements fluides).

### 4. **Obstacle Avoidance (Évitement d'Obstacles)** _(TP 6)_
*   Les **Helpers** sont dotés d'un rayon de perception leur permettant de détecter et d'éviter les Astéroïdes (`Obstacles`) qui dérivent sur la carte.
    *   *Code* : `Helper.js` appelle `this.avoid(obstacles)`.

### 5. **Boids & Flocking (Comportement de Groupe)** _(TP 7)_
*   Le mode **"FLOCK"** (Nuée) des Helpers implémente les règles de Reynolds :
    *   **Separation** : Les drones se repoussent pour ne pas se chevaucher (`helper.separate(helpers)`).
    *   **Cohesion/Alignment** : Ils se déplacent ensemble en groupe autour du joueur.

### 6. **Snake Formation (Formation Serpent)** _(TP 11)_
*   Le mode **"SNAKE"** démontre un algorithme de suivi hiérarchique :
    *   Le 1er Helper suit le Joueur.
    *   Le 2ème Helper suit le 1er, et ainsi de suite.
    *   Combinaison de `Seek` (pour suivre) et `Flee` (pour ne pas coller) afin de créer une chaîne articulée.

### 7. **Architecture Orientée Objet**
*   **Héritage** : `Player`, `Enemy`, `Helper`, `Obstacle` héritent tous de la classe physiquement réaliste `Vehicle`.
*   **Polymorphisme** : Chaque entité redéfinit sa méthode `update()` tout en utilisant le moteur physique parent.

---
**Développé par [Ton Nom/Groupe] pour le module IA2.**

