import { MutableRefObject, useEffect } from 'react';
import { Position } from '../types/player';
import { MathUtils } from 'three/src/math/MathUtils.js';

type MouseControlProps = {
  mouseControlRef: MutableRefObject<any>;
  rotationTarget: MutableRefObject<number>;
  rotationTargetY: MutableRefObject<number>;
  velocity: Position;
};

const useMouseRotation = (props: MouseControlProps) => {
  useEffect(() => {
    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        props.rotationTargetY.current = 0;
      }
    };

    const handleClick = () => {
      if (
        props.mouseControlRef.current &&
        !props.mouseControlRef.current.isLocked
      ) {
        props.mouseControlRef.current.lock();
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange,
      );
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (props.mouseControlRef.current?.isLocked) {
        props.rotationTarget.current -=
          event.movementX * import.meta.env.VITE_INGAME_MOUSE_SPEED;
        const isOnGround = Math.abs(props.velocity.y) < 0.1;
        const minY = isOnGround ? -0.5 : -1;
        props.rotationTargetY.current = MathUtils.clamp(
          props.rotationTargetY.current -
            event.movementY * import.meta.env.VITE_INGAME_MOUSE_SPEED,
          minY,
          0.5,
        );
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [import.meta.env.VITE_INGAME_MOUSE_SPEED, props.velocity.y]);
};

export default useMouseRotation;