export interface FlatDirection { x: number; z: number; }

export function cameraRelativeMovement(inputX: number, inputY: number, cameraForward: FlatDirection): FlatDirection {
  const right = { x: cameraForward.z, z: -cameraForward.x };
  return {
    x: right.x * inputX + cameraForward.x * inputY,
    z: right.z * inputX + cameraForward.z * inputY
  };
}
