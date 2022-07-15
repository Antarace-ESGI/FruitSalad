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
 * @param {ColladaLoader} loader
 * @param {string} file File path to the .dae file
 */
export function createCollada(loader, file) {
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
 * @param collada
 * @param size
 * @returns {*}
 */
export function colladaPhysicBody(physicsWorld, collada, size) {
	// Physic body
	const position = new THREE.Vector3(collada.position.x, collada.position.y, collada.position.z);
	const target = new THREE.Vector3(...size);
	const quaternion = new THREE.Quaternion(0, 0, 0, 1);

	const box = new THREE.Box3().setFromCenterAndSize(position, target);
	box.getSize(target);

	const shape = new Ammo.btBoxShape(new Ammo.btVector3(target.x * 0.5, target.y * 0.5, target.z * 0.5));
	shape.setMargin(0);

	return createRigidBody(physicsWorld, collada, shape, 1, position, quaternion);
}

/**
 * @param {World} world
 * @param {number} radius Size of the plate
 */
export function createPlate(world, radius = 10) {
	const wallThickness = 1;
	const height = 5;

	const heightOffset = height / 2 - wallThickness / 2;
	const wallOffset = radius / 2 - wallThickness / 2;

	// Create the bowl
	world.createShape({
		position: [wallOffset, 0, 0],
		size: [wallThickness, height, radius],
		image: "textures/bowl.png",
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
	});
	world.createShape({
		position: [-wallOffset, 0, 0],
		size: [wallThickness, height, radius],
		image: "textures/bowl.png",
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
	});
	world.createShape({
		position: [0, 0, wallOffset],
		size: [radius, height, wallThickness],
		image: "textures/bowl.png",
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
	});
	world.createShape({
		position: [0, 0, -wallOffset],
		size: [radius, height, wallThickness],
		image: "textures/bowl.png",
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
	});
	world.createShape({
		position: [0, -heightOffset, 0],
		size: [radius, wallThickness, radius],
		image: "textures/bowl.png",
		geometry: "BoxBufferGeometry",
		rigidBody: true,
		mass: 0,
	});
}

/**
 * @param {World} world
 * @param {string} filename
 * @param {number[]} position
 */
export function addModelToWorld(world, filename, position = [0, 0, 0]) {
	createCollada(world.loader, `/models/${filename}.dae`)
		.then(collada => {
			collada.scale.set(1, 1, 1);
			collada.position.set(...position);
			world.scene.add(collada);
			colladaPhysicBody(world.physicsWorld, collada, [2, 2, 2]);
			world.rigidBodies.push(collada);
		});
}

export function click(selector, callback) {
	document.querySelector(selector).addEventListener("click", callback);
}