// Types for sandbox connector

export interface VoxelWorld {
  id: string;
  name: string;
  size: {
    width: number;
    height: number;
    depth: number;
  };
  blocks: string[][][];
}

export interface Player {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  inventory: string[];
}

export interface BlockChange {
  x: number;
  y: number;
  z: number;
  oldBlock: string;
  newBlock: string;
  playerId: string;
}
