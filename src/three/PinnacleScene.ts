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

  // Mouse lerp tracking
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };
  private isHovered = false;

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
      camX: 0.6,
      camY: 0.4,
      camZ: 4.2,
      lookAtY: 0.35,
      sunIntensity: 3.2,
      sunColor: 0xffe6cb, // Warm morning Mediterranean sun
      groupOffsetY: 0,
    },
    suites: {
      camX: 0.2,
      camY: 0.9,
      camZ: 3.5, // Closer view highlighting the pinnacle sphere & chalice
      lookAtY: 0.7,
      sunIntensity: 3.5,
      sunColor: 0xfff0dd,
      groupOffsetY: -0.2,
    },
    piscina: {
      camX: -0.7,
      camY: 0.3,
      camZ: 4.0,
      lookAtY: 0.35,
      sunIntensity: 3.8,
      sunColor: 0xffd8aa, // Warm golden reflection
      groupOffsetY: 0,
    },
    esperienza: {
      camX: 0.9,
      camY: 0.2,
      camZ: 3.9,
      lookAtY: 0.4,
      sunIntensity: 3.0,
      sunColor: 0xffe0be,
      groupOffsetY: -0.1,
    },
    preventivo: {
      camX: 0.4,
      camY: 0.5,
      camZ: 4.4,
      lookAtY: 0.35,
      sunIntensity: 3.0,
      sunColor: 0xffebce,
      groupOffsetY: 0,
    },
    contatti: {
      camX: 0.0,
      camY: 0.4,
      camZ: 4.0,
      lookAtY: 0.35,
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

    // 4. GROUP FOR PINNACLE
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
    // Soft warm ambient illumination
    this.ambientLight = new THREE.AmbientLight(0xfff7ec, 0.9);
    this.scene.add(this.ambientLight);

    // Grazing directional sun light at an oblique angle to highlight individual stone reliefs
    this.sunLight = new THREE.DirectionalLight(0xffe6cb, 3.2);
    this.sunLight.position.set(4.5, 4.0, 3.0);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Sky fill bounce light (Apulian blue atmosphere from opposite angle)
    this.skyLight = new THREE.DirectionalLight(0x95bde6, 0.65);
    this.skyLight.position.set(-4.0, -1.0, -2.5);
    this.scene.add(this.skyLight);

    // Ground bounce for courtyard limestone warmth
    const groundBounce = new THREE.PointLight(0xf8e5cc, 0.7, 8);
    groundBounce.position.set(0, -2.2, 1.5);
    this.scene.add(groundBounce);
  }

  /**
   * Procedural Limestone Texture for the Pinnacle (Smooth carved stone)
   */
  private createPinnacleLimestoneMaterial(): THREE.MeshStandardMaterial {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Warm sun-bleached limestone tone matching photo 3
    ctx.fillStyle = '#E5DDD0';
    ctx.fillRect(0, 0, size, size);

    // Mineral specks and calcarenite grain
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 1.6 + 0.3;
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

    // Subtle weathered patina
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 80 + 30;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(150, 140, 125, 0.08)');
      grad.addColorStop(1, 'rgba(150, 140, 125, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
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
      roughness: 0.88, // Very matte & tactile
      metalness: 0.0,
      color: 0xeee7dc,
    });
  }

  /**
   * High-Resolution Procedural Chiancarelle Dry-Stone Texture (2048x2048)
   * Faithfully reproduced from the user's reference photo 3:
   * Layers of rectangular limestone slabs with dark shadow gaps and weathered patina.
   */
  private createChiancarelleMaterial(): THREE.MeshStandardMaterial {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base weathered limestone color
    ctx.fillStyle = '#78736B';
    ctx.fillRect(0, 0, size, size);

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#404040'; // Base depth
    bCtx.fillRect(0, 0, size, size);

    // Number of horizontal stone courses in texture
    const courseCount = 28;
    const courseHeight = size / courseCount;

    for (let c = 0; c < courseCount; c++) {
      const yStart = c * courseHeight;
      const yEnd = yStart + courseHeight;

      // Stagger courses like a brick/stone running bond
      const xOffset = (c % 2) * 55 + (c * 23) % 80;
      const avgBlockWidth = 70 + (c % 5) * 8;
      const blockCount = Math.ceil(size / avgBlockWidth) + 1;

      let currentX = -xOffset;

      for (let b = 0; b < blockCount; b++) {
        const blockW = avgBlockWidth + (Math.sin(c * 7 + b * 13) * 18);
        const blockH = courseHeight - 4; // 4px gap for deep horizontal shadow
        const blockY = yStart + 2;

        // Realistic color variation per stone block (aged grey, taupe, cream)
        const toneRand = Math.random();
        let blockColor = '#7A756D';
        if (toneRand > 0.75) blockColor = '#8D877E'; // lighter sun-exposed stone
        else if (toneRand > 0.45) blockColor = '#6F6A62'; // darker weathered stone
        else if (toneRand > 0.2) blockColor = '#7E766C'; // warm earthen taupe
        else blockColor = '#5F5A53'; // deep aged grey

        // Draw stone slab face
        ctx.fillStyle = blockColor;
        ctx.fillRect(currentX + 1.5, blockY, blockW - 3, blockH);

        // Bump map: Stone face is raised (light grey / white)
        bCtx.fillStyle = '#C8C8C8';
        bCtx.fillRect(currentX + 1.5, blockY, blockW - 3, blockH);

        // Individual stone relief: highlight upper edge of stone
        const grad = ctx.createLinearGradient(0, blockY, 0, blockY + blockH);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.18)'); // Sunlight on top edge
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.22)'); // Shadow at bottom edge
        ctx.fillStyle = grad;
        ctx.fillRect(currentX + 1.5, blockY, blockW - 3, blockH);

        // Bump map bevel on stone edges
        const bGrad = bCtx.createLinearGradient(0, blockY, 0, blockY + blockH);
        bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        bGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
        bCtx.fillStyle = bGrad;
        bCtx.fillRect(currentX + 1.5, blockY, blockW - 3, blockH);

        // Deep vertical joint between stones
        ctx.fillStyle = '#22201D';
        ctx.fillRect(currentX + blockW - 2.5, blockY, 2.5, blockH);
        bCtx.fillStyle = '#050505'; // Deep groove in bump map
        bCtx.fillRect(currentX + blockW - 3, blockY, 3, blockH);

        // Micro stone texture (calcarenite pitting) on this block
        for (let p = 0; p < 35; p++) {
          const px = currentX + Math.random() * blockW;
          const py = blockY + Math.random() * blockH;
          const pr = Math.random() * 1.5 + 0.5;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();

          bCtx.fillStyle = Math.random() > 0.5 ? '#E0E0E0' : '#202020';
          bCtx.beginPath();
          bCtx.arc(px, py, pr, 0, Math.PI * 2);
          bCtx.fill();
        }

        // Lichen spots on random stones
        if (Math.random() > 0.8) {
          ctx.fillStyle = 'rgba(105, 115, 90, 0.22)';
          ctx.beginPath();
          ctx.arc(currentX + blockW * 0.5, blockY + blockH * 0.4, Math.random() * 6 + 3, 0, Math.PI * 2);
          ctx.fill();
        }

        currentX += blockW;
      }

      // Deep horizontal shadow gap beneath the course
      ctx.fillStyle = '#181614';
      ctx.fillRect(0, yEnd - 3, size, 3);
      bCtx.fillStyle = '#000000';
      bCtx.fillRect(0, yEnd - 4, size, 4);
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
      bumpScale: 0.16, // Strong tactile depth for dry-stone relief
      roughness: 0.92, // Completely matte, dry-stone feel
      metalness: 0.0,
      color: 0xded8cc,
    });
  }

  /**
   * Build Sculptural Pinnacle & Stone Cone
   * Directly faithful to the user's reference photo 3:
   * - Stepped concentric courses of dry-stone chiancarelle
   * - Smooth mortar apex cap
   * - Sculpted stone plinth & flared chalice
   * - Cylindrical neck
   * - CROWNING STONE SPHERE (ONLY the ball, NO triangle/cusp above it!)
   */
  private buildSculpturalPinnacle() {
    const pinnacleMaterial = this.createPinnacleLimestoneMaterial();
    const chiancarelleMaterial = this.createChiancarelleMaterial();

    // =========================================================================
    // 1. THE CONE OF THE TRULLO (Cono in Chiancarelle a Secco - Stepped Tiers)
    // =========================================================================
    const coneGroup = new THREE.Group();
    const courseCount = 18;
    const baseRadius = 1.48;
    const topRadius = 0.32;
    const coneHeight = 1.95;
    const startY = -1.15;

    for (let i = 0; i < courseCount; i++) {
      const t = i / courseCount;
      const tNext = (i + 1) / courseCount;
      const rBottom = baseRadius - t * (baseRadius - topRadius);
      const rTop = baseRadius - tNext * (baseRadius - topRadius);
      const h = coneHeight / courseCount;
      const y = startY + i * h + h / 2;

      // Tier cylinder with 48 radial segments
      const layerGeo = new THREE.CylinderGeometry(rTop * 0.97, rBottom, h, 48);
      const layerMesh = new THREE.Mesh(layerGeo, chiancarelleMaterial);
      layerMesh.position.y = y;
      layerMesh.receiveShadow = true;
      layerMesh.castShadow = true;
      coneGroup.add(layerMesh);

      // Overhanging drip stone slab rim (chiancarella protruding edge)
      const dripGeo = new THREE.TorusGeometry(rBottom * 1.018, 0.024, 10, 48);
      dripGeo.rotateX(Math.PI / 2);
      const dripMesh = new THREE.Mesh(dripGeo, chiancarelleMaterial);
      dripMesh.position.y = startY + i * h;
      dripMesh.receiveShadow = true;
      dripMesh.castShadow = true;
      coneGroup.add(dripMesh);
    }
    this.pinnacleGroup.add(coneGroup);

    // =========================================================================
    // 2. APEX MORTAR CAP (Calotta Sommitale Liscia a Calce)
    // Sealing the transition between dry-stone cone and sculpted pinnacle
    // =========================================================================
    const mortarMaterial = pinnacleMaterial.clone();
    mortarMaterial.color = new THREE.Color(0xdcd5c9);
    mortarMaterial.bumpScale = 0.05;

    const capHeight = 0.32;
    const capBottomR = topRadius * 1.02;
    const capTopR = 0.13;
    const capY = startY + coneHeight + capHeight / 2;

    const capGeo = new THREE.CylinderGeometry(capTopR, capBottomR, capHeight, 36);
    const capMesh = new THREE.Mesh(capGeo, mortarMaterial);
    capMesh.position.y = capY;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    this.pinnacleGroup.add(capMesh);

    // =========================================================================
    // 3. THE SCULPTED STONE PINNACLE (Faithful to photo 3)
    // Order from bottom to top: Plinth -> Flared Chalice -> Neck -> SPHERE (TOP)
    // =========================================================================

    // A. Plinth Base Collar (Basamento del pinnacolo)
    const plinthY = capY + capHeight / 2 + 0.04;
    const plinthGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.08, 36);
    const plinthMesh = new THREE.Mesh(plinthGeo, pinnacleMaterial);
    plinthMesh.position.y = plinthY;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    this.pinnacleGroup.add(plinthMesh);

    // Plinth molded ring
    const plinthRingGeo = new THREE.TorusGeometry(0.135, 0.02, 12, 36);
    plinthRingGeo.rotateX(Math.PI / 2);
    const plinthRing = new THREE.Mesh(plinthRingGeo, pinnacleMaterial);
    plinthRing.position.y = plinthY - 0.02;
    this.pinnacleGroup.add(plinthRing);

    // B. Flared Chalice / Goblet Pedestal (Il Calice / Tronco di cono svasato)
    // As in photo 3: tapers from a slender base to a wide flared upper rim
    const chaliceHeight = 0.28;
    const chaliceBottomR = 0.09;
    const chaliceTopR = 0.175;
    const chaliceY = plinthY + 0.04 + chaliceHeight / 2;

    const chaliceGeo = new THREE.CylinderGeometry(chaliceTopR, chaliceBottomR, chaliceHeight, 36);
    const chaliceMesh = new THREE.Mesh(chaliceGeo, pinnacleMaterial);
    chaliceMesh.position.y = chaliceY;
    chaliceMesh.castShadow = true;
    chaliceMesh.receiveShadow = true;
    this.pinnacleGroup.add(chaliceMesh);

    // Rounded lip on the upper rim of the chalice
    const chaliceRimGeo = new THREE.TorusGeometry(chaliceTopR * 0.98, 0.018, 12, 36);
    chaliceRimGeo.rotateX(Math.PI / 2);
    const chaliceRim = new THREE.Mesh(chaliceRimGeo, pinnacleMaterial);
    chaliceRim.position.y = chaliceY + chaliceHeight / 2;
    this.pinnacleGroup.add(chaliceRim);

    // C. Slender Stone Neck (Colletto cilindrico di raccordo)
    const neckHeight = 0.13;
    const neckR = 0.078;
    const neckY = chaliceY + chaliceHeight / 2 + neckHeight / 2;

    const neckGeo = new THREE.CylinderGeometry(neckR, neckR, neckHeight, 36);
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
    // Slightly oblate (1.03, 0.95, 1.03) to match hand-sculpted rustic stone sphere in photo 3
    sphereMesh.scale.set(1.03, 0.96, 1.03);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    this.pinnacleGroup.add(sphereMesh);

    // Position whole group centered harmoniously in viewport
    this.pinnacleGroup.position.y = -0.25;
  }

  /**
   * Mouse Interaction and Lerp Tracking
   */
  private setupEventListeners() {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Detection zone around container
      const buffer = 150;
      const isInsideOrNear =
        clientX >= rect.left - buffer &&
        clientX <= rect.right + buffer &&
        clientY >= rect.top - buffer &&
        clientY <= rect.bottom + buffer;

      if (isInsideOrNear) {
        this.isHovered = true;
        const relX = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const relY = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        this.targetMouse.x = THREE.MathUtils.clamp(relX, -1.2, 1.2);
        this.targetMouse.y = THREE.MathUtils.clamp(relY, -1.2, 1.2);
      } else {
        this.isHovered = false;
        this.targetMouse.x = 0;
        this.targetMouse.y = 0;
      }
    };

    const handleMouseLeave = () => {
      this.isHovered = false;
      this.targetMouse.x = 0;
      this.targetMouse.y = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    this.container.addEventListener('mouseleave', handleMouseLeave);

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

    // 2. Pinnacle Rotation Flourish & Offset Adjustment
    gsap.to(this.pinnacleGroup.rotation, {
      y: this.pinnacleGroup.rotation.y + Math.PI * 0.45,
      duration: 1.6,
      ease: 'power2.out',
    });

    gsap.to(this.pinnacleGroup.position, {
      y: -0.25 + config.groupOffsetY,
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
   * Render Loop: Constant Slow Idle Rotation + Smooth Lerp Mouse Tilt
   */
  private animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Continuous slow idle rotation on Y axis (slows down gracefully when hovered)
    this.pinnacleGroup.rotation.y += this.isHovered ? 0.0012 : 0.0035;

    // Smooth lerp for interactive mouse response
    const lerpFactor = 0.055;
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * lerpFactor;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * lerpFactor;

    // Gentle tactile tilt without losing sight of the sculpture
    this.pinnacleGroup.rotation.x = this.mouse.y * 0.22;
    this.pinnacleGroup.rotation.z = -this.mouse.x * 0.16;

    // Subtle sun position shift to emphasize the grazing light along the stone
    this.sunLight.position.x = 4.5 + this.mouse.x * 0.8;
    this.sunLight.position.y = 4.0 - this.mouse.y * 0.6;

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
