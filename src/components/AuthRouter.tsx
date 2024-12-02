import { useAtom, useAtomValue } from 'jotai';
import { gameScreenAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import SocketController from '../controller/SocketController';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import MatchingPage from '../pages/MatchingPage';
import { GameTimer } from '../components/UI/GameTimer';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import GameOverPage from '../pages/GameOverPage';
import { playerInfoAtom, playersAtom } from '../atoms/PlayerAtoms';
import KillLogs from './KillLogs';
import GameLogsPage from '../pages/GameLogsPage';
import MiniMap from './MiniMap';
import SkillCooldownIndicator from './UI/SkillCooldownIndicator';
import ItemCard from './ItemCard';
import { useMemo } from 'react';

const AuthRouter = () => {
  const [gameScreen] = useAtom(gameScreenAtom);
  const { id } = useAtomValue(playerInfoAtom);
  const players = useAtomValue(playersAtom);

  const currentPlayer = useMemo(() => players.find((p) => p.id === id), []);
  const playerItems = currentPlayer?.items || [];

  if (!id) {
    return <LoginPage />;
  }

  return (
    <>
      {gameScreen === GameScreen.HOME && <HomePage />}
      <SocketController />
      {gameScreen === GameScreen.MATCHING && <MatchingPage />}
      {gameScreen === GameScreen.GAME && (
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
            <Scene />
          </Canvas>
          <MiniMap />
          <KillLogs />
          <SkillCooldownIndicator />
          <ItemCard itemType={playerItems} />
        </div>
      )}
      {gameScreen === GameScreen.GAME_OVER && <GameOverPage />}
      {gameScreen === GameScreen.GAME_LOGS && <GameLogsPage />}
    </>
  );
};

export default AuthRouter;
