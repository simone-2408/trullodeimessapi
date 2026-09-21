import * as THREE from 'three';
import gsap from 'gsap';
import { AppRoute, CameraPose, HotspotItem } from './types';

export class TrulloScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animId: number | null = null;

  // Camera & Mouse Parallax
  private currentRoute: AppRoute = 'home';
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 1.8, 0);
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };

  // Raycasting & Hotspots
  private raycaster = new THREE.Raycaster();
  private mouseVector = new THREE.Vector2(-999, -999);
  private hotspotMeshes: THREE.Mesh[] = [];
  private hoveredHotspotId: string | null = null;
  private callbacks: {
    onHotspotClick?: (id: 'quercia' | 'corbezzolo' | 'melograno' | 'piscina') => void;
    onHotspotHover?: (id: string | null) => void;
  };

  // Scene Elements
  private estateGroup = new THREE.Group();
  private dustParticles!: THREE.Points;
  private waterMaterial!: THREE.MeshStandardMaterial;
  private lanternLights: THREE.PointLight[] = [];

  // Route Camera Poses
  private cameraPoses: Record<AppRoute, CameraPose> = {
    home: {
      position: new THREE.Vector3(0, 5.2, 14.5),
      target: new THREE.Vector3(0, 2.0, 0),
      fov: 46,
    },
    suites: {
      position: new THREE.Vector3(-1.8, 2.4, 7.8),
      target: new THREE.Vector3(0, 2.2, 0),
      fov: 50,
    },
    piscina: {
      position: new THREE.Vector3(5.5, 2.0, 5.8),
      target: new THREE.Vector3(4.0, 0.4, -0.5),
      fov: 48,
    },
    esperienza: {
      position: new THREE.Vector3(-6.5, 3.2, 8.5),
      target: new THREE.Vector3(-2.0, 1.8, 0),
      fov: 52,
    },
    preventivo: {
      position: new THREE.Vector3(5.0, 4.0, 12.0),
      target: new THREE.Vector3(0, 1.8, 0),
      fov: 44,
    },
    contatti: {
      position: new THREE.Vector3(-3.5, 3.8, 11.5),
      target: new THREE.Vector3(0, 1.8, 0),
      fov: 45,
    },
  };

  // Hotspots definitions
  private hotspotsData: HotspotItem[] = [
    {
      id: 'quercia',
      title: { it: 'Suite Trullo Quercia', en: 'Trullo Quercia Suite' },
      subtitle: { it: 'I Trulli Storici (150 mq)', en: 'Historic Trulli (150 sqm)' },
      position: new THREE.Vector3(0, 3.8, 0),
    },
    {
      id: 'corbezzolo',
      title: { it: 'Mini Suite Corbezzolo', en: 'Corbezzolo Mini Suite' },
      subtitle: { it: 'Lamia & Patio Piscina', en: 'Lamia & Pool Patio' },
      position: new THREE.Vector3(-4.8, 2.5, 1.0),
    },
    {
      id: 'melograno',
      title: { it: 'Mini Suite Melograno', en: 'Melograno Mini Suite' },
      subtitle: { it: 'Charme & Ulivi', en: 'Charm & Olive Grove' },
      position: new THREE.Vector3(4.8, 2.5, 1.0),
    },
    {
      id: 'piscina',
      title: { it: 'Piscina & Jacuzzi', en: 'Pool & Jacuzzi' },
      subtitle: { it: 'Oasi Relax Condivisa', en: 'Shared Serene Oasis' },
      position: new THREE.Vector3(3.8, 1.0, -1.2),
    },
  ];

  constructor(
    container: HTMLElement,
    initialRoute: AppRoute = 'home',
    callbacks: {
      onHotspotClick?: (id: 'quercia' | 'corbezzolo' | 'melograno' | 'piscina') => void;
      onHotspotHover?: (id: string | null) => void;
    } = {}
  ) {
    this.container = container;
    this.currentRoute = initialRoute;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#FAF8F5');
    this.scene.fog = new THREE.FogExp2('#FAF8F5', 0.035);

    const initialPose = this.cameraPoses[initialRoute] || this.cameraPoses.home;
    this.camera = new THREE.PerspectiveCamera(
      initialPose.fov || 46,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.copy(initialPose.position);
    this.cameraTarget.copy(initialPose.target);
    this.camera.lookAt(this.cameraTarget);

    // Renderer with performance optimizations
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Build the 3D World
    this.setupLighting();
    this.buildTerrain();
    this.buildProceduralEstate();
    this.buildPoolAndJacuzzi();
    this.setupGoldenDust();
    this.setupHotspots();

    // Event Listeners
    this.bindEvents();

    // Start Render Loop
    this.animate();
  }

  // --- LIGHTING ---
  private setupLighting(): void {
    // Ambient / Sky Hemisphere light (Golden hour horizon to Mediterranean warm sky)
    const hemiLight = new THREE.HemisphereLight('#FFF5E6', '#9AB4CB', 0.95);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Main Golden Hour Sun (casting warm shadows across stone cones)
    const sunLight = new THREE.DirectionalLight('#FFD199', 2.4);
    sunLight.position.set(15, 12, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Soft sky rim light from opposite side
    const rimLight = new THREE.DirectionalLight('#D8E5F0', 0.8);
    rimLight.position.set(-12, 8, -8);
    this.scene.add(rimLight);

    // Warm lantern entrance lights for suites
    const lanternPositions = [
      new THREE.Vector3(0, 1.4, 1.4), // Quercia entrance
      new THREE.Vector3(-4.0, 1.3, 2.0), // Corbezzolo
      new THREE.Vector3(4.0, 1.3, 2.0), // Melograno
    ];

    lanternPositions.forEach((pos) => {
      const pLight = new THREE.PointLight('#FFA742', 1.8, 6, 1.8);
      pLight.position.copy(pos);
      this.scene.add(pLight);
      this.lanternLights.push(pLight);
    });
  }

  // --- TERRAIN & ENVIRONMENT ---
  private buildTerrain(): void {
    // Ground plane representing Apulian warm limestone patio and red soil
    const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#EFE7DA', // Warm sandstone / calcarenite
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Raised courtyard terrace ("Chianche" stone platform)
    const courtyardGeo = new THREE.BoxGeometry(18, 0.25, 12);
    const courtyardMat = new THREE.MeshStandardMaterial({
      color: '#F4ECE1', // Traditional light chianca stone
      roughness: 0.75,
      metalness: 0.02,
    });
    const courtyard = new THREE.Mesh(courtyardGeo, courtyardMat);
    courtyard.position.set(0, 0.125, 0.5);
    courtyard.receiveShadow = true;
    this.scene.add(courtyard);

    // Dry-stone walls ("Muretti a secco") winding around the boundary
    this.buildDryStoneWalls();

    // Sculptural Olive Trees
    this.buildOliveTrees();
  }

  private buildDryStoneWalls(): void {
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#D8CEBE',
      roughness: 0.95,
    });

    const wallCoords = [
      { x: -9, z: -3, w: 0.6, h: 0.9, l: 8 },
      { x: -9, z: 4, w: 0.6, h: 0.8, l: 6 },
      { x: 9, z: -3, w: 0.6, h: 0.9, l: 8 },
      { x: 9, z: 4, w: 0.6, h: 0.8, l: 6 },
      { x: 0, z: -5.5, w: 18, h: 1.1, l: 0.6 },
    ];

    wallCoords.forEach((wc) => {
      const wallGeo = new THREE.BoxGeometry(wc.w, wc.h, wc.l);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(wc.x, wc.h / 2, wc.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    });
  }

  private buildOliveTrees(): void {
    const trunkMat = new THREE.MeshStandardMaterial({
      color: '#5C5042',
      roughness: 0.9,
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: '#65775B', // Silvery-green olive foliage
      roughness: 0.7,
      flatShading: true,
    });

    const treePositions = [
      { x: -7.5, z: 3.5, scale: 1.2 },
      { x: -8.0, z: -2.0, scale: 1.0 },
      { x: 7.5, z: 3.5, scale: 1.1 },
      { x: 8.5, z: -2.5, scale: 1.3 },
      { x: -2.5, z: -4.5, scale: 0.9 },
      { x: 3.5, z: -4.5, scale: 1.0 },
    ];

    treePositions.forEach((tp) => {
      const tree = new THREE.Group();
      tree.position.set(tp.x, 0, tp.z);
      tree.scale.setScalar(tp.scale);

      // Gnarled twisted trunk
      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.35, 2.2, 7);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.1;
      trunk.rotation.z = (Math.random() - 0.5) * 0.2;
      trunk.rotation.x = (Math.random() - 0.5) * 0.2;
      trunk.castShadow = true;
      tree.add(trunk);

      // Clustered cloud-like foliage
      const foliageGeo = new THREE.DodecahedronGeometry(1.2, 1);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 2.6;
      foliage.castShadow = true;
      tree.add(foliage);

      const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), foliageMat);
      f2.position.set(0.6, 2.3, 0.4);
      f2.castShadow = true;
      tree.add(f2);

      this.scene.add(tree);
    });
  }

  // --- PROCEDURAL APULIAN ESTATE (3 RESIDENCES) ---
  private buildProceduralEstate(): void {
    // 1. SUITE TRULLO QUERCIA (Master Residence - 3 Cones)
    const querciaGroup = new THREE.Group();
    querciaGroup.position.set(0, 0, 0);

    // Whitewashed Lime Base (cylinder / barrel-vaulted core)
    const limeMat = new THREE.MeshStandardMaterial({
      color: '#FAF8F5', // Pure white lime
      roughness: 0.85,
      metalness: 0.02,
    });
    const stoneConeMat = new THREE.MeshStandardMaterial({
      color: '#7C7975', // Traditional grey limestone "chiancarelle"
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#4B3621',
      roughness: 0.7,
    });

    // Central Master Cone
    const baseCentralGeo = new THREE.CylinderGeometry(2.3, 2.4, 2.4, 24);
    const baseCentral = new THREE.Mesh(baseCentralGeo, limeMat);
    baseCentral.position.y = 1.2;
    baseCentral.castShadow = true;
    baseCentral.receiveShadow = true;
    querciaGroup.add(baseCentral);

    const coneCentralGeo = new THREE.ConeGeometry(2.4, 2.8, 24);
    const coneCentral = new THREE.Mesh(coneCentralGeo, stoneConeMat);
    coneCentral.position.y = 2.4 + 1.4;
    coneCentral.castShadow = true;
    coneCentral.receiveShadow = true;
    querciaGroup.add(coneCentral);

    // Decorative Traditional Pinnacle ("Pinnacolo")
    const pinnacleCentral = this.createPinnacle();
    pinnacleCentral.position.y = 2.4 + 2.8;
    querciaGroup.add(pinnacleCentral);

    // Left Flanking Cone (Quercia bedroom 2)
    const baseLeftGeo = new THREE.CylinderGeometry(1.4, 1.5, 2.0, 18);
    const baseLeft = new THREE.Mesh(baseLeftGeo, limeMat);
    baseLeft.position.set(-2.2, 1.0, 0.4);
    baseLeft.castShadow = true;
    baseLeft.receiveShadow = true;
    querciaGroup.add(baseLeft);

    const coneLeftGeo = new THREE.ConeGeometry(1.5, 2.0, 18);
    const coneLeft = new THREE.Mesh(coneLeftGeo, stoneConeMat);
    coneLeft.position.set(-2.2, 2.0 + 1.0, 0.4);
    coneLeft.castShadow = true;
    querciaGroup.add(coneLeft);

    const pinLeft = this.createPinnacle();
    pinLeft.position.set(-2.2, 2.0 + 2.0, 0.4);
    pinLeft.scale.setScalar(0.75);
    querciaGroup.add(pinLeft);

    // Right Flanking Cone (Quercia bedroom 3)
    const baseRightGeo = new THREE.CylinderGeometry(1.4, 1.5, 2.0, 18);
    const baseRight = new THREE.Mesh(baseRightGeo, limeMat);
    baseRight.position.set(2.2, 1.0, 0.4);
    baseRight.castShadow = true;
    baseRight.receiveShadow = true;
    querciaGroup.add(baseRight);

    const coneRightGeo = new THREE.ConeGeometry(1.5, 2.0, 18);
    const coneRight = new THREE.Mesh(coneRightGeo, stoneConeMat);
    coneRight.position.set(2.2, 2.0 + 1.0, 0.4);
    coneRight.castShadow = true;
    querciaGroup.add(coneRight);

    const pinRight = this.createPinnacle();
    pinRight.position.set(2.2, 2.0 + 2.0, 0.4);
    pinRight.scale.setScalar(0.75);
    querciaGroup.add(pinRight);

    // Master Arched Entrance Door
    const doorGeo = new THREE.BoxGeometry(0.8, 1.4, 0.1);
    const door = new THREE.Mesh(doorGeo, woodMat);
    door.position.set(0, 0.7, 2.36);
    door.castShadow = true;
    querciaGroup.add(door);

    this.estateGroup.add(querciaGroup);

    // 2. MINI SUITE CORBEZZOLO (Left Stone Lamia + Small Trullo Cone)
    const corbezzoloGroup = new THREE.Group();
    corbezzoloGroup.position.set(-5.2, 0, 0.8);

    const lamiaCorbezzoloGeo = new THREE.BoxGeometry(2.8, 2.1, 2.8);
    const lamiaCorbezzolo = new THREE.Mesh(lamiaCorbezzoloGeo, limeMat);
    lamiaCorbezzolo.position.y = 1.05;
    lamiaCorbezzolo.castShadow = true;
    lamiaCorbezzolo.receiveShadow = true;
    corbezzoloGroup.add(lamiaCorbezzolo);

    // Side cone on lamia
    const coneCorbGeo = new THREE.ConeGeometry(1.3, 1.8, 16);
    const coneCorb = new THREE.Mesh(coneCorbGeo, stoneConeMat);
    coneCorb.position.set(0.2, 2.1 + 0.9, 0);
    coneCorb.castShadow = true;
    corbezzoloGroup.add(coneCorb);

    const pinCorb = this.createPinnacle();
    pinCorb.position.set(0.2, 2.1 + 1.8, 0);
    pinCorb.scale.setScalar(0.65);
    corbezzoloGroup.add(pinCorb);

    // Wooden pergola on patio
    this.addPergola(corbezzoloGroup, new THREE.Vector3(0, 0, 1.8));

    this.estateGroup.add(corbezzoloGroup);

    // 3. MINI SUITE MELOGRANO (Right Stone Lamia + Small Trullo Cone)
    const melogranoGroup = new THREE.Group();
    melogranoGroup.position.set(5.2, 0, 0.8);

    const lamiaMelogranoGeo = new THREE.BoxGeometry(2.8, 2.1, 2.8);
    const lamiaMelograno = new THREE.Mesh(lamiaMelogranoGeo, limeMat);
    lamiaMelograno.position.y = 1.05;
    lamiaMelograno.castShadow = true;
    lamiaMelograno.receiveShadow = true;
    melogranoGroup.add(lamiaMelograno);

    const coneMeloGeo = new THREE.ConeGeometry(1.3, 1.8, 16);
    const coneMelo = new THREE.Mesh(coneMeloGeo, stoneConeMat);
    coneMelo.position.set(-0.2, 2.1 + 0.9, 0);
    coneMelo.castShadow = true;
    melogranoGroup.add(coneMelo);

    const pinMelo = this.createPinnacle();
    pinMelo.position.set(-0.2, 2.1 + 1.8, 0);
    pinMelo.scale.setScalar(0.65);
    melogranoGroup.add(pinMelo);

    this.addPergola(melogranoGroup, new THREE.Vector3(0, 0, 1.8));

    this.estateGroup.add(melogranoGroup);
    this.scene.add(this.estateGroup);
  }

  private createPinnacle(): THREE.Group {
    const group = new THREE.Group();
    const pinMat = new THREE.MeshStandardMaterial({
      color: '#EFE7DA',
      roughness: 0.7,
    });

    const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.12, 12), pinMat);
    baseDisc.position.y = 0.06;
    group.add(baseDisc);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), pinMat);
    sphere.position.y = 0.24;
    group.add(sphere);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), pinMat);
    tip.position.y = 0.42;
    group.add(tip);

    return group;
  }

  private addPergola(parent: THREE.Group, pos: THREE.Vector3): void {
    const beamMat = new THREE.MeshStandardMaterial({
      color: '#654321',
      roughness: 0.8,
    });
    const pergola = new THREE.Group();
    pergola.position.copy(pos);

    // 2 upright posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6);
    const post1 = new THREE.Mesh(postGeo, beamMat);
    post1.position.set(-1.0, 1.0, 1.0);
    post1.castShadow = true;
    pergola.add(post1);

    const post2 = new THREE.Mesh(postGeo, beamMat);
    post2.position.set(1.0, 1.0, 1.0);
    post2.castShadow = true;
    pergola.add(post2);

    // Cross beams
    const crossGeo = new THREE.BoxGeometry(2.4, 0.08, 0.08);
    const cross = new THREE.Mesh(crossGeo, beamMat);
    cross.position.set(0, 2.0, 1.0);
    pergola.add(cross);

    parent.add(pergola);
  }

  // --- PANORAMIC POOL & JACUZZI ---
  private buildPoolAndJacuzzi(): void {
    const poolGroup = new THREE.Group();
    poolGroup.position.set(3.8, 0.02, -1.8);

    // Stone Pool Deck Surround
    const surroundGeo = new THREE.BoxGeometry(6.4, 0.28, 4.4);
    const surroundMat = new THREE.MeshStandardMaterial({
      color: '#E8DEC8',
      roughness: 0.8,
    });
    const surround = new THREE.Mesh(surroundGeo, surroundMat);
    surround.position.y = 0.14;
    surround.receiveShadow = true;
    poolGroup.add(surround);

    // Swimming Pool Water (Turquoise reflective)
    const waterGeo = new THREE.PlaneGeometry(5.6, 3.6, 24, 24);
    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: '#2896B2',
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    const water = new THREE.Mesh(waterGeo, this.waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.22;
    poolGroup.add(water);

    // Sunken Jacuzzi Hydromassage Corner
    const jacuzziGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 24);
    const jacuzziMat = new THREE.MeshStandardMaterial({
      color: '#34B7D6',
      roughness: 0.05,
      metalness: 0.9,
    });
    const jacuzzi = new THREE.Mesh(jacuzziGeo, jacuzziMat);
    jacuzzi.position.set(2.0, 0.24, -1.0);
    poolGroup.add(jacuzzi);

    // Sunbeds on Poolside
    const bedMat = new THREE.MeshStandardMaterial({ color: '#FAF8F5', roughness: 0.7 });
    [-1.5, -0.5, 0.5].forEach((offset) => {
      const sunbed = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 1.5), bedMat);
      sunbed.position.set(offset, 0.32, 2.6);
      sunbed.castShadow = true;
      poolGroup.add(sunbed);
    });

    this.scene.add(poolGroup);
  }

  // --- FLOATING GOLDEN DUST (ATMOSPHERE) ---
  private setupGoldenDust(): void {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 24;
      positions[i + 1] = Math.random() * 8;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: '#FFE0A3',
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  // --- 3D INTERACTIVE HOTSPOTS ---
  private setupHotspots(): void {
    this.hotspotsData.forEach((data) => {
      const group = new THREE.Group();
      group.position.copy(data.position);

      // Outer Pulsing Ring
      const ringGeo = new THREE.RingGeometry(0.24, 0.28, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#B99470',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = `ring_${data.id}`;
      group.add(ring);

      // Core Interactive Center Sphere
      const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: '#FAF8F5',
        emissive: '#B99470',
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.name = data.id;
      sphere.userData = { hotspotId: data.id, ...data };
      group.add(sphere);

      this.hotspotMeshes.push(sphere);
      this.scene.add(group);
    });
  }

  // --- ROUTE CAMERA TRANSITIONS WITH GSAP ---
  public setRoute(route: AppRoute): void {
    if (this.currentRoute === route) return;
    this.currentRoute = route;

    const targetPose = this.cameraPoses[route] || this.cameraPoses.home;

    // Cinematic camera flight with GSAP
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.cameraTarget);

    // Animate position
    gsap.to(this.camera.position, {
      x: targetPose.position.x,
      y: targetPose.position.y,
      z: targetPose.position.z,
      duration: 2.2,
      ease: 'power3.inOut',
    });

    // Animate lookAt target
    gsap.to(this.cameraTarget, {
      x: targetPose.target.x,
      y: targetPose.target.y,
      z: targetPose.target.z,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(this.cameraTarget);
      },
    });

    // Animate FOV if present
    if (targetPose.fov && this.camera.fov !== targetPose.fov) {
      gsap.to(this.camera, {
        fov: targetPose.fov,
        duration: 2.2,
        ease: 'power3.inOut',
        onUpdate: () => this.camera.updateProjectionMatrix(),
      });
    }
  }

  // --- EVENT LISTENERS ---
  private bindEvents(): void {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('click', this.onPointerClick);
  }

  private onWindowResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private onPointerMove = (e: PointerEvent): void => {
    // Normalized device coordinates (-1 to +1)
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.mouseVector.x = this.targetMouse.x;
    this.mouseVector.y = this.targetMouse.y;

    // Check raycast for hotspots
    this.raycaster.setFromCamera(this.mouseVector, this.camera);
    const intersects = this.raycaster.intersectObjects(this.hotspotMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const id = hit.userData.hotspotId;
      if (this.hoveredHotspotId !== id) {
        this.hoveredHotspotId = id;
        document.body.style.cursor = 'pointer';
        if (this.callbacks.onHotspotHover) {
          this.callbacks.onHotspotHover(id);
        }
      }
    } else {
      if (this.hoveredHotspotId !== null) {
        this.hoveredHotspotId = null;
        document.body.style.cursor = 'default';
        if (this.callbacks.onHotspotHover) {
          this.callbacks.onHotspotHover(null);
        }
      }
    }
  };

  private onPointerClick = (): void => {
    if (this.hoveredHotspotId && this.callbacks.onHotspotClick) {
      this.callbacks.onHotspotClick(this.hoveredHotspotId as any);
    }
  };

  // --- ANIMATION LOOP ---
  private animate = (): void => {
    this.animId = requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    // 1. Mouse Parallax Lerp
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.04;

    // Subtle parallax offset added to camera
    this.camera.position.x += (this.mouse.x * 0.4 - (this.camera.position.x - this.cameraPoses[this.currentRoute].position.x)) * 0.02;
    this.camera.position.y += (-this.mouse.y * 0.2 - (this.camera.position.y - this.cameraPoses[this.currentRoute].position.y)) * 0.02;

    // 2. Idle Organic Breathing Oscillation
    const breathingOffset = Math.sin(elapsedTime * 0.7) * 0.08;
    this.camera.lookAt(
      this.cameraTarget.x,
      this.cameraTarget.y + breathingOffset,
      this.cameraTarget.z
    );

    // 3. Golden Dust Floating Motion
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.003; // Gentle upward drift
        if (positions[i] > 8) {
          positions[i] = 0.2;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
      this.dustParticles.rotation.y = elapsedTime * 0.02;
    }

    // 4. Subtle Water Shimmer
    if (this.waterMaterial) {
      this.waterMaterial.roughness = 0.08 + Math.sin(elapsedTime * 2.0) * 0.03;
    }

    // 5. Lantern Point Lights Flicker
    this.lanternLights.forEach((light, i) => {
      light.intensity = 1.6 + Math.sin(elapsedTime * 3 + i * 2) * 0.25;
    });

    // 6. Hotspots Billboard and Pulse
    this.hotspotsData.forEach((data) => {
      const ring = this.scene.getObjectByName(`ring_${data.id}`);
      if (ring) {
        ring.quaternion.copy(this.camera.quaternion);
        const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.15;
        ring.scale.set(pulse, pulse, pulse);
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  // --- MEMORY CLEANUP & DISPOSAL ---
  public dispose(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);

    // Recursive scene disposal
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
