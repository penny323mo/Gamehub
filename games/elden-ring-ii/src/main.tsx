import { createRoot } from "react-dom/client";
import GameClient from "./GameClient";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Game root element is missing");
}

createRoot(root).render(<GameClient />);
