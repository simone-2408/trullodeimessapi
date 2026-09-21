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
    // Soft ambient illumination
    this.ambientLight = new THREE.AmbientLight(0xfff8ee, 0.9);
    this.scene.add(this.ambientLight);

    // Main grazing directional sun light at an oblique angle to highlight individual stone blocks
    this.sunLight = new THREE.DirectionalLight(0xffe8d1, 3.2);
    this.sunLight.position.set(4.5, 4.2, 3.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);

    // Soft sky fill bounce light (Apulian blue sky atmosphere from opposite side)
    this.skyLight = new THREE.DirectionalLight(0x90b9e8, 0.65);
    this.skyLight.position.set(-4.0, -0.8, -2.5);
    this.scene.add(this.skyLight);

    // Courtyard stone bounce light
    const groundBounce = new THREE.PointLight(0xf8e5ce, 0.75, 8);
    groundBounce.position.set(0, -2.2, 1.5);
    this.scene.add(groundBounce);
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
   * Procedural Stacked Stone Blocks Texture on Smooth Cone Surface (2048x2048)
   * The cone geometry is completely smooth and continuous,
   * while the texture renders the stacked rectangular limestone blocks (chiancarelle)
   * with natural color variations and subtle tactile relief.
   */
  private createSmoothStackedStoneMaterial(): THREE.MeshStandardMaterial {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base weathered mortar/shadow tone
    ctx.fillStyle = '#423E38';
    ctx.fillRect(0, 0, size, size);

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#202020'; // Deep crevices in bump map
    bCtx.fillRect(0, 0, size, size);

    // Number of horizontal stone courses
    const courseCount = 28;
    const courseHeight = size / courseCount;

    // Authentic Apulian limestone palette from the real trullo (Photo 3)
    const blockPalette = [
      '#78726A', // Weathered grey limestone
      '#827B72', // Medium taupe grey
      '#8D857A', // Warm sun-touched stone
      '#988F84', // Pale aged cream stone
      '#666159', // Dark shaded stone
      '#6D7360', // Subtle olive lichen stone
      '#A2998C', // Sun-bleached limestone
      '#7C766D', // Neutral calcarenite
    ];

    for (let c = 0; c < courseCount; c++) {
      const yStart = c * courseHeight;
      const yEnd = yStart + courseHeight;
      const blockH = courseHeight - 3; // 3px dark shadow seam between courses

      // Courses are staggered in running bond (offset by half a block)
      const blocksInCourse = 38;
      const avgBlockW = size / blocksInCourse;
      const xOffset = (c % 2) * (avgBlockW * 0.5) + ((c * 17) % 35);

      for (let b = -1; b < blocksInCourse + 2; b++) {
        // Subtle natural width variation for handcrafted stone masonry
        const jitterW = Math.sin(c * 7 + b * 13) * 6;
        const blockW = avgBlockW + jitterW;
        const blockX = b * avgBlockW + xOffset;
        const blockY = yStart + 1.5;

        // Choose organic stone color
        const colorIdx = Math.floor(Math.abs(Math.sin(c * 5.3 + b * 7.1)) * blockPalette.length) % blockPalette.length;
        const baseColor = blockPalette[colorIdx];

        // Draw smooth flat stone face (with 2.5px dark joint between adjacent stones)
        ctx.fillStyle = baseColor;
        ctx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Bump map: Stone block face is elevated (light grey ~200)
        bCtx.fillStyle = '#C8C8C8';
        bCtx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Subtle gradient on each block: top edge catching sunlight
        const topHighlight = ctx.createLinearGradient(0, blockY, 0, blockY + blockH);
        topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        topHighlight.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
        topHighlight.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
        ctx.fillStyle = topHighlight;
        ctx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Bump map bevel on stone top/bottom
        const bGrad = bCtx.createLinearGradient(0, blockY, 0, blockY + blockH);
        bGrad.addColorStop(0, '#EAEAEA');
        bGrad.addColorStop(0.3, '#C0C0C0');
        bGrad.addColorStop(1, '#707070');
        bCtx.fillStyle = bGrad;
        bCtx.fillRect(blockX + 1.5, blockY, blockW - 3, blockH);

        // Micro stone surface noise (pitted limestone texture)
        for (let p = 0; p < 25; p++) {
          const px = blockX + Math.random() * blockW;
          const py = blockY + Math.random() * blockH;
          const pr = Math.random() * 1.5 + 0.4;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();

          bCtx.fillStyle = Math.random() > 0.5 ? '#DCDCDC' : '#303030';
          bCtx.beginPath();
          bCtx.arc(px, py, pr, 0, Math.PI * 2);
          bCtx.fill();
        }

        // Random subtle lichen spot
        if (Math.random() > 0.85) {
          ctx.fillStyle = 'rgba(105, 115, 90, 0.22)';
          ctx.beginPath();
          ctx.arc(blockX + blockW * 0.5, blockY + blockH * 0.45, Math.random() * 6 + 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Dark horizontal joint line under each course
      ctx.fillStyle = '#221F1B';
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
      bumpScale: 0.05, // Subtle, realistic stone relief without physical protrusions
      roughness: 0.95, // Truly matte dry stone
      metalness: 0.0,
      color: 0xe8e2d8,
    });
  }

  /**
   * Build Sculptural Pinnacle & Smooth Stacked-Stone Cone
   */
  private buildSculpturalPinnacle() {
    const pinnacleMaterial = this.createPinnacleLimestoneMaterial();
    const stoneConeMaterial = this.createSmoothStackedStoneMaterial();

    // =========================================================================
    // 1. SMOOTH STACKED-STONE CONE (Superficie Liscia con Texture a Blocchetti)
    // =========================================================================
    const baseRadius = 1.45;
    const topRadius = 0.28;
    const coneHeight = 1.88;
    const startY = -1.15;

    // Smooth truncated cone geometry with 64 segments for an immaculate silhouette
    const coneGeo = new THREE.CylinderGeometry(topRadius, baseRadius, coneHeight, 64, 32, true);
    const coneMesh = new THREE.Mesh(coneGeo, stoneConeMaterial);
    coneMesh.position.y = startY + coneHeight / 2;
    coneMesh.castShadow = true;
    coneMesh.receiveShadow = true;
    this.pinnacleGroup.add(coneMesh);

    // Bottom stone base cap to close the cone underneath
    const bottomCapGeo = new THREE.CircleGeometry(baseRadius, 64);
    bottomCapGeo.rotateX(Math.PI / 2);
    const bottomCapMesh = new THREE.Mesh(
      bottomCapGeo,
      new THREE.MeshBasicMaterial({ color: 0x302c27 })
    );
    bottomCapMesh.position.y = startY;
    this.pinnacleGroup.add(bottomCapMesh);

    // =========================================================================
    // 2. APEX MORTAR CAP (Calotta Sommitale in Malta a Calce Sbiancata)
    // Smooth lime mortar capping the apex of the cone
    // =========================================================================
    const mortarMaterial = pinnacleMaterial.clone();
    mortarMaterial.color = new THREE.Color(0xdad3c6);
    mortarMaterial.bumpScale = 0.05;

    const capHeight = 0.35;
    const capBottomR = topRadius * 1.03;
    const capTopR = 0.13;
    const capY = startY + coneHeight + capHeight / 2 - 0.02;

    const capGeo = new THREE.CylinderGeometry(capTopR, capBottomR, capHeight, 48);
    const capMesh = new THREE.Mesh(capGeo, mortarMaterial);
    capMesh.position.y = capY;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    this.pinnacleGroup.add(capMesh);

    // =========================================================================
    // 3. THE SCULPTED LIMESTONE PINNACLE (Directly faithful to Photo 3)
    // Structure: Plinth Collar -> Flared Chalice -> Cylindrical Neck -> SPHERE (TOP)
    // STRICTLY NO TRIANGLE OR CUSP ON TOP!
    // =========================================================================

    // A. Plinth Base Collar (Basamento a collare)
    const plinthY = capY + capHeight / 2 + 0.04;
    const plinthGeo = new THREE.CylinderGeometry(0.125, 0.145, 0.08, 48);
    const plinthMesh = new THREE.Mesh(plinthGeo, pinnacleMaterial);
    plinthMesh.position.y = plinthY;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    this.pinnacleGroup.add(plinthMesh);

    // Subtle stone ring at the plinth base
    const plinthRingGeo = new THREE.TorusGeometry(0.138, 0.015, 12, 48);
    plinthRingGeo.rotateX(Math.PI / 2);
    const plinthRing = new THREE.Mesh(plinthRingGeo, pinnacleMaterial);
    plinthRing.position.y = plinthY - 0.02;
    this.pinnacleGroup.add(plinthRing);

    // B. Flared Chalice / Goblet Pedestal (Il Calice / Tronco di cono svasato)
    const chaliceHeight = 0.28;
    const chaliceBottomR = 0.088;
    const chaliceTopR = 0.175;
    const chaliceY = plinthY + 0.04 + chaliceHeight / 2;

    const chaliceGeo = new THREE.CylinderGeometry(chaliceTopR, chaliceBottomR, chaliceHeight, 48);
    const chaliceMesh = new THREE.Mesh(chaliceGeo, pinnacleMaterial);
    chaliceMesh.position.y = chaliceY;
    chaliceMesh.castShadow = true;
    chaliceMesh.receiveShadow = true;
    this.pinnacleGroup.add(chaliceMesh);

    // Soft rounded lip on the upper rim of the chalice
    const chaliceRimGeo = new THREE.TorusGeometry(chaliceTopR * 0.98, 0.015, 12, 48);
    chaliceRimGeo.rotateX(Math.PI / 2);
    const chaliceRim = new THREE.Mesh(chaliceRimGeo, pinnacleMaterial);
    chaliceRim.position.y = chaliceY + chaliceHeight / 2;
    this.pinnacleGroup.add(chaliceRim);

    // C. Slender Stone Neck (Colletto cilindrico di raccordo)
    const neckHeight = 0.13;
    const neckR = 0.076;
    const neckY = chaliceY + chaliceHeight / 2 + neckHeight / 2;

    const neckGeo = new THREE.CylinderGeometry(neckR, neckR, neckHeight, 48);
    const neckMesh = new THREE.Mesh(neckGeo, pinnacleMaterial);
    neckMesh.position.y = neckY;
    neckMesh.castShadow = true;
    neckMesh.receiveShadow = true;
    this.pinnacleGroup.add(neckMesh);

    // D. THE ICONIC CROWNING LIMESTONE SPHERE (La Palla Lapidea del Trullo)
    // The supreme crowning element - strictly NO cone or triangle above it!
    const sphereRadius = 0.245;
    const sphereY = neckY + neckHeight / 2 + sphereRadius * 0.88;

    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 48);
    const sphereMesh = new THREE.Mesh(sphereGeo, pinnacleMaterial);
    sphereMesh.position.y = sphereY;
    // Slightly oblate (1.03, 0.96, 1.03) to match hand-sculpted rustic stone sphere
    sphereMesh.scale.set(1.03, 0.96, 1.03);
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

    // 4. Subtle Sun Position Shift to follow the rotation angle
    this.sunLight.position.x = 4.5 + Math.cos(this.userRotationY) * 1.2;
    this.sunLight.position.z = 3.2 + Math.sin(this.userRotationY) * 1.2;
    this.sunLight.position.y = 4.2 - this.mouse.y * 0.5;

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Cleanup Memory & VRAM
   */
  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
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
