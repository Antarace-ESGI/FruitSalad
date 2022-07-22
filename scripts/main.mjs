import {World} from "./world.mjs";
import {addSlice, click, createPlate, updatePriceDisplay} from "./utils.mjs";

let world, plateSize;

function startScene() {
	Ammo().then(function (AmmoLib) {
		Ammo = AmmoLib;
		init();

		document.querySelector("#plateSelector").style.display = "none";
		document.querySelector("#compositor").style.display = "block";

		// Register events
		click("#strawberry", addSlice, "strawberry", 0.25, plateSize, world);
		click("#banana", addSlice, "banana", 0.5, plateSize, world);
		click("#kiwi", addSlice, "kiwi", 0.75, plateSize, world);
	});
}

function init() {
	const canvas = document.getElementById("threejs");
	world = new World(canvas);

	// Register resize event
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