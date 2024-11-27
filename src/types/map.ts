import { Vector3, Quaternion, Object3D } from 'three';
import { RapierRigidBody } from '@react-three/rapier';

export interface TrainSystem {
  id: string;
  trainMesh: Object3D | null;
  controller: Object3D | null;
  rigidBody: RapierRigidBody | null;
}

export const createTrainSystem = (
  id: string,
  scene: Object3D,
  meshName: string,
  controllerName: string,
): TrainSystem => ({
  id,
  trainMesh: scene.getObjectByName(meshName) || null,
  controller: scene.getObjectByName(controllerName) || null,
  rigidBody: null,
});

export const updateRigidBody = (
  system: TrainSystem,
  worldPosition: Vector3,
  worldQuaternion: Quaternion,
) => {
  if (!system.rigidBody) return;

  try {
    system.rigidBody.setTranslation(worldPosition, true);
    system.rigidBody.setRotation(worldQuaternion, true);
  } catch (error) {
    system.rigidBody = null;
  }
};
