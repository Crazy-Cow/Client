import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { gameScreenAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import useGame from '../hooks/useGame';

const TournamentCallbackPage = () => {
  const [player, setPlayer] = useAtom(playerInfoAtom);
  const setGameScreen = useSetAtom(gameScreenAtom);
  const { registerTournamentPlayerQuery } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // state와 code_verifier 정리
        sessionStorage.removeItem('challengermode_state');
        sessionStorage.removeItem('challengermode_code_verifier');
        sessionStorage.removeItem('tournament_nickname');

        console.log('OAuth 인증 성공! Authorization Code:', code);
        console.log('플레이어 정보:', player);
        console.log('토너먼트 닉네임:', tournamentNickname);

        // 서버에서 토큰 교환 및 플레이어 등록
        const {userId, accountId} = await registerTournamentPlayerQuery({
          playerInfo: {
            ...player,
            nickname: tournamentNickname || player.nickname,
          },
          authorizationCode: code,
          codeVerifier: codeVerifier,
        });

        setPlayer((prev) => ({
          ...prev,
          id: userId,
          nickname: userId,
          tournamentMode: true,
          challengermodeId: 'tournament-user', // 서버에서 실제 ID를 받아올 수 있음
        }));

        setGameScreen(GameScreen.HOME);
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
      <div className="fixed inset-0 flex items-center justify-center flex-col">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">토너먼트 인증 중...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">인증 실패</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => setGameScreen(GameScreen.LOGIN)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TournamentCallbackPage;
