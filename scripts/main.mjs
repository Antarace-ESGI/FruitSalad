import {World} from "./world.mjs";
import {addModelToWorld, click, createPlate} from "./utils.mjs";

let world, plateSize;

function updatePriceDisplay(amount) {
	const price = document.querySelector("#price");
	price.innerText = parseFloat(price.innerText) + amount + "€";
}

function startScene() {
	Ammo().then(function (AmmoLib) {
		Ammo = AmmoLib;
		init();

		document.querySelector("#plateSelector").style.display = "none";
		document.querySelector("#compositor").style.display = "block";

		// Register events
		click("#strawberry", () => {
			const randomIndex = Math.floor(Math.random() * 3 + 1);
			const x = Math.random() * plateSize - plateSize / 2 - 1;
			const y = Math.random() * plateSize - plateSize / 2 - 1;
			addModelToWorld(world, `strawberry_slice_${randomIndex}`, [x, 5, y]);
			updatePriceDisplay(0.5);
		})

		click("#banana", () => {
			const randomIndex = Math.floor(Math.random() * 3 + 1);
			const x = Math.random() * plateSize - plateSize / 2 - 1;
			const y = Math.random() * plateSize - plateSize / 2 - 1;
			addModelToWorld(world, `banana_slice_${randomIndex}`, [x, 5, y]);
			updatePriceDisplay(0.75);
		})
	});
}

function init() {
	const canvas = document.getElementById("threejs");
	world = new World(canvas);

	window.onresize = () => world.onWindowResize();

	// Add some showoff lights
	world.createSpotLight(0, 100, 50);
	world.createSpotLight(30, 70, 0);

	// Create the bowl
	createPlate(world, plateSize);

	/**
	 * Animate the world
	 */

	function animate() {
		const delta = world.clock.getDelta();
		world.renderer.render(world.scene, world.camera);
		world.animate(delta);
		requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
}

click("#small", () => {
	plateSize = 10;
	updatePriceDisplay(5);
	startScene();
});

click("#medium", () => {
	plateSize = 20;
	updatePriceDisplay(7.5);
	startScene();
});

click("#large", () => {
	plateSize = 30;
	updatePriceDisplay(10);
	startScene();
});