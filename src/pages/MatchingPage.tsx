import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import {
  characterCharIndexAtom,
  gameScreenAtom,
  playAudioAtom,
} from '../atoms/GameAtoms';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { GameScreen } from '../types/game';
import useSocket from '../hooks/useSocket';
import Star, { generateStars } from '../components/UI/Star';
import KeyboardGuide from '../components/UI/KeyboardGuide';

interface RoomInfo {
  playerCnt: number;
}

interface Meteor {
  id: number;
  startX: number;
  startY: number;
}

const MatchingPage = () => {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [, setGameScreen] = useAtom(gameScreenAtom);
  const [, playAudio] = useAtom(playAudioAtom);
  const { socket } = useSocket();
  const [characterCharIndex] = useAtom(characterCharIndexAtom);
  const [playerInfo] = useAtom(playerInfoAtom);

  useEffect(() => {
    if (!socket) return;

    // 토너먼트 모드인지 확인
    const isTournamentMode = playerInfo.tournamentMode === true;

    // challengermode에서 들어온 경우 room.launchGame 이벤트 emit
    if (playerInfo.gameSessionId) {
      socket.launchGame(characterCharIndex + 1, playerInfo.gameSessionId);
    } else {
      // 일반 모드인 경우 room.enter 이벤트 emit
      socket.enterRoom(characterCharIndex + 1, isTournamentMode);
    }

    const unsubscribeRoomState = socket.onRoomStateChange(
      (roomInfo: RoomInfo) => {
        setPlayerCount(roomInfo.playerCnt);
      },
    );
    const unsubscribeGameState = socket.onGameStartSoon(() => {
      setIsStarting(true);
    });
    const unsubscribeGameStart = socket.onGameStart(() => {
      setGameScreen(GameScreen.GAME);
    });

    return () => {
      unsubscribeRoomState();
      unsubscribeGameState();
      unsubscribeGameStart();
    };
  }, [
    socket,
    setGameScreen,
    setPlayerCount,
    characterCharIndex,
    playerInfo.tournamentMode,
    playerInfo.gameSessionId,
  ]);

  const createMeteor = (e: React.MouseEvent<HTMLDivElement>) => {
    playAudio('twinkle');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newMeteor: Meteor = {
      id: Date.now(),
      startX: x,
      startY: y,
    };

    setMeteors((prev) => [...prev, newMeteor]);

    setTimeout(() => {
      setMeteors((prev) => prev.filter((meteor) => meteor.id !== newMeteor.id));
    }, 2000);
  };

  const stars = useMemo(() => generateStars(20), []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-black via-purple-950 to-blue-950"
      onClick={createMeteor}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20px 30px, #FFD700, rgba(0,0,0,0)), ' +
            'radial-gradient(1px 1px at 40px 70px, #FF69B4, rgba(0,0,0,0)), ' +
            'radial-gradient(1px 1px at 50px 160px, #87CEEB, rgba(0,0,0,0)), ' +
            'radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)), ' +
            'radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)), ' +
            'radial-gradient(1px 1px at 160px 120px, #fff, rgba(0,0,0,0))',
          backgroundSize: '200px 200px',
        }}
      />
      {stars.map((star) => (
        <Star key={star.id} star={star} />
      ))}
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute animate-shooting-star"
          style={{
            top: meteor.startY,
            left: meteor.startX,
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
          <div className="absolute w-40 h-1 -right-40 top-1/2 -translate-y-1/2 bg-gradient-to-l from-transparent to-white opacity-40" />
        </div>
      ))}

      <KeyboardGuide />
      <div className="relative z-10 flex gap-10 text-white text-opacity-80 justify-center items-center w-full h-full text-xl">
        <div>
          <p>
            1️⃣ <b>선물을 많이 모으세요!</b>
          </p>
          <small className="mb-2">
            가장 많은 선물을 가진 플레이어가 우승해요!🎁
          </small>
        </div>
        <div>
          <p>
            2️⃣ <b>스킬을 활용하세요!</b>
          </p>
          <small className="mb-1">
            다른 플레이어의 선물을 빼앗아 승리하세요.🎅🏻
          </small>
        </div>
        <div>
          <p>
            3️⃣ <b>연속 캐치 보너스!</b>
          </p>
          <small className="mb-1">
            연속으로 빼앗으면 보너스! 동점 땐 이게 승부수!🎯
          </small>
        </div>
      </div>
      <div className="absolute top-32 left-1/2 -translate-x-1/2 text-white text-opacity-80 flex flex-col gap-5">
        <div className="flex items-center">
          {isStarting ? (
            <span className="animate-pulse text-4xl">곧 게임이 시작돼요👻</span>
          ) : (
            <>
              <span className="font-semibold text-4xl rounded-full bg-white w-14 h-14 flex items-center justify-center text-black">
                {playerCount}
              </span>
              <span className="ml-2 text-4xl">명 접속중🐰</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingPage;
