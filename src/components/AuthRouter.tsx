import { useAtom } from 'jotai';
import { gameScreenAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import { lazy, useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import ProtectedRoute from './ProtectedRouter';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const MatchingPage = lazy(() => import('../pages/MatchingPage'));
const GamePage = lazy(() => import('../pages/GamePage'));
const GameOverPage = lazy(() => import('../pages/GameOverPage'));
const TournamentCallbackPage = lazy(
  () => import('../pages/TournamentCallbackPage'),
);
const ChallengermodeCallbackPage = lazy(
  () => import('../pages/ChallengermodeCallbackPage'),
);
const ChallengermodeIntentPage = lazy(
  () => import('../pages/ChallengermodeIntentPage'),
);

const AuthRouter = () => {
  const [gameScreen] = useAtom(gameScreenAtom);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // challengermode 경로에서는 HOME 상태일 때만 리다이렉트하지 않음
    if (
      location.pathname.startsWith('/challengermode/') &&
      gameScreen === GameScreen.HOME
    ) {
      return;
    }

    // challengermode-intent 경로에서는 리다이렉트하지 않음
    if (location.pathname.startsWith('/challengermode-intent/')) {
      return;
    }

    // tournament-callback 경로에서는 리다이렉트하지 않음
    if (location.pathname === '/tournament-callback') {
      return;
    }

    switch (gameScreen) {
      case GameScreen.HOME:
        if (location.pathname !== '/home') {
          navigate('/home');
        }
        break;
      case GameScreen.MATCHING:
        if (location.pathname !== '/matching') {
          navigate('/matching');
        }
        break;
      case GameScreen.GAME:
        if (location.pathname !== '/game') {
          navigate('/game');
        }
        break;
      case GameScreen.GAME_OVER:
        if (location.pathname !== '/game-over') {
          navigate('/game-over');
        }
        break;
    }
  }, [gameScreen, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tournament-callback" element={<TournamentCallbackPage />} />
      <Route
        path="/challengermode/:id"
        element={<ChallengermodeCallbackPage />}
      />
      <Route
        path="/challengermode-intent/:ott"
        element={<ChallengermodeIntentPage />}
      />
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
