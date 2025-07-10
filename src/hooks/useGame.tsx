import HttpClient from '../apis/HttpClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import GameService from '../apis/GameService';
import { PlayerInfo } from '../types/player';

const useGame = () => {
  const httpClient = new HttpClient();
  const game = new GameService(httpClient);
  const queryClient = useQueryClient();

  const { mutateAsync: registerPlayerQuery } = useMutation({
    mutationFn: (playerInfo: PlayerInfo) => game.registerPlayer(playerInfo),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['playerInfo'] }),
  });

  const { mutateAsync: registerTournamentPlayerQuery } = useMutation({
    mutationFn: ({
      playerInfo,
      authorizationCode,
      codeVerifier,
    }: {
      playerInfo: PlayerInfo;
      authorizationCode: string;
      codeVerifier: string;
    }) =>
      game.registerTournamentPlayer(
        playerInfo,
        authorizationCode,
        codeVerifier,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['playerInfo'] }),
  });

  const { mutateAsync: gameRankQuery, isPending: isPendingRankQuery } =
    useMutation({
      mutationFn: (roomId: string) => game.getTotalGameResult(roomId),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['rankInfo'] }),
    });

  const { mutateAsync: myGameResultQuery, isPending: isPendingResultQuery } =
    useMutation({
      mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
        game.getMyGameResult(roomId, userId),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['myGameInfo'] }),
    });
  return {
    registerPlayerQuery,
    registerTournamentPlayerQuery,
    gameRankQuery,
    isPendingRankQuery,
    myGameResultQuery,
    isPendingResultQuery,
  };
};

export default useGame;
