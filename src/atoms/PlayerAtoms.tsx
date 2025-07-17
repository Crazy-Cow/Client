import { atom } from 'jotai';
import { Character, PlayerInfo, PlayerMovement } from '../types/player';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export const playerMovementAtom = atom<PlayerMovement>({
  steal: false,
  skill: false,
  item: false,
  character: {
    id: '',
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
  },
  teleportAck: false,
});
export const playersAtom = atom<Character[]>([
  {
    id: '',
    charType: 1,
    nickName: 'ONGSIM',
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    charColor: 'gold',
    giftCnt: 0,
    stealMotion: false,
    stolenMotion: false,
    protectMotion: 0,
    eventBlock: 0,
    isSkillActive: false,
    totalSkillCooldown: 0,
    currentSkillCooldown: 0,
    speed: 0,
    items: [],
    itemDuration: { boost: 0, shield: 0 },
    thunderEffect: [],
    isAwaitingTeleportAck: false,
  },
]);

export const playerInfoAtom = atomWithStorage<PlayerInfo>(
  'player',
  {
    id: null,
    nickname: '',
    tournamentMode: false,
    challengermodeId: undefined,
    gameSessionId: undefined,
  },
  createJSONStorage(() => sessionStorage),
);

export const playerRotationAtom = atom(0);

export interface AnimationRefs {
  isPunching: boolean;
  punchAnimationTimer: NodeJS.Timeout | null;
  isCurrentlyStolen: boolean;
  stolenAnimationTimer: NodeJS.Timeout | null;
  lastPunchTime: number;
}

export const animationRefsAtom = atom<AnimationRefs>({
  isPunching: false,
  punchAnimationTimer: null,
  isCurrentlyStolen: false,
  stolenAnimationTimer: null,
  lastPunchTime: 0,
});
