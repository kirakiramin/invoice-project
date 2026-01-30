/**
 * HistoryTable 컴포넌트
 *
 * - 특정 거래처의 주문 내역 리스트를 테이블 형태로 출력
 * - 최신 주문 자동 선택
 * - 무한 스크롤로 점진적 데이터 로딩
 * - 주문 수정 버튼은 최신 주문에만 노출
 */

"use client";
import React, { useState, useEffect, useRef, useReducer } from "react";
import { useRouter } from "next/navigation";
import { getInvoicesByClientId } from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faPrint,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

// 테이블에서만 사용하는 날짜 포맷터: "2025-04-09(수) 14:19"
export const formatDateWithWeekday = (isoString: string) => {
  const date = new Date(isoString);

  // Intl을 이용해 Asia/Seoul 타임존 기준으로 포맷팅
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", // 서울 기준
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short", // 요일 (월, 화, 수, 등)
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24시간제
  });

  const parts = formatter.formatToParts(date);

  // 포맷 조합
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  if (!year || !month || !day || !weekday || !hour || !minute) return "";

  return `${year}-${month}-${day}(${weekday}) ${hour}:${minute}`;
};

// 주문 데이터 타입 정의
interface OrderData {
  id: number;
  no: number;
  createDate: string;
  total: string;
  balance: string;
}

// 리듀서의 상태 및 액션 타입 정의
interface State {
  visibleData: OrderData[];
  loadedItems: number;
}

type Action = { type: "LOAD_MORE" };

interface HistoryTableProps {
  clientId: number;
  clientName: string;
  onSelectOrder: (order: OrderData) => void; // 주문 선택 시 부모로 전달되는 콜백
  onDownloadImage: () => void;
}

const HistoryTable = ({
  clientId,
  clientName,
  onSelectOrder,
  onDownloadImage,
}: HistoryTableProps) => {
  const router = useRouter();
  const itemsPerPage = 10;

  // 동적으로 주문 데이터를 관리
  const [data, setData] = useState<OrderData[]>([]); // 전체 주문 데이터

  // 수정: 스크롤 컨테이너를 root로 지정하기 위한 ref 추가
  const containerRef = useRef<HTMLDivElement | null>(null); // 수정: 스크롤 컨테이너 ref

  // 수정: observerRef는 감지 대상(트리거) ref로 유지하되 의미를 명확히
  const observerRef = useRef<HTMLDivElement | null>(null); // 수정: IntersectionObserver 타겟(트리거) ref

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null); // 현재 선택된 주문

  // useReducer로 visibleData & loadedItems 상태 관리
  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case "LOAD_MORE":
        return {
          visibleData: data.slice(0, state.loadedItems + itemsPerPage),
          loadedItems: state.loadedItems + itemsPerPage,
        };
      default:
        return state;
    }
  };

  // useReducer 초기 상태 설정
  const [state, dispatch] = useReducer(reducer, {
    visibleData: [],
    loadedItems: itemsPerPage,
  });

  // 주문 내역을 서버에서 가져오는 함수
  const getInvoices = async (id: number) => {
    try {
      const clientInvoice = await getInvoicesByClientId(id);
      setData(
        clientInvoice.invoices.map((invoice: OrderData) => ({
          id: invoice.id,
          no: invoice.no,
          createDate: invoice.createDate,
          total: invoice.total,
          balance: invoice.balance,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  // 최초 실행 시 데이터 가져오기
  useEffect(() => {
    getInvoices(clientId);
  }, [clientId]);

  // data가 변경될 때 visibleData 업데이트
  useEffect(() => {
    if (data.length > 0) {
      dispatch({ type: "LOAD_MORE" });
    }
  }, [data]);

  // selectedOrder 기본값 설정 (초기 렌더 시 최근 주문 자동 선택)
  useEffect(() => {
    if (data.length > 0 && !selectedOrder) {
      const latest = data[0];
      setSelectedOrder(latest);
      onSelectOrder(latest);
    }
  }, [data, selectedOrder, onSelectOrder]);

  // Intersection Observer 설정 (무한 스크롤)
  useEffect(() => {
    // 수정: root(스크롤 컨테이너)와 target(트리거) 둘 다 있어야 감지 가능
    if (!containerRef.current || !observerRef.current) return;

    // 수정: 스크롤 컨테이너를 root로 지정 (overflow-y: auto 환경에서 윈도우에서도 안정적)
    const root = containerRef.current; // 수정
    const target = observerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.loadedItems < data.length) {
          // 수정: setTimeout은 불필요하면 제거해도 되지만, 기존 동작 유지하려면 남겨도 됨
          setTimeout(() => {
            dispatch({ type: "LOAD_MORE" });
          }, 500);
        }
      },
      {
        // 수정: 무한 스크롤이 table-container 내부 스크롤 기준으로 동작하도록 root 지정
        root, // 수정

        // 수정: threshold 1.0은 1px 트리거 + 윈도우 배율/줌 환경에서 교차가 안 잡힐 수 있음
        threshold: 0, // 수정: 0 또는 0.01 추천

        // 수정: 바닥에 닿기 전에 미리 로딩해서 끊김 줄임 (윈도우 환경 안정성에도 도움)
        rootMargin: "200px 0px", // 수정
      },
    );

    observer.observe(target);

    return () => observer.disconnect();

    // 수정: containerRef는 ref 객체라 deps에 넣지 않음(변하지 않음)
  }, [state.loadedItems, data.length]);

  // 주문 항목 클릭 시 실행
  const handleRowClick = (order: OrderData) => {
    setSelectedOrder(order);
    onSelectOrder(order);
  };

  // 최신 주문 ID를 구함
  const latestOrderId = data.reduce((latestId, current) => {
    return new Date(current.createDate) >
      new Date(data.find((d) => d.id === latestId)?.createDate ?? "")
      ? current.id
      : latestId;
  }, data[0]?.id);

  // 인쇄 버튼 클릭 시 실행
  const handlePrint = () => {
    window.print();
  };

  return (
    // 수정: 스크롤 컨테이너에 ref 연결 (IntersectionObserver root로 사용)
    <div className="table-container" ref={containerRef}>
      <table className="order-table">
        <thead>
          <tr>
            <th>No</th>
            <th>구매 날짜</th>
            <th>구매 금액</th>
            <th>잔금</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {state.visibleData.map(
            (
              order: OrderData,
              index: number, // `order`의 타입 명시
            ) => (
              <tr
                key={`${order.id}-${order.no}-${index}`}
                className={selectedOrder?.id === order.id ? "selected-row" : ""}
                onClick={() => handleRowClick(order)}
              >
                <td className="no">{order.no}</td>
                <td className="date">
                  {formatDateWithWeekday(order.createDate)}
                </td>
                <td className="total">
                  {parseInt(order.total, 10).toLocaleString()}
                </td>
                <td className="balance">
                  {parseInt(order.balance, 10).toLocaleString()}
                </td>
                <td>
                  {order.id === latestOrderId && (
                    <button
                      className="detail-button edit"
                      onClick={(e) => {
                        e.stopPropagation(); // 수정: 부모 row 클릭 방지
                        router.push(
                          `/client-detail/edit-invoice?invoiceId=${order.id}&clientId=${clientId}&name=${encodeURIComponent(clientName)}`,
                        );
                      }}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                    </button>
                  )}
                  <button
                    className="detail-button print"
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 row 클릭 방지
                      handlePrint(); // 프린트 실행
                    }}
                  >
                    <FontAwesomeIcon icon={faPrint} className="icon" />
                  </button>
                  <button
                    className="detail-button img"
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 row 클릭 방지
                      onDownloadImage();
                    }}
                  >
                    <FontAwesomeIcon icon={faImage} className="icon" />
                  </button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      {/* 스크롤 감지를 위한 div */}
      <div ref={observerRef} className="observer-trigger"></div>
    </div>
  );
};

export default HistoryTable;
