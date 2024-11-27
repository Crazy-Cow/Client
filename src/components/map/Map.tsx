import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GroupProps, useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Vector3, Quaternion, Group } from 'three';
import {
  createTrainSystem,
  updateRigidBody,
  TrainSystem,
} from '../../types/map';

interface MapProps extends Omit<GroupProps, 'args'> {
  model: string;
  position?: Vector3 | [number, number, number];
  scale?: Vector3 | [number, number, number] | number;
}

const Map = ({ model, ...props }: MapProps) => {
  const { scene, animations } = useGLTF(model);
  const group = useRef<Group>(null);
  const { actions, mixer } = useAnimations(animations, group);
  const isRigidBodyInitialized = useRef<boolean>(false);

  const trainSystemsRef = useRef<Record<string, TrainSystem>>({
    trainA: createTrainSystem(
      'trainA',
      scene,
      'Train_A_color_0', // 메시 이름
      'Train_A_CTRL', // 컨트롤러 이름
    ),
    trainB: createTrainSystem(
      'trainB',
      scene,
      'train_B_color_0',
      'Train_B_CTRL',
    ),
    trainC: createTrainSystem(
      'trainC',
      scene,
      'train_C_color_0',
      'Train_C_CTRL',
    ),
  });

  // 기차 제외한 정적인 맵
  const staticScene = useMemo(() => {
    const clonedScene = scene.clone(true);
    const trainMeshNames = [
      'Train_A_color_0',
      'train_B_color_0',
      'train_C_color_0',
    ];

    trainMeshNames.forEach((name) => {
      const obj = clonedScene.getObjectByName(name);
      if (obj) obj.removeFromParent();
    });

    return clonedScene;
  }, [scene]);

  // 물리 엔진과 애니메이션 초기화
  const initializeRigidBodies = useCallback(() => {
    if (!actions) return;

    const firstAnimation = animations[0]?.name || '';
    const action = actions[firstAnimation];

    if (action) {
      mixer.stopAllAction();
      action.reset();
      action.timeScale = 0.2; // 애니메이션 속도를 0.2배로 감속
      action.fadeIn(0.5).play();
    }

    isRigidBodyInitialized.current = true;
  }, [actions, animations, mixer]);

  useEffect(() => {
    initializeRigidBodies();

    return () => {
      Object.values(trainSystemsRef.current).forEach((system) => {
        system.rigidBody?.sleep();
      });
      isRigidBodyInitialized.current = false;
    };
  }, [scene, initializeRigidBodies]);

  // 매 프레임마다 열차 위치 업데이트
  useFrame(() => {
    if (!isRigidBodyInitialized.current) return;

    Object.values(trainSystemsRef.current).forEach((system) => {
      if (!system.controller) return;

      // 열차 컨트롤러의 월드 위치와 회전값 계산
      const worldPosition = new Vector3();
      const worldQuaternion = new Quaternion();
      system.controller.getWorldPosition(worldPosition);
      system.controller.getWorldQuaternion(worldQuaternion);

      // 물리 엔진에 열차의 새로운 위치와 회전값 적용
      updateRigidBody(system, worldPosition, worldQuaternion);
    });
  });

  return (
    <group {...props} ref={group}>
      <primitive object={scene} />

      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={staticScene} />
      </RigidBody>

      {Object.values(trainSystemsRef.current).map((system) =>
        system.trainMesh ? (
          <RigidBody
            key={system.id}
            type="kinematicPosition"
            colliders="trimesh"
            ref={(api) => (system.rigidBody = api)}
          >
            <primitive object={system.trainMesh} />
          </RigidBody>
        ) : null,
      )}
    </group>
  );
};

export default Map;
