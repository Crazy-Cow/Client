import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { gameScreenAtom, characterCharIndexAtom } from '../atoms/GameAtoms';
import { GameScreen } from '../types/game';
import useSocket from '../hooks/useSocket';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SkillBadge from '../components/UI/SkillBadge';
import AnimatedRabbit from '../models/AnimatedRabbit';
import AnimatedSanta from '../models/AnimatedSanta';
import AnimatedGhost from '../models/AnimatedGhost';

const ChallengermodeCallbackPage = () => {
  const { id } = useAtomValue(playerInfoAtom);
  const setGameScreen = useSetAtom(gameScreenAtom);
  const { id: gameSessionId } = useParams<{ id: string }>();
  const [_, setPlayer] = useAtom(playerInfoAtom);
  const [characterCharIndex, setCharacterCharIndex] = useAtom(
    characterCharIndexAtom,
  );
  const { socket } = useSocket(gameSessionId);

  // 소켓 이벤트 리스너 설정
  useEffect(() => {
    if (!socket) return;
    const challengermodeNickname = localStorage.getItem('nickname');

    // room.launchGame.response 이벤트 수신 시 플레이어 정보 업데이트 및 room.confirm 전송
    const unsubscribeLaunchGameResponse = socket.onLaunchGameResponse(
      (data: { userId: string; nickName: string; isGuest: boolean }) => {
        console.log('Received room.launchGame.response:', data);
        setPlayer((prev) => {
          const updated = {
            ...prev,
            id: data.userId,
            nickname: challengermodeNickname || data.nickName,
            gameSessionId,
          };

          return updated;
        });

        // response로 받은 내용을 서버로 다시 전송
        if (gameSessionId) {
          socket.confirmRoom(
            data.userId,
            characterCharIndex + 1,
            gameSessionId,
          );
        } else {
          console.error('Cannot confirm room: gameSessionId is not available');
        }
      },
    );

    // game.join 이벤트 수신 시 게임 화면으로 이동
    const unsubscribeGameJoin = socket.onGameJoin(() => {
      console.log('Received game.join event, moving to game page');
      setGameScreen(GameScreen.GAME);
    });

    return () => {
      unsubscribeLaunchGameResponse();
      unsubscribeGameJoin();
    };
  }, [socket, setPlayer, setGameScreen, gameSessionId, id]);

  const handleGameStart = () => {
    if (!socket || !gameSessionId) return;
    const challengermodeId = localStorage.getItem('accountId');
    const challengermodeNickname = localStorage.getItem('nickname');
    socket.launchGame(
      characterCharIndex + 1,
      gameSessionId,
      challengermodeId || undefined,
      challengermodeNickname || undefined,
    );
  };

  const nextCharacter = () => {
    setCharacterCharIndex((prev) => (prev + 1) % 3);
  };

  const prevCharacter = () => {
    setCharacterCharIndex((prev) => (prev - 1 + 3) % 3);
  };

  // 소켓이 연결되지 않은 경우 로딩 화면 표시
  if (!socket || !gameSessionId) {
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
              <p className="text-lg font-semibold">
                게임에 입장하고 있습니다...
              </p>
              <p className="text-sm text-gray-600 mt-2">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 플레이어가 등록된 경우 HomePage와 동일한 화면 표시
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <img
        src={import.meta.env.VITE_HOME_IMAGE_URL}
        alt="background"
        className="absolute w-full h-full object-cover blur-sm"
      />
      <div className="inset-0 relative z-10 flex flex-col w-full h-full justify-between">
        <div className="flex items-center gap-2 m-4">
          <span className="flex flex-col justify-center items-center w-64 h-20 rounded-xl text-white border-6-pinkish-ivory border-4 bg-4-purple-light">
            <p className="text-lg font-semibold">{gameSessionId}</p>
            <small>메리 크리스마스🎅🏻</small>
          </span>
        </div>
        <div className="relative flex items-center justify-center w-full h-full">
          <button
            onClick={prevCharacter}
            className="absolute left-4 z-20 p-4 rounded-full hover:scale-110 transition-all outline-none bg-5-purple-deep"
            aria-label="character-choose-left-button"
          >
            <img
              src="/images/leftArrow.svg"
              alt="left-Arrow"
              className="w-8 h-8"
            />
          </button>
          <Canvas camera={{ position: [0, 1, 5], fov: 45 }} className="-mt-10">
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 5, 6]} intensity={1} />
            {characterCharIndex === 0 && (
              <AnimatedRabbit
                scale={0.8}
                animation="CharacterArmature|Yes"
                position={[0, -2, 0]}
                charColor="pink"
                nickName=" "
              />
            )}
            {characterCharIndex === 1 && (
              <AnimatedSanta
                scale={0.7}
                animation="Armature|Excited"
                position={[0, -2, 0]}
                charColor=" "
                nickName=" "
                isInGame={false}
              />
            )}
            {characterCharIndex === 2 && (
              <AnimatedGhost
                scale={0.8}
                animation="CharacterArmature|Fast_Flying"
                position={[0, -2, 0]}
                charColor="gray"
                nickName=" "
              />
            )}
            <OrbitControls
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
          {characterCharIndex === 0 && (
            <SkillBadge
              img="portal"
              name="토끼의 발자국"
              desc1="점프! 점프! 어디서 나타났지?"
              desc2="워프를 통해 눈 깜짝할 사이에 순간이동해보세요!🐰"
            />
          )}
          {characterCharIndex === 1 && (
            <SkillBadge
              img="rudolph"
              name="루돌프의 질주"
              desc1="눈길 따윈 걱정 없어요!"
              desc2="루돌프 썰매를 타고 1.5배 더 빠르게 질주해보세요!🎅🏻"
            />
          )}
          {characterCharIndex === 2 && (
            <SkillBadge
              img="ghost"
              name="소리 없는 날갯짓"
              desc1="쉿… 바람 소리만 남기고 사라지세요."
              desc2="5초간 아무도 당신이 어디 있는지 모릅니다!👻"
            />
          )}
          <button
            onClick={nextCharacter}
            className="absolute right-4 z-20 p-4 rounded-full hover:scale-110 transition-all outline-none bg-5-purple-deep"
            aria-label="character-choose-right-button"
          >
            <img
              src="/images/rightArrow.svg"
              alt="right-Arrow"
              className="w-8 h-8"
            />
          </button>
        </div>
        <div className="flex justify-end mb-8 mr-8">
          <button
            onClick={handleGameStart}
            className="bg-3-xmas-gold text-white text-3xl font-bold rounded-xl transition-colors min-w-56 min-h-16 p-4 border-6-pinkish-ivory border-4 hover:scale-110"
          >
            플레이!
          </button>
        </div>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-opacity-50 text-sm">
        캐릭터를 선택해주세요 🐰🎅🏻👻
      </div>
    </div>
  );
};

export default ChallengermodeCallbackPage;
