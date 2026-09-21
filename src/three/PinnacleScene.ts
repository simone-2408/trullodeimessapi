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
      camY: 0.3,
      camZ: 3.8,
      lookAtY: 0.1,
      sunIntensity: 3.2,
      sunColor: 0xffe2bf, // Warm morning sun
      groupOffsetY: 0,
    },
    suites: {
      camX: 0.2,
      camY: 0.7,
      camZ: 3.2, // Closer macro view on the pinnacle collar
      lookAtY: 0.4,
      sunIntensity: 3.5,
      sunColor: 0xffeed6,
      groupOffsetY: -0.15,
    },
    piscina: {
      camX: -0.7,
      camY: 0.2,
      camZ: 3.6,
      lookAtY: 0.1,
      sunIntensity: 3.8,
      sunColor: 0xffd29d, // Golden hour warm reflection
      groupOffsetY: 0,
    },
    esperienza: {
      camX: 0.9,
      camY: -0.1,
      camZ: 3.5,
      lookAtY: 0.2,
      sunIntensity: 3.0,
      sunColor: 0xffdfb8,
      groupOffsetY: -0.1,
    },
    preventivo: {
      camX: 0.4,
      camY: 0.4,
      camZ: 4.0,
      lookAtY: 0.15,
      sunIntensity: 2.9,
      sunColor: 0xffe6cb,
      groupOffsetY: 0,
    },
    contatti: {
      camX: 0.0,
      camY: 0.3,
      camZ: 3.7,
      lookAtY: 0.1,
      sunIntensity: 3.1,
      sunColor: 0xffe4c4,
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

    // 3. RENDERER (Transparent background for seamless side integration)
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
    // Warm ambient light for soft fills
    this.ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    this.scene.add(this.ambientLight);

    // Main grazing directional light at an oblique angle to highlight tactile stone relief
    this.sunLight = new THREE.DirectionalLight(0xffe2bf, 3.2);
    this.sunLight.position.set(4.5, 3.5, 2.5);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Sky fill bounce light (soft cool blue from opposite side for natural realism)
    this.skyLight = new THREE.DirectionalLight(0xa3c5e8, 0.6);
    this.skyLight.position.set(-4.0, -1.5, -2.5);
    this.scene.add(this.skyLight);

    // Warm courtyard ground bounce
    const groundBounce = new THREE.PointLight(0xf7e2c6, 0.8, 8);
    groundBounce.position.set(0, -2.0, 1.5);
    this.scene.add(groundBounce);
  }

  /**
   * Procedural Limestone Texture Generator (Pietra Calcarea Ruvida e Opaca)
   */
  private createLimestoneMaterial(): THREE.MeshStandardMaterial {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base warm limestone tone (Pietra di Ostuni / Ceglie calcarenite)
    ctx.fillStyle = '#EDE6D8';
    ctx.fillRect(0, 0, size, size);

    // 1. Organic mineral grain & micro-specks
    for (let i = 0; i < 45000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 1.8 + 0.3;
      const shade = Math.random();

      if (shade > 0.65) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'; // Calcite crystal sparkles
      } else if (shade > 0.3) {
        ctx.fillStyle = 'rgba(185, 170, 150, 0.22)'; // Warm sandy grain
      } else {
        ctx.fillStyle = 'rgba(125, 110, 95, 0.18)'; // Micro fossil pores
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Chisel marks & fine horizontal dry-stone striations
    for (let y = 0; y < size; y += 4) {
      if (Math.random() > 0.4) {
        ctx.strokeStyle = `rgba(140, 125, 105, ${Math.random() * 0.08})`;
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

    // Separate High-Contrast Bump Map
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    // Stone relief pores & pits
    for (let i = 0; i < 35000; i++) {
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

    // Completely matte, rough Apulian limestone material
    return new THREE.MeshStandardMaterial({
      map: diffTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.08,
      roughness: 0.9, // Very matte & tactile
      metalness: 0.0,
      color: 0xf5efe6,
    });
  }

  /**
   * Procedural Authentic Trullo Pinnacle Sculpture
   */
  private buildSculpturalPinnacle() {
    const stoneMaterial = this.createLimestoneMaterial();

    // Darker chiancarelle material for the stepped stone cone apex
    const chiancarelleMaterial = stoneMaterial.clone();
    chiancarelleMaterial.color = new THREE.Color(0x756d64); // Weathered limestone grey
    chiancarelleMaterial.bumpScale = 0.12;

    // 1. BASE: Apex of the Trullo Cone (5 stepped concentric courses of chiancarelle)
    const coneApexGroup = new THREE.Group();
    const courseCount = 6;
    const baseRadius = 1.35;
    const topRadius = 0.65;
    const coneHeight = 0.9;

    for (let i = 0; i < courseCount; i++) {
      const t = i / courseCount;
      const rBottom = baseRadius - t * (baseRadius - topRadius);
      const rTop = baseRadius - (t + 1 / courseCount) * (baseRadius - topRadius);
      const h = coneHeight / courseCount;

      const layerGeo = new THREE.CylinderGeometry(rTop * 0.98, rBottom, h, 36);
      const layerMesh = new THREE.Mesh(layerGeo, chiancarelleMaterial);
      layerMesh.position.y = -0.85 + i * h + h / 2;
      layerMesh.receiveShadow = true;
      layerMesh.castShadow = true;
      coneApexGroup.add(layerMesh);

      // Slightly protruding ring edge (chiancarella drip slab)
      const dripGeo = new THREE.TorusGeometry(rBottom * 1.01, 0.022, 8, 36);
      dripGeo.rotateX(Math.PI / 2);
      const dripMesh = new THREE.Mesh(dripGeo, chiancarelleMaterial);
      dripMesh.position.y = -0.85 + i * h;
      coneApexGroup.add(dripMesh);
    }
    this.pinnacleGroup.add(coneApexGroup);

    // 2. STONE DRUM / PLINTH (Il Basamento Cilindrico Modanato)
    // Sits directly capping the cone apex
    const plinthHeight = 0.28;
    const plinthRadius = 0.58;
    const plinthGeo = new THREE.CylinderGeometry(plinthRadius * 0.95, plinthRadius, plinthHeight, 48);
    const plinthMesh = new THREE.Mesh(plinthGeo, stoneMaterial);
    plinthMesh.position.y = 0.18;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    this.pinnacleGroup.add(plinthMesh);

    // Decorative molding collar at the base of the plinth
    const plinthTorusGeo = new THREE.TorusGeometry(plinthRadius * 0.98, 0.035, 12, 48);
    plinthTorusGeo.rotateX(Math.PI / 2);
    const plinthTorus = new THREE.Mesh(plinthTorusGeo, stoneMaterial);
    plinthTorus.position.y = 0.05;
    this.pinnacleGroup.add(plinthTorus);

    // 3. DISK / CAPSTONE (Il Collare Scanalato)
    const diskGeo = new THREE.CylinderGeometry(0.52, 0.62, 0.14, 48);
    const diskMesh = new THREE.Mesh(diskGeo, stoneMaterial);
    diskMesh.position.y = 0.38;
    diskMesh.castShadow = true;
    diskMesh.receiveShadow = true;
    this.pinnacleGroup.add(diskMesh);

    // Concave transition neck
    const neckGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.16, 48);
    const neckMesh = new THREE.Mesh(neckGeo, stoneMaterial);
    neckMesh.position.y = 0.52;
    neckMesh.castShadow = true;
    this.pinnacleGroup.add(neckMesh);

    // 4. THE ICONIC LIMESTONE SPHERE (La Sfera Lapidea del Pinnacolo)
    // Finely hand-chiseled spherical centerpiece of the Messapian trullo
    const sphereRadius = 0.42;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 48);
    const sphereMesh = new THREE.Mesh(sphereGeo, stoneMaterial);
    sphereMesh.position.y = 0.95;
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    this.pinnacleGroup.add(sphereMesh);

    // 5. APICAL CUSP / SPINDLE (Il Culmine / Cuspide a Piramide Smussata)
    // Traditional carved stone apex
    const cuspBaseRadius = 0.16;
    const cuspHeight = 0.38;
    const cuspGeo = new THREE.ConeGeometry(cuspBaseRadius, cuspHeight, 16);
    const cuspMesh = new THREE.Mesh(cuspGeo, stoneMaterial);
    cuspMesh.position.y = 1.48;
    cuspMesh.castShadow = true;
    this.pinnacleGroup.add(cuspMesh);

    // Small stone acorn/bead finial on top of the cusp
    const tipGeo = new THREE.SphereGeometry(0.06, 24, 24);
    const tipMesh = new THREE.Mesh(tipGeo, stoneMaterial);
    tipMesh.position.y = 1.68;
    tipMesh.castShadow = true;
    this.pinnacleGroup.add(tipMesh);

    // Group centering
    this.pinnacleGroup.position.y = -0.3;
  }

  /**
   * Mouse Interaction and Lerp Tracking
   */
  private setupEventListeners() {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      // Calculate mouse position relative to container
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Expand detection zone slightly around the container
      const buffer = 150;
      const isInsideOrNear =
        clientX >= rect.left - buffer &&
        clientX <= rect.right + buffer &&
        clientY >= rect.top - buffer &&
        clientY <= rect.bottom + buffer;

      if (isInsideOrNear) {
        this.isHovered = true;
        // Normalized coordinates: -1 to 1 relative to container center
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
      y: -0.3 + config.groupOffsetY,
      duration: 1.2,
      ease: 'power2.out',
    });

    // 3. Gentle Scale Breathe
    gsap.timeline()
      .to(this.pinnacleGroup.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
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
    this.pinnacleGroup.rotation.y += this.isHovered ? 0.001 : 0.0035;

    // Smooth lerp for interactive mouse response
    const lerpFactor = 0.055;
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * lerpFactor;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * lerpFactor;

    // Gentle tactile tilt without losing sight of the sculpture
    this.pinnacleGroup.rotation.x = this.mouse.y * 0.22;
    this.pinnacleGroup.rotation.z = -this.mouse.x * 0.16;

    // Subtle sun position shift to emphasize the grazing light along the stone
    this.sunLight.position.x = 4.5 + this.mouse.x * 0.8;
    this.sunLight.position.y = 3.5 - this.mouse.y * 0.6;

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
