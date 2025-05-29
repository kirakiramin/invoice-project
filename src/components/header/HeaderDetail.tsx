/**
 * HeaderDetail 컴포넌트
 *
 * 거래처 상세 페이지 상단에 표시되는 헤더 컴포넌트
 * - 거래처 이름과 아이콘 표시
 * - 현재 페이지가 거래 내역(/order-history)인지 여부에 따라 버튼 라벨 및 링크를 동적으로 변경
 * - "홈으로" 버튼과 "거래 내역 보기 / 계산서 작성" 버튼 제공
 */

'use client';
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHouse, faBars, faPen} from "@fortawesome/free-solid-svg-icons";
import {usePathname} from "next/navigation";
import Image from "next/image";


interface HeaderDetailProps {
  clientName: string;
  clientId: number;
}


const HeaderDetail = ({clientName, clientId}: HeaderDetailProps) => {
  const pathname = usePathname();
  // 현재 경로가 주문 내역(/order-history) 페이지인지 여부
  const isOrderHistoryPage = pathname.includes("/order-history");

  return (
    <header>
      <div className="container">
        <div className="header_wrapper">
          <h2><span>
            <Image src="/images/mango.png" alt="과일" width={42} height={42} priority/>
          </span>{clientName}</h2>

          <div className="btn-area">
            <Link href="/main" className="default">
              <FontAwesomeIcon icon={faHouse} className="icon"/>
              홈으로
            </Link>
            {clientName && (
              <Link
                href={
                  isOrderHistoryPage
                    ? `/client-detail?name=${encodeURIComponent(clientName)}&clientId=${clientId}`
                    : `/client-detail/order-history?name=${encodeURIComponent(clientName)}&clientId=${clientId}`
                }
                className="default primary"
              >
                <FontAwesomeIcon icon={isOrderHistoryPage ? faPen : faBars} className="icon"/>
                {isOrderHistoryPage ? "계산서 작성" : "거래 내역"}
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default HeaderDetail;