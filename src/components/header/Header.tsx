/**
 * Header 컴포넌트
 *
 * - 메인 페이지 상단에 고정되는 헤더 UI
 * - 거래처 등록 모달 오픈 및 처리 기능 포함
 * - "신규 거래처 등록" 및 "거래처 잔금 확인" 버튼 제공
 */

"use client";
import {useState, useCallback} from "react";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faWonSign, faCoins, faWallet} from "@fortawesome/free-solid-svg-icons";
import ClientRegisterModal from "@/components/main/ClientModal";
import {createClient} from '@/utils/api';

// 거래처 신규 작성 타입 정의
interface Client {
  id: number | null;
  name: string;
  phone: string;
  note?: string;
  isFavorite: boolean;
}


const Header = ({onClientRegistered}: { onClientRegistered: () => void }) => {
  // 거래처 등록 모달의 열림/닫힘 상태
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleRegister = useCallback(async (client: Client) => {
    try {
      await createClient(client); // 서버에 거래처 생성 요청
      setIsRegisterModalOpen(false); // 모달 닫기
      onClientRegistered(); // 거래처 등록 후 리스트 업데이트
    } catch (error) {
      console.error("거래처 등록 실패:", error);
      alert("거래처 등록에 실패했습니다.");
    }
  }, [onClientRegistered]);

  return (
    <header>
      <div className="container">
        <div className="header_wrapper">
          <Link href="/main">
            <h1>농협 369번</h1>
          </Link>
          <div className="btn-area">
            <button className="primary default" onClick={() => setIsRegisterModalOpen(true)}>
              <FontAwesomeIcon icon={faPlus} className="icon"/>
              신규 등록
            </button>
            <Link href="/balance" className="default">
              <FontAwesomeIcon icon={faWonSign} className="icon"/>
              잔금 확인
            </Link>
            <Link href="/client-monthly" className="default">
              <FontAwesomeIcon icon={faWallet} className="icon"/>
              매출 현황
            </Link>
            <Link href="/sales-monthly" className="default">
              <FontAwesomeIcon icon={faCoins} className="icon"/>
              판매 현황
            </Link>
          </div>
        </div>
      </div>

      {/* 거래처 등록 모달 */}
      {isRegisterModalOpen && (
        <ClientRegisterModal
          isOpen={isRegisterModalOpen}
          onCloseAction={() => setIsRegisterModalOpen(false)}
          onRegisterAction={handleRegister}
        />
      )}
    </header>
  );
};

export default Header;
