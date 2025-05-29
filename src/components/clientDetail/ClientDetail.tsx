/**
 * ClientDetail 컴포넌트
 *
 * 거래처별 인보이스 데이터를 입력하고 미리보기까지 할 수 있는 페이지 컴포넌트
 * - URL 파라미터로 clientId와 clientName을 받아 해당 거래처의 최신 인보이스 번호를 자동 생성
 * - 사용자는 품목, 날짜, 금액, 비고 등을 입력할 수 있으며 실시간으로 미리보기를 확인 가능
 * - 내부적으로 ClientInputForm과 InvoiceTemplate을 렌더링
 */

"use client";
import {useState, useEffect, useCallback, useRef} from "react";
import {useSearchParams} from "next/navigation";
import ClientInputForm from "@/components/clientDetail/ClientInputForm";
import InvoiceTemplate from "@/components/clientDetail/InvoiceTemplate";
import {getLatestInvoiceByClientId} from "@/utils/api";
import {InvoiceData} from "@/types/common";


const ClientDetail = () => {
  const currentYear = new Date().getFullYear().toString();
  const searchParams = useSearchParams();

  // URL 파라미터에서 clientId, clientName 추출 (기본값 설정)
  const clientId = Number(searchParams.get("clientId")) || 1;
  const clientName = searchParams.get("name") || "Unknown Client";

  // 인보이스 입력 데이터를 상태로 관리
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    year: currentYear,
    month: "",
    day: "",
    items: [],
    payment: "",
    note: "",
  });

  // 입력 내용이 수정되었는지 여부
  const [isUpdated, setIsUpdated] = useState(false);

  // 이전 잔금 상태 추가
  const [previousBalance, setPreviousBalance] = useState<number>(0);

  // 최신 인보이스 번호를 조회하여 자동으로 생성
  const getInvoiceId = useCallback(async (clientId: number) => {
    try {
      const data = await getLatestInvoiceByClientId(clientId);
      const latestInvoice = data?.latestInvoice;
      const latestBalance = latestInvoice?.balance ?? 0;
      const latestNo = latestInvoice?.no ?? 0;

      // 새로운 인보이스 번호 생성: INVOICE-{clientId}-{latestNo+1}
      const nextInvoiceNumber = `INVOICE-${clientId}-${latestNo + 1}`;

      setInvoiceData((prev) => ({...prev, invoiceNumber: nextInvoiceNumber}));
      setPreviousBalance(latestBalance);
    } catch {
      // 조회 실패 시 기본 인보이스 번호로 설정
      setInvoiceData((prev) => ({...prev, invoiceNumber: `INVOICE-${clientId}-1`}));
    }
  }, []);

  // useRef로 콜백 캐싱 (추후 확장 가능성 대비)
  const getInvoiceIdRef = useRef(getInvoiceId);
  getInvoiceIdRef.current = getInvoiceId;

  // clientId 변경될 때 인보이스 정보 업데이트
  useEffect(() => {
    if (clientId) getInvoiceId(clientId);
  }, [clientId]);

  return (
    <main className="site-content">
      <div className="container">
        <div className="main-wrapper">
          <div className="layout-half" id="invoice">
            <div className="input-group">
              <ClientInputForm
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                setIsUpdated={setIsUpdated}
              />
            </div>

            <div className="viewer-group">
              <InvoiceTemplate
                invoiceData={invoiceData}
                clientName={clientName}
                isUpdated={isUpdated}
                previousBalance={previousBalance}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ClientDetail;
