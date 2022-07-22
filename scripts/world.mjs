import * as THREE from '../threejs/three.module.js';
import {OrbitControls} from "../threejs/jsm/controls/OrbitControls.js";
import {createRigidBody} from "./utils.mjs";
import {GLTFLoader} from "../threejs/jsm/loaders/GLTFLoader.js";

export class World {
	/**
	 * Create a scene for the world
	 */
	constructor(canvas) {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 1, 10000);
		this.camera.rotation.order = 'YXZ';
		this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas, alpha: true});

		// Ambient light
		const light = new THREE.AmbientLight(0x404040); // soft white light
		this.scene.add(light);

		// Create camera
		/*this.camera.position.set(1600, 0, 1000);
		this.camera.lookAt(0, 0, 0);*/
		this.camera.position.set(30, 30, 30);

		// Setup the renderer
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputEncoding = THREE.sRGBEncoding;

		// Add the renderer element to webpage
		this.container = document.querySelector(".compositor");
		canvas.parentElement.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		// Ambient light
		const ambient = new THREE.AmbientLight(0xffffff, 0.1);
		this.scene.add(ambient);

		// Clock
		this.clock = new THREE.Clock();

		// Audio listener
		this.listener = new THREE.AudioListener();
		this.camera.add(this.listener);

		// Collada loader
		this.loader = new GLTFLoader();

		// Audio loader
		this.audioLoader = new THREE.AudioLoader();

		// Handle window resize
		window.addEventListener('resize', this.onWindowResize, false);

		this.initPhysics();
	}

	/*
	 * Physics
	 */

	initPhysics() {
		// Physics variables
		const gravityConstant = -9.8 * 100;
		this.rigidBodies = [];

		// Physics configuration

		const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
		const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		const broadphase = new Ammo.btDbvtBroadphase();
		const solver = new Ammo.btSequentialImpulseConstraintSolver();
		const softBodySolver = new Ammo.btDefaultSoftBodySolver();
		this.physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
		this.physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
		this.physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

		this.transformAux1 = new Ammo.btTransform();
	}

	onWindowResize() {
		this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
	}

	/**
	 * Function called on each frame
	 * @param delta
	 */
	animate(delta) {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);

		// Step world
		this.physicsWorld.stepSimulation(delta, 10);

		// Update rigid bodies
		for (let i = 0, il = this.rigidBodies.length; i < il; i++) {
			const objThree = this.rigidBodies[i];
			const objPhys = objThree.userData.physicsBody;
			const ms = objPhys.getMotionState();

			if (ms) {
				ms.getWorldTransform(this.transformAux1);
				const p = this.transformAux1.getOrigin();
				const q = this.transformAux1.getRotation();
				objThree.position.set(p.x(), p.y(), p.z());
				objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
			}
		}
	}

	/*
	 * Spotlight
	 */

	/**
	 * Create a new spotlight in the scene
	 * @param {number} x X coordinate of the spotlight
	 * @param {number} y Y coordinate
	 * @param {number} z Z coordinate
	 * @param {number} rx X rotation of the spotlight
	 * @param {number} ry Y rotation
	 * @param {number} rz Z rotation
	 * @return {{THREE.SpotLight, THREE.SpotLightHelper}}
	 */
	createSpotLight(x, y, z, rx = 0, ry = 0, rz = 0, options) {
		const spotLight = new THREE.SpotLight(0xffffff, 1);
		spotLight.position.set(x, y, z);
		spotLight.angle = Math.PI / 4;
		spotLight.penumbra = 0.1;
		spotLight.decay = 2;
		spotLight.distance = options?.distance ?? 200;

		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 2048;
		spotLight.shadow.mapSize.height = 2048;
		spotLight.shadow.camera.near = 10;
		spotLight.shadow.camera.far = 200;
		spotLight.shadow.focus = 1;

		this.scene.add(spotLight);

		const lightHelper = new THREE.SpotLightHelper(spotLight);
		//this.scene.add(lightHelper);

		return {spotLight: spotLight, lightHelper: lightHelper};
	}

	/*
	 * Create and add a new shape to the world
	 */

	createShape(options) {
		let geometry;

		const size = {
			w: options.w || options.width || options.size[0],
			h: options.h || options.height || options.size[1],
			d: options.d || options.depth || options.size[2],
		};

		let shape;

		// Get position
		let position =
			options.x !== undefined && options.y !== undefined && options.z !== undefined ?
				[options.x, options.y, options.z] :
				options.position || options.pos;

		let volume = 0;

		const texture = new THREE.TextureLoader().load(options.image);
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		if (options.geometry !== 'SphereGeometry') {
			texture.repeat.x = 4;
			texture.repeat.y = 4;
		}

		const material = new THREE.MeshPhongMaterial({map: texture, dithering: true});
		material.opacity = options.opacity ?? 1;
		material.transparent = options.opacity === 0;

		switch (options.geometry) {
			case 'Bowl':
				geometry = new THREE.SphereBufferGeometry(30, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
				material.side = THREE.DoubleSide;
				shape = new Ammo.btSphereShape(30)
				break;

			case 'BoxBufferGeometry':
			default:
				shape = new Ammo.btBoxShape(new Ammo.btVector3(size.w * 0.5, size.h * 0.5, size.d * 0.5));

				volume = size.d * size.h * size.w;

				geometry = new THREE.BoxBufferGeometry(size.w, size.h, size.d);
				break;
		}

		const mesh = new THREE.Mesh(geometry, material);

		mesh.position.set(...position);
		if (options.geometry !== 'SphereGeometry' && options.opacity !== 0) {
			mesh.castShadow = true;
			mesh.receiveShadow = true;
		}

		let body;

		if (shape && (options.rigidBody ?? true)) {
			const vector3 = new THREE.Vector3(...position);
			const quaternion = new THREE.Quaternion(0, 0, 0, 1);

			shape.setMargin(0.05);

			body = createRigidBody(this.physicsWorld, mesh, shape, options.mass ?? volume, vector3, quaternion);
			this.rigidBodies.push(mesh);
		}

		this.scene.add(mesh);

		return {body: body, mesh: mesh};
	}
}