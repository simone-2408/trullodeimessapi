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
      camX: 0.55,
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

    // Main grazing directional sun light at an oblique angle to highlight individual stone slabs
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
      bumpScale: 0.07,
      roughness: 0.94, // Completely matte & tactile
      metalness: 0.0,
      color: 0xeee7dc,
    });
  }

  /**
   * Procedural Limestone Slab Material for Chiancarelle Stones
   */
  private createStoneSlabMaterial(): THREE.MeshStandardMaterial {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base weathered stone color
    ctx.fillStyle = '#827C74';
    ctx.fillRect(0, 0, size, size);

    // Weathering grain and chisel marks
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.8 + 0.4;
      const s = Math.random();
      if (s > 0.65) ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      else if (s > 0.3) ctx.fillStyle = 'rgba(170, 160, 145, 0.22)';
      else ctx.fillStyle = 'rgba(70, 65, 58, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Irregular stone striations along the flat face
    for (let y = 0; y < size; y += 4) {
      if (Math.random() > 0.4) {
        ctx.strokeStyle = `rgba(50, 45, 40, ${Math.random() * 0.15})`;
        ctx.lineWidth = Math.random() * 2.5 + 0.8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + (Math.random() - 0.5) * 8);
        ctx.stroke();
      }
    }

    // Lichen and moss patches
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 45 + 15;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(105, 115, 90, 0.25)');
      grad.addColorStop(1, 'rgba(105, 115, 90, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const diffTexture = new THREE.CanvasTexture(canvas);
    diffTexture.wrapS = THREE.RepeatWrapping;
    diffTexture.wrapT = THREE.RepeatWrapping;

    // High relief bump map for individual stone face rough texture
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 35000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const isPit = Math.random() > 0.5;
      bCtx.fillStyle = isPit ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
      bCtx.beginPath();
      bCtx.arc(x, y, Math.random() * 2 + 0.6, 0, Math.PI * 2);
      bCtx.fill();
    }

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;

    return new THREE.MeshStandardMaterial({
      map: diffTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.14,
      roughness: 0.96, // Truly matte rough dry stone
      metalness: 0.0,
      color: 0xffffff, // Base white to multiply with instance colors
    });
  }

  /**
   * Build Real Stacked Dry-Stone Cone (Pietre Impilate a Secco) & Crowning Sphere Pinnacle
   * NO circular rings or toruses!
   * Built out of hundreds of individual stacked limestone slabs (chiancarelle) with natural irregularities.
   */
  private buildSculpturalPinnacle() {
    const pinnacleMaterial = this.createPinnacleLimestoneMaterial();
    const stoneSlabMaterial = this.createStoneSlabMaterial();

    // =========================================================================
    // 1. STACKED DRY-STONE CHIANCARELLE CONE (Pietre Impilate a Secco)
    // =========================================================================
    const courseCount = 20; // 20 tiered stone courses
    const baseRadius = 1.45;
    const topRadius = 0.28;
    const coneHeight = 1.85;
    const startY = -1.15;
    const stoneWidth = 0.175; // average width of an individual chiancarella slab
    const stoneDepth = 0.24; // depth protruding into the roof
    const stoneHeight = coneHeight / courseCount; // slab thickness

    // Base geometry for an individual stone slab with irregular hand-chiseled feel
    const stoneGeo = new THREE.BoxGeometry(stoneWidth, stoneHeight * 1.08, stoneDepth, 2, 1, 2);
    // Subtle vertex jitter for organic chiseled stone shape
    const posAttr = stoneGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      posAttr.setXYZ(
        i,
        vx + (Math.sin(vx * 15 + vy * 20) * 0.006),
        vy + (Math.cos(vz * 18) * 0.004),
        vz + (Math.sin(vy * 22) * 0.006)
      );
    }
    stoneGeo.computeVertexNormals();

    // Calculate total number of stone instances needed
    let totalStoneCount = 0;
    const tierStones: { tier: number; count: number; radius: number; y: number }[] = [];
    for (let c = 0; c < courseCount; c++) {
      const t = c / courseCount;
      const r = baseRadius - t * (baseRadius - topRadius);
      const circ = 2 * Math.PI * r;
      const count = Math.max(8, Math.round(circ / stoneWidth));
      tierStones.push({ tier: c, count, radius: r, y: startY + c * stoneHeight + stoneHeight / 2 });
      totalStoneCount += count;
    }

    // InstancedMesh: Renders all 600+ individual stones in a single GPU draw call!
    const instancedStones = new THREE.InstancedMesh(stoneGeo, stoneSlabMaterial, totalStoneCount);
    instancedStones.castShadow = true;
    instancedStones.receiveShadow = true;

    // Palette of authentic Apulian limestone tones from the real trullo (Photo 3)
    const stonePalette = [
      new THREE.Color(0x767068), // Weathered limestone grey
      new THREE.Color(0x847d74), // Medium taupe grey
      new THREE.Color(0x8f877d), // Warm sun-touched limestone
      new THREE.Color(0x9a9186), // Pale aged cream stone
      new THREE.Color(0x656059), // Shadowed dark slate stone
      new THREE.Color(0x6c7260), // Subtle olive lichen stone
      new THREE.Color(0xa29a8f), // Sun-bleached top stone
    ];

    const dummy = new THREE.Object3D();
    let instanceIdx = 0;

    for (let c = 0; c < tierStones.length; c++) {
      const tier = tierStones[c];
      // Running bond angular offset between courses so stones are staggered
      const angleOffset = (c % 2) * (Math.PI / tier.count) + (c * 0.22);

      for (let s = 0; s < tier.count; s++) {
        const baseAngle = (s / tier.count) * Math.PI * 2 + angleOffset;

        // Natural irregular offset for hand-stacked dry stones
        const radJitter = (Math.sin(s * 13 + c * 17) * 0.022) + ((Math.random() - 0.5) * 0.015);
        const yJitter = (Math.sin(s * 19 + c * 7) * 0.008);
        const r = tier.radius + radJitter;

        const x = Math.cos(baseAngle) * r;
        const z = Math.sin(baseAngle) * r;
        const y = tier.y + yJitter;

        dummy.position.set(x, y, z);

        // Orient stone facing radially outward
        dummy.rotation.y = -baseAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.06;

        // Traditional trullo stone slope: stones pitch slightly downward (~6 deg) for water runoff
        const pitchSlope = 0.12 + (Math.random() - 0.5) * 0.04;
        dummy.rotation.x = Math.sin(baseAngle) * pitchSlope;
        dummy.rotation.z = -Math.cos(baseAngle) * pitchSlope;

        // Subtle scale variation per slab (each stone is unique)
        const scaleW = 0.92 + (Math.sin(s * 9 + c * 11) * 0.12);
        const scaleH = 0.88 + (Math.cos(s * 7 + c * 13) * 0.18);
        const scaleD = 0.95 + (Math.sin(s * 15 + c * 5) * 0.1);
        dummy.scale.set(scaleW, scaleH, scaleD);

        dummy.updateMatrix();
        instancedStones.setMatrixAt(instanceIdx, dummy.matrix);

        // Pick color from natural limestone palette with organic clustering
        const colorIdx = Math.floor(Math.abs(Math.sin(s * 5 + c * 3.7)) * stonePalette.length) % stonePalette.length;
        instancedStones.setColorAt(instanceIdx, stonePalette[colorIdx]);

        instanceIdx++;
      }
    }

    instancedStones.instanceMatrix.needsUpdate = true;
    if (instancedStones.instanceColor) {
      instancedStones.instanceColor.needsUpdate = true;
    }
    this.pinnacleGroup.add(instancedStones);

    // Inner backing core: dark interior masonry to prevent see-through gaps between stacked stones
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x38342f,
      roughness: 0.98,
      metalness: 0.0,
    });
    const innerCoreGeo = new THREE.ConeGeometry(baseRadius * 0.88, coneHeight * 1.02, 36);
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCoreMesh.position.y = startY + coneHeight / 2;
    this.pinnacleGroup.add(innerCoreMesh);

    // =========================================================================
    // 2. APEX MORTAR CAP (Calotta Sommitale in Malta a Calce Sbiancata)
    // Smooth lime mortar capping the apex of the stacked stone cone
    // =========================================================================
    const mortarMaterial = pinnacleMaterial.clone();
    mortarMaterial.color = new THREE.Color(0xdad3c6);
    mortarMaterial.bumpScale = 0.06;

    const capHeight = 0.35;
    const capBottomR = topRadius * 1.05;
    const capTopR = 0.13;
    const capY = startY + coneHeight + capHeight / 2 - 0.02;

    const capGeo = new THREE.CylinderGeometry(capTopR, capBottomR, capHeight, 36);
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
    const plinthGeo = new THREE.CylinderGeometry(0.125, 0.145, 0.08, 36);
    const plinthMesh = new THREE.Mesh(plinthGeo, pinnacleMaterial);
    plinthMesh.position.y = plinthY;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    this.pinnacleGroup.add(plinthMesh);

    // Subtle stone ring at the plinth base
    const plinthRingGeo = new THREE.TorusGeometry(0.138, 0.016, 12, 36);
    plinthRingGeo.rotateX(Math.PI / 2);
    const plinthRing = new THREE.Mesh(plinthRingGeo, pinnacleMaterial);
    plinthRing.position.y = plinthY - 0.02;
    this.pinnacleGroup.add(plinthRing);

    // B. Flared Chalice / Goblet Pedestal (Il Calice / Tronco di cono svasato)
    // As seen in photo 3: tapers from a slender base to a wide flared rim
    const chaliceHeight = 0.28;
    const chaliceBottomR = 0.088;
    const chaliceTopR = 0.175;
    const chaliceY = plinthY + 0.04 + chaliceHeight / 2;

    const chaliceGeo = new THREE.CylinderGeometry(chaliceTopR, chaliceBottomR, chaliceHeight, 36);
    const chaliceMesh = new THREE.Mesh(chaliceGeo, pinnacleMaterial);
    chaliceMesh.position.y = chaliceY;
    chaliceMesh.castShadow = true;
    chaliceMesh.receiveShadow = true;
    this.pinnacleGroup.add(chaliceMesh);

    // Soft rounded lip on the upper rim of the chalice
    const chaliceRimGeo = new THREE.TorusGeometry(chaliceTopR * 0.98, 0.016, 12, 36);
    chaliceRimGeo.rotateX(Math.PI / 2);
    const chaliceRim = new THREE.Mesh(chaliceRimGeo, pinnacleMaterial);
    chaliceRim.position.y = chaliceY + chaliceHeight / 2;
    this.pinnacleGroup.add(chaliceRim);

    // C. Slender Stone Neck (Colletto cilindrico di raccordo)
    const neckHeight = 0.13;
    const neckR = 0.076;
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

    // Center whole sculpture harmoniously in viewport
    this.pinnacleGroup.position.y = -0.22;
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

    // Subtle sun position shift to emphasize grazing light along stone faces
    this.sunLight.position.x = 4.5 + this.mouse.x * 0.8;
    this.sunLight.position.y = 4.2 - this.mouse.y * 0.6;

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
