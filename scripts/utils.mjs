import * as THREE from "../threejs/three.module.js";

/**
 *
 * @param {Ammo.btSoftRigidDynamicsWorld} physicsWorld
 * @param {THREE.Mesh} threeObject
 * @param {Ammo.btBoxShape} physicsShape
 * @param {number} mass
 * @param {THREE.Vector3} pos
 * @param {THREE.Quaternion} quaternion
 * @returns {Ammo.btRigidBody} rigidBody
 */
export function createRigidBody(physicsWorld, threeObject, physicsShape, mass, pos, quaternion) {
	threeObject.position.copy(pos);
	threeObject.quaternion.copy(quaternion);

	const transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
	const motionState = new Ammo.btDefaultMotionState(transform);

	const localInertia = new Ammo.btVector3(0, 0, 0);
	physicsShape.calculateLocalInertia(mass, localInertia);

	const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
	const body = new Ammo.btRigidBody(rbInfo);

	threeObject.userData.physicsBody = body;

	if (mass > 0) {
		// Disable deactivation
		body.setActivationState(4);
	}

	physicsWorld.addRigidBody(body);

	return body;
}

/*
 * Collada
 */

/**
 * Create and add a new model to the scene
 * @param {GLTFLoader} loader
 * @param {string} file File path to the .dae file
 */
export function loadModel(loader, file) {
	return new Promise(resolve => {
		loader.load(file, collada => {
			const model = collada.scene;

			model.traverse((node) => {
				if (node.isSkinnedMesh) {
					node.frustumCulled = false;
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			resolve(model);
		});
	});
}

/**
 * Create a new physic body for a collada
 * @param physicsWorld
 * @param model
 * @param isStatic
 * @param size
 * @returns {*}
 */
export function modelPhysicBody(physicsWorld, model, size) {
	// Physic body
	const position = new THREE.Vector3(model.position.x, model.position.y, model.position.z);
	const target = new THREE.Vector3(...size);
	const quaternion = new THREE.Quaternion(0, 0, 0, 1);

	const box = new THREE.Box3().setFromCenterAndSize(position, target);
	box.getSize(target);

	const shape = new Ammo.btBoxShape(new Ammo.btVector3(target.x * 0.5, target.y * 0.5, target.z * 0.5));
	shape.setMargin(0);

	return createRigidBody(physicsWorld, model, shape, 1, position, quaternion);
}

/**
 * @param {World} world
 * @param {number} radius Size of the plate
 */
export function createPlate(world, radius = 10) {

	addModelToWorld(world,"box_down",[0,0,0]);
	world.createShape({
		position: [0, 0, 0],
		size: [10, .5, 15],
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
		opacity: 0,
	});

	// Back
	addModelToWorld(world,"box_back",[-5.5,0,0.5]);
	world.createShape({
		position: [-5, 0, 0],
		size: [0.5, 10, 15],
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
		opacity: 0,
	});

	// Front
	addModelToWorld(world,"box_front",[4,0,0.5]);
	world.createShape({
		position: [5, 0, 0],
		size: [0.5, 10, 15],
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
		opacity: 0,
	});

	// Left
	addModelToWorld(world, "box_left", [0,0,-7]);
	world.createShape({
		position: [0, 0, -7],
		size: [10, 10, 0.5],
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
		opacity: 0,
	});

	// Right
	addModelToWorld(world,"box_right", [0,0,7.5]);
	world.createShape({
		position: [0, 0, 7.5],
		size: [10, 10, 0.5],
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
		opacity: 0,
	});
}

/**
 * @param {World} world
 * @param {string} filename
 * @param {number[]} position
 * @param isStatic
 * @param size
 */
export function addModelToWorld(world, filename, position = [0, 0, 0],  isPhysic = false) {
	loadModel(world.loader, `/models/${filename}.glb`)
		.then(model => {
			model.scale.set(1, 1, 1);
			model.position.set(...position);
			world.scene.add(model);
			if(isPhysic){
				modelPhysicBody(world.physicsWorld, model,[2,2,2]);
				world.rigidBodies.push(model);
			}
		});
}

/**
 * Registers a click event on an element
 * @param {string} selector Selector of the element to add the callback to
 * @param {function} callback Function to be called on click
 * @param {*} args Arguments to pass to the callback
 */
export function click(selector, callback, ...args) {
	document.querySelector(selector).addEventListener("click", () => callback(...args));
}

/**
 * Update the price displayed on the web page
 * @param {number} amount
 */
export function updatePriceDisplay(amount) {
	const price = document.querySelector("#price");
	price.innerText = parseFloat(price.innerText) + amount + "€";
}

/**
 * Add a new slice of fruit to the scene and updates the price
 * @param {string} fruit Name of the fruit to add
 * @param {number} price Price of the slice of fruit
 * @param {number} plateSize Size of the place selected
 * @param {World} world World to add the slice in
 * @param {number} slices Amount of slices
 */
export function addSlice(fruit, price, plateSize, world, slices = 3) {
	const randomIndex = Math.floor(Math.random() * slices + 1);
	const x = Math.random() * plateSize - plateSize / 2 - 1;
	const y = Math.random() * plateSize - plateSize / 2 - 1;
	addModelToWorld(world, `${fruit}_slice_${randomIndex}`, [x, 5, y], true);
	updatePriceDisplay(price);
}