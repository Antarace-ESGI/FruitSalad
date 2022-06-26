import Game from "./salad/Game";
import "./style.css";
import { createShape } from "./salad/Bodies";

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = new Game()

await game.initPhysics().then(() => console.log("Physics initialized!"));

game.displayRenderer(app);

const { body, mesh } = createShape({
	position: [0, 0, 0],
	size: [1, 1, 1],
	image: "static/textures/Pillier.jpg",
	geometry: "BoxBufferGeometry",
	rigidBody: true,
	mass: 1,
	opacity: 1,
});

game.add(mesh, body);

requestAnimationFrame(() => game.render());