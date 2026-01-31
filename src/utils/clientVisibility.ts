// /utils/clientVisibility.ts
// 거래처 메인 노출/숨김 상태를 localStorage로 관리하는 유틸

// localStorage에 저장할 key
export const CLIENT_HIDDEN_KEY = "hiddenClientIds";

// 숨김 상태 변경을 알리기 위한 커스텀 이벤트명
export const CLIENT_VISIBILITY_EVENT = "client-visibility-change";

// SSR 환경에서 window 접근 방어용
const safeWindow = () => typeof window !== "undefined";

/**
 * 숨김 처리된 거래처 ID 목록 조회
 * - localStorage에서 읽어옴
 * - 문제 있으면 빈 배열 반환
 */
export const getHiddenClientIds = (): number[] => {
  if (!safeWindow()) return [];

  try {
    const raw = window.localStorage.getItem(CLIENT_HIDDEN_KEY);
    if (!raw) return [];

    return JSON.parse(raw)
      .map((v: unknown) => Number(v))
      .filter((n: number) => Number.isFinite(n));
  } catch {
    return [];
  }
};

/**
 * 숨김 처리된 거래처 ID 목록 저장
 * - 중복 제거 후 저장
 * - 저장 후 메인 페이지에 반영되도록 이벤트 발생
 */
export const setHiddenClientIds = (ids: number[]) => {
  if (!safeWindow()) return;

  const uniqueSorted = Array.from(new Set(ids)).sort((a, b) => a - b);
  window.localStorage.setItem(CLIENT_HIDDEN_KEY, JSON.stringify(uniqueSorted));

  window.dispatchEvent(new Event(CLIENT_VISIBILITY_EVENT));
};
