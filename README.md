# 🛸 Alien Monolith WebAR - Centro Commerciale La Nave (Frattocchie)

A mobile WebAR experience that renders a giant alien dark metal monolith in front of **Centro Commerciale La Nave** in Frattocchie (Marino, Rome), built with **8thwall.org Open-Source WebAR** and **A-Frame / Three.js**.

---

## ⚡ The 8thwall.org Open-Source Upgrade

8th Wall transitioned away from the legacy commercial *8thwall.com* platform to **[8thwall.org](https://8thwall.org)**:
- **No App Key Required**: The old cloud authentication and license keys are gone.
- **No Domain Whitelisting**: You don't need to register URLs in a dashboard.
- **Freely Distributed Engine Binary**: Core SLAM world tracking is loaded directly via `@8thwall/engine-binary` with preloaded SLAM chunks.
- **100% Free & Self-Hosted**: Host your WebAR app on any static host, Vercel, GitHub Pages, or your own server without subscriptions or usage limits.

---

## 🌟 Key Features

- **True In-Browser WebAR**: Runs directly in Safari (iOS) and Chrome (Android) without requiring any app download.
- **Giant Alien Dark Metal Monolith**:
  - Classic Arthur C. Clarke / *2001: A Space Odyssey* proportion ($1 : 4 : 9$ ratio).
  - Procedurally generated high-specular dark obsidian/brushed gunmetal PBR finish with alien geometric glyphs and pulsing cyan/purple energy circuitry.
  - Scale modes: **Giant (12m)**, **Titanic (24m)**, and **Human Scale (4m)**.
- **Built-in Procedural Audio Hum**:
  - Native **Web Audio API** synthesizes an extraterrestrial 55Hz sub-bass alien drone with detuned oscillators and LFO filter modulation (zero external audio files needed; zero 404 or CORS errors).
- **Interactive Sci-Fi HUD**:
  - Location badge: `TARGET: LA NAVE CC (FRATTOCCHIE)`.
  - Recenter button to place the monolith directly in front of your camera view at the plaza of La Nave.
  - Audio hum toggle and scale switcher.

---

## 📁 Project Structure

```
Frattocchie AR/
├── index.html        # Main WebAR experience (8thwall.org engine binary, A-Frame scene, HUD)
├── style.css         # Glassmorphism sci-fi HUD & responsive mobile layout
├── app.js            # Procedural textures, alien shader animations, Web Audio synth, SLAM controls
├── package.json      # Local dev scripts
├── .gitignore        # Git ignore rules
└── README.md         # Deployment & remote update guide
```

---

## 🚀 How 8thwall.org Is Integrated

In [`index.html`](file:///f:/Antigravity%20Projects/Frattocchie%20AR/index.html), the open-source libraries are loaded as follows:

```html
<!-- 8thwall.org Core SLAM Engine Binary (No App Key needed!) -->
<script src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" async crossorigin="anonymous" data-preload-chunks="slam"></script>

<!-- A-Frame VR/AR Framework -->
<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>

<!-- 8th Wall XRExtras Helper Suite -->
<script src="https://cdn.jsdelivr.net/npm/@8thwall/xrextras@1/dist/xrextras.js" crossorigin="anonymous"></script>

<!-- XR Scene with SLAM tracking enabled -->
<a-scene xrconfig xrweb ...>
```

---

## 🌐 How to Put This Web App Online for FREE

WebAR camera access (`getUserMedia`) strictly requires **HTTPS**. Because there are no more domain lockouts, deployment is completely friction-free:

### Option A: Vercel (Recommended - Fastest & Easiest)
1. Push this project to GitHub (see the Git instructions below).
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New"** > **"Project"** and select your repository.
4. Click **Deploy**. Vercel will give you a live HTTPS URL (e.g., `https://frattocchie-ar.vercel.app`) in under 30 seconds!

### Option B: GitHub Pages (100% Free)
1. Push this code to a public or private GitHub repository.
2. Go to repository **Settings** > **Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**, select branch `main` and folder `/ (root)`.
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## 🔄 How to Connect It So Antigravity Can Make Changes Non-Locally

To enable continuous deployment where I can push updates live to your webapp:

### The Continuous Deployment Architecture

```
[ Antigravity ] ──(git push)──> [ GitHub Repository ] ──(auto-deploy in ~20s)──> [ Vercel / GitHub Pages ]
                                                                                       │
                                                                                       ▼
                                                                           Live Mobile WebAR App
```

### Initial Setup:
1. **Initialize Git and push to GitHub**:
   In your terminal inside `Frattocchie AR`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Alien Monolith WebAR for La Nave"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Connect your repository to Vercel**:
   - Vercel automatically links to your GitHub repo.
   - Any time a new commit hits `main`, Vercel automatically rebuilds and deploys the live site in ~20 seconds.

3. **Remote Updates with Antigravity**:
   - Whenever you want changes (e.g. *“make the monolith taller”*, *“change the glow to purple”*, or *“add alien runes on the ground”*), simply instruct me.
   - I can edit the files, commit, and push directly to GitHub.
   - The live web app will immediately update on your phone when you are standing in front of *Centro Commerciale La Nave*.

---

## 📱 Testing On-Site at Centro Commerciale La Nave

1. Open your live HTTPS link on your phone's browser (**Safari on iOS** or **Chrome on Android**).
2. Tap **"INITIALIZE AR SCAN"** and allow camera access.
3. Point your camera at the front plaza / parking area of **Centro Commerciale La Nave**.
4. The giant alien monolith will appear anchored to the ground.
5. Use the HUD controls to toggle the alien audio hum, cycle between Giant and Titanic scale, or tap **RECENTER** to reposition it relative to your viewpoint.
