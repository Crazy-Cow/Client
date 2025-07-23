import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { gameScreenAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import useGame from '../hooks/useGame';
import { useNavigate } from 'react-router-dom';

const TournamentCallbackPage = () => {
  const [player, setPlayer] = useAtom(playerInfoAtom);
  const setGameScreen = useSetAtom(gameScreenAtom);
  const { registerTournamentPlayerQuery } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        // 에러 체크
        if (error) {
          setError(`OAuth 에러: ${error}`);
          setIsLoading(false);
          return;
        }

        // 필수 파라미터 체크
        if (!code || !state) {
          setError('필수 OAuth 파라미터가 누락되었습니다.');
          setIsLoading(false);
          return;
        }

        // CSRF 방지를 위한 state 검증
        const savedState = sessionStorage.getItem('challengermode_state');
        if (state !== savedState) {
          setError('OAuth state 검증에 실패했습니다.');
          setIsLoading(false);
          return;
        }

        // PKCE code_verifier 가져오기
        const codeVerifier = sessionStorage.getItem(
          'challengermode_code_verifier',
        );
        if (!codeVerifier) {
          setError('PKCE code_verifier가 없습니다.');
          setIsLoading(false);
          return;
        }

        // 토너먼트 닉네임 가져오기
        const tournamentNickname = sessionStorage.getItem(
          'tournament_nickname',
        );
        if (tournamentNickname) {
          setPlayer((prev) => ({ ...prev, nickname: tournamentNickname }));
        }

        // localStorage에서 gameSessionId 가져오기
        const gameSessionId =
          localStorage.getItem('tournament_gameSessionId') || '';

        console.log('OAuth 인증 성공! Authorization Code:', code);
        console.log('플레이어 정보:', player);
        console.log('토너먼트 닉네임:', tournamentNickname);
        console.log('gameSessionId from localStorage:', gameSessionId);

        // 서버에서 토큰 교환 및 플레이어 등록
        const { userId, accountId } = await registerTournamentPlayerQuery({
          playerInfo: {
            ...player,
            nickname: tournamentNickname || player.nickname,
            gameSessionId: gameSessionId || undefined,
          },
          authorizationCode: code,
          codeVerifier: codeVerifier,
          gameSessionId: gameSessionId || undefined,
        });

        console.log('TournamentCallbackPage - Setting player info:', {
          userId,
          accountId,
          gameSessionId,
        });

        setPlayer((prev) => ({
          ...prev,
          id: userId,
          nickname: userId,
          tournamentMode: true,
          challengermodeId: accountId, // 서버에서 실제 ID를 받아올 수 있음
          gameSessionId,
        }));

        // state와 code_verifier 정리 (플레이어 정보 설정 후)
        sessionStorage.removeItem('challengermode_state');
        sessionStorage.removeItem('challengermode_code_verifier');
        sessionStorage.removeItem('tournament_nickname');
        localStorage.removeItem('tournament_gameSessionId');

        // setPlayer가 완전히 처리된 후에 HOME으로 이동
        setGameScreen(GameScreen.HOME);
        navigate('/home');
      } catch (err) {
        console.error('OAuth 콜백 처리 중 에러:', err);
        setError('토너먼트 인증 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">
              토너먼트 인증 중
            </h2>
            <p className="text-blue-200 text-lg">잠시만 기다려주세요...</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-pink-900 to-rose-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">인증 실패</h2>
            <p className="text-red-200 text-lg mb-6">{error}</p>
            <button
              onClick={() => setGameScreen(GameScreen.LOGIN)}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TournamentCallbackPage;
