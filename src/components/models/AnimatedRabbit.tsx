import * as THREE from 'three';
import React, { useEffect } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF, SkeletonUtils } from 'three-stdlib';

export type RabbitActionName =
  | 'CharacterArmature|Death'
  | 'CharacterArmature|Duck'
  | 'CharacterArmature|HitReact'
  | 'CharacterArmature|Idle'
  | 'CharacterArmature|Idle_Gun'
  | 'CharacterArmature|Idle_Shoot'
  | 'CharacterArmature|Jump'
  | 'CharacterArmature|Jump_Idle'
  | 'CharacterArmature|Jump_Land'
  | 'CharacterArmature|No'
  | 'CharacterArmature|Punch'
  | 'CharacterArmature|Run'
  | 'CharacterArmature|Run_Gun'
  | 'CharacterArmature|Run_Shoot'
  | 'CharacterArmature|Walk'
  | 'CharacterArmature|Walk_Gun'
  | 'CharacterArmature|Wave'
  | 'CharacterArmature|Yes';

interface GLTFAction extends THREE.AnimationClip {
  name: RabbitActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    Body_2: THREE.SkinnedMesh;
    Body_3: THREE.SkinnedMesh;
    Body_4: THREE.SkinnedMesh;
    Ears: THREE.SkinnedMesh;
    Head_2: THREE.SkinnedMesh;
    Head_3: THREE.SkinnedMesh;
    Head_4: THREE.SkinnedMesh;
    Head_5: THREE.SkinnedMesh;
    Head_6: THREE.SkinnedMesh;
    Arms_1: THREE.SkinnedMesh;
    Arms_2: THREE.SkinnedMesh;
    Root: THREE.Bone;
  };
  materials: {
    Main: THREE.MeshStandardMaterial;
    Main_Light: THREE.MeshStandardMaterial;
    Main2: THREE.MeshStandardMaterial;
    EyeColor: THREE.MeshStandardMaterial;
    White: THREE.MeshStandardMaterial;
    Black: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

type AnimatedRabbitProps = {
  animation: RabbitActionName;
} & JSX.IntrinsicElements['group'];

export function AnimatedRabbit({ animation, ...props }: AnimatedRabbitProps) {
  const group = React.useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/AnimatedRabbit.glb');
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as GLTFResult;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.5).play();
    return () => {
      actions[animation]?.fadeOut(0.5);
    };
  }, [animation]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Root_Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <primitive object={nodes.Root} />
          </group>
          <group name="Body_1" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Body_2"
              geometry={nodes.Body_2.geometry}
              material={materials.Main}
              skeleton={nodes.Body_2.skeleton}
            />
            <skinnedMesh
              name="Body_3"
              geometry={nodes.Body_3.geometry}
              material={materials.Main_Light}
              skeleton={nodes.Body_3.skeleton}
            />
            <skinnedMesh
              name="Body_4"
              geometry={nodes.Body_4.geometry}
              material={materials.Main2}
              skeleton={nodes.Body_4.skeleton}
            />
          </group>
          <skinnedMesh
            name="Ears"
            geometry={nodes.Ears.geometry}
            material={materials.Main}
            skeleton={nodes.Ears.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          />
          <group name="Head_1" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Head_2"
              geometry={nodes.Head_2.geometry}
              material={materials.Main}
              skeleton={nodes.Head_2.skeleton}
            />
            <skinnedMesh
              name="Head_3"
              geometry={nodes.Head_3.geometry}
              material={materials.Main_Light}
              skeleton={nodes.Head_3.skeleton}
            />
            <skinnedMesh
              name="Head_4"
              geometry={nodes.Head_4.geometry}
              material={materials.EyeColor}
              skeleton={nodes.Head_4.skeleton}
            />
            <skinnedMesh
              name="Head_5"
              geometry={nodes.Head_5.geometry}
              material={materials.White}
              skeleton={nodes.Head_5.skeleton}
            />
            <skinnedMesh
              name="Head_6"
              geometry={nodes.Head_6.geometry}
              material={materials.Black}
              skeleton={nodes.Head_6.skeleton}
            />
          </group>
          <group name="Arms" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Arms_1"
              geometry={nodes.Arms_1.geometry}
              material={materials.Main}
              skeleton={nodes.Arms_1.skeleton}
            />
            <skinnedMesh
              name="Arms_2"
              geometry={nodes.Arms_2.geometry}
              material={materials.Main_Light}
              skeleton={nodes.Arms_2.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/models/AnimatedRabbit.glb');
