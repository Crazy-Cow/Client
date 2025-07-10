import { useAtom } from 'jotai';
import { gameScreenAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRouter';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const MatchingPage = lazy(() => import('../pages/MatchingPage'));
const GamePage = lazy(() => import('../pages/GamePage'));
const GameOverPage = lazy(() => import('../pages/GameOverPage'));
const TournamentCallbackPage = lazy(
  () => import('../pages/TournamentCallbackPage'),
);

const AuthRouter = () => {
  const [gameScreen] = useAtom(gameScreenAtom);
  const navigate = useNavigate();

  useEffect(() => {
    switch (gameScreen) {
      case GameScreen.HOME:
        navigate('/home');
        break;
      case GameScreen.MATCHING:
        navigate('/matching');
        break;
      case GameScreen.GAME:
        navigate('/game');
        break;
      case GameScreen.GAME_OVER:
        navigate('/game-over');
        break;
    }
  }, [gameScreen]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tournament-callback" element={<TournamentCallbackPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/matching" element={<MatchingPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/game-over" element={<GameOverPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRouter;
