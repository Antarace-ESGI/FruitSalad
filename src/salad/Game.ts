import * as THREE from "three";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Game {
	private readonly camera: PerspectiveCamera;
	private readonly scene: Scene;
	private renderer: WebGLRenderer;
	private rigidBodies: any[];

	constructor() {
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
		this.camera.position.set(-1.8, 0.6, 2.7);

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.outputEncoding = THREE.sRGBEncoding;

		const controls = new OrbitControls(this.camera, this.renderer.domElement);
		//controls.addEventListener("change", this.render); // use if there is no animation loop
		controls.minDistance = 2;
		controls.maxDistance = 10;
		controls.target.set(0, 0, -0.2);
		controls.update();

		window.addEventListener("resize", this.onWindowResize);
	}

	private onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);

		this.render();
	}

	displayRenderer(container: HTMLElement) {
		container.appendChild(this.renderer.domElement);
	}

	public render() {
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.render());
	}
}