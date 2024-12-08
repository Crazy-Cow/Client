import { useState, useEffect } from 'react';
import cls from 'classnames';

type KeyboardMapProps = {
  getKeyClass: (key: string, mode: 'keyboard' | 'mouse') => string;
  keyMap: string[];
  movement: string[];
  steal: string;
  skill: string;
  mode: 'keyboard' | 'mouse';
};

const KeyboardMap = ({
  getKeyClass,
  keyMap,
  movement,
  steal,
  skill,
  mode,
}: KeyboardMapProps) => {
  return (
    <div className="w-full flex justify-center gap-20 items-end">
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-8 text-white">
          <div className="flex flex-col gap-1">
            <div className="flex justify-center">
              <div className={cls(`w-10 h-10 ${getKeyClass(keyMap[0], mode)}`)}>
                {movement[0]}
              </div>
            </div>
            <div className="flex gap-1">
              <div className={cls(`w-10 h-10 ${getKeyClass(keyMap[1], mode)}`)}>
                {movement[1]}
              </div>
              <div className={cls(`w-10 h-10 ${getKeyClass(keyMap[2], mode)}`)}>
                {movement[2]}
              </div>
              <div className={cls(`w-10 h-10 ${getKeyClass(keyMap[3], mode)}`)}>
                {movement[3]}
              </div>
            </div>
          </div>
        </div>
        <span className="text-sm text-white/70">이동하기</span>
      </div>

      <div className="flex gap-10 items-end text-white">
        <div className="flex flex-col items-center gap-2">
          <div className={cls(`w-32 h-10 ${getKeyClass('Space', mode)}`)}>
            Space
          </div>
          <span className="text-sm text-white/70">점프하기</span>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <div className="flex gap-2">
          <div className={cls(`w-20 h-10 ${getKeyClass(keyMap[4], mode)}`)}>
            {steal}
          </div>
        </div>
        <span className="text-sm text-white/70">선물 훔치기</span>
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <div className={cls(`w-16 h-10 ${getKeyClass(keyMap[5], mode)}`)}>
          {skill}
        </div>
        <span className="text-sm text-white/70">스킬</span>
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <div className={cls(`w-16 h-10 ${getKeyClass('KeyE', mode)}`)}>E</div>
        <span className="text-sm text-white/70">아이템</span>
      </div>
    </div>
  );
};

const KeyboardGuide = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mode, setMode] = useState<'keyboard' | 'mouse'>('mouse');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setPressedKeys((prev) => new Set(prev).add(e.code));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getKeyClass = (key: string, currentMode: 'keyboard' | 'mouse') => {
    let isActive = false;

    if (currentMode === 'mouse') {
      if (key === 'Mouse' || key === 'Click') {
        isActive = isMouseDown;
      } else {
        isActive = pressedKeys.has(key);
      }
    } else {
      // keyboard mode
      if (key === 'Mouse') {
        isActive = pressedKeys.has('ShiftLeft');
      } else {
        isActive = pressedKeys.has(key);
      }
    }

    return cls(`
      flex items-center justify-center
      bg-white/10 backdrop-blur-sm
      rounded-lg border border-white/20
      font-bold animate-key-shine
      ${isActive ? 'bg-yellow-300/30' : ''}
    `);
  };

  return (
    <div
      className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-10 w-full text-white z-50"
      aria-label="key-control-guide"
    >
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode('mouse');
          }}
          className={cls(
            'px-4 py-2 rounded-lg font-bold outline-none',
            mode === 'mouse' ? 'bg-3-xmas-gold text-white' : 'bg-gray-300/30',
          )}
        >
          마우스 모드
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode('keyboard');
          }}
          className={cls(
            'px-4 py-2 rounded-lg font-bold outline-none',
            mode === 'keyboard'
              ? 'bg-3-xmas-gold text-white'
              : 'bg-gray-300/30',
          )}
        >
          키보드 모드
        </button>
      </div>
      <KeyboardMap
        getKeyClass={getKeyClass}
        keyMap={
          mode === 'mouse'
            ? ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Click', 'KeyQ']
            : [
                'ArrowUp',
                'ArrowLeft',
                'ArrowDown',
                'ArrowRight',
                'Mouse',
                'KeyQ',
              ]
        }
        movement={
          mode === 'mouse' ? ['W', 'A', 'S', 'D'] : ['↑', '←', '↓', '→']
        }
        steal={mode === 'mouse' ? 'Click' : 'Shift'}
        skill="Q"
        mode={mode}
      />
    </div>
  );
};

export default KeyboardGuide;
