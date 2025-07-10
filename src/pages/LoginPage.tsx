import { ChangeEvent, FormEvent, useCallback, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { gameScreenAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import useGame from '../hooks/useGame';
import useUser from '../hooks/useUser';

const LoginPage = () => {
  const [player, setPlayer] = useAtom(playerInfoAtom);
  const setGameScreen = useSetAtom(gameScreenAtom);
  const { registerPlayerQuery } = useGame();
  const inputRef = useRef<HTMLInputElement>(null);
  const { nicknameQuery } = useUser();

  useEffect(() => {
    if (player.id) {
      setGameScreen(GameScreen.HOME);
    }
    if (nicknameQuery) {
      setPlayer((prev) => ({ ...prev, nickname: nicknameQuery }));
      setGameScreen(GameScreen.LOGIN);
    }
  }, [nicknameQuery, player.id]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleRegisterPlayer = useCallback(async () => {
    const userId = await registerPlayerQuery(player);
    setPlayer((prev) => ({ ...prev, id: userId }));
    setGameScreen(GameScreen.HOME);
  }, [player, registerPlayerQuery, setGameScreen]);

  const handleTournamentEntry = useCallback(async () => {
    // 현재 입력된 닉네임을 sessionStorage에 저장 (페이지 이동 후에도 유지)
    const currentNickname = inputRef.current?.value || player.nickname;
    if (currentNickname) {
      sessionStorage.setItem('tournament_nickname', currentNickname);
      setPlayer((prev) => ({ ...prev, nickname: currentNickname }));
    }

    // Challengermode OAuth 설정
    const CHALLENGERMODE_CLIENT_ID = import.meta.env
      .VITE_CHALLENGERMODE_CLIENT_ID;
    const CHALLENGERMODE_REDIRECT_URI = import.meta.env
      .VITE_CHALLENGERMODE_REDIRECT_URI;
    const CHALLENGERMODE_AUTH_URL =
      'https://challengermode.com/oauth/authorize';

    // PKCE 구현
    // 1. Generate a URL safe code_verifier
    const generateCodeVerifier = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    };

    // 2. Generate the code_challenge
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

    // code_verifier를 sessionStorage에 저장 (토큰 교환 시 사용)
    sessionStorage.setItem('challengermode_code_verifier', codeVerifier);

    // CSRF 방지를 위한 state 생성
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('challengermode_state', state);

    // OAuth 인증 URL 생성 (PKCE 포함)
    const authUrl = new URL(CHALLENGERMODE_AUTH_URL);
    authUrl.searchParams.append('client_id', CHALLENGERMODE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', CHALLENGERMODE_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);

    // 사용자를 Challengermode OAuth 페이지로 리다이렉트
    window.location.href = authUrl.toString();
  }, [player.nickname, setPlayer]);

  const handleNicknameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPlayer((prev) => ({ ...prev, nickname: e.target.value }));
    },
    [player, setPlayer],
  );

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
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">닉네임</label>
            <input
              ref={inputRef}
              aria-label="nickname-input"
              type="text"
              onChange={handleNicknameChange}
              placeholder={player.nickname || '닉네임을 입력하세요'}
              className="w-full text-lg p-3 border border-gray-300 rounded focus:outline-none"
            />
            <small className="ml-1">게스트 모드로 바로 입장가능해요🧑‍🎄</small>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegisterPlayer}
              className="w-full bg-0-accentColor text-white py-3 rounded hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold outline-none"
            >
              입장하기
            </button>
            <button
              onClick={handleTournamentEntry}
              className="w-full bg-[#228B22] text-white py-3 rounded hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold outline-none"
            >
              KEM 토너먼트 입장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
