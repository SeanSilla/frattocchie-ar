/**
 * Alien Monolith AR Experience - Centro Commerciale La Nave (Frattocchie)
 * Built with 8th Wall WebAR & A-Frame (Three.js)
 */

// Procedurally generate an alien circuit & rune canvas texture
function createAlienProceduralTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Background: Deep brushed dark obsidian
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Brushed metal micro-scratches
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 400; i++) {
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 40);
    ctx.stroke();
  }

  // Draw glowing alien glyphs & vertical geometric circuits
  ctx.strokeStyle = '#00ffe1';
  ctx.fillStyle = '#00ffe1';
  ctx.shadowColor = '#00ffe1';
  ctx.shadowBlur = 12;

  // Central spine lines
  const centerX = canvas.width / 2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, 100);
  ctx.lineTo(centerX, canvas.height - 100);
  ctx.stroke();

  // Lateral branches & geometric nodes
  for (let y = 200; y < canvas.height - 200; y += 150) {
    const span = 120 + Math.sin(y) * 80;
    ctx.beginPath();
    ctx.moveTo(centerX - span, y);
    ctx.lineTo(centerX + span, y);
    ctx.stroke();

    // Small diamond runes at intersections
    ctx.beginPath();
    ctx.moveTo(centerX, y - 10);
    ctx.lineTo(centerX + 10, y);
    ctx.lineTo(centerX, y + 10);
    ctx.lineTo(centerX - 10, y);
    ctx.closePath();
    ctx.fill();

    // Outer angular steps
    ctx.beginPath();
    ctx.moveTo(centerX - span, y);
    ctx.lineTo(centerX - span - 40, y + 40);
    ctx.moveTo(centerX + span, y);
    ctx.lineTo(centerX + span + 40, y + 40);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// Procedurally generate the emissive glow map
function createAlienEmissiveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#00ffe1';
  ctx.fillStyle = '#00ffe1';
  ctx.shadowColor = '#00ffe1';
  ctx.shadowBlur = 20;

  const centerX = canvas.width / 2;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(centerX, 150);
  ctx.lineTo(centerX, canvas.height - 150);
  ctx.stroke();

  for (let y = 200; y < canvas.height - 200; y += 150) {
    const span = 120 + Math.sin(y) * 80;
    ctx.beginPath();
    ctx.moveTo(centerX - span, y);
    ctx.lineTo(centerX + span, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// A-Frame Component: Alien Monolith with dark metallic PBR & pulsing shaders
AFRAME.registerComponent('alien-monolith', {
  schema: {
    width: { type: 'number', default: 3.0 },
    height: { type: 'number', default: 12.0 },
    depth: { type: 'number', default: 0.75 },
  },

  init() {
    const { width, height, depth } = this.data;

    // Create box geometry with slight edge bevel or chamfer simulation
    const geometry = new THREE.BoxGeometry(width, height, depth, 4, 16, 4);
    
    const diffuseMap = createAlienProceduralTexture();
    const emissiveMap = createAlienEmissiveTexture();

    // High-specular alien dark metal material
    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a0e14),
      metalness: 0.95,
      roughness: 0.18,
      map: diffuseMap,
      emissive: new THREE.Color(0x00d9ff),
      emissiveMap: emissiveMap,
      emissiveIntensity: 0.7,
      bumpMap: diffuseMap,
      bumpScale: 0.02,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    // Position mesh so the base sits on ground level (y = 0)
    this.mesh.position.y = height / 2;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.el.setObject3D('mesh', this.mesh);
    this.time = 0;
  },

  tick(time, timeDelta) {
    // Subtle pulsating alien glow effect
    if (this.material) {
      this.time += (timeDelta || 16) * 0.002;
      const pulse = 0.5 + 0.4 * Math.sin(this.time);
      this.material.emissiveIntensity = pulse;
    }
  },
});

// Web Audio API Synthesizer: Eerie Alien Monolith Drone
class AlienAudioSynth {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

    // Resonant Lowpass Filter (Atmospheric sci-fi muffling)
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(4.0, this.audioCtx.currentTime);

    // Low Sub-bass oscillator (55Hz fundamental, deep resonance)
    const subOsc = this.audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, this.audioCtx.currentTime);

    // Harmonic Saw oscillator with detune for extraterrestrial hum
    const detuneOsc1 = this.audioCtx.createOscillator();
    detuneOsc1.type = 'sawtooth';
    detuneOsc1.frequency.setValueAtTime(110, this.audioCtx.currentTime);
    detuneOsc1.detune.setValueAtTime(-14, this.audioCtx.currentTime);

    const detuneOsc2 = this.audioCtx.createOscillator();
    detuneOsc2.type = 'triangle';
    detuneOsc2.frequency.setValueAtTime(165, this.audioCtx.currentTime);
    detuneOsc2.detune.setValueAtTime(12, this.audioCtx.currentTime);

    // LFO to slowly modulate the filter cutoff (breathing pulse)
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.audioCtx.currentTime); // 5-second cycle
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(80, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Sub gains
    const oscGain = this.audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);

    subOsc.connect(filter);
    detuneOsc1.connect(filter);
    detuneOsc2.connect(filter);
    filter.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    subOsc.start();
    detuneOsc1.start();
    detuneOsc2.start();
    lfo.start();
  }

  toggle() {
    if (!this.audioCtx) this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.isPlaying) {
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.0);
      this.isPlaying = false;
    } else {
      this.masterGain.gain.exponentialRampToValueAtTime(0.35, this.audioCtx.currentTime + 1.5);
      this.isPlaying = true;
    }
    return this.isPlaying;
  }
}

// Scene Interaction and Controller
AFRAME.registerComponent('monolith-interaction', {
  init() {
    const scene = this.el;
    const monolithRig = document.getElementById('monolith-rig');
    const camera = document.getElementById('camera');
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const soundBtn = document.getElementById('btn-sound');
    const scaleBtn = document.getElementById('btn-scale');
    const recenterBtn = document.getElementById('btn-recenter');
    const statusText = document.getElementById('xr-status');

    const audioSynth = new AlienAudioSynth();

    // Scale options: Giant (default 12m), Titanic (24m), Human (4m)
    const scaleModes = [
      { label: 'SCALE: GIANT (12m)', scale: 1.0, distance: 15 },
      { label: 'SCALE: TITANIC (24m)', scale: 2.0, distance: 28 },
      { label: 'SCALE: HUMAN (4m)', scale: 0.33, distance: 6 },
    ];
    let currentScaleIndex = 0;

    // Start / Initialize Experience
    startBtn.addEventListener('click', () => {
      startOverlay.classList.add('hidden');
      // Auto-start ambient alien audio
      audioSynth.toggle();
      soundBtn.classList.add('active');

      // Check if 8th Wall XR is running
      if (statusText) {
        statusText.innerText = 'CALIBRATING AR SLAM...';
      }
    });

    // Sound toggle
    soundBtn.addEventListener('click', () => {
      const active = audioSynth.toggle();
      if (active) {
        soundBtn.classList.add('active');
        soundBtn.innerHTML = '<span class="btn-icon">🔊</span> AUDIO ON';
      } else {
        soundBtn.classList.remove('active');
        soundBtn.innerHTML = '<span class="btn-icon">🔇</span> AUDIO OFF';
      }
    });

    // Scale toggle
    scaleBtn.addEventListener('click', () => {
      currentScaleIndex = (currentScaleIndex + 1) % scaleModes.length;
      const mode = scaleModes[currentScaleIndex];
      scaleBtn.innerHTML = `<span class="btn-icon">⚡</span> ${mode.label}`;
      
      monolithRig.setAttribute('scale', `${mode.scale} ${mode.scale} ${mode.scale}`);
    });

    // Recenter Monolith in front of device camera
    const recenterMonolith = () => {
      const camObj = camera.object3D;
      const rigObj = monolithRig.object3D;

      // Calculate forward direction from camera rotation
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0; // Lock to horizontal ground plane
      forward.normalize();

      const targetDistance = scaleModes[currentScaleIndex].distance;
      const targetPos = camObj.position.clone().add(forward.multiplyScalar(targetDistance));
      targetPos.y = 0; // Ground level

      rigObj.position.copy(targetPos);
      
      // Face the camera
      rigObj.lookAt(camObj.position.x, 0, camObj.position.z);

      if (statusText) {
        statusText.innerText = 'MONOLITH RECENTERED';
        setTimeout(() => {
          statusText.innerText = 'TRACKING ACTIVE';
        }, 2000);
      }
    };

    recenterBtn.addEventListener('click', recenterMonolith);

    // Tap to reposition on ground
    scene.addEventListener('click', (e) => {
      // Don't trigger if user clicked an interactive HUD button
      if (e.target.closest('#hud-container') || e.target.closest('#start-overlay')) {
        return;
      }
      recenterMonolith();
    });

    // 8th Wall Lifecycle Events
    scene.addEventListener('realityready', () => {
      if (statusText) statusText.innerText = '8THWALL.ORG REALITY READY';
    });

    scene.addEventListener('xrfatalerror', (e) => {
      if (statusText) statusText.innerText = 'AR ERROR: ' + (e.detail?.error || 'Check Camera Permission');
    });
  },
});
