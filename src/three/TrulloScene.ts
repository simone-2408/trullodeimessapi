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

  // Procedural Textures & Materials (disposed on cleanup)
  private stoneConeMaterial!: THREE.MeshStandardMaterial;
  private limeWallMaterial!: THREE.MeshStandardMaterial;
  private chiancheFloorMaterial!: THREE.MeshStandardMaterial;
  private murettoMaterial!: THREE.MeshStandardMaterial;
  private texturesToDispose: THREE.Texture[] = [];

  // Route Camera Poses
  private cameraPoses: Record<AppRoute, CameraPose> = {
    home: {
      position: new THREE.Vector3(0, 4.8, 13.8),
      target: new THREE.Vector3(0, 2.0, 0),
      fov: 46,
    },
    suites: {
      position: new THREE.Vector3(-1.6, 2.2, 7.2),
      target: new THREE.Vector3(0, 2.1, 0),
      fov: 50,
    },
    piscina: {
      position: new THREE.Vector3(5.2, 1.9, 5.5),
      target: new THREE.Vector3(3.8, 0.4, -0.6),
      fov: 48,
    },
    esperienza: {
      position: new THREE.Vector3(-6.2, 3.0, 8.2),
      target: new THREE.Vector3(-1.8, 1.8, 0),
      fov: 52,
    },
    preventivo: {
      position: new THREE.Vector3(4.8, 3.8, 11.5),
      target: new THREE.Vector3(0, 1.8, 0),
      fov: 44,
    },
    contatti: {
      position: new THREE.Vector3(-3.2, 3.6, 11.0),
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
    this.scene.fog = new THREE.FogExp2('#FAF8F5', 0.032);

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

    // Generate Procedural Textures for authentic stone grooves & whitewash
    this.generateProceduralTextures();

    // Build the 3D World
    this.setupLighting();
    this.buildTerrain();
    this.buildHighDetailTrulliEstate();
    this.buildPoolAndJacuzzi();
    this.setupGoldenDust();
    this.setupHotspots();

    // Event Listeners
    this.bindEvents();

    // Start Render Loop
    this.animate();
  }

  // --- PROCEDURAL HIGH-RES TEXTURE GENERATION ---
  private generateProceduralTextures(): void {
    // 1. Chiancarelle Stone Roof Grooves & Bump Map
    const coneCanvas = document.createElement('canvas');
    coneCanvas.width = 1024;
    coneCanvas.height = 1024;
    const ctx = coneCanvas.getContext('2d')!;

    // Base weathered limestone color
    ctx.fillStyle = '#6E6B65';
    ctx.fillRect(0, 0, 1024, 1024);

    // Horizontal courses of layered stone slabs ("chiancarelle")
    const numCourses = 36;
    const rowHeight = 1024 / numCourses;

    for (let r = 0; r < numCourses; r++) {
      const y = r * rowHeight;
      const shade = 105 + Math.floor(Math.sin(r * 0.7) * 20);
      ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 8})`;
      ctx.fillRect(0, y, 1024, rowHeight - 2);

      // Deep shadow groove between courses
      ctx.fillStyle = 'rgba(25, 24, 22, 0.75)';
      ctx.fillRect(0, y + rowHeight - 3, 1024, 3);

      // Top highlight rim on each stone slab
      ctx.fillStyle = 'rgba(215, 205, 190, 0.45)';
      ctx.fillRect(0, y, 1024, 2);

      // Vertical dry-stone cracks and joints
      const stonesInRow = 14 + (r % 6);
      const stoneWidth = 1024 / stonesInRow;
      const offset = (r * 37) % stoneWidth;

      for (let s = 0; s < stonesInRow; s++) {
        const x = (s * stoneWidth + offset) % 1024;
        ctx.fillStyle = 'rgba(30, 28, 25, 0.65)';
        ctx.fillRect(x, y, 2.5, rowHeight - 2);
      }
    }

    // Add noise grain & natural stone speckling
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const alpha = Math.random() * 0.25;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }

    const coneTex = new THREE.CanvasTexture(coneCanvas);
    coneTex.wrapS = THREE.RepeatWrapping;
    coneTex.wrapT = THREE.RepeatWrapping;
    coneTex.repeat.set(2, 1);
    this.texturesToDispose.push(coneTex);

    // Dedicated Bump Map for stone relief
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    for (let r = 0; r < numCourses; r++) {
      const y = r * rowHeight;
      // Protruding stone face (white)
      bCtx.fillStyle = '#D0D0D0';
      bCtx.fillRect(0, y + 2, 1024, rowHeight - 4);
      // Deep recessed groove (black)
      bCtx.fillStyle = '#202020';
      bCtx.fillRect(0, y + rowHeight - 3, 1024, 3);
    }
    const coneBump = new THREE.CanvasTexture(bumpCanvas);
    coneBump.wrapS = THREE.RepeatWrapping;
    coneBump.wrapT = THREE.RepeatWrapping;
    coneBump.repeat.set(2, 1);
    this.texturesToDispose.push(coneBump);

    this.stoneConeMaterial = new THREE.MeshStandardMaterial({
      map: coneTex,
      bumpMap: coneBump,
      bumpScale: 0.18,
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true,
    });

    // 2. Whitewashed Lime Plaster Wall Texture ("Calce Viva Pugliese")
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext('2d')!;
    wCtx.fillStyle = '#FAF8F5';
    wCtx.fillRect(0, 0, 512, 512);

    // Subtle trowel stroke variations & micropits
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 4 + Math.random() * 20;
      const h = 2 + Math.random() * 8;
      const val = 240 + Math.random() * 15;
      wCtx.fillStyle = `rgb(${val}, ${val - 2}, ${val - 5})`;
      wCtx.fillRect(x, y, w, h);
    }

    const wallTex = new THREE.CanvasTexture(wallCanvas);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(3, 2);
    this.texturesToDispose.push(wallTex);

    this.limeWallMaterial = new THREE.MeshStandardMaterial({
      color: '#FAF8F5',
      map: wallTex,
      roughness: 0.88,
      metalness: 0.02,
    });

    // 3. "Chianche" Stone Flagstone Texture for Courtyard
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#E8DEC8';
    fCtx.fillRect(0, 0, 512, 512);

    // Grid of irregular stone pavers
    const cols = 8;
    const rows = 8;
    const tileW = 512 / cols;
    const tileH = 512 / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * tileW;
        const y = j * tileH;
        const colVar = 225 + Math.floor(Math.random() * 25);
        fCtx.fillStyle = `rgb(${colVar}, ${colVar - 8}, ${colVar - 20})`;
        fCtx.fillRect(x + 2, y + 2, tileW - 4, tileH - 4);

        // Dark mortar joints
        fCtx.fillStyle = '#6E6455';
        fCtx.fillRect(x, y, tileW, 2);
        fCtx.fillRect(x, y, 2, tileH);
      }
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 4);
    this.texturesToDispose.push(floorTex);

    this.chiancheFloorMaterial = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.82,
      metalness: 0.03,
    });

    // 4. Muretti a Secco Texture
    this.murettoMaterial = new THREE.MeshStandardMaterial({
      color: '#CFC5B4',
      roughness: 0.95,
      flatShading: true,
    });
  }

  // --- LIGHTING ---
  private setupLighting(): void {
    const hemiLight = new THREE.HemisphereLight('#FFF5E6', '#9AB4CB', 0.95);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Warm golden hour sunlight casting dramatic shadows
    const sunLight = new THREE.DirectionalLight('#FFD199', 2.6);
    sunLight.position.set(16, 14, 11);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#D8E5F0', 0.85);
    rimLight.position.set(-14, 8, -8);
    this.scene.add(rimLight);

    // Warm ambient point lights at entrances
    const lanternPositions = [
      new THREE.Vector3(0, 1.4, 2.3),
      new THREE.Vector3(-4.0, 1.3, 2.0),
      new THREE.Vector3(4.0, 1.3, 2.0),
    ];

    lanternPositions.forEach((pos) => {
      const pLight = new THREE.PointLight('#FFA742', 1.8, 7, 1.8);
      pLight.position.copy(pos);
      this.scene.add(pLight);
      this.lanternLights.push(pLight);
    });
  }

  // --- TERRAIN & ENVIRONMENT ---
  private buildTerrain(): void {
    // Ground plane (Apulian red-tinted soil / countryside)
    const groundGeo = new THREE.PlaneGeometry(60, 60, 16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#E8DEC8',
      roughness: 0.92,
      metalness: 0.02,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Raised courtyard terrace in authentic "Chianche" flagstones
    const courtyardGeo = new THREE.BoxGeometry(19, 0.25, 13);
    const courtyard = new THREE.Mesh(courtyardGeo, this.chiancheFloorMaterial);
    courtyard.position.set(0, 0.125, 0.6);
    courtyard.receiveShadow = true;
    this.scene.add(courtyard);

    // Dry-stone walls ("Muretti a secco")
    this.buildDryStoneWalls();

    // Sculptural Olive Trees
    this.buildOliveTrees();
  }

  private buildDryStoneWalls(): void {
    const wallCoords = [
      { x: -9.5, z: -3, w: 0.7, h: 0.95, l: 8 },
      { x: -9.5, z: 4.5, w: 0.7, h: 0.85, l: 6 },
      { x: 9.5, z: -3, w: 0.7, h: 0.95, l: 8 },
      { x: 9.5, z: 4.5, w: 0.7, h: 0.85, l: 6 },
      { x: 0, z: -6.0, w: 19, h: 1.15, l: 0.7 },
    ];

    wallCoords.forEach((wc) => {
      const wallGeo = new THREE.BoxGeometry(wc.w, wc.h, wc.l);
      const wall = new THREE.Mesh(wallGeo, this.murettoMaterial);
      wall.position.set(wc.x, wc.h / 2, wc.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);

      // Coping stone slab on top of dry-stone wall
      const copingGeo = new THREE.BoxGeometry(wc.w + 0.1, 0.08, wc.l + 0.1);
      const coping = new THREE.Mesh(copingGeo, this.chiancheFloorMaterial);
      coping.position.set(wc.x, wc.h + 0.04, wc.z);
      coping.castShadow = true;
      this.scene.add(coping);
    });
  }

  private buildOliveTrees(): void {
    const trunkMat = new THREE.MeshStandardMaterial({
      color: '#554738',
      roughness: 0.92,
      flatShading: true,
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: '#607255',
      roughness: 0.75,
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

      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 2.3, 7);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.15;
      trunk.rotation.z = (Math.random() - 0.5) * 0.25;
      trunk.rotation.x = (Math.random() - 0.5) * 0.25;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliageGeo = new THREE.DodecahedronGeometry(1.25, 1);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 2.7;
      foliage.castShadow = true;
      tree.add(foliage);

      const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 1), foliageMat);
      f2.position.set(0.65, 2.4, 0.45);
      f2.castShadow = true;
      tree.add(f2);

      this.scene.add(tree);
    });
  }

  // --- HYPER-DETAILED PROCEDURAL TRULLI ESTATE ---
  private buildHighDetailTrulliEstate(): void {
    const woodMat = new THREE.MeshStandardMaterial({ color: '#4B3621', roughness: 0.75 });
    const ironMat = new THREE.MeshStandardMaterial({ color: '#2B2B2B', roughness: 0.5, metalness: 0.7 });
    const terracottaMat = new THREE.MeshStandardMaterial({ color: '#B35D38', roughness: 0.8 });

    // 1. SUITE TRULLO QUERCIA (Central Grand Trullo with 3 Stone Cones)
    const querciaGroup = new THREE.Group();
    querciaGroup.position.set(0, 0, 0);

    // Whitewashed base cylinder with stone cornice
    const baseCentralGeo = new THREE.CylinderGeometry(2.35, 2.45, 2.4, 32);
    const baseCentral = new THREE.Mesh(baseCentralGeo, this.limeWallMaterial);
    baseCentral.position.y = 1.2;
    baseCentral.castShadow = true;
    baseCentral.receiveShadow = true;
    querciaGroup.add(baseCentral);

    // Projecting stone drip cornice ("Cornicione a beccatelli")
    const corniceGeo = new THREE.CylinderGeometry(2.55, 2.4, 0.16, 32);
    const cornice = new THREE.Mesh(corniceGeo, this.chiancheFloorMaterial);
    cornice.position.y = 2.4 + 0.08;
    cornice.castShadow = true;
    querciaGroup.add(cornice);

    // Central Stone Cone with Tiered Overlapping Rings ("Chiancarelle")
    const centralConeGroup = this.buildTieredChiancarelleCone(2.5, 3.0, 10);
    centralConeGroup.position.y = 2.48;
    querciaGroup.add(centralConeGroup);

    // Traditional Apulian Sun Symbol on Central Cone (whitewashed emblem)
    const symbolGroup = this.createApulianSunSymbol();
    symbolGroup.position.set(0, 3.6, 1.7);
    symbolGroup.rotation.x = 0.48;
    querciaGroup.add(symbolGroup);

    // Grand sculpted pinnacle ("Pinnacolo")
    const pinnacleCentral = this.createSculptedPinnacle();
    pinnacleCentral.position.y = 2.48 + 3.0;
    querciaGroup.add(pinnacleCentral);

    // Left Secondary Cone (Quercia Master Bed 2)
    const baseLeftGeo = new THREE.CylinderGeometry(1.45, 1.55, 2.0, 24);
    const baseLeft = new THREE.Mesh(baseLeftGeo, this.limeWallMaterial);
    baseLeft.position.set(-2.2, 1.0, 0.4);
    baseLeft.castShadow = true;
    baseLeft.receiveShadow = true;
    querciaGroup.add(baseLeft);

    const leftCornice = new THREE.CylinderGeometry(1.62, 1.5, 0.12, 24);
    const leftC = new THREE.Mesh(leftCornice, this.chiancheFloorMaterial);
    leftC.position.set(-2.2, 2.0 + 0.06, 0.4);
    querciaGroup.add(leftC);

    const leftConeGroup = this.buildTieredChiancarelleCone(1.6, 2.1, 7);
    leftConeGroup.position.set(-2.2, 2.06, 0.4);
    querciaGroup.add(leftConeGroup);

    const pinLeft = this.createSculptedPinnacle();
    pinLeft.position.set(-2.2, 2.06 + 2.1, 0.4);
    pinLeft.scale.setScalar(0.75);
    querciaGroup.add(pinLeft);

    // Right Secondary Cone (Quercia Master Bed 3)
    const baseRightGeo = new THREE.CylinderGeometry(1.45, 1.55, 2.0, 24);
    const baseRight = new THREE.Mesh(baseRightGeo, this.limeWallMaterial);
    baseRight.position.set(2.2, 1.0, 0.4);
    baseRight.castShadow = true;
    baseRight.receiveShadow = true;
    querciaGroup.add(baseRight);

    const rightCornice = new THREE.CylinderGeometry(1.62, 1.5, 0.12, 24);
    const rightC = new THREE.Mesh(rightCornice, this.chiancheFloorMaterial);
    rightC.position.set(2.2, 2.0 + 0.06, 0.4);
    querciaGroup.add(rightC);

    const rightConeGroup = this.buildTieredChiancarelleCone(1.6, 2.1, 7);
    rightConeGroup.position.set(2.2, 2.06, 0.4);
    querciaGroup.add(rightConeGroup);

    const pinRight = this.createSculptedPinnacle();
    pinRight.position.set(2.2, 2.06 + 2.1, 0.4);
    pinRight.scale.setScalar(0.75);
    querciaGroup.add(pinRight);

    // Arched Stone Portal & Wooden Door with Iron Details
    const portalArch = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.08, 8, 16, Math.PI),
      this.chiancheFloorMaterial
    );
    portalArch.position.set(0, 1.45, 2.42);
    querciaGroup.add(portalArch);

    const doorGeo = new THREE.BoxGeometry(0.85, 1.45, 0.08);
    const door = new THREE.Mesh(doorGeo, woodMat);
    door.position.set(0, 0.72, 2.4);
    door.castShadow = true;
    querciaGroup.add(door);

    // Iron ring handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), ironMat);
    handle.position.set(0.25, 0.7, 2.46);
    querciaGroup.add(handle);

    // Wall Lantern beside entrance
    this.addWroughtIronLantern(querciaGroup, new THREE.Vector3(0.7, 1.45, 2.35));

    // Terracotta Plant Pots ("Capasoni") outside
    const pot1 = this.createTerracottaPlanter(terracottaMat);
    pot1.position.set(-0.9, 0.25, 2.5);
    querciaGroup.add(pot1);

    const pot2 = this.createTerracottaPlanter(terracottaMat);
    pot2.position.set(0.9, 0.25, 2.5);
    querciaGroup.add(pot2);

    this.estateGroup.add(querciaGroup);

    // 2. MINI SUITE CORBEZZOLO (Left Stone Lamia + Stone Cone + Pergola)
    const corbezzoloGroup = new THREE.Group();
    corbezzoloGroup.position.set(-5.3, 0, 0.8);

    const lamiaCorbGeo = new THREE.BoxGeometry(2.9, 2.15, 2.9);
    const lamiaCorb = new THREE.Mesh(lamiaCorbGeo, this.limeWallMaterial);
    lamiaCorb.position.y = 1.075;
    lamiaCorb.castShadow = true;
    lamiaCorb.receiveShadow = true;
    corbezzoloGroup.add(lamiaCorb);

    const corbCornice = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.12, 3.05), this.chiancheFloorMaterial);
    corbCornice.position.y = 2.15 + 0.06;
    corbezzoloGroup.add(corbCornice);

    const coneCorb = this.buildTieredChiancarelleCone(1.35, 1.85, 7);
    coneCorb.position.set(0.2, 2.22, 0);
    corbezzoloGroup.add(coneCorb);

    const pinCorb = this.createSculptedPinnacle();
    pinCorb.position.set(0.2, 2.22 + 1.85, 0);
    pinCorb.scale.setScalar(0.65);
    corbezzoloGroup.add(pinCorb);

    this.addPergola(corbezzoloGroup, new THREE.Vector3(0, 0, 1.85));
    this.addWroughtIronLantern(corbezzoloGroup, new THREE.Vector3(-0.6, 1.35, 1.5));

    this.estateGroup.add(corbezzoloGroup);

    // 3. MINI SUITE MELOGRANO (Right Stone Lamia + Stone Cone + Pergola)
    const melogranoGroup = new THREE.Group();
    melogranoGroup.position.set(5.3, 0, 0.8);

    const lamiaMeloGeo = new THREE.BoxGeometry(2.9, 2.15, 2.9);
    const lamiaMelo = new THREE.Mesh(lamiaMeloGeo, this.limeWallMaterial);
    lamiaMelo.position.y = 1.075;
    lamiaMelo.castShadow = true;
    lamiaMelo.receiveShadow = true;
    melogranoGroup.add(lamiaMelo);

    const meloCornice = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.12, 3.05), this.chiancheFloorMaterial);
    meloCornice.position.y = 2.15 + 0.06;
    melogranoGroup.add(meloCornice);

    const coneMelo = this.buildTieredChiancarelleCone(1.35, 1.85, 7);
    coneMelo.position.set(-0.2, 2.22, 0);
    melogranoGroup.add(coneMelo);

    const pinMelo = this.createSculptedPinnacle();
    pinMelo.position.set(-0.2, 2.22 + 1.85, 0);
    pinMelo.scale.setScalar(0.65);
    melogranoGroup.add(pinMelo);

    this.addPergola(melogranoGroup, new THREE.Vector3(0, 0, 1.85));
    this.addWroughtIronLantern(melogranoGroup, new THREE.Vector3(0.6, 1.35, 1.5));

    this.estateGroup.add(melogranoGroup);
    this.scene.add(this.estateGroup);
  }

  // Builds a cone with real concentric stepped stone tiers ("chiancarelle")
  private buildTieredChiancarelleCone(baseRadius: number, height: number, tiers: number): THREE.Group {
    const group = new THREE.Group();
    const tierHeight = height / tiers;

    for (let i = 0; i < tiers; i++) {
      const tProgress = i / tiers;
      const rBottom = baseRadius * (1 - tProgress * 0.96);
      const rTop = baseRadius * (1 - ((i + 1) / tiers) * 0.96);

      // Slightly protruding stone overhang on each tier
      const tierGeo = new THREE.CylinderGeometry(rTop * 0.98, rBottom * 1.02, tierHeight * 1.05, 24);
      const tierMesh = new THREE.Mesh(tierGeo, this.stoneConeMaterial);
      tierMesh.position.y = i * tierHeight + tierHeight / 2;
      tierMesh.castShadow = true;
      tierMesh.receiveShadow = true;
      group.add(tierMesh);
    }

    return group;
  }

  // Traditional Apulian Sun Symbol in whitewash lime on the stone cone
  private createApulianSunSymbol(): THREE.Group {
    const group = new THREE.Group();
    const symbolMat = new THREE.MeshBasicMaterial({ color: '#FAF8F5', transparent: true, opacity: 0.9 });

    // Central disc
    const center = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), symbolMat);
    group.add(center);

    // 8 rays
    for (let r = 0; r < 8; r++) {
      const angle = (r * Math.PI) / 4;
      const ray = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.22), symbolMat);
      ray.position.set(Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0.01);
      ray.rotation.z = angle + Math.PI / 2;
      group.add(ray);
    }

    return group;
  }

  // Sculpted traditional pinnacle: plinth, ring, sphere, conical finial
  private createSculptedPinnacle(): THREE.Group {
    const group = new THREE.Group();
    const pinMat = new THREE.MeshStandardMaterial({
      color: '#E8DEC8',
      roughness: 0.65,
      metalness: 0.05,
    });

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.14, 16), pinMat);
    plinth.position.y = 0.07;
    plinth.castShadow = true;
    group.add(plinth);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), pinMat);
    sphere.position.y = 0.28;
    sphere.castShadow = true;
    group.add(sphere);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 12), pinMat);
    spire.position.y = 0.5;
    spire.castShadow = true;
    group.add(spire);

    return group;
  }

  private addWroughtIronLantern(parent: THREE.Group, pos: THREE.Vector3): void {
    const lanternMat = new THREE.MeshStandardMaterial({ color: '#2A2A2A', roughness: 0.5, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#FFA845',
      emissive: '#FF8800',
      emissiveIntensity: 0.85,
      roughness: 0.1,
    });

    const lantern = new THREE.Group();
    lantern.position.copy(pos);

    // Wall bracket
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.12), lanternMat);
    lantern.add(bracket);

    // Glowing glass lamp
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.1), glassMat);
    lamp.position.z = 0.08;
    lantern.add(lamp);

    parent.add(lantern);
  }

  private createTerracottaPlanter(mat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.35, 12), mat);
    pot.position.y = 0.175;
    pot.castShadow = true;
    group.add(pot);

    const shrubMat = new THREE.MeshStandardMaterial({ color: '#4E613F', roughness: 0.8 });
    const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 1), shrubMat);
    shrub.position.y = 0.42;
    shrub.castShadow = true;
    group.add(shrub);

    return group;
  }

  private addPergola(parent: THREE.Group, pos: THREE.Vector3): void {
    const beamMat = new THREE.MeshStandardMaterial({ color: '#5C3E21', roughness: 0.8 });
    const pergola = new THREE.Group();
    pergola.position.copy(pos);

    [-1.0, 1.0].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.05, 6), beamMat);
      post.position.set(x, 1.025, 1.0);
      post.castShadow = true;
      pergola.add(post);
    });

    const cross = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), beamMat);
    cross.position.set(0, 2.05, 1.0);
    pergola.add(cross);

    // Transverse rafters
    [-0.8, -0.2, 0.4, 1.0].forEach((rx) => {
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.2), beamMat);
      rafter.position.set(rx, 2.1, 0.5);
      pergola.add(rafter);
    });

    parent.add(pergola);
  }

  // --- PANORAMIC POOL & JACUZZI ---
  private buildPoolAndJacuzzi(): void {
    const poolGroup = new THREE.Group();
    poolGroup.position.set(3.8, 0.02, -1.8);

    const surroundGeo = new THREE.BoxGeometry(6.4, 0.28, 4.4);
    const surround = new THREE.Mesh(surroundGeo, this.chiancheFloorMaterial);
    surround.position.y = 0.14;
    surround.receiveShadow = true;
    poolGroup.add(surround);

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

    const jacuzziGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 24);
    const jacuzziMat = new THREE.MeshStandardMaterial({
      color: '#34B7D6',
      roughness: 0.05,
      metalness: 0.9,
    });
    const jacuzzi = new THREE.Mesh(jacuzziGeo, jacuzziMat);
    jacuzzi.position.set(2.0, 0.24, -1.0);
    poolGroup.add(jacuzzi);

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

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.cameraTarget);

    gsap.to(this.camera.position, {
      x: targetPose.position.x,
      y: targetPose.position.y,
      z: targetPose.position.z,
      duration: 2.2,
      ease: 'power3.inOut',
    });

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
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.mouseVector.x = this.targetMouse.x;
    this.mouseVector.y = this.targetMouse.y;

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

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.04;

    this.camera.position.x += (this.mouse.x * 0.4 - (this.camera.position.x - this.cameraPoses[this.currentRoute].position.x)) * 0.02;
    this.camera.position.y += (-this.mouse.y * 0.2 - (this.camera.position.y - this.cameraPoses[this.currentRoute].position.y)) * 0.02;

    const breathingOffset = Math.sin(elapsedTime * 0.7) * 0.08;
    this.camera.lookAt(
      this.cameraTarget.x,
      this.cameraTarget.y + breathingOffset,
      this.cameraTarget.z
    );

    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.003;
        if (positions[i] > 8) {
          positions[i] = 0.2;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
      this.dustParticles.rotation.y = elapsedTime * 0.02;
    }

    if (this.waterMaterial) {
      this.waterMaterial.roughness = 0.08 + Math.sin(elapsedTime * 2.0) * 0.03;
    }

    this.lanternLights.forEach((light, i) => {
      light.intensity = 1.6 + Math.sin(elapsedTime * 3 + i * 2) * 0.25;
    });

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

  // --- MEMORY DISPOSAL ---
  public dispose(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);

    this.texturesToDispose.forEach((tex) => tex.dispose());
    this.texturesToDispose = [];

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
