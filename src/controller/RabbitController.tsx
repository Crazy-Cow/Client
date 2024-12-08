import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AnimatedRabbit, { RabbitActionName } from '../models/AnimatedRabbit';
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
import { Model as Portal } from '../models/Portal';
import { Euler, MathUtils, Quaternion, Vector3 } from 'three';
import CircleShadow from '../components/UI/Shadow';
import { Lightning } from '../models/Lightning';
import BoostEffect from '../components/effect/BoostEffect';
import DizzyEffect from '../components/effect/DizzyEffect';

interface RabbitControllerProps {
  player: Character;
  isLocalPlayer?: boolean;
  mouseSpeed: number;
}

const RabbitController = ({
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
  mouseSpeed,
}: RabbitControllerProps): JSX.Element => {
  const [animation, setAnimation] = useState<RabbitActionName>(
    'CharacterArmature|Idle',
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
    if (thunderEffect[0] === 1) {
      setShowDizzy(true);
      setTimeout(() => setShowDizzy(false), 2000);
    }
  }, [thunderEffect]);

  // 포탈 위치 계산
  const getPortalPosition = useCallback((): [number, number, number] => {
    if (!rb.current || !container.current) return [0, 0, 0];

    const forwardDirection = new Vector3();
    container.current.getWorldDirection(forwardDirection);
    forwardDirection.normalize();

    const rotationOffset = new Euler(0, MathUtils.degToRad(60), 0); // Y축을 기준으로 -30도 회전
    const quaternionOffset = new Quaternion().setFromEuler(rotationOffset);
    forwardDirection.applyQuaternion(quaternionOffset);

    const playerPosition = rb.current.translation();
    if (!playerPosition) return [0, 0, 0];

    return [
      playerPosition.x + forwardDirection.x * 3,
      playerPosition.y + forwardDirection.y + 1,
      playerPosition.z + forwardDirection.z * -3,
    ];
  }, [rb, container]);

  const portalPosition = useMemo((): [number, number, number] => {
    if (!isSkillActive) return [0, 0, 0];
    return getPortalPosition();
  }, [isSkillActive, getPortalPosition]);

  const { updateMovement } = useCharacterControl({
    charType: 1,
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
    mouseSpeed,
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
            {showDizzy && itemDuration.shield === 0 && (
              <DizzyEffect position={[0, 4, 0]} />
            )}
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
            <AnimatedRabbit
              nickName={nickName}
              animation={animation}
              charColor={charColor}
            />
            {Array.from({ length: giftCnt }).map((_, index) => (
              <Present index={index} key={id + index} />
            ))}
          </group>
        </group>
        <ProtectEffect
          duration={itemDuration.shield || protectMotion}
          radius={2.2}
          color={itemDuration.shield > 0 ? '#58ACFA' : '#FFE31A'}
        />
        <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.3, 0]} />
      </RigidBody>
      <CircleShadow target={character} />
      {isSkillActive && <Portal position={portalPosition} />}
    </>
  );
};

export default RabbitController;
