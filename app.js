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

// Generate Authentic Weathered Carrara Marble PBR Texture
function generateCarraraMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Antique ivory marble base
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle marble mineral clouds
  for (let i = 0; i < 45; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 130);
    grad.addColorStop(0, 'rgba(210, 202, 188, 0.42)');
    grad.addColorStop(1, 'rgba(244, 241, 234, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 130, 0, Math.PI * 2);
    ctx.fill();
  }

  // Organic winding marble veins
  ctx.lineWidth = 2;
  for (let v = 0; v < 10; v++) {
    ctx.strokeStyle = 'rgba(120, 112, 100, 0.26)';
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

  // Micro stone grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  for (let i = 0; i < 2500; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
  }

  return new THREE.CanvasTexture(canvas);
}

// Generate Dedicated Imperial SPQR Plaque Texture for the Front of the Pedestal
function generateRomanPlaqueTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Antique bronze/dark porphyry stone background
  ctx.fillStyle = '#1c1815';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle bronze metal grain
  for (let i = 0; i < 30; i++) {
    const grad = ctx.createRadialGradient(
      Math.random() * canvas.width, Math.random() * canvas.height, 10,
      Math.random() * canvas.width, Math.random() * canvas.height, 200
    );
    grad.addColorStop(0, 'rgba(60, 50, 40, 0.35)');
    grad.addColorStop(1, 'rgba(28, 24, 21, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Double classical Roman border in antiqued gold
  ctx.strokeStyle = '#c8a44d';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  // Corner rosettes / classical rivets
  const drawRivet = (x, y) => {
    ctx.fillStyle = '#e5c158';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4d1b';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };
  drawRivet(28, 28);
  drawRivet(canvas.width - 28, 28);
  drawRivet(28, canvas.height - 28);
  drawRivet(canvas.width - 28, canvas.height - 28);

  // Chiseled Gold Lettering: S · P · Q · R
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0cf65';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.font = 'bold 100px "Times New Roman", Georgia, serif';
  ctx.fillText('S · P · Q · R', canvas.width / 2, 190);

  // Subtitle: VIA ALDO MORO 52
  ctx.font = 'bold 44px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('VIA ALDO MORO · LII', canvas.width / 2, 290);

  // Subtitle: FRATTOCCHIE · MARINO
  ctx.font = 'italic 34px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#b89430';
  ctx.fillText('FRATTOCCHIE · CASTRUM MARINI', canvas.width / 2, 360);

  // Ornamental laurel sprig at bottom
  ctx.font = '32px serif';
  ctx.fillText('◈ ─── 🏛️ ─── ◈', canvas.width / 2, 440);

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
    const plaqueTexture = generateRomanPlaqueTexture();

    // Weathered Carrara Marble Material
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xf0ece4,
      map: marbleTexture,
      roughness: 0.35,
      metalness: 0.03,
      bumpMap: marbleTexture,
      bumpScale: 0.018,
      envMapIntensity: 0.85,
    });

    // Darker Weathered Marble for Creases & Shadow Depths
    const marbleShadowMat = new THREE.MeshStandardMaterial({
      color: 0xded8cc,
      map: marbleTexture,
      roughness: 0.45,
      metalness: 0.02,
    });

    // Antique Imperial Bronze / Gold Material for Laurel & Brooch
    const laurelMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.88,
    });

    // Dedicated SPQR Pedestal Front Plaque Material
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTexture,
      roughness: 0.32,
      metalness: 0.45,
      bumpMap: plaqueTexture,
      bumpScale: 0.015,
    });

    // ─────────────────────────────────────────────────────────────
    // 1. CLASSICAL PEDESTAL PLINTH (With Front SPQR Plaque)
    // ─────────────────────────────────────────────────────────────

    // Stepped plinth base
    const baseGeo = new THREE.BoxGeometry(0.72, 0.14, 0.72);
    const baseMesh = new THREE.Mesh(baseGeo, marbleMat);
    baseMesh.position.y = 0.07;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Pedestal column shaft
    const shaftGeo = new THREE.BoxGeometry(0.56, 0.72, 0.56);
    const shaftMesh = new THREE.Mesh(shaftGeo, marbleMat);
    shaftMesh.position.y = 0.50;
    shaftMesh.castShadow = true;
    shaftMesh.receiveShadow = true;
    group.add(shaftMesh);

    // Dedicated Bronze SPQR Plaque on FRONT FACE (+Z)
    const plaqueGeo = new THREE.BoxGeometry(0.44, 0.22, 0.02);
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, 0.52, 0.285); // Mounted on front face of the 0.56m shaft (0.56/2 = 0.28)
    plaqueMesh.castShadow = true;
    group.add(plaqueMesh);

    // Classical capital plinth moulding
    const capGeo = new THREE.BoxGeometry(0.66, 0.08, 0.66);
    const capMesh = new THREE.Mesh(capGeo, marbleMat);
    capMesh.position.y = 0.90;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    group.add(capMesh);

    // Circular pedestal socle collar
    const socleGeo = new THREE.CylinderGeometry(0.19, 0.23, 0.07, 24);
    const socleMesh = new THREE.Mesh(socleGeo, marbleMat);
    socleMesh.position.y = 0.975;
    socleMesh.castShadow = true;
    group.add(socleMesh);

    // ─────────────────────────────────────────────────────────────
    // 2. ROMAN TORSO & DRAPED CLOAK / TOGA (Front vs Back)
    // ─────────────────────────────────────────────────────────────

    // Broad Roman Imperial Shoulders
    const shouldersGeo = new THREE.BoxGeometry(0.62, 0.16, 0.26);
    const shouldersMesh = new THREE.Mesh(shouldersGeo, marbleMat);
    shouldersMesh.position.set(0, 1.28, 0);
    shouldersMesh.castShadow = true;
    group.add(shouldersMesh);

    // Anatomical Torso Core (Tapered oval chest)
    const torsoGeo = new THREE.CylinderGeometry(0.23, 0.28, 0.52, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, marbleMat);
    torsoMesh.position.set(0, 1.22, 0);
    torsoMesh.scale.set(1.15, 1.0, 0.85); // Wider in X, shallower in Z
    torsoMesh.castShadow = true;
    group.add(torsoMesh);

    // BACK CLOAK DRAPE (-Z face): Clearly establishes the rear of the statue!
    const backCloakGeo = new THREE.BoxGeometry(0.50, 0.54, 0.07);
    const backCloakMesh = new THREE.Mesh(backCloakGeo, marbleShadowMat);
    backCloakMesh.position.set(0, 1.20, -0.13); // Centered on -Z (rear)
    backCloakMesh.castShadow = true;
    group.add(backCloakMesh);

    // Back Cloak Vertical Folds
    for (let f = -0.18; f <= 0.18; f += 0.09) {
      const foldGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.50, 8);
      const foldMesh = new THREE.Mesh(foldGeo, marbleMat);
      foldMesh.position.set(f, 1.20, -0.16);
      foldMesh.castShadow = true;
      group.add(foldMesh);
    }

    // FRONT CHEST TOGA DRAPES (+Z face): Diagonal cascading Roman folds
    const sashGeo = new THREE.TorusGeometry(0.27, 0.055, 12, 24, Math.PI * 1.15);
    const sashMesh = new THREE.Mesh(sashGeo, marbleMat);
    sashMesh.position.set(0, 1.32, 0.06);
    sashMesh.rotation.set(0.35, 0.15, -0.58);
    sashMesh.castShadow = true;
    group.add(sashMesh);

    const sashGeo2 = new THREE.TorusGeometry(0.24, 0.045, 12, 24, Math.PI * 1.05);
    const sashMesh2 = new THREE.Mesh(sashGeo2, marbleMat);
    sashMesh2.position.set(-0.02, 1.18, 0.08);
    sashMesh2.rotation.set(0.38, 0.12, -0.52);
    sashMesh2.castShadow = true;
    group.add(sashMesh2);

    // Imperial Golden Fibula Brooch (pinned on front right shoulder)
    const fibulaGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.022, 16);
    const fibulaMesh = new THREE.Mesh(fibulaGeo, laurelMat);
    fibulaMesh.position.set(0.21, 1.36, 0.09);
    fibulaMesh.rotation.x = Math.PI / 2;
    fibulaMesh.castShadow = true;
    group.add(fibulaMesh);

    // ─────────────────────────────────────────────────────────────
    // 3. SCULPTED ROMAN HEAD & FACIAL ANATOMY (+Z Face)
    // ─────────────────────────────────────────────────────────────

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.10, 0.125, 0.16, 20);
    const neckMesh = new THREE.Mesh(neckGeo, marbleMat);
    neckMesh.position.set(0, 1.48, 0.01);
    neckMesh.castShadow = true;
    group.add(neckMesh);

    // Skull / Cranium (Anatomical oval)
    const skullGeo = new THREE.SphereGeometry(0.155, 24, 20);
    const skullMesh = new THREE.Mesh(skullGeo, marbleMat);
    skullMesh.position.set(0, 1.68, 0);
    skullMesh.scale.set(0.92, 1.14, 0.96);
    skullMesh.castShadow = true;
    group.add(skullMesh);

    // Sculpted Strong Roman Jaw & Firm Chin (+Z face)
    const chinGeo = new THREE.BoxGeometry(0.095, 0.065, 0.085);
    const chinMesh = new THREE.Mesh(chinGeo, marbleMat);
    chinMesh.position.set(0, 1.545, 0.115);
    chinMesh.rotation.x = 0.25;
    chinMesh.castShadow = true;
    group.add(chinMesh);

    // Jawline left & right
    const jawL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.10), marbleMat);
    jawL.position.set(-0.065, 1.575, 0.06);
    jawL.rotation.set(0.2, 0.35, -0.2);
    group.add(jawL);

    const jawR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.10), marbleMat);
    jawR.position.set(0.065, 1.575, 0.06);
    jawR.rotation.set(0.2, -0.35, 0.2);
    group.add(jawR);

    // Classical Stoic Brow Ridge & Forehead (+Z face)
    const browGeo = new THREE.BoxGeometry(0.15, 0.038, 0.06);
    const browMesh = new THREE.Mesh(browGeo, marbleMat);
    browMesh.position.set(0, 1.725, 0.13);
    browMesh.castShadow = true;
    group.add(browMesh);

    // Deep-Set Carved Classical Eyes & Eyelids (+Z face)
    const eyeGeo = new THREE.SphereGeometry(0.022, 14, 14);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe2ded4, roughness: 0.25 });
    
    // Left eye
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.052, 1.70, 0.142);
    group.add(eyeL);

    // Right eye
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.052, 1.70, 0.142);
    group.add(eyeR);

    // Prominent Aquiline Roman Nose (+Z face)
    // Nasal bridge:
    const bridgeGeo = new THREE.BoxGeometry(0.032, 0.075, 0.048);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, marbleMat);
    bridgeMesh.position.set(0, 1.665, 0.168);
    bridgeMesh.rotation.x = -0.15;
    bridgeMesh.castShadow = true;
    group.add(bridgeMesh);

    // Sharp sculpted nasal tip & nostrils:
    const tipGeo = new THREE.ConeGeometry(0.024, 0.046, 8);
    const tipMesh = new THREE.Mesh(tipGeo, marbleMat);
    tipMesh.position.set(0, 1.625, 0.188);
    tipMesh.rotation.x = Math.PI / 2;
    tipMesh.castShadow = true;
    group.add(tipMesh);

    // Classical Sculpted Lips & Mouth (+Z face)
    const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.018, 0.028), marbleMat);
    upperLip.position.set(0, 1.585, 0.148);
    group.add(upperLip);

    const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.020, 0.026), marbleMat);
    lowerLip.position.set(0, 1.562, 0.144);
    group.add(lowerLip);

    // Sculpted Left & Right Ears (±X sides)
    const earGeo = new THREE.BoxGeometry(0.025, 0.07, 0.045);
    const earL = new THREE.Mesh(earGeo, marbleMat);
    earL.position.set(-0.145, 1.67, 0.01);
    earL.rotation.y = 0.2;
    group.add(earL);

    const earR = new THREE.Mesh(earGeo, marbleMat);
    earR.position.set(0.145, 1.67, 0.01);
    earR.rotation.y = -0.2;
    group.add(earR);

    // Sculpted Augustan Hair Curls (Framing forehead and temples)
    const curlsPositions = [
      [-0.07, 1.76, 0.12],
      [-0.03, 1.77, 0.135],
      [0.03, 1.77, 0.135],
      [0.07, 1.76, 0.12],
      [-0.11, 1.72, 0.09],
      [0.11, 1.72, 0.09],
      [-0.13, 1.66, 0.06],
      [0.13, 1.66, 0.06],
    ];
    curlsPositions.forEach(([x, y, z]) => {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), marbleMat);
      curl.position.set(x, y, z);
      group.add(curl);
    });

    // ─────────────────────────────────────────────────────────────
    // 4. CORONA TRIUMPHALIS (Golden Laurel Wreath & Back Ribbon Knot)
    // ─────────────────────────────────────────────────────────────

    // Laurel Wreath Crown Ring
    const wreathGeo = new THREE.TorusGeometry(0.162, 0.024, 12, 28);
    const wreathMesh = new THREE.Mesh(wreathGeo, laurelMat);
    wreathMesh.position.set(0, 1.76, 0.01);
    wreathMesh.rotation.x = Math.PI / 2 - 0.18;
    wreathMesh.castShadow = true;
    group.add(wreathMesh);

    // Laurel Leaves around the front forehead
    for (let a = -1.2; a <= 1.2; a += 0.35) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 6), laurelMat);
      const lx = Math.sin(a) * 0.165;
      const lz = Math.cos(a) * 0.165 + 0.01;
      leaf.position.set(lx, 1.77 + Math.cos(a) * 0.02, lz);
      leaf.rotation.set(Math.PI / 2 - 0.2, 0, -a);
      group.add(leaf);
    }

    // WREATH RIBBON KNOT AT THE REAR (-Z face):
    // Confirms the unmistakable back of the head!
    const knotGeo = new THREE.SphereGeometry(0.032, 10, 10);
    const knotMesh = new THREE.Mesh(knotGeo, laurelMat);
    knotMesh.position.set(0, 1.75, -0.155);
    group.add(knotMesh);

    // Left & Right hanging ribbon tails down the neck (-Z face)
    const ribbonGeo = new THREE.BoxGeometry(0.024, 0.18, 0.008);
    
    const ribL = new THREE.Mesh(ribbonGeo, laurelMat);
    ribL.position.set(-0.028, 1.64, -0.158);
    ribL.rotation.set(0.15, 0, 0.12);
    group.add(ribL);

    const ribR = new THREE.Mesh(ribbonGeo, laurelMat);
    ribR.position.set(0.028, 1.64, -0.158);
    ribR.rotation.set(0.15, 0, -0.12);
    group.add(ribR);

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

  // Futuristic Chime Feedback on Ground Latch / Unlatch
  playLatchChime(isLatched) {
    if (!this.audioCtx) this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      if (isLatched) {
        // Ascending lock-in chime: 520Hz -> 1040Hz
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      } else {
        // Descending release chime: 880Hz -> 440Hz
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      }

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
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

    // Solution A: SLAM Fusion & Latch Elements
    const fusionStatusPill = document.getElementById('fusion-status-pill');
    const btnToggleLatch = document.getElementById('btn-toggle-latch');
    const btnRelatch = document.getElementById('btn-relatch');
    const btnFaceMe = document.getElementById('btn-face-me');
    const btnTurn180 = document.getElementById('btn-turn-180');
    const latchToast = document.getElementById('latch-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');

    // Solution A: Geofence Auto-Latch & SLAM Fusion State
    const latchState = {
      STATUE: {
        key: 'STATUE',
        name: 'Ancient Roman Statue',
        rig: statueRig,
        latched: false,
        autoGeofenceMeters: 55, // Expanded to 55m for reliable auto-latch at Via Aldo Moro 52
        placeDistance: 3.2,
        altitude: 0,
      },
      MONOLITH: {
        key: 'MONOLITH',
        name: 'Alien Monolith',
        rig: monolithRig,
        latched: false,
        autoGeofenceMeters: 55, // When within 55m of La Nave
        placeDistance: 12.0,
        altitude: 0,
      },
      UFO: {
        key: 'UFO',
        name: 'Mothership UFO',
        rig: ufoRig,
        latched: false,
        autoGeofenceMeters: 85, // When within 85m of Officine Ibba
        placeDistance: 28.0,
        altitude: 26.0,
      },
    };

    let lastDistMoro = 0;
    let lastDistLaNave = 0;
    let lastDistIbba = 0;
    let toastTimer = null;

    const showLatchToast = (title, desc) => {
      if (!latchToast) return;
      if (toastTitle) toastTitle.innerText = title;
      if (toastDesc) toastDesc.innerText = desc;
      latchToast.classList.remove('hidden');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        latchToast.classList.add('hidden');
      }, 4500);
    };

    const updateLatchUI = () => {
      const currentTarget = latchState[activeScaleTarget];
      const isLatched = currentTarget ? currentTarget.latched : false;

      if (fusionStatusPill) {
        if (isLatched) {
          fusionStatusPill.className = 'fusion-pill latched';
          fusionStatusPill.innerHTML = `🔒 ${activeScaleTarget} LATCHED (0 JITTER)`;
        } else {
          fusionStatusPill.className = 'fusion-pill unlatched';
          fusionStatusPill.innerHTML = '🛰️ GPS TRACKING';
        }
      }

      if (btnToggleLatch) {
        if (isLatched) {
          btnToggleLatch.innerHTML = '🔓 UNLATCH (USE GPS)';
          btnToggleLatch.classList.add('active');
        } else {
          btnToggleLatch.innerHTML = '🔒 LATCH ON GROUND';
          btnToggleLatch.classList.remove('active');
        }
      }

      // Update distance labels in the HUD
      if (distMoroEl && latchState.STATUE.latched) {
        distMoroEl.innerHTML = `${formatDistance(lastDistMoro)} <b style="color:#10b981;">(🔒 LATCHED)</b>`;
      }
      if (distLaNaveEl && latchState.MONOLITH.latched) {
        distLaNaveEl.innerHTML = `${formatDistance(lastDistLaNave)} <b style="color:#10b981;">(🔒 LATCHED)</b>`;
      }
      if (distIbbaEl && latchState.UFO.latched) {
        distIbbaEl.innerHTML = `${formatDistance(lastDistIbba)} <b style="color:#10b981;">(🔒 LATCHED)</b>`;
      }
    };

    const latchTarget = (targetKey, isAuto = false) => {
      const target = latchState[targetKey];
      if (!target) return;

      const camObj = camera.object3D;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camObj.quaternion);
      forward.y = 0;
      forward.normalize();

      const targetPos = camObj.position.clone().add(forward.multiplyScalar(target.placeDistance));
      targetPos.y = target.altitude;

      target.rig.setAttribute('position', `${targetPos.x.toFixed(2)} ${targetPos.y.toFixed(2)} ${targetPos.z.toFixed(2)}`);
      
      // Explicitly rotate in A-Frame so front (+Z) faces towards the user
      if (target.altitude === 0) {
        const dx = camObj.position.x - targetPos.x;
        const dz = camObj.position.z - targetPos.z;
        const rotYDeg = (Math.atan2(dx, dz) * 180) / Math.PI;
        target.rig.setAttribute('rotation', `0 ${rotYDeg.toFixed(1)} 0`);
      }

      target.latched = true;
      audioSynth.playLatchChime(true);

      showLatchToast(
        isAuto ? `GEOFENCE AUTO-LATCH: ${target.name.toUpperCase()}` : `LATCHED: ${target.name.toUpperCase()}`,
        isAuto
          ? `Within ${target.autoGeofenceMeters}m geofence! Locked to physical SLAM ground (zero GPS drift).`
          : `Rigidly locked to physical ground in front of camera (60fps SLAM).`
      );

      if (guideText) {
        guideText.innerText = `🔒 ${target.name} locked to ground! Walk around it freely with zero GPS jitter.`;
      }

      updateLatchUI();
    };

    const unlatchTarget = (targetKey) => {
      const target = latchState[targetKey];
      if (!target) return;

      target.latched = false;
      audioSynth.playLatchChime(false);

      showLatchToast(
        `RELEASED: ${target.name.toUpperCase()}`,
        `Re-enabled continuous GPS satellite & compass tracking.`
      );

      if (guideText) {
        guideText.innerText = `🛰️ Tracking ${target.name} via live GPS & compass.`;
      }

      updateLatchUI();
      updateGeospatialPositions();
    };

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
      updateLatchUI();
    });

    tabMonolith.addEventListener('click', () => {
      activeScaleTarget = 'MONOLITH';
      tabMonolith.classList.add('active');
      tabStatue.classList.remove('active');
      tabUfo.classList.remove('active');
      renderPresets();
      updateSliderUI();
      updateLatchUI();
    });

    tabUfo.addEventListener('click', () => {
      activeScaleTarget = 'UFO';
      tabUfo.classList.add('active');
      tabStatue.classList.remove('active');
      tabMonolith.classList.remove('active');
      renderPresets();
      updateSliderUI();
      updateLatchUI();
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

      lastDistMoro = distMoro;
      lastDistLaNave = distLaNave;
      lastDistIbba = distIbba;

      if (distMoroEl && !latchState.STATUE.latched) distMoroEl.innerText = `${formatDistance(distMoro)} (${Math.round(bearingMoro)}°)`;
      if (distLaNaveEl && !latchState.MONOLITH.latched) distLaNaveEl.innerText = `${formatDistance(distLaNave)} (${Math.round(bearingLaNave)}°)`;
      if (distIbbaEl && !latchState.UFO.latched) distIbbaEl.innerText = `${formatDistance(distIbba)} (${Math.round(bearingIbba)}°)`;

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

      // --- SOLUTION A: AUTO-LATCH TRIGGER ---
      // Automatically latch when entering the physical geofence radius
      if (standpointMode === 'LIVE') {
        if (!latchState.STATUE.latched && distMoro <= latchState.STATUE.autoGeofenceMeters) {
          latchTarget('STATUE', true);
        }
        if (!latchState.MONOLITH.latched && distLaNave <= latchState.MONOLITH.autoGeofenceMeters) {
          latchTarget('MONOLITH', true);
        }
        if (!latchState.UFO.latched && distIbba <= latchState.UFO.autoGeofenceMeters) {
          latchTarget('UFO', true);
        }
      }

      // Transform Compass Bearing + Distance to A-Frame AR Coordinates (X, Z)
      const radBearingMoro = ((bearingMoro - effectiveHeading) * Math.PI) / 180;
      const radBearingLaNave = ((bearingLaNave - effectiveHeading) * Math.PI) / 180;
      const radBearingIbba = ((bearingIbba - effectiveHeading) * Math.PI) / 180;

      // Distance projection: If user is on-site (< 60m), place right in front of them
      // ONLY update positions for UNLATCHED objects!
      // Once latched, 8th Wall SLAM completely owns the rigid coordinate with ZERO jitter!
      if (!latchState.STATUE.latched) {
        const renderDistMoro = distMoro < 60 ? Math.max(3.5, distMoro) : 25;
        const statueX = Math.sin(radBearingMoro) * renderDistMoro;
        const statueZ = -Math.cos(radBearingMoro) * renderDistMoro;
        statueRig.setAttribute('position', `${statueX.toFixed(2)} 0 ${statueZ.toFixed(2)}`);
        // Keep front (+Z) oriented towards user's view
        const rotYDeg = (Math.atan2(-statueX, -statueZ) * 180) / Math.PI;
        statueRig.setAttribute('rotation', `0 ${rotYDeg.toFixed(1)} 0`);
      }

      if (!latchState.MONOLITH.latched) {
        const renderDistLaNave = distLaNave < 80 ? Math.max(8, distLaNave) : 45;
        const monolithX = Math.sin(radBearingLaNave) * renderDistLaNave;
        const monolithZ = -Math.cos(radBearingLaNave) * renderDistLaNave;
        monolithRig.setAttribute('position', `${monolithX.toFixed(2)} 0 ${monolithZ.toFixed(2)}`);
      }

      if (!latchState.UFO.latched) {
        const renderDistIbba = distIbba < 100 ? Math.max(15, distIbba) : 80;
        const ufoX = Math.sin(radBearingIbba) * renderDistIbba;
        const ufoZ = -Math.cos(radBearingIbba) * renderDistIbba;
        const ufoAltitude = distIbba < 100 ? 25 : 38;
        ufoRig.setAttribute('position', `${ufoX.toFixed(2)} ${ufoAltitude.toFixed(1)} ${ufoZ.toFixed(2)}`);
      }

      ground.setAttribute('position', `0 0 0`);
      updateLatchUI();
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

        // Release any simulated latches so live GPS takes over
        latchState.STATUE.latched = false;
        latchState.MONOLITH.latched = false;
        latchState.UFO.latched = false;

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
        updateGeospatialPositions();
        updateLatchUI();
      } else if (mode === 'MORO') {
        locMoroBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.VIA_ALDO_MORO.lat, lon: GEO_TARGETS.VIA_ALDO_MORO.lon };
        targetTitle.innerText = 'STANDPOINT: VIA ALDO MORO 52 (SIMULATED)';
        guideText.innerText = 'Simulating standing at Via Aldo Moro 52. Statue is auto-latched 3.2m on ground!';
        if (teleAcc) { teleAcc.innerText = 'SIMULATED'; teleAcc.className = 'telemetry-val acc-good'; }
        activeScaleTarget = 'STATUE';
        tabStatue.click();
        latchTarget('STATUE', true);
        updateGeospatialPositions();
      } else if (mode === 'LANAVE') {
        locLaNaveBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.LA_NAVE.lat, lon: GEO_TARGETS.LA_NAVE.lon };
        targetTitle.innerText = 'STANDPOINT: LA NAVE CC (SIMULATED)';
        guideText.innerText = 'Simulating standing at La Nave. Alien monolith is auto-latched 12m on plaza!';
        if (teleAcc) { teleAcc.innerText = 'SIMULATED'; teleAcc.className = 'telemetry-val acc-good'; }
        activeScaleTarget = 'MONOLITH';
        tabMonolith.click();
        latchTarget('MONOLITH', true);
        updateGeospatialPositions();
      } else if (mode === 'IBBA') {
        locIbbaBtn.classList.add('active');
        currentCoords = { lat: GEO_TARGETS.OFFICINE_IBBA.lat, lon: GEO_TARGETS.OFFICINE_IBBA.lon };
        targetTitle.innerText = 'STANDPOINT: OFFICINE IBBA (SIMULATED)';
        guideText.innerText = 'Simulating standing at Officine Ibba. Mothership UFO is auto-latched overhead!';
        if (teleAcc) { teleAcc.innerText = 'SIMULATED'; teleAcc.className = 'telemetry-val acc-good'; }
        activeScaleTarget = 'UFO';
        tabUfo.click();
        latchTarget('UFO', true);
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

    // Solution A: Toggle Latch & Re-Latch Toolbar Buttons
    if (btnToggleLatch) {
      btnToggleLatch.addEventListener('click', () => {
        const target = latchState[activeScaleTarget];
        if (target.latched) {
          unlatchTarget(activeScaleTarget);
        } else {
          latchTarget(activeScaleTarget, false);
        }
      });
    }

    if (btnRelatch) {
      btnRelatch.addEventListener('click', () => {
        latchTarget(activeScaleTarget, false);
        if (statusText) {
          statusText.innerText = 'RE-LATCHED TO PHYSICAL GROUND';
          setTimeout(() => (statusText.innerText = 'SLAM TRACKING ACTIVE'), 2000);
        }
      });
    }

    // Face Me Button (rotates active object so its front faces camera)
    if (btnFaceMe) {
      btnFaceMe.addEventListener('click', () => {
        const target = latchState[activeScaleTarget];
        if (!target) return;
        const camObj = camera.object3D;
        const pos = target.rig.getAttribute('position') || { x: 0, y: 0, z: 0 };
        const dx = camObj.position.x - pos.x;
        const dz = camObj.position.z - pos.z;
        const rotYDeg = (Math.atan2(dx, dz) * 180) / Math.PI;
        target.rig.setAttribute('rotation', `0 ${rotYDeg.toFixed(1)} 0`);
        audioSynth.playLatchChime(true);
        if (guideText) guideText.innerText = `🔄 ${target.name} turned to face you directly!`;
      });
    }

    // Flip 180° Button (instantly rotates active object 180°)
    if (btnTurn180) {
      btnTurn180.addEventListener('click', () => {
        const target = latchState[activeScaleTarget];
        if (!target) return;
        const curRot = target.rig.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
        const newY = ((curRot.y || 0) + 180) % 360;
        target.rig.setAttribute('rotation', `0 ${newY.toFixed(1)} 0`);
        audioSynth.playLatchChime(false);
        if (guideText) guideText.innerText = `↩️ ${target.name} flipped 180°!`;
      });
    }

    // Precise Ground Pin Button (Drops active object on the exact physical spot in front of you)
    if (pinGroundBtn) {
      pinGroundBtn.addEventListener('click', () => {
        latchTarget(activeScaleTarget, false);
        if (guideText) guideText.innerText = `📌 ${latchState[activeScaleTarget].name} pinned to ground & latched to SLAM!`;
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
      if (currentFocus === 'STATUE') {
        currentFocus = 'MONOLITH';
        focusBtn.innerHTML = '<span class="btn-icon">▲</span> FOCUS: LA NAVE';
        guideText.innerText = 'Focusing on Alien Monolith (Centro Commerciale La Nave)';
        tabMonolith.click();
        if (standpointMode !== 'LIVE') {
          latchTarget('MONOLITH', true);
        }
      } else if (currentFocus === 'MONOLITH') {
        currentFocus = 'UFO';
        focusBtn.innerHTML = '<span class="btn-icon">🛸</span> FOCUS: UFO';
        guideText.innerText = 'Focusing on Mothership UFO above Santa Maria delle Mole';
        tabUfo.click();
        if (standpointMode !== 'LIVE') {
          latchTarget('UFO', true);
        }
      } else {
        currentFocus = 'STATUE';
        focusBtn.innerHTML = '<span class="btn-icon">🏛️</span> FOCUS: STATUE';
        guideText.innerText = 'Focusing on Ancient Roman Statue in front of Via Aldo Moro 52';
        tabStatue.click();
        if (standpointMode !== 'LIVE') {
          latchTarget('STATUE', true);
        }
      }
    });

    // Recenter (Latching current object firmly in front of the camera in SLAM space)
    recenterBtn.addEventListener('click', () => {
      latchTarget(activeScaleTarget, false);
      if (statusText) {
        statusText.innerText = 'RECENTERED & LATCHED TO SLAM';
        setTimeout(() => (statusText.innerText = 'TRACKING ACTIVE'), 2000);
      }
    });

    // Tap on ground to reposition active object & latch it to the physical ground
    scene.addEventListener('click', (e) => {
      if (e.target.closest('#hud-container') || e.target.closest('#start-overlay')) {
        return;
      }
      latchTarget(activeScaleTarget, false);
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
