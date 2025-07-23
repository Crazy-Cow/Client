import { ItemType } from './game';

export type Directions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};
export type Position = { x: number; y: number; z: number };

export interface Character {
  id: string;
  charType: 1 | 2 | 3;
  nickName: string;
  position: Position;
  charColor: string;
  velocity: Position;
  giftCnt: number;
  stealMotion: boolean;
  stolenMotion: boolean;
  protectMotion: number;
  eventBlock: number;
  isSkillActive: boolean;
  totalSkillCooldown: number;
  currentSkillCooldown: number;
  speed: number;
  items: ItemType[];
  itemDuration: { boost: number; shield: number };
  thunderEffect: number[];
  isAwaitingTeleportAck: boolean;
}

export interface PlayerMovement {
  steal: boolean;
  skill: boolean;
  item: Boolean;
  character: Pick<Character, 'id' | 'position' | 'velocity'>;
  teleportAck: boolean;
}

export interface PlayerInfo {
  id: string | null | undefined;
  nickname: string;
  tournamentMode?: boolean;
  challengermodeId?: string;
  gameSessionId?: string;
}

export interface KillLogInfo {
  actor: { id: string; nickName: string };
  victim: { id: string; nickName: string };
}

type StealComboType = 'double' | 'triple' | 'multiple';
export interface KillComboLogsInfo {
  actor: { id: string; nickName: string; combo: StealComboType };
}

export interface MyGameResult {
  character: {
    id: string;
    nickName: string;
    charType: number;
    charColor: string;
  };
  badges: [
    {
      label: string;
      img: string;
    },
  ];
  summary: [
    {
      label: string;
      value: number;
    },
    {
      label: string;
      value: number;
    },
    {
      label: string;
      value: number;
    },
    {
      label: string;
      value: number;
    },
  ];
}
