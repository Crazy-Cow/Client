import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useState, useEffect } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { Character } from '../types/player';
import { Present } from '../components/present';
import useCharacterControl from '../hooks/useCharacterControl';
import useCharacterAnimation from '../hooks/useCharacterAnimation';
import useCamera from '../hooks/useCamera';
import usePlayerState from '../hooks/usePlayerState';
import useMouseRotation from '../hooks/useMouseRotation';
import usePlayersInterpolation from '../hooks/usePlayersInterpolation';
import useCharacterRefs from '../hooks/refs/useCharacterRefs';
import useCameraRefs from '../hooks/refs/useCameraRefs';
import useAnimationRefs from '../hooks/refs/useAnmiationRefs';
import useGameLoop from '../hooks/useGameLoop';
import useMouseRefs from '../hooks/refs/useMouseRefs';
import ProtectEffect from '../components/effect/ProtectEffect';
import { AnimatedGhost, GhostActionName } from '../hooks/AnimatedGhost';
import CircleShadow from '../components/UI/Shadow';
import { Lightning } from '../models/Lightning';
import BoostEffect from '../components/effect/BoostEffect';
import { Vector3 } from 'three';
import DizzyEffect from '../components/effect/DizzyEffect';

interface GhostControllerProps {
  player: Character;
  isLocalPlayer?: boolean;
}

const GhostController = ({
  player: {
    id,
    giftCnt,
    position,
    velocity,
    nickName,
    charType,
    charColor,
    stealMotion,
    stolenMotion,
    protectMotion,
    eventBlock,
    isSkillActive,
    totalSkillCooldown,
    currentSkillCooldown,
    speed,
    items,
    itemDuration,
    thunderEffect,
  },
  isLocalPlayer,
}: GhostControllerProps): JSX.Element => {
  const [animation, setAnimation] = useState<GhostActionName>(
    'CharacterArmature|Flying_Idle',
  );

  const [showDizzy, setShowDizzy] = useState(false);

  const { rb, container, character, currentPosition, currentVelocity } =
    useCharacterRefs(position, velocity);

  const {
    mouseControlRef,
    rotationTarget,
    rotationTargetY,
    characterRotationTarget,
  } = useMouseRefs();

  const {
    cameraTarget,
    cameraPosition,
    cameraLookAtWorldPosition,
    cameraWorldPosition,
    cameraLookAt,
    currentExtraHeight,
    currentExtraDistance,
    currentCameraHeight,
    currentForwardDistance,
  } = useCameraRefs();

  const {
    punchAnimationTimer,
    isPunching,
    stolenAnimationTimer,
    isCurrentlyStolen,
  } = useAnimationRefs();

  useEffect(() => {
    if (thunderEffect.length === 1) {
      setShowDizzy(true);
      setTimeout(() => setShowDizzy(false), 4000);
    }
  }, [thunderEffect]);

  const { updateMovement } = useCharacterControl({
    charType: 3,
    rotationTarget,
    mouseControlRef,
    characterRotationTarget,
    isPunching,
    punchAnimationTimer,
    setAnimation,
    giftCnt,
    stolenMotion,
    isCurrentlyStolen,
    stolenAnimationTimer,
    stealMotion,
    position,
    character,
    container,
    eventBlock,
    isSkillActive,
    totalSkillCooldown,
    currentSkillCooldown,
    speed,
    items,
    itemDuration,
    thunderEffect,
  });

  const { updateAnimation } = useCharacterAnimation({
    charType,
    stolenMotion,
    isCurrentlyStolen,
    stolenAnimationTimer,
    isPunching,
    punchAnimationTimer,
    stealMotion,
    giftCnt,
    setAnimation,
  });

  const { updatePlayerState } = usePlayerState({
    id,
  });

  const { updateRemotePosition } = usePlayersInterpolation({
    currentPosition,
    currentVelocity,
    position,
    velocity,
    rb,
    character,
  });

  const { updateCamera } = useCamera({
    cameraTarget,
    cameraPosition,
    rotationTargetY,
    currentExtraHeight,
    currentExtraDistance,
    currentCameraHeight,
    currentForwardDistance,
    cameraWorldPosition,
    cameraLookAtWorldPosition,
    cameraLookAt,
  });

  useMouseRotation({
    mouseControlRef,
    rotationTarget,
    rotationTargetY,
    velocity,
  });

  useGameLoop({
    isLocalPlayer,
    rb,
    updateMovement,
    updatePlayerState,
    updateCamera,
    updateRemotePosition,
    updateAnimation,
    velocity,
  });

  return (
    <>
      <RigidBody colliders={false} lockRotations ref={rb}>
        {(thunderEffect.length > 0 || showDizzy) && (
          <>
            {thunderEffect.length > 0 && (
              <Lightning thunderEffect={thunderEffect} />
            )}
            {showDizzy && <DizzyEffect position={[0, 4, 0]} />}
          </>
        )}
        {isLocalPlayer && <PointerLockControls ref={mouseControlRef} />}
        <group ref={container}>
          {isLocalPlayer && (
            <>
              <group ref={cameraTarget} position-z={6} />
              <group ref={cameraPosition} position-y={10} position-z={-15} />
            </>
          )}
          <group ref={character}>
            {itemDuration.boost > 0 && (
              <BoostEffect
                targetPosition={character.current?.position || new Vector3()}
              />
            )}
            <AnimatedGhost
              nickName={nickName}
              animation={animation}
              charColor={charColor}
              isTransparent={isSkillActive}
              isLocalPlayer={isLocalPlayer}
            />
            {Array.from({ length: giftCnt }).map((_, index) => (
              <Present
                index={index}
                key={id + index}
                isTransparent={isSkillActive}
                isLocalPlayer={isLocalPlayer}
              />
            ))}
          </group>
        </group>
        <ProtectEffect duration={protectMotion} radius={2.2} />
        <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.3, 0]} />
      </RigidBody>
      <CircleShadow target={character} isSkillActive={isSkillActive} />
    </>
  );
};

export default GhostController;
