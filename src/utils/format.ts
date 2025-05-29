/**
 * 숫자로만 된 전화번호를 000-0000-0000 형식으로 변환합니다.
 * @param phone 숫자만 포함된 전화번호 문자열
 * @returns 하이픈이 포함된 전화번호 문자열
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  } else {
    return phone; // 예상하지 못한 형식은 그대로 반환
  }
};
