// N-Body Problem Simulation - Vanilla JavaScript
class NBodySimulation {
    constructor() {
        // State management (replacing React state)
        this.state = {
            isPaused: false,
            speed: 1,
            isSetupMode: true,
            numBodies: 3,
            massDistribution: 'equal',
            massParams: {
                gaussianMu: 1,
                gaussianSigma: 0.3,
                powerLawK: 2,
                powerLawMin: 0.1,
                powerLawMax: 10,
                uniformA: 0.5,
                uniformB: 2
            }
        };

        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.bodies = [];
        this.animationId = null;

        // Physics constants
        this.G = 1;
        this.dt = 0.01;

        // Camera controls
        this.cameraDistance = 25;
        this.minDistance = 5;
        this.maxDistance = 100;
        this.isDraggingCamera = false;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.cameraRotationY = 0;
        this.cameraRotationX = 0;

        // Body selection for setup mode
        this.selectedBody = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.offset = new THREE.Vector3();

        // DOM elements
        this.elements = {};
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDOM());
        } else {
            this.setupDOM();
        }
    }

    setupDOM() {
        // Cache DOM elements
        this.elements = {
            container: document.getElementById('simulation-container'),
            loading: document.getElementById('loading'),
            setupControls: document.getElementById('setup-controls'),
            simulationControls: document.getElementById('simulation-controls'),
            
            // Setup controls
            numBodies: document.getElementById('num-bodies'),
            numBodiesValue: document.getElementById('num-bodies-value'),
            massDistribution: document.getElementById('mass-distribution'),
            
            // Distribution parameters
            gaussianParams: document.getElementById('gaussian-params'),
            gaussianMu: document.getElementById('gaussian-mu'),
            gaussianMuValue: document.getElementById('gaussian-mu-value'),
            gaussianSigma: document.getElementById('gaussian-sigma'),
            gaussianSigmaValue: document.getElementById('gaussian-sigma-value'),
            
            powerlawParams: document.getElementById('powerlaw-params'),
            powerlawK: document.getElementById('powerlaw-k'),
            powerlawKValue: document.getElementById('powerlaw-k-value'),
            powerlawMin: document.getElementById('powerlaw-min'),
            powerlawMinValue: document.getElementById('powerlaw-min-value'),
            powerlawMax: document.getElementById('powerlaw-max'),
            powerlawMaxValue: document.getElementById('powerlaw-max-value'),
            
            uniformParams: document.getElementById('uniform-params'),
            uniformA: document.getElementById('uniform-a'),
            uniformAValue: document.getElementById('uniform-a-value'),
            uniformB: document.getElementById('uniform-b'),
            uniformBValue: document.getElementById('uniform-b-value'),
            
            distributionDescription: document.getElementById('distribution-description'),
            
            // Buttons
            startSimulation: document.getElementById('start-simulation'),
            pauseResume: document.getElementById('pause-resume'),
            resetSimulation: document.getElementById('reset-simulation'),
            
            // Simulation controls
            speedControl: document.getElementById('speed-control'),
            speedValue: document.getElementById('speed-value')
        };

        this.setupEventListeners();
        this.initThreeJS();
    }

    setupEventListeners() {
        // Setup controls
        this.elements.numBodies.addEventListener('input', (e) => {
            this.state.numBodies = parseInt(e.target.value);
            this.elements.numBodiesValue.textContent = this.state.numBodies;
            this.reinitScene();
        });

        this.elements.massDistribution.addEventListener('change', (e) => {
            this.state.massDistribution = e.target.value;
            this.updateDistributionUI();
            this.reinitScene();
        });

        // Distribution parameter controls
        this.setupDistributionControls();

        // Button controls
        this.elements.startSimulation.addEventListener('click', () => {
            this.state.isSetupMode = false;
            this.state.isPaused = false;
            this.updateUI();
        });

        this.elements.pauseResume.addEventListener('click', () => {
            this.state.isPaused = !this.state.isPaused;
            this.updateUI();
        });

        this.elements.resetSimulation.addEventListener('click', () => {
            this.resetSimulation();
        });

        this.elements.speedControl.addEventListener('input', (e) => {
            this.state.speed = parseInt(e.target.value);
            this.elements.speedValue.textContent = this.state.speed;
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.state.isSetupMode) {
                    this.state.isPaused = !this.state.isPaused;
                    this.updateUI();
                }
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupDistributionControls() {
        // Gaussian controls
        this.elements.gaussianMu.addEventListener('input', (e) => {
            this.state.massParams.gaussianMu = parseFloat(e.target.value);
            this.elements.gaussianMuValue.textContent = this.state.massParams.gaussianMu.toFixed(2);
            this.reinitScene();
        });

        this.elements.gaussianSigma.addEventListener('input', (e) => {
            this.state.massParams.gaussianSigma = parseFloat(e.target.value);
            this.elements.gaussianSigmaValue.textContent = this.state.massParams.gaussianSigma.toFixed(2);
            this.reinitScene();
        });

        // Power law controls
        this.elements.powerlawK.addEventListener('input', (e) => {
            this.state.massParams.powerLawK = parseFloat(e.target.value);
            this.elements.powerlawKValue.textContent = this.state.massParams.powerLawK.toFixed(1);
            this.reinitScene();
        });

        this.elements.powerlawMin.addEventListener('input', (e) => {
            this.state.massParams.powerLawMin = parseFloat(e.target.value);
            this.elements.powerlawMinValue.textContent = this.state.massParams.powerLawMin.toFixed(2);
            this.reinitScene();
        });

        this.elements.powerlawMax.addEventListener('input', (e) => {
            this.state.massParams.powerLawMax = parseFloat(e.target.value);
            this.elements.powerlawMaxValue.textContent = this.state.massParams.powerLawMax.toFixed(1);
            this.reinitScene();
        });

        // Uniform controls
        this.elements.uniformA.addEventListener('input', (e) => {
            this.state.massParams.uniformA = parseFloat(e.target.value);
            this.elements.uniformAValue.textContent = this.state.massParams.uniformA.toFixed(2);
            this.reinitScene();
        });

        this.elements.uniformB.addEventListener('input', (e) => {
            this.state.massParams.uniformB = parseFloat(e.target.value);
            this.elements.uniformBValue.textContent = this.state.massParams.uniformB.toFixed(2);
            this.reinitScene();
        });
    }

    updateDistributionUI() {
        // Hide all parameter panels
        this.elements.gaussianParams.style.display = 'none';
        this.elements.powerlawParams.style.display = 'none';
        this.elements.uniformParams.style.display = 'none';

        // Show relevant panel and update description
        const descriptions = {
            equal: 'All bodies have mass = 1',
            random: 'Random masses (0.5-2x)',
            central: 'First body 10x heavier',
            gaussian: 'Normal distribution',
            powerlaw: 'Power law: P(m) ∝ m^(-k)',
            uniform: 'Uniform distribution [a, b]'
        };

        this.elements.distributionDescription.textContent = descriptions[this.state.massDistribution];

        if (this.state.massDistribution === 'gaussian') {
            this.elements.gaussianParams.style.display = 'block';
        } else if (this.state.massDistribution === 'powerlaw') {
            this.elements.powerlawParams.style.display = 'block';
        } else if (this.state.massDistribution === 'uniform') {
            this.elements.uniformParams.style.display = 'block';
        }
    }

    updateUI() {
        if (this.state.isSetupMode) {
            this.elements.setupControls.style.display = 'block';
            this.elements.simulationControls.style.display = 'none';
        } else {
            this.elements.setupControls.style.display = 'none';
            this.elements.simulationControls.style.display = 'block';
            
            // Update pause/resume button
            this.elements.pauseResume.textContent = this.state.isPaused ? 'Resume' : 'Pause';
            this.elements.pauseResume.className = this.state.isPaused ? 'action-button paused' : 'action-button';
        }
    }

    initThreeJS() {
        if (!window.THREE) {
            console.error('Three.js not loaded');
            return;
        }

        this.createScene();
        this.createBodies();
        this.setupControls();
        this.updateUI();
        this.updateDistributionUI();
        
        // Hide loading screen
        this.elements.loading.style.display = 'none';
        
        this.animate();
    }

    createScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 25);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.elements.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        // Grid
        const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
        gridHelper.position.y = -5;
        this.scene.add(gridHelper);

        // Raycaster for mouse picking
        this.raycaster = new THREE.Raycaster();
    }

    createBodies() {
        // Clear existing bodies
        this.bodies.forEach(body => {
            this.scene.remove(body.mesh);
            this.scene.remove(body.glow);
            this.scene.remove(body.light);
            this.scene.remove(body.trailLine);
        });
        this.bodies = [];

        // Calculate body size based on number of bodies
        const baseSize = 0.25;
        const glowSize = 0.4;
        const sizeScale = Math.max(0.3, 1 - (this.state.numBodies / 120));
        const bodySize = baseSize * sizeScale;
        const bodyGlowSize = glowSize * sizeScale;

        // Color palette
        const colors = [
            0xff3366, 0x33ff88, 0x3388ff, 0xffaa33, 0xff33ff, 0x33ffff,
            0xaaff33, 0xff3388, 0x88ff33, 0x8833ff, 0xff6633, 0x33ff66,
            0x6633ff, 0xffcc33, 0xff33cc, 0x33ffcc, 0xccff33, 0xcc33ff,
            0xff3399, 0x99ff33
        ];

        for (let i = 0; i < this.state.numBodies; i++) {
            const angle = (i / this.state.numBodies) * Math.PI * 2;
            const radius = 3;
            const speed = 0.5;

            // Determine mass based on distribution
            let mass = this.calculateMass(i);

            const body = {
                mass: mass,
                pos: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 2,
                    Math.sin(angle) * radius
                ),
                vel: new THREE.Vector3(
                    -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.3,
                    Math.cos(angle) * speed + (Math.random() - 0.5) * 0.2
                ),
                color: colors[i % colors.length],
                trail: [],
                maxTrail: 800
            };

            this.createBodyMesh(body, bodySize, bodyGlowSize);
            this.bodies.push(body);
        }

        // Store initial states for reset
        this.initialStates = this.bodies.map(body => ({
            pos: body.pos.clone(),
            vel: body.vel.clone()
        }));
    }

    calculateMass(index) {
        const { massDistribution, massParams } = this.state;
        
        switch (massDistribution) {
            case 'equal':
                return 1;
            case 'random':
                return 0.5 + Math.random() * 1.5;
            case 'central':
                return index === 0 ? 10 : 1;
            case 'gaussian':
                return this.gaussianRandom(massParams.gaussianMu, massParams.gaussianSigma);
            case 'powerlaw':
                return this.powerLawRandom(massParams.powerLawK, massParams.powerLawMin, massParams.powerLawMax);
            case 'uniform':
                return this.uniformRandom(massParams.uniformA, massParams.uniformB);
            default:
                return 1;
        }
    }

    gaussianRandom(mu, sigma) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return Math.max(0.1, mu + z0 * sigma);
    }

    powerLawRandom(k, min, max) {
        const u = Math.random();
        const minPow = Math.pow(min, -k);
        const maxPow = Math.pow(max, -k);
        const mass = Math.pow(minPow + u * (maxPow - minPow), -1/k);
        return mass;
    }

    uniformRandom(a, b) {
        return a + Math.random() * (b - a);
    }

    createBodyMesh(body, bodySize, bodyGlowSize) {
        // Scale body size based on mass
        const massScale = Math.pow(body.mass, 0.33); // Cube root for realistic volume
        const scaledBodySize = bodySize * massScale;
        const scaledGlowSize = bodyGlowSize * massScale;

        // Glow
        const glowGeometry = new THREE.SphereGeometry(scaledGlowSize, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: body.color,
            transparent: true,
            opacity: 0.3
        });
        body.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(body.glow);

        // Main body
        const geometry = new THREE.SphereGeometry(scaledBodySize, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: body.color,
            emissive: body.color,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        body.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(body.mesh);

        // Light
        const light = new THREE.PointLight(body.color, 2, 10);
        body.light = light;
        this.scene.add(light);

        // Trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: body.color,
            transparent: true,
            opacity: 0.6
        });
        body.trailLine = new THREE.Line(trailGeometry, trailMaterial);
        this.scene.add(body.trailLine);

        // Position everything
        body.mesh.position.copy(body.pos);
        body.glow.position.copy(body.pos);
        body.light.position.copy(body.pos);
    }

    setupControls() {
        // Mouse controls
        const onMouseMove = (e) => {
            const currentMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const currentMouseY = -(e.clientY / window.innerHeight) * 2 + 1;

            if (this.state.isSetupMode && this.selectedBody !== null) {
                this.mouse.x = currentMouseX;
                this.mouse.y = currentMouseY;

                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersectPoint = new THREE.Vector3();
                this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
                
                if (intersectPoint) {
                    this.bodies[this.selectedBody].pos.copy(intersectPoint.sub(this.offset));
                }
            } else if (!this.state.isSetupMode && this.isDraggingCamera) {
                const deltaX = currentMouseX - this.previousMouseX;
                const deltaY = currentMouseY - this.previousMouseY;
                
                this.cameraRotationY -= deltaX * 2;
                this.cameraRotationX -= deltaY * 2;
                this.cameraRotationX = Math.max(-1, Math.min(1, this.cameraRotationX));
            }
            
            this.previousMouseX = currentMouseX;
            this.previousMouseY = currentMouseY;
        };

        const onMouseDown = (e) => {
            this.previousMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.previousMouseY = -(e.clientY / window.innerHeight) * 2 + 1;

            if (this.state.isSetupMode) {
                this.mouse.x = this.previousMouseX;
                this.mouse.y = this.previousMouseY;

                this.raycaster.setFromCamera(this.mouse, this.camera);

                const meshes = this.bodies.map(b => b.mesh);
                const intersects = this.raycaster.intersectObjects(meshes);

                if (intersects.length > 0) {
                    const bodyIndex = this.bodies.findIndex(b => b.mesh === intersects[0].object);
                    this.selectedBody = bodyIndex;

                    const intersectPoint = new THREE.Vector3();
                    this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
                    this.offset.copy(intersectPoint).sub(this.bodies[bodyIndex].pos);

                    this.bodies[bodyIndex].mesh.scale.set(1.3, 1.3, 1.3);
                    this.bodies[bodyIndex].glow.scale.set(1.3, 1.3, 1.3);
                }
            } else {
                this.isDraggingCamera = true;
            }
        };

        const onMouseUp = () => {
            if (this.selectedBody !== null) {
                this.bodies[this.selectedBody].mesh.scale.set(1, 1, 1);
                this.bodies[this.selectedBody].glow.scale.set(1, 1, 1);
                this.selectedBody = null;
            }
            this.isDraggingCamera = false;
        };

        const onWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY * 0.01;
            this.cameraDistance += delta;
            this.cameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.cameraDistance));
        };

        // Add event listeners
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('wheel', onWheel, { passive: false });
    }

    calculateAcceleration(bodyIndex) {
        const acc = new THREE.Vector3(0, 0, 0);
        const body = this.bodies[bodyIndex];

        this.bodies.forEach((other, otherIndex) => {
            if (bodyIndex === otherIndex) return;

            const diff = new THREE.Vector3().subVectors(other.pos, body.pos);
            const distSq = diff.lengthSq();
            const dist = Math.sqrt(distSq);
            
            if (dist > 0.1) {
                const force = this.G * other.mass / (distSq * dist);
                acc.add(diff.multiplyScalar(force));
            }
        });

        return acc;
    }

    integrate() {
        const states = this.bodies.map(body => ({
            p0: body.pos.clone(),
            v0: body.vel.clone()
        }));

        this.bodies.forEach((body, i) => {
            const { p0, v0 } = states[i];

            const k1v = this.calculateAcceleration(i);
            const k1p = v0.clone();

            body.pos = p0.clone().add(k1p.clone().multiplyScalar(this.dt / 2));
            body.vel = v0.clone().add(k1v.clone().multiplyScalar(this.dt / 2));
            const k2v = this.calculateAcceleration(i);
            const k2p = body.vel.clone();

            body.pos = p0.clone().add(k2p.clone().multiplyScalar(this.dt / 2));
            body.vel = v0.clone().add(k2v.clone().multiplyScalar(this.dt / 2));
            const k3v = this.calculateAcceleration(i);
            const k3p = body.vel.clone();

            body.pos = p0.clone().add(k3p.clone().multiplyScalar(this.dt));
            body.vel = v0.clone().add(k3v.clone().multiplyScalar(this.dt));
            const k4v = this.calculateAcceleration(i);
            const k4p = body.vel.clone();

            body.pos = p0.clone().add(
                k1p.add(k2p.multiplyScalar(2)).add(k3p.multiplyScalar(2)).add(k4p).multiplyScalar(this.dt / 6)
            );
            body.vel = v0.clone().add(
                k1v.add(k2v.multiplyScalar(2)).add(k3v.multiplyScalar(2)).add(k4v).multiplyScalar(this.dt / 6)
            );
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.state.isPaused && !this.state.isSetupMode) {
            for (let i = 0; i < this.state.speed * 3; i++) {
                this.integrate();
            }

            this.bodies.forEach(body => {
                body.mesh.position.copy(body.pos);
                body.glow.position.copy(body.pos);
                body.light.position.copy(body.pos);

                body.trail.push(body.pos.clone());
                if (body.trail.length > body.maxTrail) {
                    body.trail.shift();
                }

                const positions = new Float32Array(body.trail.length * 3);
                body.trail.forEach((p, i) => {
                    positions[i * 3] = p.x;
                    positions[i * 3 + 1] = p.y;
                    positions[i * 3 + 2] = p.z;
                });

                body.trailLine.geometry.setAttribute(
                    'position',
                    new THREE.BufferAttribute(positions, 3)
                );
            });
        } else if (this.state.isSetupMode) {
            this.bodies.forEach(body => {
                body.mesh.position.copy(body.pos);
                body.glow.position.copy(body.pos);
                body.light.position.copy(body.pos);
            });
        }

        if (!this.state.isSetupMode) {
            const targetX = Math.sin(this.cameraRotationY) * this.cameraDistance;
            const targetZ = Math.cos(this.cameraRotationY) * this.cameraDistance;
            const targetY = 15 + this.cameraRotationX * 10;
            
            this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
            this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
            this.camera.lookAt(0, 0, 0);
        }

        this.renderer.render(this.scene, this.camera);
    }

    reinitScene() {
        this.createBodies();
    }

    resetSimulation() {
        this.bodies.forEach((body, i) => {
            body.pos.copy(this.initialStates[i].pos);
            body.vel.copy(this.initialStates[i].vel);
            body.trail = [];
            body.mesh.position.copy(body.pos);
            body.glow.position.copy(body.pos);
            body.light.position.copy(body.pos);
            body.trailLine.geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(0), 3)
            );
        });
        this.state.isSetupMode = true;
        this.state.isPaused = false;
        this.updateUI();
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the simulation when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new NBodySimulation();
});