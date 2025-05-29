/**
 * EditInvoiceClient 컴포넌트
 *
 * 기존에 작성된 인보이스 데이터를 수정할 수 있는 클라이언트 전용 컴포넌트
 * - URL 파라미터로부터 invoiceId, clientId, clientName을 추출
 * - 서버에서 해당 인보이스 데이터를 가져와 입력 폼에 초기값으로 설정
 * - ClientInputForm을 통해 사용자 입력을 받고, InvoiceTemplate을 통해 미리보기 제공
 * - 날짜/품목/입금액 등의 정보는 포맷 가공 후 상태로 관리됨
 * - 수정 완료 여부는 isUpdated 상태로 관리
 */

"use client";
import React, {useEffect, useState, useCallback, useRef} from "react";
import {useSearchParams} from "next/navigation";
import ClientInputForm from "@/components/clientDetail/ClientInputForm";
import InvoiceTemplate from "@/components/clientDetail/InvoiceTemplate";
import {getInvoiceById} from "@/utils/api";
import {InvoiceData, InvoiceItem} from "@/types/common";


const EditInvoiceClient = () => {
  const searchParams = useSearchParams();

  // URL 파라미터에서 ID, 거래처 정보 추출
  const invoiceId = Number(searchParams.get("invoiceId") || 1);
  const clientId = Number(searchParams.get("clientId") || 1);
  const clientName = searchParams.get("name") || "Unknown Client";
  const [previousBalance, setPreviousBalance] = useState<number>(0);

  // 인보이스 입력 데이터 상태
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    year: new Date().getFullYear().toString(),
    month: "",
    day: "",
    items: [],
    payment: "",
    note: "",
  });

  // 반영 완료 여부
  const [isUpdated, setIsUpdated] = useState(false);

  // 서버에서 기존 인보이스 데이터를 가져와 가공하는 함수
  const fetchInvoice = useCallback(async (invoiceId: number) => {
    try {
      const data = await getInvoiceById(invoiceId);

      // 품목 정보 가공 (문자열로 변환 및 총액 계산)
      const items: InvoiceItem[] = (data.details || []).map((item: {
        name: string;
        spec?: string;
        quantity: number;
        price: number
      }) => ({
        name: item.name,
        spec: item.spec ?? "",
        quantity: item.quantity.toString(),
        price: item.price.toLocaleString(),
        total: (item.quantity * item.price).toLocaleString(),
      }));

      // 날짜 정보 포맷
      const invoiceDate = new Date(data.createDate);

      // 폼 데이터 구성
      const formData: InvoiceData = {
        invoiceNumber: `INVOICE-${clientId}-${data.no}`,
        year: invoiceDate.getFullYear().toString(),
        month: (invoiceDate.getMonth() + 1).toString().padStart(2, "0"),
        day: invoiceDate.getDate().toString().padStart(2, "0"),
        items,
        payment: data.payment.toLocaleString(),
        note: data.note || "",
      };

      setInvoiceData(formData);
      setPreviousBalance(data.previousBalance ?? 0);
    } catch (error) {
      // 인보이스 데이터 호출 실패 시 콘솔 출력
      console.error("수정용 인보이스 로딩 실패:", error);
    }
  }, [clientId]);

  // useRef로 fetchInvoice 저장
  const fetchInvoiceRef = useRef(fetchInvoice);
  fetchInvoiceRef.current = fetchInvoice;

  // invoiceId 변경 시 데이터 요청
  useEffect(() => {
    if (invoiceId) fetchInvoiceRef.current(invoiceId);
  }, [invoiceId]);

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
                invoiceId={invoiceId}
                isEditMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditInvoiceClient;
