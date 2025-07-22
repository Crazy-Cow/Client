import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ChallengermodeCallbackPage = () => {
  const { id: gameSessionId } = useParams<{ id: string }>();

  // URL 파라미터에서 sessionId 확인 및 자동 OAuth 실행
  useEffect(() => {
    if (gameSessionId) {
      // gameSessionId가 있으면 자동으로 Challengermode OAuth 실행
      const handleChallengermodeOAuth = async () => {
        // gameSessionId를 localStorage에 저장
        localStorage.setItem('tournament_gameSessionId', gameSessionId);

        // Challengermode OAuth 설정
        const CHALLENGERMODE_CLIENT_ID = import.meta.env
          .VITE_CHALLENGERMODE_CLIENT_ID;
        const CHALLENGERMODE_REDIRECT_URI = import.meta.env
          .VITE_CHALLENGERMODE_REDIRECT_URI;
        const CHALLENGERMODE_AUTH_URL =
          'https://challengermode.com/oauth/authorize';

        // PKCE 구현
        const generateCodeVerifier = () => {
          const array = new Uint8Array(32);
          crypto.getRandomValues(array);
          return btoa(String.fromCharCode(...array))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        };

        const generateCodeChallenge = async (verifier: string) => {
          const encoder = new TextEncoder();
          const data = encoder.encode(verifier);
          const digest = await crypto.subtle.digest('SHA-256', data);
          return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        };

        // PKCE 키 생성
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // code_verifier를 sessionStorage에 저장
        sessionStorage.setItem('challengermode_code_verifier', codeVerifier);

        // CSRF 방지를 위한 state 생성
        const state =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('challengermode_state', state);

        // OAuth 인증 URL 생성 (PKCE 포함)
        const authUrl = new URL(CHALLENGERMODE_AUTH_URL);
        authUrl.searchParams.append('client_id', CHALLENGERMODE_CLIENT_ID);
        authUrl.searchParams.append(
          'redirect_uri',
          CHALLENGERMODE_REDIRECT_URI,
        );
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('state', state);

        // 사용자를 Challengermode OAuth 페이지로 리다이렉트
        window.location.href = authUrl.toString();
      };

      handleChallengermodeOAuth();
    }
  }, [gameSessionId]);

  // OAuth 리다이렉트 중 로딩 화면 표시
  return (
    <div className="fixed inset-0 flex items-center justify-center flex-col">
      <video
        autoPlay
        loop
        muted
        preload="auto"
        className="absolute w-full h-full object-cover"
        aria-label="xmas-background-video"
      >
        <source src={import.meta.env.VITE_VIDEO_URL} type="video/mp4" />
      </video>
      <div className="relative z-10 flex flex-col gap-10">
        <h1 className="text-center font-bold text-white text-6xl">
          X-MAS RUN🎅🏻
        </h1>
        <div className="flex flex-col justify-center gap-6 bg-white p-8 rounded-lg shadow-xl min-w-[28rem]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-0-accentColor mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Challengermode 인증 중...</p>
            <p className="text-sm text-gray-600 mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengermodeCallbackPage;
