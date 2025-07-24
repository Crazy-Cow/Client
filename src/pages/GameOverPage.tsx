import { useAtomValue } from 'jotai';
import { roomIdAtom } from '../atoms/GameAtoms';
import { Row } from '../types/game';
import { lazy, useEffect, useState } from 'react';
import useGame from '../hooks/useGame';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import cls from 'classnames';
import { Canvas } from '@react-three/fiber';
const AnimatedRabbit = lazy(() => import('../models/AnimatedRabbit'));
const AnimatedSanta = lazy(() => import('../models/AnimatedSanta'));
const AnimatedGhost = lazy(() => import('../models/AnimatedGhost'));

const GameOverPage = () => {
  // NOTE: 게임 재시작 비활성화
  // const [, setGameScreen] = useAtom(gameScreenAtom);
  const roomId = useAtomValue(roomIdAtom);
  const { gameRankQuery, isPendingRankQuery } = useGame();
  const [row, setRow] = useState<Row[]>([]);
  const { id } = useAtomValue(playerInfoAtom);

  useEffect(() => {
    const fetchWinner = async () => {
      const { rows } = await gameRankQuery(roomId);
      setRow(rows);
    };
    fetchWinner();
  }, [gameRankQuery, setRow, roomId]);

  // const handlePlayAgain = () => {
  //   setGameScreen(GameScreen.HOME);
  // };

  const CharacterWithMedal = ({
    characterType,
    rank,
    characterColor,
  }: {
    characterType: number;
    rank: number;
    characterColor: string;
  }) => (
    <div className="relative inline-block w-14 h-14 bg-white rounded-lg">
      <Canvas camera={{ position: [0, 1, 5], fov: 25 }} className="">
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 5, 6]} intensity={1.5} />
        {characterType === 1 && (
          <AnimatedRabbit
            scale={0.8}
            animation={
              rank === 1 ? 'CharacterArmature|Wave' : 'CharacterArmature|No'
            }
            position={[0, -2, 0]}
            charColor={characterColor}
            nickName=" "
          />
        )}
        {characterType === 2 && (
          <AnimatedSanta
            scale={0.8}
            animation={rank === 1 ? 'Armature|Excited' : 'Armature|No'}
            position={[0, -2.7, 0]}
            charColor={characterColor}
            nickName=" "
            isInGame={false}
          />
        )}
        {characterType === 3 && (
          <AnimatedGhost
            scale={0.9}
            animation={
              rank === 1 ? 'CharacterArmature|Yes' : 'CharacterArmature|Punch'
            }
            position={[0, -2, 0]}
            charColor={characterColor}
            nickName=" "
          />
        )}
      </Canvas>
      {rank === 1 && (
        <img
          src="/images/medalIcon.webp"
          alt="medal"
          className="absolute -top-3 -right-4 w-10 h-10"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <style>
        {`
          .tooltip-container {
            position: relative;
            display: inline-block;
          }
          
          .tooltip-content {
            visibility: hidden;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            white-space: nowrap;
            z-index: 50;
            margin-bottom: 5px;
          }
          
          .tooltip-container:hover .tooltip-content {
            visibility: visible;
          }
        `}
      </style>
      <img
        src={import.meta.env.VITE_GAME_OVER_IMAGE_URL}
        alt="background"
        className="absolute w-full h-full object-cover"
      />
      <div className="inset-0 relative z-10 flex flex-col w-full h-full justify-center items-center">
        {isPendingRankQuery && (
          <div className="flex flex-col items-center justify-center text-white text-xl">
            게임 결과를 받아오는 중이예요🎅🏻
          </div>
        )}
        {row && (
          <div className="flex flex-col items-center gap-2 mt-10 bg-black/50 rounded-md mx-20 py-5 max-w-7xl w-full">
            <div className="w-full relative">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-300 text-xl">
                    <th className="p-2 text-center w-[5%]"></th>
                    <th className="p-2 text-center w-[5%]"></th>
                    <th className="p-2 text-center w-[15%]"></th>
                    <th className="p-2 text-center w-[15%]">획득 뱃지</th>
                    <th className="p-2 text-center w-[10%]">선물</th>
                    <th className="p-2 text-center w-[12.5%]">멀티플 콤보</th>
                    <th className="p-2 text-center w-[12.5%]">트리플 콤보</th>
                    <th className="p-2 text-center w-[12.5%]">더블 콤보</th>
                    <th className="p-2 text-center w-[12.5%]">누적 스틸</th>
                  </tr>
                </thead>
                <tbody>
                  {row.map((r) => (
                    <tr
                      key={r.userId}
                      className={cls('text-white text-center align-middle', {
                        'bg-3-xmas-gold/40': id === r.userId,
                      })}
                    >
                      <td className="p-2 text-2xl font-bold">{r.rank}</td>
                      <td className="p-2">
                        <CharacterWithMedal
                          characterType={r.charcterType}
                          rank={r.rank}
                          characterColor={r.charcterColor}
                        />
                      </td>
                      <td className="p-2 text-xl">{r.nickName}</td>
                      <td className="p-2">
                        <div className="flex gap-2 items-center">
                          {r.badges.slice(0, 3).map((b) => (
                            <div className="tooltip-container">
                              <img
                                src={b.img}
                                alt={b.label}
                                className="w-14 h-14 rounded-full hover:cursor-pointer"
                              />
                              <span className="tooltip-content">{b.label}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 text-xl font-semibold">{r.gifts}</td>
                      <td className="p-2 text-xl font-semibold">
                        {r.multipleCombos}
                      </td>
                      <td className="p-2 text-xl font-semibold">
                        {r.tripleCombos}
                      </td>
                      <td className="p-2 text-xl font-semibold">
                        {r.doubleCombos}
                      </td>
                      <td className="p-2 text-xl font-semibold">
                        {r.accSteals}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* <div className="absolute bottom-0 w-full flex justify-between">
          <button
            onClick={handlePlayAgain}
            className="bg-white text-xl font-semibold rounded-tr-xl transition-colors min-w-56 min-h-16 p-4 hover:scale-110"
            type="button"
            aria-label="play-agin"
          >
            한판 더?
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default GameOverPage;
