/**
 * 개별 품목의 수량 및 단가 정보 (작성 시 사용하는 입력값)
 */
export interface InvoiceDetail {
  name: string;        // 상품명
  quantity: number;    // 수량 (숫자 입력)
  price: number;       // 단가 (숫자 입력)
}

/**
 * 인보이스 생성 시 서버에 전송하는 요청 데이터
 */
export interface InvoiceRequest {
  no: number;                 // 인보이스 번호 (서버에서 발급 또는 클라이언트에서 지정)
  clientId: number;          // 거래처 ID
  balance: number;           // 해당 거래처의 잔금 (인보이스 생성 시 기준값)
  payment: number;           // 이번 인보이스에 대한 입금 금액
  details: InvoiceDetail[];  // 품목별 상세 리스트
}

/**
 * 인보이스에 표시되는 개별 품목 데이터 (렌더링 전용)
 */
export interface InvoiceItem {
  name: string;       // 품목명
  spec: string;       // 규격 (예: "500ml", "1박스" 등)
  quantity: string;   // 수량 (표시용 문자열, 예: "10개")
  price: string;      // 단가 (포맷된 문자열, 예: "5,000")
  total: string;      // 총액 (수량 × 단가, 포맷 포함 문자열)
}

/**
 * 인보이스 전체 데이터를 구성하는 렌더링 전용 모델
 */
export interface InvoiceData {
  invoiceNumber: string;   // 인보이스 번호 (예: "INV-20250529-001")
  year: string;            // 발행 연도 (예: "2025")
  month: string;           // 발행 월 (예: "05")
  day: string;             // 발행 일 (예: "29")
  items: InvoiceItem[];    // 렌더링용 품목 리스트
  payment: string;         // 입금 금액 (예: "50,000")
  note: string;            // 하단 비고 내용 (선택 입력)
}
