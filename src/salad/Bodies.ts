import * as THREE from "three";
import { Ammo } from "../Ammo";

export interface IShape {
	// Position
	x?: number,
	y?: number,
	z?: number,
	position?: number[],
	pos?: number[],

	// Sizing
	w?: number,
	h?: number,
	d?: number,
	width?: number,
	height?: number,
	depth?: number,
	size?: number[],

	image: any,
	geometry: "CylinderBufferGeometry" | "SphereGeometry" | "BoxBufferGeometry",
	rigidBody: boolean,
	mass: any,
	opacity: any,
}

/**
 *
 * @param {THREE.Mesh} threeObject
 * @param {Ammo.btBoxShape} physicsShape
 * @param {number} mass
 * @param {THREE.Vector3} pos
 * @param {THREE.Quaternion} quat
 */
export function createRigidBody(threeObject: THREE.Mesh, physicsShape: Ammo.btBoxShape, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion) {
	threeObject.position.copy(pos);
	threeObject.quaternion.copy(quat);

	const transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
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

	return body;
}

export function createShape(options: IShape) {
	let geometry;

	const size = {
		w: options.w || options.width || options.size?.[0] || 1,
		h: options.h || options.height || options.size?.[1] || 1,
		d: options.d || options.depth || options.size?.[2] || 1,
	};

	let shape;

	// Get position
	let position = options.x !== undefined && options.y !== undefined && options.z !== undefined ?
		[options.x, options.y, options.z] :
		options.position || options.pos || [0, 0, 0];

	let volume = 0;

	switch (options.geometry) {
		case 'CylinderBufferGeometry':
			geometry = new THREE.CylinderBufferGeometry(size.w, size.h, size.d);
			volume = Math.PI * Math.pow(size.w, 2) * size.h;

			shape = new Ammo.btCylinderShape(new Ammo.btVector3(size.w * 0.5, size.d * 0.5, size.h * 0.5));

			break;

		case 'SphereGeometry':
			geometry = new THREE.SphereGeometry(size.w, size.h, size.d);
			break;

		case 'BoxBufferGeometry':
		default:
			shape = new Ammo.btBoxShape(new Ammo.btVector3(size.w * 0.5, size.h * 0.5, size.d * 0.5));

			volume = size.d * size.h * size.w;

			geometry = new THREE.BoxBufferGeometry(size.w, size.h, size.d);
			break;

	}

	const texture = new THREE.TextureLoader().load(options.image);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	if (options.geometry !== 'SphereGeometry') {
		texture.repeat.x = 4;
		texture.repeat.y = 4;
	}

	const material = new THREE.MeshPhongMaterial({ map: texture, dithering: true });
	material.opacity = options.opacity ?? 1;
	material.transparent = options.opacity === 0;

	const mesh = new THREE.Mesh(geometry, material);

	mesh.position.set(...position);
	if (options.geometry !== 'SphereGeometry' && options.opacity !== 0) {
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		/*} else {
			mesh.material.side = THREE.DoubleSide;*/
	}

	let body;

	if (shape && (options.rigidBody ?? true)) {
		const vector3 = new THREE.Vector3(...position);
		const quaternion = new THREE.Quaternion(0, 0, 0, 1);

		shape.setMargin(0.05);

		body = createRigidBody(mesh, shape, options.mass ?? volume, vector3, quaternion);
	}

	return { body, mesh };
}