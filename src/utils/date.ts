/**
 * ISO 형식의 날짜 문자열을 한국 시간(Asia/Seoul) 기준으로 포맷된 문자열로 변환합니다.
 * @param isoString ISO 8601 문자열 (예: 2025-04-08T06:45:59.390Z)
 * @returns "YYYY-MM-DD HH:mm" 형식의 문자열
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  const hour = parts.find(p => p.type === "hour")?.value;
  const minute = parts.find(p => p.type === "minute")?.value;

  if (!year || !month || !day || !hour || !minute) return "";

  return `${year}-${month}-${day} ${hour}:${minute}`;
};
