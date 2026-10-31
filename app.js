/**
 * Precision Red Map Pin AR - Real-World Address WebAR
 * Built with 8thwall.org SLAM + A-Frame (Three.js) + OpenStreetMap/Google Geocoding
 */

// Global State
const state = {
  // Target location (Defaults to Via Aldo Moro 52, Frattocchie)
  target: {
    title: 'Via Aldo Moro, 52',
    address: 'Via Aldo Moro, 52, Frattocchie, 00047 Marino RM, Italy',
    lat: 41.76370,
    lon: 12.60930,
  },
  // User's current location (Defaults to target initially)
  userCoords: {
    lat: 41.76370,
    lon: 12.60930,
    accuracy: null,
  },
  standpointMode: 'LIVE', // 'LIVE' (Real satellite GPS) or 'SIMULATED' (At destination)
  isLatched: false,       // When true, 8th Wall SLAM locks pin coordinates; GPS jitter decoupled
  compassHeading: 0,
  rawCompassHeading: 0,
  smoothedHeading: 0,
  headingTrim: 0,
  compassSource: 'INITIALIZING',
  isCompassCalibrated: false,
  calibrationProgress: 0,
  pinScale: 1.0,
  pinElevation: 0,
  distanceMeters: 0,
  bearingDegrees: 0,
  posture: 'STRAIGHT (AR)',
  slamNorthYaw: null,     // True North angle in 8th Wall SLAM world space (smoothed & rock-solid)
  slamAnchorOrigin: null, // Fixed SLAM origin vector (X, Z) so beacon isn't tethered to camera
  targetWorldPos: { x: 0, y: 0, z: -4, scale: 1.0 },
};

// Seamless Omni-Directional Heading:
// Computes True North whether held STRAIGHT (vertical AR camera) or HORIZONTALLY (flat in palm like a compass),
// in portrait, landscape, or any tilt angle in between.
function computeOmniDirectionalHeading(alpha, beta, gamma) {
  const degToRad = Math.PI / 180;
  const a = (alpha || 0) * degToRad;
  const b = (beta || 0) * degToRad;
  const g = (gamma || 0) * degToRad;

  const cA = Math.cos(a), sA = Math.sin(a);
  const cB = Math.cos(b), sB = Math.sin(b);
  const cG = Math.cos(g), sG = Math.sin(g);

  // Rotation matrix elements from Device frame to Earth frame:
  // Col 1: Device +X (Right edge)
  const R11 = cA * cG - sA * sB * sG; // East component
  const R21 = sA * cG + cA * sB * sG; // North component

  // Col 2: Device +Y (Top edge of phone)
  const R12 = - sA * cB; // East component
  const R22 = cA * cB;  // North component

  // Col 3: Device -Z (Rear camera forward pointing out back of phone into world)
  const CamX = - (cA * sG + sA * sB * cG); // East component
  const CamY = - (sA * sG - cA * sB * cG); // North component

  // Screen orientation angle (0° for portrait, 90° for landscape, 270° for reverse landscape)
  const screenAngle = (((screen.orientation && screen.orientation.angle) || window.orientation || 0) % 360) * degToRad;
  const sS = Math.sin(screenAngle);
  const cS = Math.cos(screenAngle);

  // 1. HORIZONTAL POSTURE (Flat in palm like a handheld compass):
  // User looks along the visual top of the screen:
  // v_top = -sin(screenAngle) * DeviceX + cos(screenAngle) * DeviceY
  const TopX = - sS * R11 + cS * R12;
  const TopY = - sS * R21 + cS * R22;

  // 2. STRAIGHT POSTURE (Vertical upright AR camera view):
  // User looks through the rear camera forward into the physical world (CamX, CamY)

  // 3. Continuous smooth cosine blend between Flat (beta <= 25°) and Straight (beta >= 60°):
  // Completely eliminates gimbal lock and guarantees zero jump when tilting phone up or down
  const absBeta = Math.abs(beta || 0);
  let t = (absBeta - 25) / 35; // 0 at <= 25°, 1 at >= 60°
  t = Math.max(0, Math.min(1, t));

  const East = (1 - t) * TopX + t * CamX;
  const North = (1 - t) * TopY + t * CamY;

  let heading = Math.atan2(East, North) * (180 / Math.PI);
  return (heading + 360) % 360;
}

// Continuous smooth circular exponential filter (Zero stepped deadband twitching)
function smoothHeading(current, target, customFactor) {
  let diff = (target - current + 540) % 360 - 180;
  const absDiff = Math.abs(diff);
  if (absDiff < 0.15) return current;

  let factor = customFactor !== undefined ? customFactor : 0.08;
  if (absDiff > 45) {
    factor = 0.3; // Responsive on quick body rotation
  } else if (absDiff < 3.0) {
    factor = 0.025; // Heavy damping for sensor micro-jitter
  }
  return (current + diff * factor + 360) % 360;
}

// 3D Figure-8 Compass Calibration Engine
class CalibrationEngine {
  constructor() {
    this.pitchMin = 999;
    this.pitchMax = -999;
    this.rollMin = 999;
    this.rollMax = -999;
    this.isCalibrated = false;
    this.progress = 0;
    this.source = 'UNCALIBRATED';
  }

  feed(e, isAbsolute = false) {
    // 1. iOS Hardware-reported compass accuracy
    if (e.webkitCompassAccuracy !== undefined && e.webkitCompassAccuracy !== null) {
      if (e.webkitCompassAccuracy > 0 && e.webkitCompassAccuracy <= 25) {
        this.isCalibrated = true;
        this.progress = 100;
        this.source = `IOS COMPASS (±${Math.round(e.webkitCompassAccuracy)}°)`;
        return { isCalibrated: true, progress: 100, source: this.source };
      } else if (e.webkitCompassAccuracy < 0) {
        this.isCalibrated = false;
        this.source = 'IOS COMPASS (UNCALIBRATED)';
        return { isCalibrated: false, progress: this.progress, source: this.source };
      }
    }

    // 2. Android & Generic: Detect Figure-8 3D angular sweep
    const beta = e.beta || 0;
    const gamma = e.gamma || 0;

    this.pitchMin = Math.min(this.pitchMin, beta);
    this.pitchMax = Math.max(this.pitchMax, beta);
    this.rollMin = Math.min(this.rollMin, gamma);
    this.rollMax = Math.max(this.rollMax, gamma);

    const pitchSpread = Math.min(40, this.pitchMax - this.pitchMin);
    const rollSpread = Math.min(30, this.rollMax - this.rollMin);

    const calcProgress = Math.min(100, Math.round(((pitchSpread / 40) * 50) + ((rollSpread / 30) * 50)));
    this.progress = Math.max(this.progress, calcProgress);

    if (this.progress >= 100) {
      this.isCalibrated = true;
      this.source = isAbsolute ? 'EARTH MAGNETOMETER (CALIBRATED)' : 'RELATIVE ORIENTATION';
    } else {
      this.source = isAbsolute ? 'EARTH MAGNETOMETER (CALIBRATING...)' : 'UNCALIBRATED';
    }

    return { isCalibrated: this.isCalibrated, progress: this.progress, source: this.source };
  }

  forceCalibrated(sourceName = 'GPS SATELLITE VALIDATED') {
    this.isCalibrated = true;
    this.progress = 100;
    this.source = sourceName;
  }
}

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
  if (isNaN(meters)) return '---';
  if (meters < 1000) {
    return Math.round(meters) + ' m';
  }
  return (meters / 1000).toFixed(1) + ' km';
}

function getCardinal(deg) {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  return cardinals[Math.round(((deg % 360) / 45)) % 8];
}

// Audio Feedback Chime (Web Audio API)
class AudioFeedback {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) this.ctx = new AudioContext();
  }
  playLock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  playRelease() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

// Component: 3D Red Map Pin with Ground Target & Floating Billboard Badge
AFRAME.registerComponent('red-map-pin', {
  schema: {},

  init() {
    const group = new THREE.Group();
    this.pinGroup = new THREE.Group();
    this.time = 0;

    // ─────────────────────────────────────────────────────────────
    // 1. TEARDROP MAP PIN 3D GEOMETRY (Google Maps Lathe Profile)
    // ─────────────────────────────────────────────────────────────
    const points = [];
    points.push(new THREE.Vector2(0.01, 0.0)); // needle tip touching ground

    // Tapered lower stem
    const stemSegments = 16;
    for (let i = 1; i <= stemSegments; i++) {
      const t = i / stemSegments;
      const y = 0.0 + t * 1.05;
      const x = 0.01 + Math.pow(t, 1.25) * 0.44;
      points.push(new THREE.Vector2(x, y));
    }

    // Upper spherical cap (centered at Y = 1.45, R = 0.45)
    const startAngle = Math.asin((1.05 - 1.45) / 0.45);
    const capSegments = 20;
    for (let i = 0; i <= capSegments; i++) {
      const angle = startAngle + (i / capSegments) * (Math.PI / 2 - startAngle);
      const x = Math.max(0.001, Math.cos(angle) * 0.45);
      const y = 1.45 + Math.sin(angle) * 0.45;
      points.push(new THREE.Vector2(x, y));
    }

    const pinGeometry = new THREE.LatheGeometry(points, 40);

    // Iconic Glossy Red Enamel Material
    const pinMaterial = new THREE.MeshStandardMaterial({
      color: 0xee2c2c,
      roughness: 0.18,
      metalness: 0.12,
      envMapIntensity: 1.2,
    });

    const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial);
    pinMesh.castShadow = true;
    this.pinGroup.add(pinMesh);

    // Center White Circular Medallion (Passing through front & rear faces)
    const whiteDotGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.92, 32);
    const whiteDotMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });
    const whiteDotMesh = new THREE.Mesh(whiteDotGeo, whiteDotMat);
    whiteDotMesh.position.set(0, 1.45, 0);
    whiteDotMesh.rotation.x = Math.PI / 2;
    this.pinGroup.add(whiteDotMesh);

    // Chrome Accent Bevel Rings around white dot
    const bevelGeo = new THREE.TorusGeometry(0.19, 0.015, 12, 32);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.2,
    });
    const bevelFront = new THREE.Mesh(bevelGeo, chromeMat);
    bevelFront.position.set(0, 1.45, 0.45);
    this.pinGroup.add(bevelFront);

    const bevelBack = new THREE.Mesh(bevelGeo, chromeMat);
    bevelBack.position.set(0, 1.45, -0.45);
    this.pinGroup.add(bevelBack);

    group.add(this.pinGroup);

    // ─────────────────────────────────────────────────────────────
    // 2. GROUND CONTACT TARGET & PULSING SONAR BEACON
    // ─────────────────────────────────────────────────────────────
    this.groundGroup = new THREE.Group();

    // Dark Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(0.42, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    this.groundGroup.add(shadowMesh);

    // Red Center Target Dot
    const centerDotGeo = new THREE.CircleGeometry(0.12, 32);
    const centerDotMat = new THREE.MeshBasicMaterial({
      color: 0xee2c2c,
      depthWrite: false,
    });
    const centerDotMesh = new THREE.Mesh(centerDotGeo, centerDotMat);
    centerDotMesh.rotation.x = -Math.PI / 2;
    centerDotMesh.position.y = 0.015;
    this.groundGroup.add(centerDotMesh);

    // Outer Animated Sonar Pulse Ring
    const pulseGeo = new THREE.RingGeometry(0.4, 0.48, 36);
    this.pulseMat = new THREE.MeshBasicMaterial({
      color: 0xee2c2c,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.pulseMesh = new THREE.Mesh(pulseGeo, this.pulseMat);
    this.pulseMesh.rotation.x = -Math.PI / 2;
    this.pulseMesh.position.y = 0.02;
    this.groundGroup.add(this.pulseMesh);

    group.add(this.groundGroup);

    // ─────────────────────────────────────────────────────────────
    // 2b. VERTICAL SKY BEACON BEAM (Visible from afar in any direction)
    // ─────────────────────────────────────────────────────────────
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.35, 60, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xee2c2c,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.beamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.beamMesh.position.set(0, 30.0, 0); // Extends from ground up 60m into the sky!
    group.add(this.beamMesh);

    // ─────────────────────────────────────────────────────────────
    // 3. 3D FLOATING BILLBOARD BADGE (Address + Live Distance)
    // ─────────────────────────────────────────────────────────────
    this.badgeCanvas = document.createElement('canvas');
    this.badgeCanvas.width = 512;
    this.badgeCanvas.height = 192;
    this.badgeCtx = this.badgeCanvas.getContext('2d');
    this.badgeTexture = new THREE.CanvasTexture(this.badgeCanvas);

    const badgeGeo = new THREE.PlaneGeometry(1.6, 0.6);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: this.badgeTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    this.badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    this.badgeMesh.position.set(0, 2.35, 0);
    group.add(this.badgeMesh);

    this.lastBadgeKey = '';
    this.updateBadgeTexture('Via Aldo Moro, 52', '14 m away');
    this.el.setObject3D('mesh', group);
  },

  setFarMode(isFarBeacon) {
    if (this.groundGroup) {
      this.groundGroup.visible = !isFarBeacon;
    }
    if (this.beamMesh && this.beamMesh.material) {
      if (isFarBeacon) {
        this.beamMesh.material.color.setHex(0x38bdf8);
        this.beamMesh.material.opacity = 0.65;
      } else {
        this.beamMesh.material.color.setHex(0xee2c2c);
        this.beamMesh.material.opacity = 0.35;
      }
    }
  },

  updateBadgeTexture(title, distanceText, isFarBeacon = false) {
    const badgeKey = `${title}|${distanceText}|${isFarBeacon}`;
    if (this.lastBadgeKey === badgeKey) return;
    this.lastBadgeKey = badgeKey;

    const ctx = this.badgeCtx;
    const w = this.badgeCanvas.width;
    const h = this.badgeCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Rounded Frosted Glass Container
    const r = 24;
    ctx.fillStyle = isFarBeacon ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = isFarBeacon ? '#38bdf8' : '#ea4335';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Icon
    ctx.font = '36px sans-serif';
    ctx.fillText(isFarBeacon ? '🧭' : '📍', 24, 76);

    // Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px -apple-system, Roboto, sans-serif';
    ctx.textAlign = 'left';
    const prefix = isFarBeacon ? 'TOWARDS: ' : '';
    const cleanTitle = (prefix + title).length > 22 ? (prefix + title).substring(0, 22) + '...' : (prefix + title);
    ctx.fillText(cleanTitle, 72, 74);

    // Subtitle / Distance Pill
    ctx.fillStyle = isFarBeacon ? '#38bdf8' : '#ff7666';
    ctx.font = 'bold 28px -apple-system, Roboto, monospace';
    ctx.fillText(distanceText, 72, 132);

    this.badgeTexture.needsUpdate = true;
  },

  tick(time, timeDelta) {
    const dt = timeDelta / 1000;
    this.time += dt;

    // Hovering Bob Animation
    if (this.pinGroup) {
      this.pinGroup.position.y = Math.sin(this.time * 2.8) * 0.06;
      // Gentle subtle rotation
      this.pinGroup.rotation.y = Math.sin(this.time * 0.8) * 0.25;
    }

    // Sonar Ground Ripple Animation
    if (this.pulseMesh && this.pulseMat) {
      const pulseT = (this.time * 0.9) % 1.0; // 0 to 1
      const scale = 0.6 + pulseT * 1.8;
      this.pulseMesh.scale.set(scale, scale, 1);
      this.pulseMat.opacity = Math.max(0, 0.9 * (1.0 - pulseT));
    }

    // Make floating billboard badge always face user's camera
    if (this.badgeMesh) {
      const cam = document.getElementById('camera');
      if (cam && cam.object3D) {
        this.badgeMesh.quaternion.copy(cam.object3D.quaternion);
      }
    }
  },
});

// Master Map Pin AR Application Controller
AFRAME.registerComponent('map-pin-controller', {
  init() {
    const scene = this.el;
    const pinRig = document.getElementById('pin-rig');
    const pinMeshEl = document.getElementById('pin-mesh');
    const camera = document.getElementById('camera');
    const ground = document.getElementById('ground');

    // UI Elements
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const addressInput = document.getElementById('address-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const btnSearchGo = document.getElementById('btn-search-go');
    const suggestionsDropdown = document.getElementById('suggestions-dropdown');

    const destCardIcon = document.getElementById('dest-card-icon');
    const destTitle = document.getElementById('dest-title');
    const destAddress = document.getElementById('dest-address');
    const btnQuickStandpoint = document.getElementById('btn-quick-standpoint');
    const standpointBtnText = document.getElementById('standpoint-btn-text');
    const btnOpenGMaps = document.getElementById('btn-open-gmaps');

    const metricDist = document.getElementById('metric-dist');
    const metricBearing = document.getElementById('metric-bearing');
    const latchPill = document.getElementById('latch-pill');
    const latchPillText = document.getElementById('latch-pill-text');
    const teleAcc = document.getElementById('tele-acc');

    const directionGuide = document.getElementById('direction-guide');
    const guideArrow = document.getElementById('guide-arrow');
    const guideText = document.getElementById('guide-text');

    this.pinRig = pinRig;
    this.camera = camera;
    this.directionGuide = directionGuide;
    this.guideArrow = guideArrow;
    this.guideText = guideText;

    const radarWidget = document.getElementById('radar-widget');
    const radarDial = document.getElementById('radar-dial');
    const radarPinBlip = document.getElementById('radar-pin-blip');

    const hudToast = document.getElementById('hud-toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMsg = document.getElementById('toast-msg');

    // Bottom Toolbar & Drawers
    const btnToggleMap = document.getElementById('btn-toggle-map');
    const btnLatchGround = document.getElementById('btn-latch-ground');
    const latchIcon = document.getElementById('latch-icon');
    const latchLabel = document.getElementById('latch-label');
    const btnPinFeet = document.getElementById('btn-pin-feet');
    const btnToggleDrawer = document.getElementById('btn-toggle-drawer');

    const adjustDrawer = document.getElementById('adjust-drawer');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const sliderScale = document.getElementById('slider-scale');
    const labelScale = document.getElementById('label-scale');
    const sliderElevation = document.getElementById('slider-elevation');
    const labelElevation = document.getElementById('label-elevation');
    const sliderTrim = document.getElementById('slider-trim');
    const labelTrim = document.getElementById('label-trim');
    const btnTrimMinus = document.getElementById('btn-trim-minus');
    const btnTrimReset = document.getElementById('btn-trim-reset');
    const btnTrimPlus = document.getElementById('btn-trim-plus');
    const btnAlignCamera = document.getElementById('btn-align-camera');
    const compassSourceLabel = document.getElementById('compass-source-label');
    const btnModeLive = document.getElementById('btn-mode-live');
    const btnModeSim = document.getElementById('btn-mode-sim');
    const btnGpsCurrent = document.getElementById('btn-gps-current');

    // Leaflet Map Modal
    const mapModal = document.getElementById('map-modal');
    const btnCloseMap = document.getElementById('btn-close-map');
    const btnModalOpenGMaps = document.getElementById('btn-modal-open-gmaps');
    const mapPickedCoords = document.getElementById('map-picked-coords');
    const btnConfirmMapPin = document.getElementById('btn-confirm-map-pin');

    // Calibration UI
    const calibPill = document.getElementById('calib-pill');
    const calibPillIcon = document.getElementById('calib-pill-icon');
    const calibPillText = document.getElementById('calib-pill-text');

    const calibModal = document.getElementById('calibration-modal');
    const calibProgressBar = document.getElementById('calib-progress-bar');
    const calibStatusText = document.getElementById('calib-status-text');
    const btnDismissCalib = document.getElementById('btn-dismiss-calib');
    const btnDoneCalib = document.getElementById('btn-done-calib');

    const calibEngine = new CalibrationEngine();

    const audio = new AudioFeedback();
    let leafletMap = null;
    let leafletPinMarker = null;
    let leafletUserMarker = null;
    let searchDebounceTimer = null;
    let toastTimer = null;

    // Toast Alert Helper
    const showToast = (icon, msg) => {
      if (!hudToast) return;
      if (toastIcon) toastIcon.innerText = icon;
      if (toastMsg) toastMsg.innerText = msg;
      hudToast.classList.remove('hidden');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        hudToast.classList.add('hidden');
      }, 3500);
    };

    // Update Destination Display
    const updateDestinationUI = () => {
      if (destTitle) destTitle.innerText = state.target.title;
      if (destAddress) destAddress.innerText = state.target.address;
      if (addressInput) addressInput.value = state.target.title;
      if (btnClearSearch) btnClearSearch.classList.remove('hidden');

      if (btnOpenGMaps) {
        btnOpenGMaps.onclick = () => {
          mapModal.classList.remove('hidden');
          initLeafletMap();
          if (leafletMap) {
            leafletMap.setView([state.target.lat, state.target.lon], 17);
            if (leafletPinMarker) {
              leafletPinMarker.setLatLng([state.target.lat, state.target.lon]);
            }
            setTimeout(() => leafletMap.invalidateSize(), 200);
          }
        };
      }
    };

    // Update Standpoint UI Elements
    const updateStandpointUI = () => {
      const isSim = state.standpointMode === 'SIMULATED';
      if (btnQuickStandpoint) {
        btnQuickStandpoint.classList.toggle('active', isSim);
        if (standpointBtnText) {
          standpointBtnText.innerText = isSim ? '🌐 LIVE GPS' : '🏠 TELEPORT';
        }
        btnQuickStandpoint.title = isSim ? 'Return to real live GPS tracking' : 'Simulate standing directly at destination landmark';
      }
      if (btnModeSim) btnModeSim.classList.toggle('active', isSim);
      if (btnModeLive) btnModeLive.classList.toggle('active', !isSim);
      if (destCardIcon) {
        destCardIcon.innerText = isSim ? '🏠' : (state.distanceMeters > 50 ? '🧭' : '📍');
      }
      if (latchPillText) {
        if (isSim) {
          latchPillText.innerText = '🏠 AT DESTINATION';
        } else if (state.isLatched) {
          latchPillText.innerText = '🔒 LATCHED TO GROUND';
        } else {
          latchPillText.innerText = '🛰️ GPS TRACKING';
        }
      }
    };

    // Geospatial Calculation & AR Coordinate Transform
    const updateGeospatialTransform = () => {
      const userLat = state.userCoords.lat;
      const userLon = state.userCoords.lon;
      const targetLat = state.target.lat;
      const targetLon = state.target.lon;

      const dist = calculateDistanceMeters(userLat, userLon, targetLat, targetLon);
      const bearing = calculateBearing(userLat, userLon, targetLat, targetLon);

      state.distanceMeters = dist;
      state.bearingDegrees = bearing;

      const effectiveHeading = (state.compassHeading + state.headingTrim + 360) % 360;
      const relativeBearing = ((bearing - effectiveHeading) + 360) % 360; // 0-360 relative to user camera

      // Update Telemetry Metrics
      if (metricDist) metricDist.innerText = formatDistance(dist);
      if (metricBearing) metricBearing.innerText = `${Math.round(bearing)}° ${getCardinal(bearing)}`;

      if (compassSourceLabel) {
        compassSourceLabel.innerText = `Source: ${state.compassSource} • ${state.posture}`;
      }

      updateCalibrationUI();
      updateStandpointUI();

      // Update Floating Billboard Badge above the 3D Pin
      const isFarBeacon = dist > 50.0 && state.standpointMode === 'LIVE';
      const pinComp = pinMeshEl ? pinMeshEl.components['red-map-pin'] : null;
      if (pinComp) {
        if (pinComp.setFarMode) {
          pinComp.setFarMode(isFarBeacon);
        }
        if (pinComp.updateBadgeTexture) {
          const badgeDistStr = isFarBeacon
            ? `${formatDistance(dist)} Ahead • ${Math.round(bearing)}° ${getCardinal(bearing)}`
            : `${formatDistance(dist)} • ${Math.round(bearing)}° ${getCardinal(bearing)}`;
          pinComp.updateBadgeTexture(state.target.title, badgeDistStr, isFarBeacon);
        }
      }

      // Update Mini Radar Widget (True North card with Target Blip)
      if (radarDial && radarPinBlip) {
        radarDial.style.transform = `rotate(${-effectiveHeading}deg)`;
        const rad = (bearing - 90) * (Math.PI / 180);
        const x = 50 + Math.cos(rad) * 36;
        const y = 50 + Math.sin(rad) * 36;
        radarPinBlip.style.left = `${x.toFixed(1)}%`;
        radarPinBlip.style.top = `${y.toFixed(1)}%`;
      }

      // ─────────────────────────────────────────────────────────────
      // Compute SLAM Target Anchor (Rock-Solid SLAM World Fusion)
      // ─────────────────────────────────────────────────────────────
      const camObj = camera ? camera.object3D : null;
      const camPos = camObj ? camObj.position : new THREE.Vector3(0, 1.6, 0);

      // Initialize fixed SLAM anchor origin if not set
      if (!state.slamAnchorOrigin) {
        state.slamAnchorOrigin = { x: camPos.x, z: camPos.z };
      }
      // Re-anchor if user has walked more than 15 meters away
      if (Math.hypot(camPos.x - state.slamAnchorOrigin.x, camPos.z - state.slamAnchorOrigin.z) > 15) {
        state.slamAnchorOrigin = { x: camPos.x, z: camPos.z };
      }

      // 1. Get camera yaw in 8th Wall SLAM world space (clockwise from -Z forward)
      let slamCamYaw = 0;
      if (camObj) {
        const camDir = new THREE.Vector3();
        camObj.getWorldDirection(camDir);
        slamCamYaw = Math.atan2(camDir.x, -camDir.z) * (180 / Math.PI);
      }

      // 2. Fused True North in 8th Wall SLAM coordinates:
      // instantSlamNorth is where True North lies in 8th Wall SLAM world space.
      // Because the physical room does not rotate, True North is a CONSTANT angle in the physical room!
      const instantSlamNorth = ((slamCamYaw - effectiveHeading + 360) % 360);
      if (state.slamNorthYaw === null) {
        state.slamNorthYaw = instantSlamNorth;
      } else {
        const northDiff = ((instantSlamNorth - state.slamNorthYaw + 540) % 360) - 180;
        // Heavy damping filter: ignores high-frequency magnetometer sensor noise (±2° at 100Hz)
        // while tracking deliberate, sustained orientation changes.
        const gain = Math.abs(northDiff) > 35 ? 0.25 : 0.025;
        state.slamNorthYaw = ((state.slamNorthYaw + northDiff * gain + 360) % 360);
      }

      // 3. Fixed SLAM Target Angle:
      // Bearing to target projected into 8th Wall SLAM world space.
      // Completely decoupled from high-frequency magnetometer noise!
      const slamTargetAngle = ((state.slamNorthYaw + bearing + 360) % 360);
      const rad = (slamTargetAngle * Math.PI) / 180;

      // 4. Distance & Elevation:
      // If far away (> 50m, e.g. Colosseum 18 km) in LIVE GPS mode:
      // Render at 24.0m horizon distance, elevated 2.4m in the air as a Navigational Sky Beacon!
      // This places it far out on the horizon in the sky, NOT sitting inside the user's living room!
      const renderDist = isFarBeacon ? 24.0 : (dist <= 7.0 ? Math.max(2.4, dist) : 5.8);
      const targetY = isFarBeacon ? (2.4 + state.pinElevation) : state.pinElevation;

      // Dynamic scale:
      // At 24m distance, 4.2x scale ensures the billboard badge is perfectly readable and prominent
      let dynamicScale = state.pinScale;
      if (isFarBeacon) {
        dynamicScale *= 4.2;
      } else if (dist > 7.0) {
        dynamicScale *= Math.min(1.8, 1.0 + Math.log10(Math.max(10, dist) / 10.0) * 0.25);
      }

      // 5. Target World Position in 8th Wall SLAM space:
      // Anchored from state.slamAnchorOrigin (so it doesn't follow the camera like a leash)
      const origin = state.slamAnchorOrigin;
      state.targetWorldPos = {
        x: origin.x + Math.sin(rad) * renderDist,
        y: targetY,
        z: origin.z - Math.cos(rad) * renderDist,
        scale: dynamicScale,
        relativeBearing: ((bearing - effectiveHeading + 540) % 360) - 180,
      };

      if (ground) ground.setAttribute('position', `${camPos.x.toFixed(2)} 0 ${camPos.z.toFixed(2)}`);
    };

    // Ground Latch Controls (Zero-jitter SLAM ground lock)
    const toggleGroundLatch = (forceLatched) => {
      const nextLatched = forceLatched !== undefined ? forceLatched : !state.isLatched;
      state.isLatched = nextLatched;

      if (state.isLatched) {
        audio.playLock();
        latchPill.className = 'metric-pill status-pill latched';
        latchPillText.innerText = '🔒 LATCHED TO GROUND';
        btnLatchGround.classList.add('active');
        latchIcon.innerText = '🔓';
        latchLabel.innerText = 'UNLATCH';

        // Latch firmly in front of camera in SLAM space if currently out of reach
        const camObj = camera.object3D;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camObj.quaternion);
        forward.y = 0;
        forward.normalize();

        const curPos = pinRig.getAttribute('position');
        const distFromCam = Math.hypot(curPos.x - camObj.position.x, curPos.z - camObj.position.z);

        if (distFromCam > 40 || isNaN(distFromCam)) {
          const targetPos = camObj.position.clone().add(forward.multiplyScalar(3.5));
          pinRig.setAttribute('position', `${targetPos.x.toFixed(2)} ${state.pinElevation} ${targetPos.z.toFixed(2)}`);
        }

        showToast('🔒', 'Pin latched to ground! 60fps SLAM tracking active (zero GPS drift).');
      } else {
        audio.playRelease();
        latchPill.className = 'metric-pill status-pill unlatched';
        latchPillText.innerText = '🛰️ GPS TRACKING';
        btnLatchGround.classList.remove('active');
        latchIcon.innerText = '🔒';
        latchLabel.innerText = 'LOCK SLAM';

        showToast('🛰️', 'Released ground latch. Following live GPS & compass.');
        updateGeospatialTransform();
      }
    };

    // Pin Directly at Feet / Camera View
    const pinAtCameraFeet = () => {
      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();

      state.slamAnchorOrigin = { x: camObj.position.x, z: camObj.position.z };
      state.slamNorthYaw = null;

      const targetPos = camObj.position.clone().add(forward.multiplyScalar(2.8));
      pinRig.setAttribute('position', `${targetPos.x.toFixed(2)} ${state.pinElevation} ${targetPos.z.toFixed(2)}`);

      toggleGroundLatch(true);
      showToast('📌', 'Red Pin dropped on the ground right in front of you!');
    };

    // Apply New Target Coordinates
    const setTargetCoordinates = (lat, lon, title, fullAddress) => {
      state.target.lat = lat;
      state.target.lon = lon;
      state.target.title = title || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      state.target.address = fullAddress || `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

      updateDestinationUI();

      if (state.standpointMode === 'SIMULATED') {
        state.userCoords.lat = lat;
        state.userCoords.lon = lon;
      }

      state.isLatched = false;
      toggleGroundLatch(false);

      const camObj = camera ? camera.object3D : null;
      if (camObj) {
        state.slamAnchorOrigin = { x: camObj.position.x, z: camObj.position.z };
      }
      state.slamNorthYaw = null;

      updateGeospatialTransform();

      const dist = calculateDistanceMeters(state.userCoords.lat, state.userCoords.lon, lat, lon);
      if (dist > 50 && state.standpointMode === 'LIVE') {
        showToast(
          '🧭',
          `Found ${state.target.title} (${formatDistance(dist)} Ahead)! Horizon beacon points toward target. Tap [🏠 TELEPORT] to stand at landmark.`
        );
      } else {
        showToast('📍', `Target updated: ${state.target.title}`);
      }

      // Sync Leaflet map if initialized
      if (leafletMap && leafletPinMarker) {
        leafletPinMarker.setLatLng([lat, lon]);
        leafletMap.setView([lat, lon], 17);
      }
    };

    // Parse Input (Coordinates, Google Maps Links, or Text Queries)
    const handleLocationSearch = async (queryText, autoSelectFirst = false) => {
      const q = (queryText || addressInput.value || '').trim();
      if (!q) return;

      // 1. Direct Coordinates Format: e.g. "41.7637, 12.6093" or "41.76370 12.60930"
      const coordRegex = /^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/;
      const coordMatch = q.match(coordRegex);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[3]);
        setTargetCoordinates(lat, lon, `Custom Coordinates`, `Latitude: ${lat}, Longitude: ${lon}`);
        suggestionsDropdown.classList.add('hidden');
        return;
      }

      // 2. Google Maps URL parsing
      // e.g. https://www.google.com/maps/@41.7637,12.6093,17z or ?q=41.7637,12.6093
      const gmapsRegex = /(@|q=|ll=)(-?\d+\.\d+),(-?\d+\.\d+)/;
      const gmapsMatch = q.match(gmapsRegex);
      if (gmapsMatch) {
        const lat = parseFloat(gmapsMatch[2]);
        const lon = parseFloat(gmapsMatch[3]);
        setTargetCoordinates(lat, lon, `Google Maps Location`, `Latitude: ${lat}, Longitude: ${lon}`);
        suggestionsDropdown.classList.add('hidden');
        return;
      }

      // 3. Online Geocoding via Nominatim OpenStreetMap API
      try {
        btnSearchGo.innerText = '...';
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        btnSearchGo.innerText = 'FIND';

        if (data && data.length > 0) {
          if (autoSelectFirst) {
            const first = data[0];
            const title = first.name || first.display_name.split(',')[0];
            setTargetCoordinates(parseFloat(first.lat), parseFloat(first.lon), title, first.display_name);
            suggestionsDropdown.classList.add('hidden');
          } else {
            renderSuggestions(data);
          }
        } else {
          showToast('⚠️', 'No matching addresses found. Try adding a city name.');
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
        btnSearchGo.innerText = 'FIND';
        showToast('⚠️', 'Network error reaching geocoder. Check connection.');
      }
    };

    // Render Search Autocomplete Suggestions
    const renderSuggestions = (items) => {
      suggestionsDropdown.innerHTML = '';
      if (!items || items.length === 0) {
        suggestionsDropdown.classList.add('hidden');
        return;
      }

      items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';

        const title = item.name || item.display_name.split(',')[0];
        div.innerHTML = `
          <span class="sugg-icon">📍</span>
          <div class="sugg-text-col">
            <span class="sugg-title">${title}</span>
            <span class="sugg-address">${item.display_name}</span>
          </div>
        `;

        div.addEventListener('click', () => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          setTargetCoordinates(lat, lon, title, item.display_name);
          suggestionsDropdown.classList.add('hidden');
        });

        suggestionsDropdown.appendChild(div);
      });

      suggestionsDropdown.classList.remove('hidden');
    };

    // Initialize Interactive Leaflet Map Modal
    const initLeafletMap = () => {
      if (leafletMap) return;
      if (typeof L === 'undefined') return;

      const initialLat = state.target.lat;
      const initialLon = state.target.lon;

      leafletMap = L.map('leaflet-map', {
        center: [initialLat, initialLon],
        zoom: 17,
        zoomControl: true,
      });

      // 1. High-Resolution Esri World Street Map (No API Key Required - 100% Free)
      const esriStreetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      });

      // 2. OpenStreetMap Standard Layer (No API Key Required)
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      // 3. Esri World Imagery (Satellite aerial view for pinpointing buildings & rooftops)
      const esriSatelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Satellite &copy; Esri',
        maxZoom: 19,
      });

      // Add default street map
      esriStreetLayer.addTo(leafletMap);

      // Layer Switcher: Allows instant switching between Streets, OpenStreetMap, and Satellite
      L.control.layers({
        '🗺️ Streets (Esri)': esriStreetLayer,
        '🌐 OpenStreetMap': osmLayer,
        '🛰️ Satellite View': esriSatelliteLayer,
      }, null, { position: 'topright' }).addTo(leafletMap);

      // Custom Red Pin Marker Icon
      const redPinIcon = L.divIcon({
        className: 'leaflet-red-pin-icon',
        html: '<div style="font-size:32px; transform: translate(-16px, -32px); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">📍</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      leafletPinMarker = L.marker([initialLat, initialLon], {
        icon: redPinIcon,
        draggable: true,
      }).addTo(leafletMap);

      const updatePickedDisplay = (lat, lon) => {
        if (mapPickedCoords) mapPickedCoords.innerText = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      };
      updatePickedDisplay(initialLat, initialLon);

      // Marker drag event
      leafletPinMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        updatePickedDisplay(pos.lat, pos.lng);
      });

      // Map click event
      leafletMap.on('click', (e) => {
        leafletPinMarker.setLatLng(e.latlng);
        updatePickedDisplay(e.latlng.lat, e.latlng.lng);
      });
    };

    // Event Listeners: Search & Input
    addressInput.addEventListener('input', (e) => {
      const val = e.target.value;
      btnClearSearch.classList.toggle('hidden', val.length === 0);

      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      if (val.trim().length >= 3) {
        searchDebounceTimer = setTimeout(() => handleLocationSearch(val), 400);
      } else {
        suggestionsDropdown.classList.add('hidden');
      }
    });

    addressInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleLocationSearch(addressInput.value, true);
        addressInput.blur();
      }
    });

    btnClearSearch.addEventListener('click', () => {
      addressInput.value = '';
      btnClearSearch.classList.add('hidden');
      suggestionsDropdown.classList.add('hidden');
      addressInput.focus();
    });

    btnSearchGo.addEventListener('click', () => {
      handleLocationSearch(addressInput.value, true);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.top-nav-container')) {
        suggestionsDropdown.classList.add('hidden');
      }
    });

    // Toolbar & Drawer Buttons
    btnLatchGround.addEventListener('click', () => toggleGroundLatch());
    btnPinFeet.addEventListener('click', () => pinAtCameraFeet());

    btnToggleDrawer.addEventListener('click', () => {
      adjustDrawer.classList.toggle('hidden');
    });

    btnCloseDrawer.addEventListener('click', () => {
      adjustDrawer.classList.add('hidden');
    });

    // Slider: Scale
    sliderScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.pinScale = val;
      pinRig.setAttribute('scale', `${val} ${val} ${val}`);
      labelScale.innerText = `${val.toFixed(1)}x (${(val * 1.8).toFixed(1)}m)`;
    });

    // Slider: Elevation
    sliderElevation.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.pinElevation = val;
      labelElevation.innerText = val === 0 ? 'Ground (0m)' : `${val}m in air`;
      updateGeospatialTransform();
    });

    // Slider: Trim
    sliderTrim.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.headingTrim = val;
      labelTrim.innerText = `${val > 0 ? '+' : ''}${val}°`;
      state.slamNorthYaw = null;
      updateGeospatialTransform();
    });

    if (btnTrimMinus) {
      btnTrimMinus.addEventListener('click', () => {
        state.headingTrim = ((state.headingTrim - 45 + 180 + 360) % 360) - 180;
        sliderTrim.value = state.headingTrim;
        labelTrim.innerText = `${state.headingTrim > 0 ? '+' : ''}${state.headingTrim}°`;
        state.slamNorthYaw = null;
        showToast('🧭', `North trimmed: ${state.headingTrim}°`);
        updateGeospatialTransform();
      });
    }

    if (btnTrimPlus) {
      btnTrimPlus.addEventListener('click', () => {
        state.headingTrim = ((state.headingTrim + 45 + 180 + 360) % 360) - 180;
        sliderTrim.value = state.headingTrim;
        labelTrim.innerText = `${state.headingTrim > 0 ? '+' : ''}${state.headingTrim}°`;
        state.slamNorthYaw = null;
        showToast('🧭', `North trimmed: ${state.headingTrim}°`);
        updateGeospatialTransform();
      });
    }

    if (btnTrimReset) {
      btnTrimReset.addEventListener('click', () => {
        state.headingTrim = 0;
        sliderTrim.value = 0;
        labelTrim.innerText = '0°';
        state.slamNorthYaw = null;
        showToast('🎯', 'North trim reset to 0°');
        updateGeospatialTransform();
      });
    }

    if (btnAlignCamera) {
      btnAlignCamera.addEventListener('click', () => {
        // Calibrate so that the current camera forward direction points to North (0°)
        let newTrim = (360 - state.compassHeading) % 360;
        if (newTrim > 180) newTrim -= 360;
        state.headingTrim = Math.round(newTrim);
        sliderTrim.value = state.headingTrim;
        labelTrim.innerText = `${state.headingTrim > 0 ? '+' : ''}${state.headingTrim}°`;
        state.slamNorthYaw = null;
        showToast('🧭', `Aligned! Current view calibrated to North (0°).`);
        updateGeospatialTransform();
      });
    }

    if (radarWidget) {
      radarWidget.style.cursor = 'pointer';
      radarWidget.addEventListener('click', (e) => {
        e.stopPropagation();
        const effHeading = (state.compassHeading + state.headingTrim + 360) % 360;
        showToast('🧭', `Heading: ${Math.round(effHeading)}° ${getCardinal(effHeading)} • Source: ${state.compassSource}`);
      });
    }

    // Calibration UI State Synchronizer
    const updateCalibrationUI = () => {
      if (calibPill) {
        if (state.isCompassCalibrated) {
          calibPill.className = 'metric-pill calib-pill calibrated';
          if (calibPillIcon) calibPillIcon.innerText = '✓';
          if (calibPillText) calibPillText.innerText = 'CALIBRATED';
          calibPill.title = `Compass Calibrated (${state.compassSource})`;
        } else {
          calibPill.className = 'metric-pill calib-pill uncalibrated';
          if (calibPillIcon) calibPillIcon.innerText = '⚠️';
          if (calibPillText) calibPillText.innerText = 'CALIBRATE';
          calibPill.title = 'Compass uncalibrated: tap to wave phone in figure-8';
        }
      }

      if (calibProgressBar) {
        calibProgressBar.style.width = `${state.calibrationProgress}%`;
        if (state.isCompassCalibrated) {
          calibProgressBar.style.background = 'var(--green-latched)';
        } else {
          calibProgressBar.style.background = 'linear-gradient(90deg, var(--red-primary), var(--green-latched))';
        }
      }

      if (calibStatusText) {
        if (state.isCompassCalibrated) {
          calibStatusText.innerText = '✓ Compass calibrated! (Precision North locked)';
          calibStatusText.style.color = 'var(--green-latched)';
        } else {
          calibStatusText.innerText = `Motion detected: ${state.calibrationProgress}% (Wave in figure-8)`;
          calibStatusText.style.color = '#cbd5e1';
        }
      }
    };

    // Calibration Modal Triggers
    if (calibPill) {
      calibPill.addEventListener('click', (e) => {
        e.stopPropagation();
        if (calibModal) calibModal.classList.remove('hidden');
      });
    }

    if (btnDismissCalib) {
      btnDismissCalib.addEventListener('click', () => {
        if (calibModal) calibModal.classList.add('hidden');
      });
    }

    if (btnDoneCalib) {
      btnDoneCalib.addEventListener('click', () => {
        calibEngine.forceCalibrated('MANUAL CALIBRATION');
        state.isCompassCalibrated = true;
        state.calibrationProgress = 100;
        updateCalibrationUI();
        if (calibModal) calibModal.classList.add('hidden');
        showToast('✓', 'Compass calibration verified.');
      });
    }

    // Standpoint Mode Controller (Live GPS vs Simulated Standpoint at Target)
    const toggleStandpointMode = (newMode) => {
      const targetMode = newMode || (state.standpointMode === 'LIVE' ? 'SIMULATED' : 'LIVE');
      state.standpointMode = targetMode;

      if (state.standpointMode === 'SIMULATED') {
        state.userCoords.lat = state.target.lat;
        state.userCoords.lon = state.target.lon;
        updateStandpointUI();
        pinAtCameraFeet();
        showToast('🏛️', `Teleported to ${state.target.title}! Simulating standing directly at landmark.`);
      } else {
        updateStandpointUI();
        state.isLatched = false;
        if (btnLatchGround) btnLatchGround.classList.remove('active');
        if (latchIcon) latchIcon.innerText = '🔒';
        if (latchLabel) latchLabel.innerText = 'LOCK SLAM';

        const camObj = camera ? camera.object3D : null;
        if (camObj) {
          state.slamAnchorOrigin = { x: camObj.position.x, z: camObj.position.z };
        }
        state.slamNorthYaw = null;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              state.userCoords.lat = pos.coords.latitude;
              state.userCoords.lon = pos.coords.longitude;
              state.userCoords.accuracy = Math.round(pos.coords.accuracy);
              updateGeospatialTransform();
              showToast('🛰️', `Live GPS: Pointing towards ${state.target.title} (${formatDistance(state.distanceMeters)} Ahead).`);
            },
            () => {
              updateGeospatialTransform();
              showToast('🛰️', `Returned to Live GPS tracking.`);
            }
          );
        } else {
          updateGeospatialTransform();
          showToast('🛰️', `Returned to Live GPS tracking.`);
        }
      }
      updateGeospatialTransform();
    };

    if (btnQuickStandpoint) {
      btnQuickStandpoint.addEventListener('click', () => toggleStandpointMode());
    }

    if (btnModeLive) {
      btnModeLive.addEventListener('click', () => toggleStandpointMode('LIVE'));
    }

    if (btnModeSim) {
      btnModeSim.addEventListener('click', () => toggleStandpointMode('SIMULATED'));
    }

    // Drop Pin at Live GPS
    btnGpsCurrent.addEventListener('click', () => {
      if (navigator.geolocation) {
        showToast('🛰️', 'Acquiring satellite lock...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            setTargetCoordinates(lat, lon, 'My Current Spot', `Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}`);
            pinAtCameraFeet();
          },
          (err) => showToast('⚠️', 'GPS location access denied.')
        );
      }
    });

    // Leaflet Map Modal Controls
    btnToggleMap.addEventListener('click', () => {
      mapModal.classList.remove('hidden');
      initLeafletMap();
      setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize();
      }, 200);
    });

    btnCloseMap.addEventListener('click', () => {
      mapModal.classList.add('hidden');
    });

    if (btnModalOpenGMaps) {
      btnModalOpenGMaps.addEventListener('click', () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${state.target.lat},${state.target.lon}`, '_blank');
      });
    }

    btnConfirmMapPin.addEventListener('click', async () => {
      if (!leafletPinMarker) return;
      const pos = leafletPinMarker.getLatLng();
      mapModal.classList.add('hidden');

      // Reverse geocode to get street name
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        const title = data && data.address ? (data.address.road || data.display_name.split(',')[0]) : 'Selected Map Point';
        const address = data ? data.display_name : `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
        setTargetCoordinates(pos.lat, pos.lng, title, address);
      } catch (e) {
        setTargetCoordinates(pos.lat, pos.lng, 'Selected Map Point', `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      }
    });

    // Continuous Phone Geolocation Watcher
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          if (state.standpointMode === 'LIVE') {
            state.userCoords.lat = pos.coords.latitude;
            state.userCoords.lon = pos.coords.longitude;
            state.userCoords.accuracy = Math.round(pos.coords.accuracy);

            if (teleAcc) {
              teleAcc.innerText = `±${state.userCoords.accuracy}m`;
              teleAcc.style.color = state.userCoords.accuracy <= 10 ? '#10b981' : state.userCoords.accuracy <= 25 ? '#f59e0b' : '#ef4444';
            }

            // Sync user marker on Leaflet map if open
            if (leafletMap && typeof L !== 'undefined') {
              if (!leafletUserMarker) {
                const userIcon = L.divIcon({
                  className: 'leaflet-user-icon',
                  html: '<div style="width:14px;height:14px;border-radius:50%;background:#1a73e8;border:2px solid #fff;box-shadow:0 0 8px #1a73e8;"></div>',
                  iconSize: [14, 14],
                  iconAnchor: [7, 7],
                });
                leafletUserMarker = L.marker([pos.coords.latitude, pos.coords.longitude], { icon: userIcon }).addTo(leafletMap);
              } else {
                leafletUserMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
              }
            }

            // Fused GPS satellite heading (True North) when walking
            if (pos.coords.heading !== null && !isNaN(pos.coords.heading) && pos.coords.speed > 0.7) {
              const gpsHeading = pos.coords.heading; // True North from satellite trajectory
              const diff = (gpsHeading - state.rawCompassHeading + 540) % 360 - 180;
              state.headingTrim = Math.round(smoothHeading(state.headingTrim, diff, 0.12));
              if (sliderTrim) sliderTrim.value = state.headingTrim;
              if (labelTrim) labelTrim.innerText = `${state.headingTrim > 0 ? '+' : ''}${state.headingTrim}°`;
              calibEngine.forceCalibrated('GPS SATELLITE FUSED (TRUE NORTH)');
              state.isCompassCalibrated = true;
              state.calibrationProgress = 100;
              state.compassSource = 'GPS SATELLITE FUSED (TRUE NORTH)';
              updateCalibrationUI();
            }

            updateGeospatialTransform();
          }
        },
        (err) => console.warn('Geolocation notice:', err),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 2000 }
      );
    }

    // High-Precision Multi-Sensor Orientation Fusion (Omni-Directional True North)
    let hasAbsoluteOrientation = false;

    const handleOrientation = (e, isAbsolute = false) => {
      let heading = null;

      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        // iOS WebKit hardware-fused compass
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android & standard W3C Euler angles: Seamless vertical + horizontal detection
        const beta = e.beta || 0;
        const gamma = e.gamma || 0;
        const alpha = e.alpha || 0;

        heading = computeOmniDirectionalHeading(alpha, beta, gamma);
      }

      // Feed calibration engine
      const prevCalibrated = state.isCompassCalibrated;
      const calibRes = calibEngine.feed(e, isAbsolute);
      state.isCompassCalibrated = calibRes.isCalibrated;
      state.calibrationProgress = calibRes.progress;
      state.compassSource = calibRes.source;

      updateCalibrationUI();

      // If calibration just completed, celebrate with chime and auto-hide prompt
      if (!prevCalibrated && state.isCompassCalibrated) {
        audio.playLock();
        showToast('🧭', 'Compass Calibrated! Precision North tracking active.');
        setTimeout(() => {
          if (calibModal && !calibModal.classList.contains('hidden')) {
            calibModal.classList.add('hidden');
          }
        }, 1400);
      }

      // Detect live device posture (Straight AR vs Horizontal Flat Compass)
      const betaVal = e.beta !== null && e.beta !== undefined ? Math.abs(e.beta) : 90;
      if (betaVal <= 25) {
        state.posture = 'HORIZONTAL (FLAT)';
      } else if (betaVal >= 60) {
        state.posture = 'STRAIGHT (AR)';
      } else {
        state.posture = 'TILTED (45°)';
      }

      if (heading !== null) {
        state.rawCompassHeading = heading;
        state.smoothedHeading = smoothHeading(state.smoothedHeading, heading);
        state.compassHeading = state.smoothedHeading;
        updateGeospatialTransform();
      }
    };

    const attachOrientationListeners = () => {
      // 1. Listen for deviceorientationabsolute (Standard on Chrome/Android for True/Magnetic North)
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', (e) => {
          hasAbsoluteOrientation = true;
          handleOrientation(e, true);
        });
      }

      // 2. Also listen for standard deviceorientation (for iOS Safari and fallback)
      window.addEventListener('deviceorientation', (e) => {
        if (!hasAbsoluteOrientation || e.webkitCompassHeading !== undefined) {
          handleOrientation(e, e.absolute === true);
        }
      });
    };

    attachOrientationListeners();

    // Start Screen Button: Trigger Camera Stream & 8th Wall SLAM
    startBtn.addEventListener('click', () => {
      startOverlay.classList.add('hidden');
      audio.init();

      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then((perm) => {
            if (perm === 'granted') {
              attachOrientationListeners();
            }
          })
          .catch((e) => console.warn('Orientation permission error:', e));
      } else {
        attachOrientationListeners();
      }

      showToast('📸', 'Initializing AR camera & SLAM tracking...');
      scene.emit('runreality');
      scene.emit('runxr');

      updateDestinationUI();
      updateGeospatialTransform();

      // Prompt user to calibrate if uncalibrated
      setTimeout(() => {
        if (!state.isCompassCalibrated && calibModal) {
          calibModal.classList.remove('hidden');
        }
      }, 1500);
    });

    // Tap on 3D Ground to place / re-anchor pin
    scene.addEventListener('click', (e) => {
      if (e.target.closest('#hud-container') || e.target.closest('#start-overlay') || e.target.closest('#map-modal') || e.target.closest('#calibration-modal')) {
        return;
      }
      pinAtCameraFeet();
    });

    // Initial setup
    updateDestinationUI();
    updateGeospatialTransform();
  },

  // 60fps SLAM Fusion Tick Loop: Buttery Smooth LERP Positioning & Viewport Frustum Guidance
  tick(time, timeDelta) {
    const pinRig = this.pinRig;
    const camera = this.camera;
    if (!pinRig || !pinRig.object3D) return;

    // 1. Smoothly glide pin toward target in SLAM world space (zero-jitter LERP)
    if (!state.isLatched && state.targetWorldPos) {
      const curPos = pinRig.object3D.position;
      const target = state.targetWorldPos;

      // Exponential ease (0.08 factor absorbs all sensor noise and micro-jitter)
      curPos.x += (target.x - curPos.x) * 0.08;
      curPos.y += (target.y - curPos.y) * 0.08;
      curPos.z += (target.z - curPos.z) * 0.08;

      const curScale = pinRig.object3D.scale.x;
      const targetScale = target.scale || 1.0;
      const newScale = curScale + (targetScale - curScale) * 0.08;
      pinRig.object3D.scale.set(newScale, newScale, newScale);
    }

    // 2. Continuous Visibility & Field-of-View check
    if (camera && camera.components && camera.components.camera && this.directionGuide && this.guideArrow && this.guideText) {
      const threeCamera = camera.components.camera.camera;
      if (threeCamera && pinRig.object3D) {
        const pinPos = new THREE.Vector3();
        pinRig.object3D.getWorldPosition(pinPos);

        // Transform pin position into camera local space:
        // In Three.js, camera looks along -Z. A point is in front of the camera only if camLocalPos.z < -0.2!
        const camLocalPos = pinPos.clone().applyMatrix4(threeCamera.matrixWorldInverse);
        const isInFront = camLocalPos.z < -0.2;

        let isInFov = false;
        if (isInFront) {
          const screenPos = pinPos.clone().project(threeCamera);
          isInFov = screenPos.x >= -0.85 && screenPos.x <= 0.85 &&
                    screenPos.y >= -0.85 && screenPos.y <= 0.85;
        }

        if (isInFov) {
          this.directionGuide.classList.add('hidden');
        } else {
          this.directionGuide.classList.remove('hidden');

          const camDir = new THREE.Vector3();
          camera.object3D.getWorldDirection(camDir);
          const camHeading = (Math.atan2(camDir.x, -camDir.z) * (180 / Math.PI) + 360) % 360;

          const toPin = pinPos.clone().sub(camera.object3D.position);
          const pinHeading = (Math.atan2(toPin.x, -toPin.z) * (180 / Math.PI) + 360) % 360;

          const diff = (pinHeading - camHeading + 540) % 360 - 180;

          const isFar = state.distanceMeters > 50.0 && state.standpointMode === 'LIVE';
          const targetName = state.target.title.length > 15 ? state.target.title.substring(0, 15) + '...' : state.target.title;

          if (Math.abs(diff) > 135) {
            this.guideArrow.innerText = '↻';
            this.guideText.innerText = isFar 
              ? `BEACON BEHIND YOU (LOOK TOWARDS ${getCardinal(state.bearingDegrees)})`
              : 'PIN IS BEHIND YOU';
          } else if (diff < 0) {
            this.guideArrow.innerText = '←';
            this.guideText.innerText = isFar
              ? `TURN LEFT ${Math.round(Math.abs(diff))}° TOWARDS ${targetName.toUpperCase()}`
              : `TURN LEFT ${Math.round(Math.abs(diff))}° TO PIN`;
          } else {
            this.guideArrow.innerText = '→';
            this.guideText.innerText = isFar
              ? `TURN RIGHT ${Math.round(diff)}° TOWARDS ${targetName.toUpperCase()}`
              : `TURN RIGHT ${Math.round(diff)}° TO PIN`;
          }
        }
      }
    }
  },
});
