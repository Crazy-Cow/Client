import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { playerInfoAtom } from '../atoms/PlayerAtoms';
import { useParams, useNavigate } from 'react-router-dom';
import useGame from '../hooks/useGame';

const ChallengermodeIntentPage = () => {
  const [player, setPlayer] = useAtom(playerInfoAtom);
  const { ott } = useParams<{ ott: string }>();
  const navigate = useNavigate();
  const { verifyGameAccount } = useGame();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intent에서 OTT 토큰 파싱
  const parseIntent = (): string | null => {
    // URL 파라미터에서 OTT 추출
    if (ott) {
      return ott;
    }

    // URL 쿼리 파라미터에서 OTT 추출 (fallback)
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ott');
  };

  // 사용자에게 확인 다이얼로그 표시
  const showConfirmationDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        'Challengermode에서 경쟁 플레이를 위해 게임 계정을 인증하시겠습니까?\n\n이 작업은 귀하의 게임 계정이 Challengermode에 연결됨을 확인합니다.',
      );
      resolve(confirmed);
    });
  };

  // 백엔드로 OTT 토큰 전송
  const sendOttToBackend = async (ottToken: string) => {
    try {
      setIsVerifying(true);
      setError(null);

      // 사용자 확인
      const confirmed = await showConfirmationDialog();
      if (!confirmed) {
        setError('사용자가 계정 인증을 취소했습니다.');
        return;
      }

      // 백엔드로 OTT 토큰 전송
      const result = await verifyGameAccount(ottToken);

      console.log('Game account verification successful:', result);

      // 사용자 정보 업데이트
      if (result.success) {
        setPlayer((prev) => ({
          ...prev,
          id: result.userId || prev.id,
          nickname: result.userId || prev.nickname,
          challengermodeId: result.accountId,
        }));
      }

      // 성공 시 홈 페이지로 리다이렉트
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Game account verification failed:', err);
      setError('게임 계정 인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const ottToken = parseIntent();

    if (!ottToken) {
      setError('유효하지 않은 인증 토큰입니다.');
      return;
    }

    // OTT 토큰을 백엔드로 전송
    sendOttToBackend(ottToken);
  }, [ott]);

  if (error) {
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
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-lg font-semibold text-red-600">인증 오류</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
              <button
                onClick={() => navigate('/home')}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg font-semibold">게임 계정 인증 중...</p>
                <p className="text-sm text-gray-600 mt-2">
                  잠시만 기다려주세요
                </p>
              </>
            ) : (
              <>
                <div className="text-blue-500 text-6xl mb-4">🔗</div>
                <p className="text-lg font-semibold">
                  Challengermode 계정 연동
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  게임 계정을 인증하고 있습니다...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengermodeIntentPage;
