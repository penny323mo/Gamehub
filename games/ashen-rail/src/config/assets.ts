export type AssetId = "player" | "train" | "weapon" | "drone";

export interface ModelAssetConfig {
  url: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  forwardAxis: "+Z" | "-Z" | "+X" | "-X";
  groundOffset: number;
  animationMap: Record<string, string>;
  shadowEnabled: boolean;
  collisionEnabled: boolean;
  weaponSocket?: string[];
  boundingBoxAdjustment: [number, number, number];
}

export const MODEL_ASSETS: Record<AssetId, ModelAssetConfig> = {
  player: {
    url: "assets/models/runtime/player-soldier.glb",
    scale: 0.92,
    position: [0, 1.02, -2.2],
    rotation: [0, Math.PI, 0],
    forwardAxis: "+Z",
    groundOffset: 0,
    animationMap: {},
    shadowEnabled: true,
    collisionEnabled: true,
    weaponSocket: ["RightHand", "right_hand", "Hand_R", "hand.R", "mixamorigRightHand", "Bip001_R_Hand", "R_Hand", "R_HandTwist01", "R_Forearm"],
    boundingBoxAdjustment: [0.45, 0.9, 0.35]
  },
  train: {
    url: "assets/models/runtime/train-locomotive.glb",
    scale: 6.2,
    position: [0, 2.0, 9.0],
    rotation: [0, Math.PI, 0],
    forwardAxis: "+Z",
    groundOffset: 0,
    animationMap: {},
    shadowEnabled: false,
    collisionEnabled: false,
    boundingBoxAdjustment: [3, 1, 9]
  },
  weapon: {
    url: "assets/models/runtime/hand-cannon.glb",
    scale: 0.34,
    position: [0.17, 0.02, 0.05],
    rotation: [0, Math.PI / 2, Math.PI / 2],
    forwardAxis: "+Z",
    groundOffset: 0,
    animationMap: {},
    shadowEnabled: true,
    collisionEnabled: false,
    boundingBoxAdjustment: [0.28, 0.18, 0.5]
  },
  drone: {
    url: "assets/models/runtime/enemy-drone.glb",
    scale: 0.78,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    forwardAxis: "+Z",
    groundOffset: 0,
    animationMap: {},
    shadowEnabled: true,
    collisionEnabled: true,
    boundingBoxAdjustment: [0.8, 0.55, 0.8]
  }
};

export const PLAYER_BOUNDS = { minX: -2.45, maxX: 2.45, minZ: -7.6, maxZ: 7.2 };
export const CORE_POSITION: [number, number, number] = [-1.3, 1.08, 2.5];
