import * as THREE from 'three';
import gsap from 'gsap';
import { AppRoute } from './types';

export interface PinnacleSceneOptions {
  container: HTMLElement;
  initialRoute?: AppRoute;
}

export class PinnacleScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pinnacleGroup: THREE.Group;
  private animationFrameId: number | null = null;
  private isDisposed = false;

  // Mouse hover tracking
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };
  private isHovered = false;

  // Interactive Drag & Momentum Orbit System (Fluid multi-angle rotation)
  private isDragging = false;
  private previousPointer = { x: 0, y: 0 };
  private dragVelocity = { x: 0, y: 0 };
  private userRotationY = 0;
  private userRotationX = 0;

  // Lights for GSAP transitions
  private sunLight!: THREE.DirectionalLight;
  private skyLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  // Cinematic Atmosphere & Focus Choreography
  private particles!: THREE.Points;
  private particlePositions!: Float32Array;
  private currentLookAt = { x: 0, y: 0.25, z: 0 };

  // Camera choreography targets per route
  private routeConfigs: Record<
    AppRoute,
    {
      camX: number;
      camY: number;
      camZ: number;
      lookAtY: number;
      sunIntensity: number;
      sunColor: number;
      groupOffsetY: number;
    }
  > = {
    home: {
      camX: 0.5,
      camY: 0.35,
      camZ: 4.1,
      lookAtY: 0.25,
      sunIntensity: 3.2,
      sunColor: 0xffe8d1, // Warm morning sun
      groupOffsetY: 0,
    },
    suites: {
      camX: 0.2,
      camY: 0.85,
      camZ: 3.4, // Closer macro view on the pinnacle sphere & chalice
      lookAtY: 0.65,
      sunIntensity: 3.5,
      sunColor: 0xfff2e0,
      groupOffsetY: -0.2,
    },
    piscina: {
      camX: -0.65,
      camY: 0.3,
      camZ: 3.9,
      lookAtY: 0.25,
      sunIntensity: 3.7,
      sunColor: 0xffdcba, // Golden hour warm reflection
      groupOffsetY: 0,
    },
    esperienza: {
      camX: 0.85,
      camY: 0.2,
      camZ: 3.8,
      lookAtY: 0.3,
      sunIntensity: 3.1,
      sunColor: 0xffe2c4,
      groupOffsetY: -0.1,
    },
    preventivo: {
      camX: 0.4,
      camY: 0.45,
      camZ: 4.3,
      lookAtY: 0.25,
      sunIntensity: 3.0,
      sunColor: 0xffecda,
      groupOffsetY: 0,
    },
    contatti: {
      camX: 0.0,
      camY: 0.35,
      camZ: 3.9,
      lookAtY: 0.25,
      sunIntensity: 3.2,
      sunColor: 0xffe6cb,
      groupOffsetY: 0,
    },
  };

  private currentRoute: AppRoute = 'home';

  constructor(options: PinnacleSceneOptions) {
    this.container = options.container;
    this.currentRoute = options.initialRoute || 'home';

    // 1. SCENE
    this.scene = new THREE.Scene();

    // 2. CAMERA
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    const initialConfig = this.routeConfigs[this.currentRoute];
    this.camera.position.set(initialConfig.camX, initialConfig.camY, initialConfig.camZ);
    this.camera.lookAt(0, initialConfig.lookAtY, 0);

    // 3. RENDERER (Transparent background for seamless side column integration)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // 100% transparent
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. GROUP FOR PINNACLE & CONE
    this.pinnacleGroup = new THREE.Group();
    this.scene.add(this.pinnacleGroup);

    // 5. BUILD PINNACLE & LIGHTS
    this.setupLights();
    this.setupDustParticles();
    this.buildSculpturalPinnacle();

    // 6. EVENT LISTENERS
    this.setupEventListeners();

    // 7. START LOOP
    this.animate = this.animate.bind(this);
    this.animate();
  }

  /**
   * Warm grazing sunlight setup (Luce radente calda)
   */
  private setupLights() {
    // Soft warm ambient illumination for dark gallery
    this.ambientLight = new THREE.AmbientLight(0xffedd8, 1.15);
    this.scene.add(this.ambientLight);

    // Main grazing directional warm spotlight
    this.sunLight = new THREE.DirectionalLight(0xffeedb, 3.8);
    this.sunLight.position.set(4.2, 4.5, 3.5);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);

    // Warm subtle fill light from opposite angle
    this.skyLight = new THREE.DirectionalLight(0xedd9c2, 1.2);
    this.skyLight.position.set(-3.5, 0.5, 2.0);
    this.scene.add(this.skyLight);

    // Rim / contour light from behind-left to trace the stone silhouette against dark background
    const rimLight = new THREE.DirectionalLight(0xd4af80, 2.2);
    rimLight.position.set(-3.0, 3.0, -3.5);
    this.scene.add(rimLight);

    // Courtyard stone warm bounce light from below
    const groundBounce = new THREE.PointLight(0xb8926a, 1.2, 10);
    groundBounce.position.set(0, -2.5, 2.0);
    this.scene.add(groundBounce);
  }

  /**
   * Floating Golden Summer Sun Motes / Atmospheric Micro-Dust
   */
  private setupDustParticles() {
    const particleCount = 160;
    this.particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 0.5 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      this.particlePositions[i3] = Math.cos(angle) * radius;
      this.particlePositions[i3 + 1] = -1.3 + Math.random() * 3.4;
      this.particlePositions[i3 + 2] = Math.sin(angle) * radius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    // Circular soft glowing particle canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 238, 205, 1)');
    grad.addColorStop(0.25, 'rgba(235, 195, 130, 0.7)');
    grad.addColorStop(0.65, 'rgba(185, 140, 80, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.045,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffe1b0,
      opacity: 0.8,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  /**
   * Procedural Limestone Texture for Carved Pinnacle (Smooth limestone)
   */
  private createPinnacleLimestoneMaterial(): THREE.MeshStandardMaterial {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Warm sun-bleached limestone tone (Pietra di Ostuni / Ceglie)
    ctx.fillStyle = '#E5DDD0';
    ctx.fillRect(0, 0, size, size);

    // Calcarenite grains & micro-pores
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 1.5 + 0.3;
      const shade = Math.random();

      if (shade > 0.6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; // Calcite crystal sparkles
      } else if (shade > 0.3) {
        ctx.fillStyle = 'rgba(195, 185, 170, 0.25)'; // Warm sandy grain
      } else {
        ctx.fillStyle = 'rgba(140, 130, 115, 0.18)'; // Micro fossil pores
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hand-chisel soft marks
    for (let y = 0; y < size; y += 8) {
      if (Math.random() > 0.3) {
        ctx.strokeStyle = `rgba(160, 150, 135, ${Math.random() * 0.08})`;
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + (Math.random() - 0.5) * 6);
        ctx.stroke();
      }
    }

    const diffTexture = new THREE.CanvasTexture(canvas);
    diffTexture.wrapS = THREE.RepeatWrapping;
    diffTexture.wrapT = THREE.RepeatWrapping;

    // Bump Map
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 25000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const isPit = Math.random() > 0.5;
      bCtx.fillStyle = isPit ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.35)';
      bCtx.beginPath();
      bCtx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      bCtx.fill();
    }

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;

    return new THREE.MeshStandardMaterial({
      map: diffTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.06,
      roughness: 0.94, // Completely matte & tactile
      metalness: 0.0,
      color: 0xeee7dc,
    });
  }

  /**
   * Procedural Stacked Stone Blocks Texture (2048x2048)
   * Authentic warm Apulian limestone chiancarelle palette with feathered apex whitewash
   */
  private createSmoothStackedStoneMaterial(): THREE.MeshStandardMaterial {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base warm weathered mortar tone
    ctx.fillStyle = '#423B33';
    ctx.fillRect(0, 0, size, size);

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#22201D';
    bCtx.fillRect(0, 0, size, size);

    // 24 horizontal stone courses matching the 3D physical steps
    const courseCount = 24;
    const courseHeight = size / courseCount;

    // Authentic Apulian limestone palette (warm sand, ivory, calcarenite, subtle sun patina)
    const blockPalette = [
      '#C8BFB2', // Warm sun-bleached calcarenite
      '#BDAFA1', // Natural aged limestone
      '#D5CCC0', // Pale ivory limestone
      '#AEA496', // Warm weathered stone shade
      '#CDC4B8', // Authentic dry-stone cream
      '#9E9385', // Deeper stone grain
      '#DDD5CA', // Sun-lit limestone highlight
      '#C2B8AA', // Golden calcarenite
      '#E6DFD4', // Soft whitewashed limestone
    ];

    for (let c = 0; c < courseCount; c++) {
      const yStart = c * courseHeight;
      const yEnd = yStart + courseHeight;
      const blockH = courseHeight - 3; // 3px dark shadow seam between courses

      // Courses staggered in organic running bond
      const blocksInCourse = 36;
      const avgBlockW = size / blocksInCourse;
      const xOffset = (c % 2) * (avgBlockW * 0.5) + ((c * 19) % 37);

      for (let b = -1; b < blocksInCourse + 2; b++) {
        const jitterW = Math.sin(c * 7.1 + b * 13.3) * 7;
        const blockW = avgBlockW + jitterW;
        const blockX = b * avgBlockW + xOffset;
        const blockY = yStart + 1.5;

        // Choose organic stone color
        const colorIdx = Math.floor(Math.abs(Math.sin(c * 5.3 + b * 7.1)) * blockPalette.length) % blockPalette.length;
        const baseColor = blockPalette[colorIdx];

        // Draw flat stone face
        ctx.fillStyle = baseColor;
        ctx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Bump map: Stone face is elevated
        bCtx.fillStyle = '#C8C8C8';
        bCtx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Top edge catching sunlight
        const topHighlight = ctx.createLinearGradient(0, blockY, 0, blockY + blockH);
        topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        topHighlight.addColorStop(0.35, 'rgba(255, 255, 255, 0.04)');
        topHighlight.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
        ctx.fillStyle = topHighlight;
        ctx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Bump map bevel on stone top/bottom
        const bGrad = bCtx.createLinearGradient(0, blockY, 0, blockY + blockH);
        bGrad.addColorStop(0, '#EEEEEE');
        bGrad.addColorStop(0.3, '#C0C0C0');
        bGrad.addColorStop(1, '#656565');
        bCtx.fillStyle = bGrad;
        bCtx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Micro stone surface noise (pitted calcarenite texture)
        for (let p = 0; p < 28; p++) {
          const px = blockX + Math.random() * blockW;
          const py = blockY + Math.random() * blockH;
          const pr = Math.random() * 1.5 + 0.4;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();

          bCtx.fillStyle = Math.random() > 0.5 ? '#DCDCDC' : '#2A2A2A';
          bCtx.beginPath();
          bCtx.arc(px, py, pr, 0, Math.PI * 2);
          bCtx.fill();
        }

        // Traditional white lime wash on top 4 courses near the apex
        if (c >= courseCount - 4) {
          const limeFactor = (c - (courseCount - 5)) / 4;
          ctx.fillStyle = `rgba(248, 246, 241, ${0.4 + limeFactor * 0.52})`;
          ctx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);
        }
      }

      // Dark horizontal joint line under each course
      ctx.fillStyle = '#2B2620';
      ctx.fillRect(0, yEnd - 2.5, size, 2.5);
      bCtx.fillStyle = '#050505';
      bCtx.fillRect(0, yEnd - 3, size, 3);
    }

    const diffTexture = new THREE.CanvasTexture(canvas);
    diffTexture.wrapS = THREE.RepeatWrapping;
    diffTexture.wrapT = THREE.RepeatWrapping;

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;

    return new THREE.MeshStandardMaterial({
      map: diffTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.065, // Tactile stone relief
      roughness: 0.95, // Truly matte dry stone
      metalness: 0.0,
      color: 0xf2ece4,
    });
  }

  /**
   * Build Sculptural Pinnacle & Stepped Stone Trullo Cone
   */
  private buildSculpturalPinnacle() {
    const pinnacleMaterial = this.createPinnacleLimestoneMaterial();
    const stoneConeMaterial = this.createSmoothStackedStoneMaterial();

    // =========================================================================
    // 1. STEPPED CHIANCARELLE CONE (Muratura a secco a gradoni sovrapposti)
    // Modeled with LatheGeometry to give real 3D physical steps and shadow relief
    // =========================================================================
    const baseRadius = 1.48;
    const topRadius = 0.28;
    const startY = -1.22;
    const topY = 0.78;
    const totalHeight = topY - startY; // 2.0
    const courseCount = 24;
    const courseHeight = totalHeight / courseCount;

    const points: THREE.Vector2[] = [];

    // Bottom seal
    points.push(new THREE.Vector2(0, startY));
    points.push(new THREE.Vector2(baseRadius + 0.04, startY));

    // Generate authentic stepped courses
    for (let c = 0; c < courseCount; c++) {
      const t0 = c / courseCount;
      const t1 = (c + 1) / courseCount;
      const y0 = startY + c * courseHeight;
      const y1 = startY + (c + 1) * courseHeight;

      // Gentle bell curve entasis of traditional Apulian trullo cone
      const r0 = topRadius + (baseRadius - topRadius) * Math.pow(1 - t0, 1.05);
      const r1 = topRadius + (baseRadius - topRadius) * Math.pow(1 - t1, 1.05);

      // Overhang of the stone slab ledge (catching physical grazing shadows)
      const overhang = 0.020 * (1 - t0 * 0.45);

      // Point 1: Overhanging lower rim of the chiancarella slab
      points.push(new THREE.Vector2(r0 + overhang, y0));
      // Point 2: Sloped outer face of the stone slab
      points.push(new THREE.Vector2(r0 + overhang * 0.35, y0 + courseHeight * 0.75));
      // Point 3: Step inward where this stone slab meets the course above
      points.push(new THREE.Vector2(r1, y1));
    }

    // Top seal point under apex cap
    points.push(new THREE.Vector2(topRadius, topY));

    const coneGeo = new THREE.LatheGeometry(points, 64);
    coneGeo.computeVertexNormals();

    const coneMesh = new THREE.Mesh(coneGeo, stoneConeMaterial);
    coneMesh.castShadow = true;
    coneMesh.receiveShadow = true;
    this.pinnacleGroup.add(coneMesh);

    // =========================================================================
    // 2. APEX MORTAR CAP (Calotta Sommitale in Malta a Calce Sbiancata)
    // Smooth lime mortar capping the apex of the cone, exactly as in Photo 3
    // =========================================================================
    const mortarMaterial = pinnacleMaterial.clone();
    mortarMaterial.color = new THREE.Color(0xf3ede3);
    mortarMaterial.bumpScale = 0.035;
    mortarMaterial.roughness = 0.95;

    const capBottomR = topRadius * 1.025;
    const capTopR = 0.138;
    const capHeight = 0.32;
    const capY = topY + capHeight / 2 - 0.01;

    const capGeo = new THREE.CylinderGeometry(capTopR, capBottomR, capHeight, 64);
    const capMesh = new THREE.Mesh(capGeo, mortarMaterial);
    capMesh.position.y = capY;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    this.pinnacleGroup.add(capMesh);

    // =========================================================================
    // 3. THE SCULPTED LIMESTONE PINNACLE (Directly faithful to pinnacolo.jpg)
    // Structure: Plinth Collar -> Flared Chalice -> Cylindrical Neck -> SPHERE (TOP)
    // STRICTLY NO TRIANGLE OR CUSP ON TOP!
    // =========================================================================

    // A. Plinth Base Collar (Basamento a collare)
    const plinthY = capY + capHeight / 2 + 0.035;
    const plinthGeo = new THREE.CylinderGeometry(0.128, 0.152, 0.08, 64);
    const plinthMesh = new THREE.Mesh(plinthGeo, pinnacleMaterial);
    plinthMesh.position.y = plinthY;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    this.pinnacleGroup.add(plinthMesh);

    // Subtle stone molding ring at the plinth base
    const plinthRingGeo = new THREE.TorusGeometry(0.142, 0.015, 16, 64);
    plinthRingGeo.rotateX(Math.PI / 2);
    const plinthRing = new THREE.Mesh(plinthRingGeo, pinnacleMaterial);
    plinthRing.position.y = plinthY - 0.02;
    this.pinnacleGroup.add(plinthRing);

    // B. Flared Chalice / Goblet Pedestal (Il Calice / Tronco di cono svasato)
    const chaliceHeight = 0.30;
    const chaliceBottomR = 0.086;
    const chaliceTopR = 0.180;
    const chaliceY = plinthY + 0.04 + chaliceHeight / 2;

    const chaliceGeo = new THREE.CylinderGeometry(chaliceTopR, chaliceBottomR, chaliceHeight, 64);
    const chaliceMesh = new THREE.Mesh(chaliceGeo, pinnacleMaterial);
    chaliceMesh.position.y = chaliceY;
    chaliceMesh.castShadow = true;
    chaliceMesh.receiveShadow = true;
    this.pinnacleGroup.add(chaliceMesh);

    // Soft rounded lip on the upper rim of the chalice
    const chaliceRimGeo = new THREE.TorusGeometry(chaliceTopR * 0.98, 0.016, 16, 64);
    chaliceRimGeo.rotateX(Math.PI / 2);
    const chaliceRim = new THREE.Mesh(chaliceRimGeo, pinnacleMaterial);
    chaliceRim.position.y = chaliceY + chaliceHeight / 2;
    this.pinnacleGroup.add(chaliceRim);

    // C. Slender Stone Neck (Colletto cilindrico di raccordo)
    const neckHeight = 0.12;
    const neckR = 0.076;
    const neckY = chaliceY + chaliceHeight / 2 + neckHeight / 2;

    const neckGeo = new THREE.CylinderGeometry(neckR, neckR, neckHeight, 64);
    const neckMesh = new THREE.Mesh(neckGeo, pinnacleMaterial);
    neckMesh.position.y = neckY;
    neckMesh.castShadow = true;
    neckMesh.receiveShadow = true;
    this.pinnacleGroup.add(neckMesh);

    // D. THE ICONIC CROWNING LIMESTONE SPHERE (La Palla Lapidea del Trullo)
    // Ovoid / egg-shaped limestone ball faithful to the authentic Trullo dei Messapi photo
    const sphereRadius = 0.245;
    const sphereY = neckY + neckHeight / 2 + sphereRadius * 0.92;

    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const sphereMesh = new THREE.Mesh(sphereGeo, pinnacleMaterial);
    sphereMesh.position.y = sphereY;
    // Ovoid ratio matching authentic Apulian spherical pinnacle in photo 3
    sphereMesh.scale.set(0.98, 1.06, 0.98);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    this.pinnacleGroup.add(sphereMesh);

    // Center whole sculpture harmoniously in viewport
    this.pinnacleGroup.position.y = -0.22;
  }

  /**
   * Ultra-Fluid Multi-Angle Interaction System
   * - Drag / Swipe: Full 360-degree rotation horizontally + broad vertical tilt (-38 deg to +26 deg)
   * - Inertial Momentum Gliding: smooth physical deceleration when released
   * - Responsive Hover Tilt: wide angular freedom when moving mouse near canvas
   */
  private setupEventListeners() {
    // --- POINTER / MOUSE DRAG ---
    const onPointerDown = (clientX: number, clientY: number) => {
      this.isDragging = true;
      this.previousPointer.x = clientX;
      this.previousPointer.y = clientY;
      this.dragVelocity.x = 0;
      this.dragVelocity.y = 0;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (this.isDragging) {
        const deltaX = clientX - this.previousPointer.x;
        const deltaY = clientY - this.previousPointer.y;

        const rotSpeedX = 0.0075;
        const rotSpeedY = 0.0055;

        this.userRotationY += deltaX * rotSpeedX;
        this.userRotationX = THREE.MathUtils.clamp(
          this.userRotationX + deltaY * rotSpeedY,
          -0.65, // Look down at cone (~ -38 deg)
          0.45   // Look up at pinnacle sphere (~ +26 deg)
        );

        this.dragVelocity.x = deltaX * rotSpeedX;
        this.dragVelocity.y = deltaY * rotSpeedY;

        this.previousPointer.x = clientX;
        this.previousPointer.y = clientY;
      }

      // Track hover coordinates relative to container
      const rect = this.container.getBoundingClientRect();
      const buffer = 180;
      const isInsideOrNear =
        clientX >= rect.left - buffer &&
        clientX <= rect.right + buffer &&
        clientY >= rect.top - buffer &&
        clientY <= rect.bottom + buffer;

      if (isInsideOrNear) {
        this.isHovered = true;
        const relX = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const relY = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        this.targetMouse.x = THREE.MathUtils.clamp(relX, -1.5, 1.5);
        this.targetMouse.y = THREE.MathUtils.clamp(relY, -1.5, 1.5);
      } else {
        this.isHovered = false;
        this.targetMouse.x = 0;
        this.targetMouse.y = 0;
      }
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    // DOM Event Listeners for Mouse
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      onPointerDown(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      onPointerUp();
    };

    // DOM Event Listeners for Touch (Mobile / Tablet)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      onPointerUp();
    };

    this.container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    this.container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      if (this.isDisposed || !this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  }

  /**
   * GSAP Camera and Lighting Choreography on Route Changes
   */
  public setRoute(route: AppRoute) {
    if (this.currentRoute === route) return;
    this.currentRoute = route;

    const config = this.routeConfigs[route] || this.routeConfigs.home;

    // 1. Smooth Camera Move with GSAP
    gsap.to(this.camera.position, {
      x: config.camX,
      y: config.camY,
      z: config.camZ,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        this.camera.lookAt(0, config.lookAtY, 0);
      },
    });

    // 2. Smooth reset / rotation flourish on route change
    gsap.to(this, {
      userRotationY: this.userRotationY + Math.PI * 0.45,
      userRotationX: 0,
      duration: 1.6,
      ease: 'power2.out',
    });

    gsap.to(this.pinnacleGroup.position, {
      y: -0.22 + config.groupOffsetY,
      duration: 1.2,
      ease: 'power2.out',
    });

    // 3. Gentle Scale Breathe
    gsap.timeline()
      .to(this.pinnacleGroup.scale, {
        x: 1.04,
        y: 1.04,
        z: 1.04,
        duration: 0.5,
        ease: 'power1.out',
      })
      .to(this.pinnacleGroup.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 0.9,
        ease: 'power2.inOut',
      });

    // 4. Warm Sun Intensity Shift
    gsap.to(this.sunLight, {
      intensity: config.sunIntensity,
      duration: 1.2,
      ease: 'power1.out',
    });

    // Color transition
    const targetColor = new THREE.Color(config.sunColor);
    gsap.to(this.sunLight.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 1.2,
    });
  }

  /**
   * Render Loop: Silky-Smooth Inertial Drag Orbit + Responsive Hover Lerp
   */
  /**
   * Render Loop: Silky-Smooth Inertial Drag Orbit + Particles + Responsive Hover Lerp
   */
  private animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    // 1. Inertial Glide & Auto-Rotation Physics
    if (!this.isDragging) {
      // Apply momentum decay
      this.userRotationY += this.dragVelocity.x;
      this.userRotationX = THREE.MathUtils.clamp(
        this.userRotationX + this.dragVelocity.y,
        -0.65,
        0.45
      );
      this.dragVelocity.x *= 0.92; // silky smooth friction
      this.dragVelocity.y *= 0.92;

      // When stopped dragging and no hover, resume slow ambient rotation
      if (!this.isHovered && Math.abs(this.dragVelocity.x) < 0.0003) {
        this.userRotationY += 0.0028;
      }
    }

    // 2. High-Fluidity Mouse Hover Lerp (Faster & Broader range)
    const lerpFactor = 0.085;
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * lerpFactor;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * lerpFactor;

    // 3. Combined Rotations (Drag + Hover bias)
    const hoverBiasY = this.isDragging ? 0 : this.mouse.x * 0.45;
    const hoverBiasX = this.isDragging ? 0 : this.mouse.y * 0.32;

    this.pinnacleGroup.rotation.y = this.userRotationY + hoverBiasY;
    this.pinnacleGroup.rotation.x = this.userRotationX + hoverBiasX;
    this.pinnacleGroup.rotation.z = -this.mouse.x * 0.08;

    // 4. Floating Sun Motes Animation (Puglia Summer Evening atmosphere)
    if (this.particles && this.particlePositions) {
      const time = Date.now() * 0.0007;
      const pos = this.particles.geometry.attributes.position.array as Float32Array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Slow gentle upward drift
        pos[i3 + 1] += 0.0012;
        if (pos[i3 + 1] > 2.2) {
          pos[i3 + 1] = -1.3;
        }
        // Subtle organic horizontal sway
        pos[i3] += Math.sin(time + i * 0.5) * 0.0006;
        pos[i3 + 2] += Math.cos(time + i * 0.7) * 0.0006;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Subtle Sun Position Shift to follow rotation angle
    this.sunLight.position.x = 4.2 + Math.cos(this.userRotationY) * 1.1;
    this.sunLight.position.z = 3.5 + Math.sin(this.userRotationY) * 1.1;
    this.sunLight.position.y = 4.5 - this.mouse.y * 0.5;

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Ultra-Cinematic Detail Inspection Choreography
   * - Dynamic FOV Warp & Hyper-Focus Snap
   * - Orbital Camera Flight with Smooth Spatial Arc
   * - Dynamic LookAt Retargeting
   * - Sculptural Pirouette & Tilt
   * - Dynamic Sun Spotlight Flight & Intensity Morph
   */
  public focusDetail(detail: 'overview' | 'sphere' | 'chalice' | 'stones') {
    let targetCam = { x: 0.42, y: 0.38, z: 4.0, lookAtX: 0, lookAtY: 0.25 };
    let targetSun = { x: 4.2, y: 4.5, z: 3.5, intensity: 3.8 };
    let rotFlourish = Math.PI * 0.35;
    let tiltTarget = 0;

    if (detail === 'sphere') {
      // Cinematic low-angle macro shot looking up at the sphere and apex rim
      targetCam = { x: -0.35, y: 1.55, z: 1.85, lookAtX: 0, lookAtY: 1.4 };
      targetSun = { x: 3.2, y: 5.5, z: 2.5, intensity: 4.4 };
      rotFlourish = Math.PI * 0.45;
      tiltTarget = -0.05;
    } else if (detail === 'chalice') {
      // 3/4 hero perspective admiring the sculpted flared goblet and collar
      targetCam = { x: 0.55, y: 0.78, z: 2.1, lookAtX: 0.05, lookAtY: 0.88 };
      targetSun = { x: 4.0, y: 2.8, z: 3.8, intensity: 4.0 };
      rotFlourish = -Math.PI * 0.4;
      tiltTarget = 0.04;
    } else if (detail === 'stones') {
      // Dramatic raking angle to highlight the 24 stepped courses and deep shadows
      targetCam = { x: 1.15, y: -0.15, z: 2.35, lookAtX: 0.1, lookAtY: -0.22 };
      targetSun = { x: 5.2, y: 1.8, z: 2.8, intensity: 4.6 };
      rotFlourish = Math.PI * 0.55;
      tiltTarget = 0.08;
    }

    // Kill any conflicting in-flight tweens
    gsap.killTweensOf(this.camera);
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.currentLookAt);
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.sunLight);
    gsap.killTweensOf(this.sunLight.position);

    // 1. Dynamic FOV Warp & Hyper-Focus Snap
    gsap.timeline()
      .to(this.camera, {
        fov: 43,
        duration: 0.38,
        ease: 'power2.out',
        onUpdate: () => this.camera.updateProjectionMatrix(),
      })
      .to(this.camera, {
        fov: 37,
        duration: 0.95,
        ease: 'expo.out',
        onUpdate: () => this.camera.updateProjectionMatrix(),
      });

    // 2. Orbital Camera Position Flight with Smooth Arc
    gsap.to(this.camera.position, {
      x: targetCam.x,
      y: targetCam.y,
      z: targetCam.z,
      duration: 1.35,
      ease: 'power3.inOut',
    });

    // 3. Dynamic LookAt Retargeting
    gsap.to(this.currentLookAt, {
      x: targetCam.lookAtX,
      y: targetCam.lookAtY,
      duration: 1.35,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(this.currentLookAt.x, this.currentLookAt.y, 0);
      },
    });

    // 4. Sculptural Pirouette & Tilt
    gsap.to(this, {
      userRotationY: this.userRotationY + rotFlourish,
      userRotationX: tiltTarget,
      duration: 1.5,
      ease: 'expo.out',
    });

    // 5. Sun Spotlight Flight & Intensity Morph
    gsap.to(this.sunLight.position, {
      x: targetSun.x,
      y: targetSun.y,
      z: targetSun.z,
      duration: 1.35,
      ease: 'power2.inOut',
    });

    gsap.to(this.sunLight, {
      intensity: targetSun.intensity,
      duration: 1.2,
      ease: 'power1.out',
    });
  }

  public zoomIn() {
    const currentZ = this.camera.position.z;
    if (currentZ > 1.6) {
      gsap.to(this.camera.position, {
        z: currentZ - 0.65,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }

  public zoomOut() {
    const currentZ = this.camera.position.z;
    if (currentZ < 6.0) {
      gsap.to(this.camera.position, {
        z: currentZ + 0.65,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }

  public resetView() {
    this.focusDetail('overview');
  }

  /**
   * Cleanup Memory & VRAM
   */
  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Dispose particles
    if (this.particles) {
      this.particles.geometry.dispose();
      if (Array.isArray(this.particles.material)) {
        this.particles.material.forEach((m) => m.dispose());
      } else {
        this.particles.material.dispose();
      }
      this.scene.remove(this.particles);
    }

    // Dispose geometries, materials, and textures
    this.pinnacleGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if (m.map) m.map.dispose();
            if (m.bumpMap) m.bumpMap.dispose();
            m.dispose();
          });
        } else if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          if (obj.material.bumpMap) obj.material.bumpMap.dispose();
          obj.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
