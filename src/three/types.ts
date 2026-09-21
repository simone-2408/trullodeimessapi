import * as THREE from 'three';

export type AppRoute = 'home' | 'suites' | 'piscina' | 'esperienza' | 'preventivo' | 'contatti';

export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
}

export interface HotspotItem {
  id: 'quercia' | 'corbezzolo' | 'melograno' | 'piscina';
  title: { it: string; en: string };
  subtitle: { it: string; en: string };
  position: THREE.Vector3;
}
