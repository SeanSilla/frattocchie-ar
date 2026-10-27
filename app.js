/**
 * Photorealistic Alien Monolith & UFO Geospatial WebAR
 * Target 1: Centro Commerciale La Nave (Frattocchie) - Monolith
 * Target 2: Officine Ibba (Santa Maria delle Mole - Via Silvio Pellico 95) - UFO Mothership
 * Built with 8thwall.org & A-Frame (Three.js)
 */

// Exact Real-World Coordinates
const GEO_TARGETS = {
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

// Generate High-Definition Photorealistic PBR Maps (2048x4096)
function generateMonolithPBRMaps() {
  const width = 1024;
  const height = 2048;

  // 1. Albedo / Diffuse Canvas
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const actx = albedoCanvas.getContext('2d');

  // Deep brushed titanium-obsidian alloy base
  actx.fillStyle = '#06080d';
  actx.fillRect(0, 0, width, height);

  // Anisotropic micro-brushing along vertical grain
  actx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  actx.lineWidth = 1;
  for (let i = 0; i < 800; i++) {
    const y = Math.random() * height;
    actx.beginPath();
    actx.moveTo(0, y);
    actx.lineTo(width, y + (Math.random() - 0.5) * 30);
    actx.stroke();
  }

  // 2. Roughness Canvas
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rctx = roughCanvas.getContext('2d');
  rctx.fillStyle = '#22252a'; // Base roughness ~0.15
  rctx.fillRect(0, 0, width, height);

  // Surface micro-imperfections & subtle smudges
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

  // 3. Normal & Emissive Canvas for Alien Inscriptions
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

    // Geometric micro-runes
    ectx.beginPath();
    ectx.moveTo(cx, y - 8);
    ectx.lineTo(cx + 8, y);
    ectx.lineTo(cx, y + 8);
    ectx.lineTo(cx - 8, y);
    ectx.closePath();
    ectx.fill();

    // Secondary stepped traces
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

// Component 1: Photorealistic Alien Monolith (Beveled Precision & PBR Shaders)
AFRAME.registerComponent('alien-monolith', {
  schema: {
    width: { type: 'number', default: 3.0 },
    height: { type: 'number', default: 12.0 },
    depth: { type: 'number', default: 0.75 },
  },

  init() {
    const { width, height, depth } = this.data;
    const maps = generateMonolithPBRMaps();

    // Create beveled geometry for photorealistic edge highlights
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
    geometry.rotateX(Math.PI / 2); // Stand upright

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
      // Soft breathing glow
      this.material.emissiveIntensity = 0.6 + 0.35 * Math.sin(this.time);
    }
  },
});

// Component 2: Photorealistic Mothership UFO (Cinema-Grade Multi-tier Architecture)
AFRAME.registerComponent('alien-ufo', {
  init() {
    const group = new THREE.Group();

    // Dark brushed titanium hull material
    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      metalness: 0.98,
      roughness: 0.18,
      envMapIntensity: 2.0,
    });

    // Dark chrome command canopy
    const cockpitMaterial = new THREE.MeshStandardMaterial({
      color: 0x020406,
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 3.0,
    });

    // Quantum plasma reactor material
    this.reactorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffe1,
      emissive: 0x00ffe1,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });

    // 1. Primary Saucer Hull (Stepped aerodynamic chassis with beveled rim)
    const saucerShape = new THREE.Shape();
    saucerShape.moveTo(0, 0);
    saucerShape.lineTo(1.8, 0.4);
    saucerShape.lineTo(7.5, 0.2);
    saucerShape.lineTo(9.5, -0.2);
    saucerShape.lineTo(10.0, -0.6);
    saucerShape.lineTo(8.5, -1.0);
    saucerShape.lineTo(3.5, -1.4);
    saucerShape.lineTo(0, -1.6);

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

    // 2. Upper Mirrored Command Bridge Dome
    const domeGeo = new THREE.SphereGeometry(3.6, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const domeMesh = new THREE.Mesh(domeGeo, cockpitMaterial);
    domeMesh.position.y = 0.8;
    group.add(domeMesh);

    // 3. Concentric Gravitational Induction Ring (Counter-rotating)
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

    // 5. Volumetric Downward Tractor Beam with Fresnel Falloff
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

      // Physics-based aerodynamic bobbing and banking
      const bob = Math.sin(this.time * 1.1) * 1.6;
      this.el.object3D.position.y = this.baseY + bob;
      this.ufoGroup.rotation.z = Math.sin(this.time * 0.7) * 0.045;
      this.ufoGroup.rotation.x = Math.cos(this.time * 0.5) * 0.035;

      // Pulsing tractor beam
      if (this.beamMaterial) {
        this.beamMaterial.opacity = 0.2 + 0.12 * Math.sin(this.time * 2.8);
      }
      if (this.reactorMaterial) {
        this.reactorMaterial.emissiveIntensity = 2.2 + 1.2 * Math.sin(this.time * 2.2);
      }

      // Rhythmic strobe flash
      const flash = Math.sin(this.time * 6) > 0.88;
      this.strobes.forEach((s) => (s.visible = flash));
    }
  },
});

// Web Audio API Synthesizer (Monolith Sub-Bass + UFO Warp Modulations)
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
    filter.frequency.setValueAtTime(220, this.audioCtx.currentTime);
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

// Master Scene Controller: Geospatial Positioning, Pinch/Slider Scaling, Occlusion & Standpoint Simulation
AFRAME.registerComponent('monolith-interaction', {
  init() {
    const scene = this.el;
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
    const distLaNaveEl = document.getElementById('dist-lanave');
    const distIbbaEl = document.getElementById('dist-ibba');
    const guideText = document.getElementById('guide-text');

    // Standpoint Buttons
    const locLiveBtn = document.getElementById('loc-live');
    const locLaNaveBtn = document.getElementById('loc-lanave');
    const locIbbaBtn = document.getElementById('loc-ibba');

    // Sizing Controls
    const tabMonolith = document.getElementById('tab-monolith');
    const tabUfo = document.getElementById('tab-ufo');
    const activeTargetTitle = document.getElementById('active-scale-target');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValLabel = document.getElementById('size-val-label');
    const presetsContainer = document.getElementById('presets-container');

    const audioSynth = new AlienAudioSynth();

    // Scale State
    let activeScaleTarget = 'MONOLITH'; // 'MONOLITH' or 'UFO'
    let monolithScale = 1.0;
    let ufoScale = 1.5;

    // Occlusion State
    let occlusionEnabled = true;

    // Geospatial State
    let standpointMode = 'LIVE'; // 'LIVE', 'LANAVE', or 'IBBA'
    let currentCoords = { lat: GEO_TARGETS.LA_NAVE.lat, lon: GEO_TARGETS.LA_NAVE.lon };
    let compassHeading = 0; // 0 = North, 90 = East, 180 = South, 270 = West

    // Presets definitions
    const monolithPresets = [
      { label: 'HUMAN (4m)', scale: 0.33, desc: '0.33x' },
      { label: 'STANDARD (12m)', scale: 1.0, desc: '1.0x' },
      { label: 'TITANIC (24m)', scale: 2.0, desc: '2.0x' },
      { label: 'COLOSSUS (48m)', scale: 4.0, desc: '4.0x' },
    ];
    const ufoPresets = [
      { label: 'SCOUT (12m)', scale: 0.6, desc: '0.6x' },
      { label: 'CRUISER (25m)', scale: 1.5, desc: '1.5x' },
      { label: 'MOTHERSHIP (60m)', scale: 3.5, desc: '3.5x' },
      { label: 'INDEPENDENCE (150m)', scale: 8.0, desc: '8.0x' },
    ];

    const renderPresets = () => {
      presetsContainer.innerHTML = '';
      const presets = activeScaleTarget === 'MONOLITH' ? monolithPresets : ufoPresets;
      presets.forEach((p) => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.innerText = p.label;
        btn.addEventListener('click', () => {
          applyScale(p.scale);
        });
        presetsContainer.appendChild(btn);
      });
    };

    const updateSliderUI = () => {
      if (activeScaleTarget === 'MONOLITH') {
        sizeSlider.min = 0.2;
        sizeSlider.max = 5.0;
        sizeSlider.step = 0.05;
        sizeSlider.value = monolithScale;
        const heightMeters = (monolithScale * 12).toFixed(0);
        sizeValLabel.innerText = `${monolithScale.toFixed(2)}x (${heightMeters}m)`;
        activeTargetTitle.innerText = 'MONOLITH';
      } else {
        sizeSlider.min = 0.4;
        sizeSlider.max = 10.0;
        sizeSlider.step = 0.1;
        sizeSlider.value = ufoScale;
        const widthMeters = (ufoScale * 20).toFixed(0);
        sizeValLabel.innerText = `${ufoScale.toFixed(1)}x (${widthMeters}m)`;
        activeTargetTitle.innerText = 'MOTHERSHIP UFO';
      }
    };

    const applyScale = (val) => {
      if (activeScaleTarget === 'MONOLITH') {
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

    tabMonolith.addEventListener('click', () => {
      activeScaleTarget = 'MONOLITH';
      tabMonolith.classList.add('active');
      tabUfo.classList.remove('active');
      renderPresets();
      updateSliderUI();
    });

    tabUfo.addEventListener('click', () => {
      activeScaleTarget = 'UFO';
      tabUfo.classList.add('active');
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
          initialPinchScale = activeScaleTarget === 'MONOLITH' ? monolithScale : ufoScale;
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

    // True Geospatial Positioning Engine
    const updateGeospatialPositions = () => {
      const userLat = currentCoords.lat;
      const userLon = currentCoords.lon;

      // 1. Distance & Bearing to La Nave (Monolith)
      const distLaNave = calculateDistanceMeters(userLat, userLon, GEO_TARGETS.LA_NAVE.lat, GEO_TARGETS.LA_NAVE.lon);
      const bearingLaNave = calculateBearing(userLat, userLon, GEO_TARGETS.LA_NAVE.lat, GEO_TARGETS.LA_NAVE.lon);

      // 2. Distance & Bearing to Officine Ibba (UFO)
      const distIbba = calculateDistanceMeters(userLat, userLon, GEO_TARGETS.OFFICINE_IBBA.lat, GEO_TARGETS.OFFICINE_IBBA.lon);
      const bearingIbba = calculateBearing(userLat, userLon, GEO_TARGETS.OFFICINE_IBBA.lat, GEO_TARGETS.OFFICINE_IBBA.lon);

      if (distLaNaveEl) distLaNaveEl.innerText = `${formatDistance(distLaNave)} (${Math.round(bearingLaNave)}°)`;
      if (distIbbaEl) distIbbaEl.innerText = `${formatDistance(distIbba)} (${Math.round(bearingIbba)}°)`;

      // Transform Compass Bearing + Distance to A-Frame AR Coordinates (X, Z)
      // Bearing theta relative to camera heading:
      const radBearingLaNave = ((bearingLaNave - compassHeading) * Math.PI) / 180;
      const radBearingIbba = ((bearingIbba - compassHeading) * Math.PI) / 180;

      // Distance projection (clamp distant horizon targets to visible AR frustum)
      const renderDistLaNave = distLaNave < 80 ? Math.max(8, distLaNave) : 40;
      const renderDistIbba = distIbba < 100 ? Math.max(15, distIbba) : 75;

      const monolithX = Math.sin(radBearingLaNave) * renderDistLaNave;
      const monolithZ = -Math.cos(radBearingLaNave) * renderDistLaNave;

      const ufoX = Math.sin(radBearingIbba) * renderDistIbba;
      const ufoZ = -Math.cos(radBearingIbba) * renderDistIbba;
      const ufoAltitude = distIbba < 100 ? 25 : 38; // Hover directly above building if on-site

      // Apply positions to rigs
      monolithRig.setAttribute('position', `${monolithX.toFixed(2)} 0 ${monolithZ.toFixed(2)}`);
      ufoRig.setAttribute('position', `${ufoX.toFixed(2)} ${ufoAltitude.toFixed(1)} ${ufoZ.toFixed(2)}`);

      // Ground plane follows viewer
      ground.setAttribute('position', `0 0 0`);
    };

    // Location Standpoint Selector
    const setStandpoint = (mode) => {
      standpointMode = mode;
      locLiveBtn.classList.remove('active');
      locLaNaveBtn.classList.remove('active');
      locIbbaBtn.classList.remove('active');

      if (mode === 'LIVE') {
        locLiveBtn.classList.add('active');
        targetTitle.innerText = 'GEOSPATIAL: LIVE SATELLITE GPS';
        guideText.innerText = 'Calculating positions using your phone live GPS and compass...';
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            currentCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            updateGeospatialPositions();
          });
        }
      } else if (mode === 'LANAVE') {
        locLaNaveBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.LA_NAVE.lat, lon: GEO_TARGETS.LA_NAVE.lon };
        targetTitle.innerText = 'STANDPOINT: CENTRO COMMERCIALE LA NAVE';
        guideText.innerText = 'Monolith is right on the front plaza; UFO looms NW over S. Maria delle Mole!';
        updateGeospatialPositions();
      } else if (mode === 'IBBA') {
        locIbbaBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.OFFICINE_IBBA.lat, lon: GEO_TARGETS.OFFICINE_IBBA.lon };
        targetTitle.innerText = 'STANDPOINT: OFFICINE IBBA (VIA SILVIO PELLICO 95)';
        guideText.innerText = 'Mothership UFO hovering directly above the building rooftop!';
        updateGeospatialPositions();
      }
    };

    locLiveBtn.addEventListener('click', () => setStandpoint('LIVE'));
    locLaNaveBtn.addEventListener('click', () => setStandpoint('LANAVE'));
    locIbbaBtn.addEventListener('click', () => setStandpoint('IBBA'));

    // Live Geolocation Watcher
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          if (standpointMode === 'LIVE') {
            currentCoords = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            };
            updateGeospatialPositions();
          }
        },
        (err) => console.warn('GPS watcher notice:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
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

    // Occlusion Toggle (Ensures foreground real elements occlude the background 3D models)
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

    // Start / Initialize Experience - Dismisses overlay instantly
    startBtn.addEventListener('click', () => {
      // 1. Immediately dismiss landing page overlay so user is never stuck
      startOverlay.classList.add('hidden');

      // 2. Start extraterrestrial ambient audio hum
      audioSynth.toggle();
      soundBtn.classList.add('active');

      // 3. iOS Safari DeviceOrientation permission
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().catch((e) => console.warn('Device orientation permission:', e));
      }

      // 4. Update HUD and launch 8th Wall SLAM & Camera
      if (statusText) statusText.innerText = 'CONNECTING CAMERA...';
      scene.emit('runreality');
      scene.emit('runxr');

      // 5. Default standpoint to La Nave so objects are immediately in view
      setStandpoint('LANAVE');
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

    // Focus Camera / Jump between Monolith and UFO
    let currentFocus = 'MONOLITH';
    focusBtn.addEventListener('click', () => {
      const camObj = camera.object3D;
      if (currentFocus === 'MONOLITH') {
        currentFocus = 'UFO';
        focusBtn.innerHTML = '<span class="btn-icon">🛸</span> FOCUS: UFO';
        guideText.innerText = 'Looking up towards Mothership UFO above Santa Maria delle Mole';
        // Swivel UFO in direct sight line
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(camObj.quaternion);
        const targetPos = camObj.position.clone().add(forward.multiplyScalar(35));
        targetPos.y = 26;
        ufoRig.setAttribute('position', `${targetPos.x.toFixed(2)} ${targetPos.y.toFixed(2)} ${targetPos.z.toFixed(2)}`);
      } else {
        currentFocus = 'MONOLITH';
        focusBtn.innerHTML = '<span class="btn-icon">▲</span> FOCUS: LA NAVE';
        guideText.innerText = 'Monolith placed at the front entrance plaza of La Nave';
        updateGeospatialPositions();
      }
    });

    // Recenter Monolith
    recenterBtn.addEventListener('click', () => {
      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();

      const targetPos = camObj.position.clone().add(forward.multiplyScalar(15));
      monolithRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
      monolithRig.object3D.lookAt(camObj.position.x, 0, camObj.position.z);

      if (statusText) {
        statusText.innerText = 'RECENTERED AT VIEW';
        setTimeout(() => (statusText.innerText = 'TRACKING ACTIVE'), 2000);
      }
    });

    // Tap on ground to reposition Monolith
    scene.addEventListener('click', (e) => {
      if (e.target.closest('#hud-container') || e.target.closest('#start-overlay')) {
        return;
      }
      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();
      const targetPos = camObj.position.clone().add(forward.multiplyScalar(14));
      monolithRig.setAttribute('position', `${targetPos.x.toFixed(2)} 0 ${targetPos.z.toFixed(2)}`);
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
