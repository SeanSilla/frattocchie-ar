/**
 * Alien Monolith & UFO AR Experience
 * Target 1: Centro Commerciale La Nave (Frattocchie) - Monolith
 * Target 2: Officine Ibba (Santa Maria delle Mole - Via Silvio Pellico 95) - Mothership UFO
 * Powered by 8thwall.org & A-Frame (Three.js)
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
  const R = 6371e3; // Earth radius in meters
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

// Calculate compass bearing from point 1 to point 2 (0° = North, 90° = East)
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

// Format distance nicely (meters or kilometers)
function formatDistance(meters) {
  if (meters < 1000) {
    return Math.round(meters) + 'm';
  }
  return (meters / 1000).toFixed(1) + 'km';
}

// Procedural Dark Metal Monolith Texture
function createAlienProceduralTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 400; i++) {
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 40);
    ctx.stroke();
  }

  ctx.strokeStyle = '#00ffe1';
  ctx.fillStyle = '#00ffe1';
  ctx.shadowColor = '#00ffe1';
  ctx.shadowBlur = 12;

  const centerX = canvas.width / 2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, 100);
  ctx.lineTo(centerX, canvas.height - 100);
  ctx.stroke();

  for (let y = 200; y < canvas.height - 200; y += 150) {
    const span = 120 + Math.sin(y) * 80;
    ctx.beginPath();
    ctx.moveTo(centerX - span, y);
    ctx.lineTo(centerX + span, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, y - 10);
    ctx.lineTo(centerX + 10, y);
    ctx.lineTo(centerX, y + 10);
    ctx.lineTo(centerX - 10, y);
    ctx.closePath();
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// Procedural Emissive Map
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

// Component 1: Alien Monolith (La Nave)
AFRAME.registerComponent('alien-monolith', {
  schema: {
    width: { type: 'number', default: 3.0 },
    height: { type: 'number', default: 12.0 },
    depth: { type: 'number', default: 0.75 },
  },

  init() {
    const { width, height, depth } = this.data;
    const geometry = new THREE.BoxGeometry(width, height, depth, 4, 16, 4);
    const diffuseMap = createAlienProceduralTexture();
    const emissiveMap = createAlienEmissiveTexture();

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
    this.mesh.position.y = height / 2;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.el.setObject3D('mesh', this.mesh);
    this.time = 0;
  },

  tick(time, timeDelta) {
    if (this.material) {
      this.time += (timeDelta || 16) * 0.002;
      this.material.emissiveIntensity = 0.5 + 0.4 * Math.sin(this.time);
    }
  },
});

// Component 2: Alien Mothership UFO (Officine Ibba - Santa Maria delle Mole)
AFRAME.registerComponent('alien-ufo', {
  init() {
    const group = new THREE.Group();

    // Dark titanium metallic hull material
    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c1017,
      metalness: 0.98,
      roughness: 0.15,
    });

    // Glowing core reactor material
    this.reactorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffe1,
      emissive: 0x00ffe1,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });

    // 1. Central Saucer Body (Wide Aerodynamic Disc)
    const discGeo = new THREE.CylinderGeometry(8, 10, 1.4, 48);
    const discMesh = new THREE.Mesh(discGeo, hullMaterial);
    discMesh.castShadow = true;
    group.add(discMesh);

    // 2. Upper Cockpit Dome
    const domeGeo = new THREE.SphereGeometry(3.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMesh = new THREE.Mesh(domeGeo, hullMaterial);
    domeMesh.position.y = 0.7;
    group.add(domeMesh);

    // 3. Lower Ventral Reactor Core
    const coreGeo = new THREE.CylinderGeometry(4.5, 1.5, 1.8, 32);
    const coreMesh = new THREE.Mesh(coreGeo, this.reactorMaterial);
    coreMesh.position.y = -0.9;
    group.add(coreMesh);

    // 4. Perimeter Plasma Thruster Orbs
    this.thrusterRing = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x9d00ff,
      emissive: 0x9d00ff,
      emissiveIntensity: 2.0,
    });

    const numOrbs = 14;
    const ringRadius = 9.8;
    for (let i = 0; i < numOrbs; i++) {
      const angle = (i / numOrbs) * Math.PI * 2;
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(Math.cos(angle) * ringRadius, -0.1, Math.sin(angle) * ringRadius);
      this.thrusterRing.add(orb);
    }
    group.add(this.thrusterRing);

    // 5. Downward Tractor Beam (Volumetric translucent cone)
    const beamGeo = new THREE.ConeGeometry(8, 35, 32, 1, true);
    this.beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffe1,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, this.beamMaterial);
    beamMesh.position.y = -18.5;
    beamMesh.rotation.x = Math.PI; // Point downwards
    group.add(beamMesh);

    this.el.setObject3D('mesh', group);
    this.ufoGroup = group;
    this.baseY = this.el.object3D.position.y;
    this.time = 0;
  },

  tick(time, timeDelta) {
    const dt = (timeDelta || 16) * 0.001;
    this.time += dt;

    if (this.ufoGroup) {
      // Slow majestic rotation
      this.ufoGroup.rotation.y += dt * 0.4;
      // Counter-rotating thrusters
      if (this.thrusterRing) {
        this.thrusterRing.rotation.y -= dt * 1.2;
      }

      // Gentle floating bob and slight flight banking tilt
      const bob = Math.sin(this.time * 1.2) * 1.8;
      this.el.object3D.position.y = this.baseY + bob;
      this.ufoGroup.rotation.z = Math.sin(this.time * 0.8) * 0.05;
      this.ufoGroup.rotation.x = Math.cos(this.time * 0.6) * 0.04;

      // Pulsing tractor beam intensity
      if (this.beamMaterial) {
        this.beamMaterial.opacity = 0.18 + 0.12 * Math.sin(this.time * 3);
      }
      if (this.reactorMaterial) {
        this.reactorMaterial.emissiveIntensity = 2.0 + 1.0 * Math.sin(this.time * 2.5);
      }
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

// Scene Interaction, Real GPS & Compass Heading Controller
AFRAME.registerComponent('monolith-interaction', {
  init() {
    const scene = this.el;
    const monolithRig = document.getElementById('monolith-rig');
    const ufoRig = document.getElementById('ufo-rig');
    const camera = document.getElementById('camera');
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const soundBtn = document.getElementById('btn-sound');
    const ufoBtn = document.getElementById('btn-ufo');
    const scaleBtn = document.getElementById('btn-scale');
    const recenterBtn = document.getElementById('btn-recenter');
    const statusText = document.getElementById('xr-status');
    const targetTitle = document.getElementById('target-title');
    const distLaNaveEl = document.getElementById('dist-lanave');
    const distIbbaEl = document.getElementById('dist-ibba');
    const guideText = document.getElementById('guide-text');

    const audioSynth = new AlienAudioSynth();

    // Scale options for Monolith
    const scaleModes = [
      { label: 'SCALE: GIANT (12m)', scale: 1.0, distance: 15 },
      { label: 'SCALE: TITANIC (24m)', scale: 2.0, distance: 28 },
      { label: 'SCALE: HUMAN (4m)', scale: 0.33, distance: 6 },
    ];
    let currentScaleIndex = 0;
    let currentFocusTarget = 'LANAVE'; // 'LANAVE' or 'IBBA'
    let userCoords = null;
    let compassHeading = 0;

    // Real-Time GPS Tracking
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          userCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };

          const distLaNave = calculateDistanceMeters(
            userCoords.lat,
            userCoords.lon,
            GEO_TARGETS.LA_NAVE.lat,
            GEO_TARGETS.LA_NAVE.lon
          );

          const distIbba = calculateDistanceMeters(
            userCoords.lat,
            userCoords.lon,
            GEO_TARGETS.OFFICINE_IBBA.lat,
            GEO_TARGETS.OFFICINE_IBBA.lon
          );

          const bearingToIbba = calculateBearing(
            userCoords.lat,
            userCoords.lon,
            GEO_TARGETS.OFFICINE_IBBA.lat,
            GEO_TARGETS.OFFICINE_IBBA.lon
          );

          if (distLaNaveEl) distLaNaveEl.innerText = formatDistance(distLaNave);
          if (distIbbaEl) distIbbaEl.innerText = `${formatDistance(distIbba)} (${Math.round(bearingToIbba)}°)`;

          // If user is directly at Officine Ibba (< 150m), place UFO directly overhead!
          if (distIbba < 150) {
            targetTitle.innerText = 'TARGET: OFFICINE IBBA (OVERHEAD UFO)';
            ufoRig.setAttribute('position', '0 25 -10');
            ufoRig.setAttribute('scale', '2.5 2.5 2.5');
          }
        },
        (err) => {
          console.warn('Geolocation warning:', err);
          if (distLaNaveEl) distLaNaveEl.innerText = 'ENABLE GPS';
          if (distIbbaEl) distIbbaEl.innerText = 'ENABLE GPS';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    // Compass Orientation
    window.addEventListener('deviceorientation', (e) => {
      if (e.webkitCompassHeading) {
        compassHeading = e.webkitCompassHeading; // iOS Safari
      } else if (e.alpha !== null) {
        compassHeading = 360 - e.alpha; // Android Chrome
      }
    });

    // Start / Initialize Experience
    startBtn.addEventListener('click', async () => {
      startBtn.disabled = true;
      startBtn.innerText = 'INITIALIZING SENSORS...';

      // 1. iOS Safari DeviceOrientation permission
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          await DeviceOrientationEvent.requestPermission();
        } catch (e) {
          console.warn('Device orientation permission:', e);
        }
      }

      // 2. Direct Camera permission prompt within user gesture
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const tempStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          });
          tempStream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        console.warn('Camera request notice:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          alert('Camera permission was denied. Please allow Camera access in your browser settings and reload.');
        }
      }

      startOverlay.classList.add('hidden');

      audioSynth.toggle();
      soundBtn.classList.add('active');

      if (statusText) {
        statusText.innerText = 'CONNECTING CAMERA...';
      }

      scene.emit('runreality');
      scene.emit('runxr');
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

    // Toggle UFO / Monolith Focus
    ufoBtn.addEventListener('click', () => {
      const camObj = camera.object3D;

      if (currentFocusTarget === 'LANAVE') {
        currentFocusTarget = 'IBBA';
        ufoBtn.classList.add('active');
        ufoBtn.innerHTML = '<span class="btn-icon">▲</span> FOCUS MONOLITH';
        targetTitle.innerText = 'TARGET: UFO AT OFFICINE IBBA';
        guideText.innerText = 'Mothership hovering above Santa Maria delle Mole';

        // Position UFO directly in the upper sky in front of wherever the user is looking
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(camObj.quaternion);
        forward.normalize();

        const ufoPos = camObj.position.clone().add(forward.multiplyScalar(40));
        ufoPos.y = 28; // High altitude above buildings
        ufoRig.object3D.position.copy(ufoPos);
      } else {
        currentFocusTarget = 'LANAVE';
        ufoBtn.classList.remove('active');
        ufoBtn.innerHTML = '<span class="btn-icon">🛸</span> UFO AT IBBA';
        targetTitle.innerText = 'TARGET: LA NAVE CC (FRATTOCCHIE)';
        guideText.innerText = 'Aim at ground in front of La Nave & tap to reposition';
      }
    });

    // Scale toggle
    scaleBtn.addEventListener('click', () => {
      currentScaleIndex = (currentScaleIndex + 1) % scaleModes.length;
      const mode = scaleModes[currentScaleIndex];
      scaleBtn.innerHTML = `<span class="btn-icon">⚡</span> ${mode.label}`;
      monolithRig.setAttribute('scale', `${mode.scale} ${mode.scale} ${mode.scale}`);
    });

    // Recenter Monolith
    const recenterMonolith = () => {
      const camObj = camera.object3D;
      const rigObj = monolithRig.object3D;

      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();

      const targetDistance = scaleModes[currentScaleIndex].distance;
      const targetPos = camObj.position.clone().add(forward.multiplyScalar(targetDistance));
      targetPos.y = 0;

      rigObj.position.copy(targetPos);
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
      if (e.target.closest('#hud-container') || e.target.closest('#start-overlay')) {
        return;
      }
      recenterMonolith();
    });

    // 8th Wall Lifecycle Events
    scene.addEventListener('realityready', () => {
      if (statusText) statusText.innerText = 'CAMERA & TRACKING ACTIVE';
    });

    scene.addEventListener('camerastatuschange', (e) => {
      if (statusText && e.detail && e.detail.status) {
        if (e.detail.status === 'hasStream' || e.detail.status === 'hasVideo') {
          statusText.innerText = 'CAMERA STREAM ATTACHED';
        } else if (e.detail.status === 'failed') {
          statusText.innerText = 'CAMERA FAILED: ' + (e.detail.reason || 'CHECK PERMISSIONS');
        }
      }
    });

    scene.addEventListener('xrfatalerror', (e) => {
      if (statusText) statusText.innerText = 'AR ERROR: ' + (e.detail?.error || 'Check Permissions');
    });
  },
});
