import { useAtomValue } from 'jotai';
import { KillComboLogsAtom, killLogsAtom } from '../atoms/GameAtoms';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { useEffect, useState } from 'react';

const KillLogs = () => {
  const kilLogs = useAtomValue(killLogsAtom);
  const comboLogs = useAtomValue(KillComboLogsAtom);
  const playerInfo = useAtomValue(playerInfoAtom);
  const [showDamageOverlay, setShowDamageOverlay] = useState(false);

  useEffect(() => {
    const latestLog = kilLogs[kilLogs.length - 1];
    if (latestLog?.victim.id === playerInfo.id) {
      setShowDamageOverlay(true);
      setTimeout(() => setShowDamageOverlay(false), 1000);
    }
  }, [kilLogs, playerInfo.id]);

  return (
    <>
      <div className="fixed top-20 right-1/2 translate-x-1/2 flex flex-col gap-2 pointer-events-none">
        {comboLogs.map(({ actor: { nickName, combo } }, index) => {
          let message = '';
          if (combo === 'double') message = '더블';
          else if (combo === 'triple') message = '트리플';
          else if (combo === 'multiple') message = '미쳐버린';
          return (
            <div
              key={`combo-log-${index}`}
              className="flex justify-center w-screen gap-2 text-5xl animate-slideIn font-extrabold"
            >
              <span
                className="flex text-1-xmas-green"
                style={{
                  textShadow: `
      2px 2px 0 white, 
      -2px -2px 0 white, 
      2px -2px 0 white, 
      -2px 2px 0 white
    `,
                }}
              >
                {nickName}의
              </span>
              <span
                className="flex text-2-xmas-red"
                style={{
                  textShadow: `
      2px 2px 0 white, 
      -2px -2px 0 white, 
      2px -2px 0 white, 
      -2px 2px 0 white
    `,
                }}
              >
                {message} CATCH!
              </span>
            </div>
          );
        })}
      </div>
      <div className="fixed top-1/2 right-5 flex flex-col gap-2 pointer-events-none">
        {kilLogs.map((log, index) => (
          <div
            key={`kill-log-${index}`}
            className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg whitespace-nowrap text-base animate-slideIn"
          >
            {log.victim.nickName}(이)의 선물을 {log.actor.nickName}(이)가
            빼앗았습니다👻
          </div>
        ))}
      </div>
      {showDamageOverlay && (
        <div
          className="fixed inset-0 pointer-events-none animate-damage-flash"
          style={{
            background: `
              linear-gradient(to right, rgba(255,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(255,0,0,0.3) 100%),
              linear-gradient(to bottom, rgba(255,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(255,0,0,0.3) 100%)
            `,
          }}
        />
      )}
    </>
  );
};
export default KillLogs;
