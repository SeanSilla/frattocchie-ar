/**
 * Photorealistic Ancient Roman Statue, Alien Monolith & UFO Geospatial WebAR
 * Target 1: Via Aldo Moro 52 (Frattocchie) - Ancient Roman Statue
 * Target 2: Centro Commerciale La Nave (Frattocchie) - Monolith
 * Target 3: Officine Ibba (Santa Maria delle Mole - Via Silvio Pellico 95) - UFO Mothership
 * Built with 8thwall.org & A-Frame (Three.js)
 */

// Exact Real-World Coordinates
const GEO_TARGETS = {
  VIA_ALDO_MORO: {
    name: 'Via Aldo Moro 52',
    locality: 'Frattocchie (Marino)',
    lat: 41.76370,
    lon: 12.60930,
  },
  LA_NAVE: {
    name: 'Centro Commerciale La Nave',
    locality: 'Frattocchie (Marino)',
    lat: 41.76714,
    lon: 12.61603,
  },
  OFFICINE_IBBA: {
    name: 'Officine Ibba',
    locality: 'Santa Maria delle Mole (Marino)',
    address: 'Via Silvio Pellico 95',
    lat: 41.77450,
    lon: 12.59720,
  },
};

// Calculate Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate compass bearing in degrees (0° = North, 90° = East)
function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

function formatDistance(meters) {
  if (meters < 1000) {
    return Math.round(meters) + 'm';
  }
  return (meters / 1000).toFixed(1) + 'km';
}

// Generate Ancient Carrara Marble PBR Texture with Mineral Veins & SPQR Inscription
function generateCarraraMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Antique ivory marble base
  ctx.fillStyle = '#f2efe9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle marble mineral clouds
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    grad.addColorStop(0, 'rgba(215, 208, 195, 0.45)');
    grad.addColorStop(1, 'rgba(242, 239, 233, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  // Organic winding marble veins
  ctx.lineWidth = 2;
  for (let v = 0; v < 8; v++) {
    ctx.strokeStyle = 'rgba(125, 118, 108, 0.28)';
    ctx.beginPath();
    let x = Math.random() * canvas.width;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < canvas.height) {
      y += 15 + Math.random() * 20;
      x += (Math.random() - 0.5) * 45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Classical S·P·Q·R carved Roman inscription
  ctx.fillStyle = 'rgba(90, 80, 70, 0.45)';
  ctx.font = 'bold 36px "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('S · P · Q · R', canvas.width / 2, canvas.height / 2 + 10);

  // Micro stone grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 2000; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
  }

  return new THREE.CanvasTexture(canvas);
}

// Generate High-Definition Monolith PBR Maps (2048x4096)
function generateMonolithPBRMaps() {
  const width = 1024;
  const height = 2048;

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const actx = albedoCanvas.getContext('2d');
  actx.fillStyle = '#06080d';
  actx.fillRect(0, 0, width, height);

  actx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  actx.lineWidth = 1;
  for (let i = 0; i < 800; i++) {
    const y = Math.random() * height;
    actx.beginPath();
    actx.moveTo(0, y);
    actx.lineTo(width, y + (Math.random() - 0.5) * 30);
    actx.stroke();
  }

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rctx = roughCanvas.getContext('2d');
  rctx.fillStyle = '#22252a';
  rctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 60; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const grad = rctx.createRadialGradient(rx, ry, 5, rx, ry, 80);
    grad.addColorStop(0, 'rgba(60, 65, 75, 0.4)');
    grad.addColorStop(1, 'rgba(34, 37, 42, 0)');
    rctx.fillStyle = grad;
    rctx.beginPath();
    rctx.arc(rx, ry, 80, 0, Math.PI * 2);
    rctx.fill();
  }

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = width;
  emissiveCanvas.height = height;
  const ectx = emissiveCanvas.getContext('2d');
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, width, height);

  ectx.strokeStyle = '#00ffe1';
  ectx.fillStyle = '#00ffe1';
  ectx.shadowColor = '#00ffe1';
  ectx.shadowBlur = 15;

  const cx = width / 2;
  ectx.lineWidth = 3.5;
  ectx.beginPath();
  ectx.moveTo(cx, 120);
  ectx.lineTo(cx, height - 120);
  ectx.stroke();

  for (let y = 200; y < height - 200; y += 140) {
    const span = 130 + Math.sin(y * 0.05) * 90;
    ectx.beginPath();
    ectx.moveTo(cx - span, y);
    ectx.lineTo(cx + span, y);
    ectx.stroke();

    ectx.beginPath();
    ectx.moveTo(cx, y - 8);
    ectx.lineTo(cx + 8, y);
    ectx.lineTo(cx, y + 8);
    ectx.lineTo(cx - 8, y);
    ectx.closePath();
    ectx.fill();

    ectx.beginPath();
    ectx.moveTo(cx - span, y);
    ectx.lineTo(cx - span - 35, y + 35);
    ectx.moveTo(cx + span, y);
    ectx.lineTo(cx + span + 35, y + 35);
    ectx.stroke();
  }

  return {
    diffuseMap: new THREE.CanvasTexture(albedoCanvas),
    roughnessMap: new THREE.CanvasTexture(roughCanvas),
    emissiveMap: new THREE.CanvasTexture(emissiveCanvas),
  };
}

// Component 1: Ancient Roman Statue (Via Aldo Moro 52, Frattocchie)
AFRAME.registerComponent('ancient-roman-statue', {
  schema: {
    height: { type: 'number', default: 1.8 },
  },

  init() {
    const group = new THREE.Group();
    const marbleTexture = generateCarraraMarbleTexture();

    // Weathered Carrara Marble Material
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xedeae2,
      map: marbleTexture,
      roughness: 0.38,
      metalness: 0.04,
      bumpMap: marbleTexture,
      bumpScale: 0.015,
      envMapIntensity: 0.8,
    });

    // Antique Bronze/Gold Laurel Wreath Material
    const laurelMat = new THREE.MeshStandardMaterial({
      color: 0xc8a44d,
      roughness: 0.28,
      metalness: 0.85,
    });

    // 1. Classical Pedestal Stepped Plinth Base
    const baseGeo = new THREE.BoxGeometry(0.7, 0.15, 0.7);
    const baseMesh = new THREE.Mesh(baseGeo, marbleMat);
    baseMesh.position.y = 0.075;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Pedestal Column Shaft (with SPQR carved inscription)
    const shaftGeo = new THREE.BoxGeometry(0.55, 0.7, 0.55);
    const shaftMesh = new THREE.Mesh(shaftGeo, marbleMat);
    shaftMesh.position.y = 0.5;
    shaftMesh.castShadow = true;
    shaftMesh.receiveShadow = true;
    group.add(shaftMesh);

    // 3. Classical Capital Plinth Moulding
    const capGeo = new THREE.BoxGeometry(0.65, 0.1, 0.65);
    const capMesh = new THREE.Mesh(capGeo, marbleMat);
    capMesh.position.y = 0.9;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    group.add(capMesh);

    // 4. Statue Torso with Draped Roman Toga
    const togaGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.65, 24);
    const togaMesh = new THREE.Mesh(togaGeo, marbleMat);
    togaMesh.position.y = 1.25;
    togaMesh.castShadow = true;
    group.add(togaMesh);

    // Toga Diagonal Fold / Sash
    const sashGeo = new THREE.TorusGeometry(0.28, 0.06, 12, 24, Math.PI * 1.2);
    const sashMesh = new THREE.Mesh(sashGeo, marbleMat);
    sashMesh.position.set(0, 1.35, 0.05);
    sashMesh.rotation.set(0.4, 0.2, -0.6);
    sashMesh.castShadow = true;
    group.add(sashMesh);

    // 5. Classical Roman Bust / Head
    const headGeo = new THREE.SphereGeometry(0.16, 24, 20);
    const headMesh = new THREE.Mesh(headGeo, marbleMat);
    headMesh.position.set(0, 1.68, 0);
    headMesh.scale.set(0.9, 1.15, 0.95);
    headMesh.castShadow = true;
    group.add(headMesh);

    // Stoic Roman nose & brow ridge
    const noseGeo = new THREE.ConeGeometry(0.035, 0.08, 8);
    const noseMesh = new THREE.Mesh(noseGeo, marbleMat);
    noseMesh.position.set(0, 1.66, 0.15);
    noseMesh.rotation.x = Math.PI / 2;
    group.add(noseMesh);

    // 6. Classical Roman Laurel Wreath (Corona Triumphalis)
    const wreathGeo = new THREE.TorusGeometry(0.165, 0.025, 8, 24);
    const wreathMesh = new THREE.Mesh(wreathGeo, laurelMat);
    wreathMesh.position.set(0, 1.76, 0);
    wreathMesh.rotation.x = Math.PI / 2 - 0.2;
    wreathMesh.castShadow = true;
    group.add(wreathMesh);

    this.el.setObject3D('mesh', group);
  },
});

// Component 2: Photorealistic Alien Monolith (Beveled Precision & PBR Shaders)
AFRAME.registerComponent('alien-monolith', {
  schema: {
    width: { type: 'number', default: 3.0 },
    height: { type: 'number', default: 12.0 },
    depth: { type: 'number', default: 0.75 },
  },

  init() {
    const { width, height, depth } = this.data;
    const maps = generateMonolithPBRMaps();

    const shape = new THREE.Shape();
    const hw = width / 2;
    const hd = depth / 2;
    const radius = 0.04;

    shape.moveTo(-hw + radius, -hd);
    shape.lineTo(hw - radius, -hd);
    shape.quadraticCurveTo(hw, -hd, hw, -hd + radius);
    shape.lineTo(hw, hd - radius);
    shape.quadraticCurveTo(hw, hd, hw - radius, hd);
    shape.lineTo(-hw + radius, hd);
    shape.quadraticCurveTo(-hw, hd, -hw, hd - radius);
    shape.lineTo(-hw, -hd + radius);
    shape.quadraticCurveTo(-hw, -hd, -hw + radius, -hd);

    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.rotateX(Math.PI / 2);

    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x080b11),
      metalness: 0.96,
      roughness: 0.16,
      roughnessMap: maps.roughnessMap,
      map: maps.diffuseMap,
      emissive: new THREE.Color(0x00d9ff),
      emissiveMap: maps.emissiveMap,
      emissiveIntensity: 0.8,
      envMapIntensity: 1.5,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = height / 2;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.el.setObject3D('mesh', this.mesh);
    this.time = 0;
  },

  tick(time, timeDelta) {
    if (this.material) {
      this.time += (timeDelta || 16) * 0.0018;
      this.material.emissiveIntensity = 0.6 + 0.35 * Math.sin(this.time);
    }
  },
});

// Component 3: Photorealistic Mothership UFO (Cinema-Grade Multi-tier Architecture)
AFRAME.registerComponent('alien-ufo', {
  init() {
    const group = new THREE.Group();

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      metalness: 0.98,
      roughness: 0.18,
      envMapIntensity: 2.0,
    });

    const cockpitMaterial = new THREE.MeshStandardMaterial({
      color: 0x020406,
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 3.0,
    });

    this.reactorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffe1,
      emissive: 0x00ffe1,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });

    // 1. Primary Saucer Hull
    const saucerGeo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0.9),
        new THREE.Vector2(3.5, 0.6),
        new THREE.Vector2(8.5, 0.15),
        new THREE.Vector2(10.2, -0.3),
        new THREE.Vector2(10.5, -0.7),
        new THREE.Vector2(8.8, -1.1),
        new THREE.Vector2(4.0, -1.5),
        new THREE.Vector2(0, -1.7),
      ],
      48
    );
    const saucerMesh = new THREE.Mesh(saucerGeo, hullMaterial);
    saucerMesh.castShadow = true;
    group.add(saucerMesh);

    // 2. Upper Mirrored Command Dome
    const domeGeo = new THREE.SphereGeometry(3.6, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const domeMesh = new THREE.Mesh(domeGeo, cockpitMaterial);
    domeMesh.position.y = 0.8;
    group.add(domeMesh);

    // 3. Gravitational Induction Ring (Counter-rotating)
    this.thrusterRing = new THREE.Group();
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x9d00ff,
      emissive: 0x9d00ff,
      emissiveIntensity: 2.8,
    });
    const numPods = 16;
    const ringRadius = 10.3;
    for (let i = 0; i < numPods; i++) {
      const angle = (i / numPods) * Math.PI * 2;
      const podGeo = new THREE.BoxGeometry(0.6, 0.25, 0.8);
      const pod = new THREE.Mesh(podGeo, orbMat);
      pod.position.set(Math.cos(angle) * ringRadius, -0.4, Math.sin(angle) * ringRadius);
      pod.rotation.y = -angle;
      this.thrusterRing.add(pod);
    }
    group.add(this.thrusterRing);

    // 4. Ventral Quantum Reactor Core
    const coreGeo = new THREE.CylinderGeometry(4.2, 1.2, 2.0, 32);
    const coreMesh = new THREE.Mesh(coreGeo, this.reactorMaterial);
    coreMesh.position.y = -1.2;
    group.add(coreMesh);

    // 5. Volumetric Downward Tractor Beam
    const beamGeo = new THREE.ConeGeometry(9.5, 45, 36, 1, true);
    this.beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffe1,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, this.beamMaterial);
    beamMesh.position.y = -24;
    beamMesh.rotation.x = Math.PI;
    group.add(beamMesh);

    // 6. Navigation Strobe Beacons
    this.strobes = [];
    const strobeGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const strobe1 = new THREE.Mesh(strobeGeo, strobeMat);
    strobe1.position.set(10.4, 0, 0);
    const strobe2 = new THREE.Mesh(strobeGeo, strobeMat);
    strobe2.position.set(-10.4, 0, 0);
    group.add(strobe1);
    group.add(strobe2);
    this.strobes.push(strobe1, strobe2);

    this.el.setObject3D('mesh', group);
    this.ufoGroup = group;
    this.baseY = this.el.object3D.position.y;
    this.time = 0;
  },

  tick(time, timeDelta) {
    const dt = (timeDelta || 16) * 0.001;
    this.time += dt;

    if (this.ufoGroup) {
      this.ufoGroup.rotation.y += dt * 0.35;
      if (this.thrusterRing) {
        this.thrusterRing.rotation.y -= dt * 1.1;
      }

      const bob = Math.sin(this.time * 1.1) * 1.6;
      this.el.object3D.position.y = this.baseY + bob;
      this.ufoGroup.rotation.z = Math.sin(this.time * 0.7) * 0.045;
      this.ufoGroup.rotation.x = Math.cos(this.time * 0.5) * 0.035;

      if (this.beamMaterial) {
        this.beamMaterial.opacity = 0.2 + 0.12 * Math.sin(this.time * 2.8);
      }
      if (this.reactorMaterial) {
        this.reactorMaterial.emissiveIntensity = 2.2 + 1.2 * Math.sin(this.time * 2.2);
      }

      const flash = Math.sin(this.time * 6) > 0.88;
      this.strobes.forEach((s) => (s.visible = flash));
    }
  },
});

// Web Audio API Synthesizer (Monolith Sub-Bass + Ancient Harmonic Resonances)
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

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(4.0, this.audioCtx.currentTime);

    const subOsc = this.audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, this.audioCtx.currentTime);

    const detuneOsc1 = this.audioCtx.createOscillator();
    detuneOsc1.type = 'sawtooth';
    detuneOsc1.frequency.setValueAtTime(110, this.audioCtx.currentTime);
    detuneOsc1.detune.setValueAtTime(-14, this.audioCtx.currentTime);

    const detuneOsc2 = this.audioCtx.createOscillator();
    detuneOsc2.type = 'triangle';
    detuneOsc2.frequency.setValueAtTime(165, this.audioCtx.currentTime);
    detuneOsc2.detune.setValueAtTime(12, this.audioCtx.currentTime);

    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.audioCtx.currentTime);
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(80, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

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

// Master Scene Controller
AFRAME.registerComponent('monolith-interaction', {
  init() {
    const scene = this.el;
    const statueRig = document.getElementById('statue-rig');
    const monolithRig = document.getElementById('monolith-rig');
    const ufoRig = document.getElementById('ufo-rig');
    const camera = document.getElementById('camera');
    const ground = document.getElementById('ground');

    // UI Elements
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const soundBtn = document.getElementById('btn-sound');
    const occlusionBtn = document.getElementById('btn-occlusion');
    const focusBtn = document.getElementById('btn-focus-toggle');
    const recenterBtn = document.getElementById('btn-recenter');
    const statusText = document.getElementById('xr-status');
    const targetTitle = document.getElementById('target-title');
    const distMoroEl = document.getElementById('dist-moro');
    const distLaNaveEl = document.getElementById('dist-lanave');
    const distIbbaEl = document.getElementById('dist-ibba');
    const guideText = document.getElementById('guide-text');

    // Telemetry & Radar UI Elements
    const teleCoords = document.getElementById('tele-coords');
    const teleAcc = document.getElementById('tele-acc');
    const teleHeading = document.getElementById('tele-heading');
    const radarDial = document.getElementById('radar-dial');
    const blipMoro = document.getElementById('blip-moro');
    const blipLaNave = document.getElementById('blip-lanave');
    const blipIbba = document.getElementById('blip-ibba');

    // Standpoint Buttons
    const locLiveBtn = document.getElementById('loc-live');
    const locMoroBtn = document.getElementById('loc-moro');
    const locLaNaveBtn = document.getElementById('loc-lanave');
    const locIbbaBtn = document.getElementById('loc-ibba');

    // Calibration & Pin Elements
    const headingTrimSlider = document.getElementById('heading-trim');
    const trimValEl = document.getElementById('trim-val');
    const pinGroundBtn = document.getElementById('btn-pin-ground');

    // Sizing Controls
    const tabStatue = document.getElementById('tab-statue');
    const tabMonolith = document.getElementById('tab-monolith');
    const tabUfo = document.getElementById('tab-ufo');
    const activeTargetTitle = document.getElementById('active-scale-target');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValLabel = document.getElementById('size-val-label');
    const presetsContainer = document.getElementById('presets-container');

    const audioSynth = new AlienAudioSynth();

    // Scale State
    let activeScaleTarget = 'STATUE'; // 'STATUE', 'MONOLITH', or 'UFO'
    let statueScale = 1.0;
    let monolithScale = 1.0;
    let ufoScale = 1.5;

    // Occlusion State
    let occlusionEnabled = true;

    // Geospatial State
    let standpointMode = 'LIVE'; // Default to LIVE SATELLITE GPS!
    let currentCoords = { lat: GEO_TARGETS.VIA_ALDO_MORO.lat, lon: GEO_TARGETS.VIA_ALDO_MORO.lon };
    let compassHeading = 0;
    let headingTrim = 0; // Manual trim for phone magnetometer interference (-90° to +90°)

    // Presets definitions
    const statuePresets = [
      { label: 'TABLETOP (0.5m)', scale: 0.3 },
      { label: 'GARDEN (1.2m)', scale: 0.7 },
      { label: 'LIFE-SIZE (1.8m)', scale: 1.0 },
      { label: 'MONUMENTAL (3.5m)', scale: 2.0 },
    ];
    const monolithPresets = [
      { label: 'HUMAN (4m)', scale: 0.33 },
      { label: 'STANDARD (12m)', scale: 1.0 },
      { label: 'TITANIC (24m)', scale: 2.0 },
      { label: 'COLOSSUS (48m)', scale: 4.0 },
    ];
    const ufoPresets = [
      { label: 'SCOUT (12m)', scale: 0.6 },
      { label: 'CRUISER (25m)', scale: 1.5 },
      { label: 'MOTHERSHIP (60m)', scale: 3.5 },
      { label: 'INDEPENDENCE (150m)', scale: 8.0 },
    ];

    const renderPresets = () => {
      presetsContainer.innerHTML = '';
      let presets = statuePresets;
      if (activeScaleTarget === 'MONOLITH') presets = monolithPresets;
      else if (activeScaleTarget === 'UFO') presets = ufoPresets;

      presets.forEach((p) => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.innerText = p.label;
        btn.addEventListener('click', () => applyScale(p.scale));
        presetsContainer.appendChild(btn);
      });
    };

    const updateSliderUI = () => {
      if (activeScaleTarget === 'STATUE') {
        sizeSlider.min = 0.2;
        sizeSlider.max = 4.0;
        sizeSlider.step = 0.05;
        sizeSlider.value = statueScale;
        const h = (statueScale * 1.8).toFixed(1);
        sizeValLabel.innerText = `${statueScale.toFixed(2)}x (${h}m)`;
        activeTargetTitle.innerText = 'ROMAN STATUE';
      } else if (activeScaleTarget === 'MONOLITH') {
        sizeSlider.min = 0.2;
        sizeSlider.max = 5.0;
        sizeSlider.step = 0.05;
        sizeSlider.value = monolithScale;
        const h = (monolithScale * 12).toFixed(0);
        sizeValLabel.innerText = `${monolithScale.toFixed(2)}x (${h}m)`;
        activeTargetTitle.innerText = 'MONOLITH';
      } else {
        sizeSlider.min = 0.4;
        sizeSlider.max = 10.0;
        sizeSlider.step = 0.1;
        sizeSlider.value = ufoScale;
        const w = (ufoScale * 20).toFixed(0);
        sizeValLabel.innerText = `${ufoScale.toFixed(1)}x (${w}m)`;
        activeTargetTitle.innerText = 'MOTHERSHIP UFO';
      }
    };

    const applyScale = (val) => {
      if (activeScaleTarget === 'STATUE') {
        statueScale = parseFloat(val);
        statueRig.setAttribute('scale', `${statueScale} ${statueScale} ${statueScale}`);
      } else if (activeScaleTarget === 'MONOLITH') {
        monolithScale = parseFloat(val);
        monolithRig.setAttribute('scale', `${monolithScale} ${monolithScale} ${monolithScale}`);
      } else {
        ufoScale = parseFloat(val);
        ufoRig.setAttribute('scale', `${ufoScale} ${ufoScale} ${ufoScale}`);
      }
      updateSliderUI();
    };

    renderPresets();
    updateSliderUI();

    tabStatue.addEventListener('click', () => {
      activeScaleTarget = 'STATUE';
      tabStatue.classList.add('active');
      tabMonolith.classList.remove('active');
      tabUfo.classList.remove('active');
      renderPresets();
      updateSliderUI();
    });

    tabMonolith.addEventListener('click', () => {
      activeScaleTarget = 'MONOLITH';
      tabMonolith.classList.add('active');
      tabStatue.classList.remove('active');
      tabUfo.classList.remove('active');
      renderPresets();
      updateSliderUI();
    });

    tabUfo.addEventListener('click', () => {
      activeScaleTarget = 'UFO';
      tabUfo.classList.add('active');
      tabStatue.classList.remove('active');
      tabMonolith.classList.remove('active');
      renderPresets();
      updateSliderUI();
    });

    sizeSlider.addEventListener('input', (e) => {
      applyScale(e.target.value);
    });

    // Multi-touch Pinch to Scale
    let initialPinchDist = null;
    let initialPinchScale = null;
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (initialPinchDist === null) {
          initialPinchDist = dist;
          if (activeScaleTarget === 'STATUE') initialPinchScale = statueScale;
          else if (activeScaleTarget === 'MONOLITH') initialPinchScale = monolithScale;
          else initialPinchScale = ufoScale;
        } else {
          const ratio = dist / initialPinchDist;
          const newScale = Math.max(0.2, Math.min(10.0, initialPinchScale * ratio));
          applyScale(newScale);
        }
      }
    });

    window.addEventListener('touchend', () => {
      initialPinchDist = null;
      initialPinchScale = null;
    });

    // Convert degree to cardinal string (N, NE, E, SE, etc.)
    const getCardinal = (deg) => {
      const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
      return cardinals[Math.round(((deg % 360) / 45)) % 8];
    };

    // True Geospatial Positioning Engine
    const updateGeospatialPositions = () => {
      const userLat = currentCoords.lat;
      const userLon = currentCoords.lon;

      // 1. Distance & Bearing to Via Aldo Moro 52 (Roman Statue)
      const distMoro = calculateDistanceMeters(userLat, userLon, GEO_TARGETS.VIA_ALDO_MORO.lat, GEO_TARGETS.VIA_ALDO_MORO.lon);
      const bearingMoro = calculateBearing(userLat, userLon, GEO_TARGETS.VIA_ALDO_MORO.lat, GEO_TARGETS.VIA_ALDO_MORO.lon);

      // 2. Distance & Bearing to La Nave (Monolith)
      const distLaNave = calculateDistanceMeters(userLat, userLon, GEO_TARGETS.LA_NAVE.lat, GEO_TARGETS.LA_NAVE.lon);
      const bearingLaNave = calculateBearing(userLat, userLon, GEO_TARGETS.LA_NAVE.lat, GEO_TARGETS.LA_NAVE.lon);

      // 3. Distance & Bearing to Officine Ibba (UFO)
      const distIbba = calculateDistanceMeters(userLat, userLon, GEO_TARGETS.OFFICINE_IBBA.lat, GEO_TARGETS.OFFICINE_IBBA.lon);
      const bearingIbba = calculateBearing(userLat, userLon, GEO_TARGETS.OFFICINE_IBBA.lat, GEO_TARGETS.OFFICINE_IBBA.lon);

      if (distMoroEl) distMoroEl.innerText = `${formatDistance(distMoro)} (${Math.round(bearingMoro)}°)`;
      if (distLaNaveEl) distLaNaveEl.innerText = `${formatDistance(distLaNave)} (${Math.round(bearingLaNave)}°)`;
      if (distIbbaEl) distIbbaEl.innerText = `${formatDistance(distIbba)} (${Math.round(bearingIbba)}°)`;

      const effectiveHeading = (compassHeading + headingTrim + 360) % 360;

      // Update Telemetry Bar
      if (teleCoords) teleCoords.innerText = `${userLat.toFixed(5)}, ${userLon.toFixed(5)}`;
      if (teleHeading) teleHeading.innerText = `${Math.round(effectiveHeading)}° ${getCardinal(effectiveHeading)}`;

      // Update Live Compass Radar Widget
      if (radarDial) {
        radarDial.style.transform = `rotate(${-effectiveHeading}deg)`;
        const setBlip = (el, bearing) => {
          if (!el) return;
          const rad = (bearing - 90) * (Math.PI / 180);
          const r = 24; // 24px radius from center (34, 34)
          const x = 34 + Math.cos(rad) * r;
          const y = 34 + Math.sin(rad) * r;
          el.style.left = `${x.toFixed(1)}px`;
          el.style.top = `${y.toFixed(1)}px`;
        };
        setBlip(blipMoro, bearingMoro);
        setBlip(blipLaNave, bearingLaNave);
        setBlip(blipIbba, bearingIbba);
      }

      // Transform Compass Bearing + Distance to A-Frame AR Coordinates (X, Z)
      const radBearingMoro = ((bearingMoro - effectiveHeading) * Math.PI) / 180;
      const radBearingLaNave = ((bearingLaNave - effectiveHeading) * Math.PI) / 180;
      const radBearingIbba = ((bearingIbba - effectiveHeading) * Math.PI) / 180;

      // Distance projection: If user is on-site (< 60m), place right in front of them
      const renderDistMoro = distMoro < 60 ? Math.max(3.5, distMoro) : 25;
      const renderDistLaNave = distLaNave < 80 ? Math.max(8, distLaNave) : 45;
      const renderDistIbba = distIbba < 100 ? Math.max(15, distIbba) : 80;

      const statueX = Math.sin(radBearingMoro) * renderDistMoro;
      const statueZ = -Math.cos(radBearingMoro) * renderDistMoro;

      const monolithX = Math.sin(radBearingLaNave) * renderDistLaNave;
      const monolithZ = -Math.cos(radBearingLaNave) * renderDistLaNave;

      const ufoX = Math.sin(radBearingIbba) * renderDistIbba;
      const ufoZ = -Math.cos(radBearingIbba) * renderDistIbba;
      const ufoAltitude = distIbba < 100 ? 25 : 38;

      statueRig.setAttribute('position', `${statueX.toFixed(2)} 0 ${statueZ.toFixed(2)}`);
      monolithRig.setAttribute('position', `${monolithX.toFixed(2)} 0 ${monolithZ.toFixed(2)}`);
      ufoRig.setAttribute('position', `${ufoX.toFixed(2)} ${ufoAltitude.toFixed(1)} ${ufoZ.toFixed(2)}`);

      ground.setAttribute('position', `0 0 0`);
    };

    // Location Standpoint Selector
    const setStandpoint = (mode) => {
      standpointMode = mode;
      locLiveBtn.classList.remove('active');
      locMoroBtn.classList.remove('active');
      locLaNaveBtn.classList.remove('active');
      locIbbaBtn.classList.remove('active');

      if (mode === 'LIVE') {
        locLiveBtn.classList.add('active');
        targetTitle.innerText = 'SATELLITE GPS ACTIVE';
        guideText.innerText = 'Tracking real GPS satellites & compass. Walk to see distances change in real time!';
        if (teleAcc) teleAcc.innerText = 'SEARCHING...';
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              currentCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
              if (teleAcc) {
                const acc = Math.round(pos.coords.accuracy);
                teleAcc.innerText = `±${acc}m`;
                teleAcc.className = `telemetry-val ${acc <= 10 ? 'acc-good' : acc <= 25 ? 'acc-med' : 'acc-poor'}`;
              }
              if (statusText) statusText.innerText = 'GPS SATELLITES LOCKED';
              updateGeospatialPositions();
            },
            (err) => {
              console.warn('GPS position error:', err);
              if (teleAcc) teleAcc.innerText = 'PERMISSION DENIED';
              if (guideText) guideText.innerText = 'Location access is required for real GPS tracking. Check site permissions.';
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      } else if (mode === 'MORO') {
        locMoroBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.VIA_ALDO_MORO.lat, lon: GEO_TARGETS.VIA_ALDO_MORO.lon };
        targetTitle.innerText = 'STANDPOINT: VIA ALDO MORO 52 (SIMULATED)';
        guideText.innerText = 'Simulating standing at Via Aldo Moro 52. Statue is 3.5m in front of you!';
        if (teleAcc) { teleAcc.innerText = 'SIMULATED'; teleAcc.className = 'telemetry-val acc-good'; }
        updateGeospatialPositions();
      } else if (mode === 'LANAVE') {
        locLaNaveBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.LA_NAVE.lat, lon: GEO_TARGETS.LA_NAVE.lon };
        targetTitle.innerText = 'STANDPOINT: LA NAVE CC (SIMULATED)';
        guideText.innerText = 'Simulating standing at La Nave. Alien monolith right in front of you!';
        if (teleAcc) { teleAcc.innerText = 'SIMULATED'; teleAcc.className = 'telemetry-val acc-good'; }
        updateGeospatialPositions();
      } else if (mode === 'IBBA') {
        locIbbaBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.OFFICINE_IBBA.lat, lon: GEO_TARGETS.OFFICINE_IBBA.lon };
        targetTitle.innerText = 'STANDPOINT: OFFICINE IBBA (SIMULATED)';
        guideText.innerText = 'Simulating standing at Officine Ibba. Mothership UFO directly overhead!';
        if (teleAcc) { teleAcc.innerText = 'SIMULATED'; teleAcc.className = 'telemetry-val acc-good'; }
        updateGeospatialPositions();
      }
    };

    locLiveBtn.addEventListener('click', () => setStandpoint('LIVE'));
    locMoroBtn.addEventListener('click', () => setStandpoint('MORO'));
    locLaNaveBtn.addEventListener('click', () => setStandpoint('LANAVE'));
    locIbbaBtn.addEventListener('click', () => setStandpoint('IBBA'));

    // Manual Compass Heading Trim Slider (adjusts for phone magnetic interference)
    if (headingTrimSlider) {
      headingTrimSlider.addEventListener('input', (e) => {
        headingTrim = parseInt(e.target.value);
        if (trimValEl) trimValEl.innerText = `${headingTrim > 0 ? '+' : ''}${headingTrim}°`;
        updateGeospatialPositions();
      });
    }

    // Precise Ground Pin Button (Drops active object on the exact physical spot in front of you)
    if (pinGroundBtn) {
      pinGroundBtn.addEventListener('click', () => {
        const camObj = camera.object3D;
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(camObj.quaternion);
        forward.y = 0;
        forward.normalize();

        if (activeScaleTarget === 'STATUE') {
          const targetPos = camObj.position.clone().add(forward.multiplyScalar(3.2));
          statueRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
          statueRig.object3D.lookAt(camObj.position.x, 0, camObj.position.z);
          if (guideText) guideText.innerText = '📌 Roman Statue pinned right here on the ground!';
        } else if (activeScaleTarget === 'MONOLITH') {
          const targetPos = camObj.position.clone().add(forward.multiplyScalar(12.0));
          monolithRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
          monolithRig.object3D.lookAt(camObj.position.x, 0, camObj.position.z);
          if (guideText) guideText.innerText = '📌 Monolith pinned right here on the ground!';
        } else {
          const targetPos = camObj.position.clone().add(forward.multiplyScalar(30.0));
          targetPos.y = 26;
          ufoRig.setAttribute('position', `${targetPos.x.toFixed(2)} ${targetPos.y.toFixed(2)} ${targetPos.z.toFixed(2)}`);
          if (guideText) guideText.innerText = '📌 UFO pinned directly in the sky above!';
        }

        if (statusText) {
          statusText.innerText = 'LOCKED TO PHYSICAL GROUND';
          setTimeout(() => (statusText.innerText = 'SLAM TRACKING ACTIVE'), 2500);
        }
      });
    }

    // Live Continuous Geolocation Watcher
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          if (standpointMode === 'LIVE') {
            currentCoords = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            };
            if (teleAcc) {
              const acc = Math.round(pos.coords.accuracy);
              teleAcc.innerText = `±${acc}m`;
              teleAcc.className = `telemetry-val ${acc <= 10 ? 'acc-good' : acc <= 25 ? 'acc-med' : 'acc-poor'}`;
            }
            if (statusText) statusText.innerText = 'GPS SATELLITES LOCKED';
            updateGeospatialPositions();
          }
        },
        (err) => console.warn('GPS watcher notice:', err),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 2000 }
      );
    }

    // Compass Heading
    window.addEventListener('deviceorientation', (e) => {
      if (e.webkitCompassHeading) {
        compassHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        compassHeading = 360 - e.alpha;
      }
      updateGeospatialPositions();
    });

    // Occlusion Toggle
    occlusionBtn.addEventListener('click', () => {
      occlusionEnabled = !occlusionEnabled;
      if (occlusionEnabled) {
        occlusionBtn.classList.add('active');
        occlusionBtn.innerHTML = '<span class="btn-icon">👁️</span> OCCLUSION: ON';
        ground.setAttribute('material', 'shader: shadow; opacity: 0.75;');
        if (scene.renderer) scene.renderer.sortObjects = true;
      } else {
        occlusionBtn.classList.remove('active');
        occlusionBtn.innerHTML = '<span class="btn-icon">🚫</span> OCCLUSION: OFF';
        ground.setAttribute('material', 'shader: shadow; opacity: 0.0;');
      }
    });

    // Start / Initialize Experience
    startBtn.addEventListener('click', () => {
      startOverlay.classList.add('hidden');
      audioSynth.toggle();
      soundBtn.classList.add('active');

      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().catch((e) => console.warn('Orientation permission:', e));
      }

      if (statusText) statusText.innerText = 'CONNECTING CAMERA & GPS...';
      scene.emit('runreality');
      scene.emit('runxr');

      // Default directly to LIVE Satellite GPS tracking!
      setStandpoint('LIVE');
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

    // Cycle Focus between Statue, Monolith, and UFO
    let currentFocus = 'STATUE';
    focusBtn.addEventListener('click', () => {
      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);

      if (currentFocus === 'STATUE') {
        currentFocus = 'MONOLITH';
        focusBtn.innerHTML = '<span class="btn-icon">▲</span> FOCUS: LA NAVE';
        guideText.innerText = 'Focusing on Alien Monolith (Centro Commerciale La Nave)';
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(15));
        monolithRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
      } else if (currentFocus === 'MONOLITH') {
        currentFocus = 'UFO';
        focusBtn.innerHTML = '<span class="btn-icon">🛸</span> FOCUS: UFO';
        guideText.innerText = 'Focusing on Mothership UFO above Santa Maria delle Mole';
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(35));
        targetPos.y = 26;
        ufoRig.setAttribute('position', `${targetPos.x.toFixed(2)} ${targetPos.y.toFixed(2)} ${targetPos.z.toFixed(2)}`);
      } else {
        currentFocus = 'STATUE';
        focusBtn.innerHTML = '<span class="btn-icon">🏛️</span> FOCUS: STATUE';
        guideText.innerText = 'Focusing on Ancient Roman Statue in front of Via Aldo Moro 52';
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(3.5));
        statueRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
      }
    });

    // Recenter
    recenterBtn.addEventListener('click', () => {
      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();

      if (activeScaleTarget === 'STATUE') {
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(3.5));
        statueRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
        statueRig.object3D.lookAt(camObj.position.x, 0, camObj.position.z);
      } else if (activeScaleTarget === 'MONOLITH') {
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(15));
        monolithRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
        monolithRig.object3D.lookAt(camObj.position.x, 0, camObj.position.z);
      } else {
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(35));
        targetPos.y = 26;
        ufoRig.setAttribute('position', `${targetPos.x.toFixed(2)} ${targetPos.y.toFixed(2)} ${targetPos.z.toFixed(2)}`);
      }

      if (statusText) {
        statusText.innerText = 'RECENTERED AT VIEW';
        setTimeout(() => (statusText.innerText = 'TRACKING ACTIVE'), 2000);
      }
    });

    // Tap on ground to reposition active object
    scene.addEventListener('click', (e) => {
      if (e.target.closest('#hud-container') || e.target.closest('#start-overlay')) {
        return;
      }
      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();

      if (activeScaleTarget === 'STATUE') {
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(3.5));
        statueRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
      } else if (activeScaleTarget === 'MONOLITH') {
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(14));
        monolithRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
      }
    });

    // 8th Wall Events
    scene.addEventListener('realityready', () => {
      if (statusText) statusText.innerText = 'AR CAMERA & SLAM ACTIVE';
    });

    scene.addEventListener('camerastatuschange', (e) => {
      if (statusText && e.detail && e.detail.status) {
        if (e.detail.status === 'hasStream' || e.detail.status === 'hasVideo') {
          statusText.innerText = 'CAMERA FEED READY';
        } else if (e.detail.status === 'failed') {
          statusText.innerText = 'CAMERA FAILED: ' + (e.detail.reason || 'BLOCKED');
        }
      }
    });
  },
});
