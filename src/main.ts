import Game from "./salad/Game";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = new Game()

game.displayRenderer(app);

requestAnimationFrame(() => game.render());