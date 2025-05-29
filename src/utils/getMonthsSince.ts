/**
 * 특정 시작 월부터 오늘까지의 월 목록(YYYY-MM)을 배열로 반환합니다.
 * 예: 시작 월이 "2025-06"이고 오늘이 2025년 8월이면,
 *     ["2025-06", "2025-07", "2025-08"]을 반환합니다.
 *
 * @param start 기준 시작 월 (형식: "YYYY-MM")
 * @returns 시작 월부터 오늘까지의 월 문자열 배열 (포함 범위)
 */
export const getMonthsSince = (start: string): string[] => {
  const result: string[] = [];

  // 시작 월 문자열을 연도와 월로 분리하고 Date 객체 생성
  const [startYear, startMonth] = start.split("-").map(Number);
  const startDate = new Date(startYear, startMonth - 1, 1);

  // 오늘 날짜 기준 연/월만 유지
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

  // 시작 월부터 현재 월까지 반복
  while (startDate <= endDate) {
    const y = startDate.getFullYear();
    const m = String(startDate.getMonth() + 1).padStart(2, "0");

    result.push(`${y}-${m}`);

    // 다음 달로 이동
    startDate.setMonth(startDate.getMonth() + 1);
  }

  return result;
};
