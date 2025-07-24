import { useEffect } from 'react';
import { SocketService } from '../apis/SocketService';
import { useAtom, useAtomValue } from 'jotai';
import { socketServiceAtom, socketStatusAtom } from '../atoms/GameAtoms';
import { playerInfoAtom } from '../atoms/PlayerAtoms';

const useSocket = (gameSessionId?: string) => {
  const [socket, setSocket] = useAtom(socketServiceAtom);
  const [status, setStatus] = useAtom(socketStatusAtom);

  const { id } = useAtomValue(playerInfoAtom);

  useEffect(() => {
    // gameSessionId가 있으면 그것을 사용, 없으면 player.id 사용
    const socketId = gameSessionId || id;

    if (socket || !socketId) return;

    const socketService = SocketService.getInstance(socketId);
    setStatus('connecting');

    socketService.onConnect(() => {
      // 이건 소켓 디버깅이 완료되면 추후에 빼겠습니다!
      console.log('usSocket에서 연결된 생태: ', socketService.id);
    });
    setSocket(socketService);
    if (socketService.connected) setStatus('connected');
  }, [id, gameSessionId]);

  return { socket, status, connected: status === 'connected' };
};

export default useSocket;
