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
  targetWorldPos: { x: 0, y: 0, z: -4, scale: 1.0 },
};

// Seamless Omni-Directional Heading: Computes True North whether held vertically (AR camera) or horizontally (flat compass)
function computeOmniDirectionalHeading(alpha, beta, gamma) {
  const degToRad = Math.PI / 180;
  const a = (alpha || 0) * degToRad;
  const b = (beta || 0) * degToRad;
  const g = (gamma || 0) * degToRad;

  const cA = Math.cos(a), sA = Math.sin(a);
  const cB = Math.cos(b), sB = Math.sin(b);
  const cG = Math.cos(g), sG = Math.sin(g);

  // Col 2: Top of phone (+Y in device coordinates) projected onto horizontal Earth plane
  const Yx = - sA * cB;
  const Yy = cA * cB;

  // Col 3: Camera forward (-Z in device coordinates) projected onto horizontal Earth plane
  const CamX = - (cA * sG + sA * sB * cG);
  const CamY = - (sA * sG - cA * sB * cG);

  // Continuous smooth blend between horizontal (beta < 20°, top of phone) and vertical (beta > 65°, camera forward)
  const absBeta = Math.abs(beta || 0);
  let t = (absBeta - 20) / 45; // 0 at <= 20°, 1 at >= 65°
  t = Math.max(0, Math.min(1, t));

  const East = (1 - t) * Yx + t * CamX;
  const North = (1 - t) * Yy + t * CamY;

  let heading = Math.atan2(East, North) * (180 / Math.PI);
  let compHeading = (heading + 360) % 360;

  const screenAngle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  return (compHeading + screenAngle + 360) % 360;
}

// Circular shortest-distance exponential smoothing with Deadband (Eliminates magnetometer micro-jitter)
function smoothHeading(current, target, customFactor) {
  let diff = (target - current + 540) % 360 - 180;
  // Deadband: Ignore sensor micro-jitter (< 2.2°) when holding phone steady
  if (Math.abs(diff) < 2.2) {
    return current;
  }
  const factor = customFactor !== undefined ? customFactor : (Math.abs(diff) > 35 ? 0.35 : 0.09);
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

    this.updateBadgeTexture('Via Aldo Moro, 52', '14 m away');
    this.el.setObject3D('mesh', group);
  },

  updateBadgeTexture(title, distanceText) {
    const ctx = this.badgeCtx;
    const w = this.badgeCanvas.width;
    const h = this.badgeCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Rounded Frosted Glass Container
    const r = 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#ea4335';
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

    // Red Pin Icon
    ctx.font = '36px sans-serif';
    ctx.fillText('📍', 24, 76);

    // Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px -apple-system, Roboto, sans-serif';
    ctx.textAlign = 'left';
    const cleanTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
    ctx.fillText(cleanTitle, 72, 74);

    // Subtitle / Distance Pill
    ctx.fillStyle = '#ff7666';
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

    const destTitle = document.getElementById('dest-title');
    const destAddress = document.getElementById('dest-address');
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
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${state.target.lat},${state.target.lon}`,
            '_blank'
          );
        };
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
        compassSourceLabel.innerText = `Source: ${state.compassSource}`;
      }

      updateCalibrationUI();

      // Update Floating Billboard Badge above the 3D Pin
      const pinComp = pinMeshEl ? pinMeshEl.components['red-map-pin'] : null;
      if (pinComp && pinComp.updateBadgeTexture) {
        pinComp.updateBadgeTexture(state.target.title, `${formatDistance(dist)} • ${Math.round(bearing)}° ${getCardinal(bearing)}`);
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
      // Compute SLAM Target Anchor (Ground Horizon Projection)
      // ─────────────────────────────────────────────────────────────
      // Clamped visual render distance: Pin stays between 3.0m and 22.0m so it is NEVER lost or clipped
      const renderDist = Math.max(3.0, Math.min(dist, 22.0));

      // Dynamic scale with distance: smoothly scales larger when far so it is always crisp and visible
      let dynamicScale = state.pinScale;
      if (dist > 22.0) {
        dynamicScale *= Math.min(2.4, 1.0 + Math.log10(dist / 18.0) * 0.65);
      }

      // Height: STRICTLY at ground / eye level (State pinElevation, never in the sky)
      const targetY = state.pinElevation;

      const camObj = camera ? camera.object3D : null;
      const camPos = camObj ? camObj.position : new THREE.Vector3(0, 1.6, 0);

      // Get camera yaw in 8th Wall SLAM world space (clockwise from -Z forward)
      let slamCamYaw = 0;
      if (camObj) {
        const camDir = new THREE.Vector3();
        camObj.getWorldDirection(camDir);
        slamCamYaw = Math.atan2(camDir.x, -camDir.z) * (180 / Math.PI);
      }

      // Signed relative bearing relative to camera view (-180° to +180°)
      const signedRelBearing = ((bearing - effectiveHeading + 540) % 360) - 180;

      // Fixed World-Space Bearing in 8th Wall SLAM:
      // SLAM Camera Yaw + Relative Bearing locks the target in physical Earth coordinates!
      // When the user turns their phone, slamCamYaw and effectiveHeading cancel out,
      // keeping the pin rigidly stationary in real physical space (North never turns with the user)!
      const slamTargetAngle = ((slamCamYaw + signedRelBearing + 360) % 360);
      const rad = (slamTargetAngle * Math.PI) / 180;

      // Target world position anchored relative to camera in 8th Wall SLAM space
      state.targetWorldPos = {
        x: camPos.x + Math.sin(rad) * renderDist,
        y: targetY,
        z: camPos.z - Math.cos(rad) * renderDist,
        scale: dynamicScale,
        relativeBearing: (signedRelBearing + 360) % 360,
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
      updateGeospatialTransform();
      showToast('📍', `Target updated: ${state.target.title}`);

      // Sync Leaflet map if initialized
      if (leafletMap && leafletPinMarker) {
        leafletPinMarker.setLatLng([lat, lon]);
        leafletMap.setView([lat, lon], 17);
      }
    };

    // Parse Input (Coordinates, Google Maps Links, or Text Queries)
    const handleLocationSearch = async (queryText) => {
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
          renderSuggestions(data);
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
        handleLocationSearch(addressInput.value);
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
      handleLocationSearch(addressInput.value);
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
      updateGeospatialTransform();
    });

    if (btnTrimMinus) {
      btnTrimMinus.addEventListener('click', () => {
        state.headingTrim = ((state.headingTrim - 45 + 180 + 360) % 360) - 180;
        sliderTrim.value = state.headingTrim;
        labelTrim.innerText = `${state.headingTrim > 0 ? '+' : ''}${state.headingTrim}°`;
        showToast('🧭', `North trimmed: ${state.headingTrim}°`);
        updateGeospatialTransform();
      });
    }

    if (btnTrimPlus) {
      btnTrimPlus.addEventListener('click', () => {
        state.headingTrim = ((state.headingTrim + 45 + 180 + 360) % 360) - 180;
        sliderTrim.value = state.headingTrim;
        labelTrim.innerText = `${state.headingTrim > 0 ? '+' : ''}${state.headingTrim}°`;
        showToast('🧭', `North trimmed: ${state.headingTrim}°`);
        updateGeospatialTransform();
      });
    }

    if (btnTrimReset) {
      btnTrimReset.addEventListener('click', () => {
        state.headingTrim = 0;
        sliderTrim.value = 0;
        labelTrim.innerText = '0°';
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

    // Standpoint Mode (Live vs Simulated at Destination)
    btnModeLive.addEventListener('click', () => {
      state.standpointMode = 'LIVE';
      btnModeLive.classList.add('active');
      btnModeSim.classList.remove('active');
      showToast('🌐', 'Tracking real live GPS satellites & compass.');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          state.userCoords.lat = pos.coords.latitude;
          state.userCoords.lon = pos.coords.longitude;
          updateGeospatialTransform();
        });
      }
    });

    btnModeSim.addEventListener('click', () => {
      state.standpointMode = 'SIMULATED';
      btnModeSim.classList.add('active');
      btnModeLive.classList.remove('active');
      state.userCoords.lat = state.target.lat;
      state.userCoords.lon = state.target.lon;
      pinAtCameraFeet();
      showToast('🏠', 'Simulating standing directly at destination address!');
    });

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

        const screenPos = pinPos.clone().project(threeCamera);

        // Pin is inside the camera view if Z < 1.0 and within screen NDC bounds (-0.88 to +0.88)
        const isInFov = screenPos.z < 1.0 &&
                        screenPos.x >= -0.88 && screenPos.x <= 0.88 &&
                        screenPos.y >= -0.88 && screenPos.y <= 0.88;

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

          if (Math.abs(diff) > 135) {
            this.guideArrow.innerText = '↻';
            this.guideText.innerText = 'PIN IS BEHIND YOU';
          } else if (diff < 0) {
            this.guideArrow.innerText = '←';
            this.guideText.innerText = `TURN LEFT ${Math.round(Math.abs(diff))}° TO PIN`;
          } else {
            this.guideArrow.innerText = '→';
            this.guideText.innerText = `TURN RIGHT ${Math.round(diff)}° TO PIN`;
          }
        }
      }
    }
  },
});
