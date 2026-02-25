/**
 * PhishGuard Visuals Engine
 * Premium Three.js Dynamic Background
 */

class PhishGuardVisuals {
    constructor() {
        this.canvas = document.getElementById('vfx-canvas');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.particles = null;
        this.initParticles();

        this.camera.position.z = 100;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.color = new THREE.Color('#00ff9d'); // Default "Secure" green
        this.speed = 0.5;

        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX - window.innerWidth / 2);
            this.mouseY = (e.clientY - window.innerHeight / 2);
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.animate();
    }

    initParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 1500;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 500;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            color: 0x00ff9d,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    updateState(verdict) {
        let targetColor = '#00ff9d';
        let targetSpeed = 0.5;

        if (verdict === 'MALICIOUS' || verdict === 'DANGEROUS' || verdict === 'HIGH_RISK') {
            targetColor = '#ff0055';
            targetSpeed = 2.0;
        } else if (verdict === 'SUSPICIOUS') {
            targetColor = '#ffb700';
            targetSpeed = 1.0;
        }

        this.color.set(targetColor);
        if (this.particles) {
            this.particles.material.color.set(targetColor);
        }
        this.speed = targetSpeed;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.targetX = this.mouseX * 0.05;
        this.targetY = this.mouseY * 0.05;

        this.particles.rotation.y += 0.001 * this.speed;
        this.particles.rotation.x += 0.0005 * this.speed;

        this.particles.position.x += (this.targetX - this.particles.position.x) * 0.1;
        this.particles.position.y += (-this.targetY - this.particles.position.y) * 0.1;

        this.renderer.render(this.scene, this.camera);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    // Three.js should be loaded via script tag in HTML
    if (typeof THREE !== 'undefined') {
        window.pgUsage = new PhishGuardVisuals();
    }
});
