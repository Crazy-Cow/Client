import { GameRankData } from '../types/game';
import { MyGameResult, PlayerInfo } from '../types/player';
import HttpClient from './HttpClient';

export default class GameService {
  constructor(private readonly httpClient: HttpClient) {}

  async registerPlayer(playerInfo: PlayerInfo): Promise<string> {
    const response = await this.httpClient.post<{ userId: string }>(
      '/user/enter',
      { userId: playerInfo.id, nickName: playerInfo.nickname },
    );
    return response.userId;
  }

  // 토너먼트 플레이어 등록 (OAuth 토큰 교환 포함)
  async registerTournamentPlayer(
    playerInfo: PlayerInfo,
    authorizationCode: string,
    codeVerifier: string,
  ): Promise<{ userId: string; accountId: string }> {
    const response = await this.httpClient.post<{
      userId: string;
      accountId: string;
    }>('/user/enter/tournament', {
      nickName: playerInfo.nickname,
      authorizationCode,
      codeVerifier,
      redirectUri: window.location.origin + '/tournament-callback',
    });
    localStorage.setItem('accountId', response.accountId);
    localStorage.setItem('nickname', response.userId);
    return { userId: response.userId, accountId: response.accountId };
  }

  async getTotalGameResult(roomId: string): Promise<GameRankData> {
    const response = await this.httpClient.get<GameRankData>(
      '/game/summary/total-rank',
      {},
      { roomId },
    );
    return response;
  }

  async getMyGameResult(roomId: string, userId: string): Promise<MyGameResult> {
    const response = await this.httpClient.get<MyGameResult>(
      '/game/summary/personal',
      {},
      { roomId, userId },
    );
    return response;
  }
}
