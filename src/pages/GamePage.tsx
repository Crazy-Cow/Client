import { useEffect, useMemo, useRef } from 'react';
import { GameTimer } from '../components/UI/GameTimer';
import { Canvas } from '@react-three/fiber';
import Scene from '../components/Scene';
import MiniMap from '../components/MiniMap';
import KillLogs from '../components/KillLogs';
import SkillCooldownIndicator from '../components/UI/SkillCooldownIndicator';
import ItemCard from '../components/ItemCard';
import MouseSensitivityController from '../components/UI/MouseSensitivityController';
import { useAtom, useAtomValue } from 'jotai';
import { playerInfoAtom, playersAtom } from '../atoms/PlayerAtoms';
import { playAudioAtom } from '../atoms/GameAtoms';

const GamePage = () => {
  const { id } = useAtomValue(playerInfoAtom);
  const players = useAtomValue(playersAtom);
  const [, playAudio] = useAtom(playAudioAtom);
  const prevItemsRef = useRef(0);
  const currentPlayer = useMemo(
    () => players.find((p) => p.id === id),
    [players, id],
  );
  const playerItems = currentPlayer?.items || [];
  const mouseSpeedRef = useRef(0.025);
  const handleMouseSpeedChange = (value: number) => {
    mouseSpeedRef.current = value;
  };

  useEffect(() => {
    const currentItemCount = playerItems.length;
    if (currentItemCount > prevItemsRef.current) {
      playAudio('item');
    }
    prevItemsRef.current = currentItemCount;
  }, [playerItems, playAudio]);
  return (
    <div className="relative w-screen h-screen">
      <GameTimer />
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], near: 0.1, fov: 60 }}
        style={{ touchAction: 'none' }}
        className="w-full h-full"
        gl={{ failIfMajorPerformanceCaveat: true }}
      >
        <color attach="background" args={['#0D1B2A']} />
        <Scene mouseSpeed={mouseSpeedRef.current} />
      </Canvas>
      <MiniMap />
      <KillLogs />
      <SkillCooldownIndicator />
      <ItemCard itemType={playerItems} />
      <MouseSensitivityController
        mouseSpeed={mouseSpeedRef.current}
        onChange={handleMouseSpeedChange}
      />
    </div>
  );
};

export default GamePage;
