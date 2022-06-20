import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let container: HTMLDivElement,
	controls: OrbitControls,
	camera: THREE.PerspectiveCamera,
	light1: THREE.PointLight,
	light2: THREE.PointLight,
	light3: THREE.PointLight,
	scene: THREE.Scene,
	renderer: THREE.WebGLRenderer;

init();
render();

function init() {
	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
	camera.position.set(0.0, 0.0, 4.);

	scene = new THREE.Scene();

//light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
//scene.add( light );

	light1 = new THREE.PointLight(0xffffff, 1, 0);
	light1.position.set(0.0, 0.0, 10.);
	scene.add(light1);

	light2 = new THREE.PointLight(0xffffff, 1, 0);
	light2.position.set(0.0, 0.0, -10.);
	scene.add(light2);

	light3 = new THREE.PointLight(0xffffff, 1, 0);
	light3.position.set(0.0, 10.0, 0.0);
	scene.add(light3);

	const loader = new GLTFLoader().setPath('models/gltf/Suzanne/');
	loader.load('Suzanne_B.glb', function (gltf) {
//gltf.scene.traverse( function ( child ) {} );
		scene.add(gltf.scene);
		render();
	});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.8;
	renderer.outputEncoding = THREE.sRGBEncoding;
	container.appendChild(renderer.domElement);

	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	pmremGenerator.compileEquirectangularShader();

	controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // use if there is no animation loop
	controls.minDistance = 2;
	controls.maxDistance = 10;
	controls.target.set(0, 0, -0.2);
	controls.update();

	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	render();
}

function render() {
	renderer.render(scene, camera);
}