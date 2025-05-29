/**
 * ClientList 컴포넌트
 *
 * - 전체 거래처 리스트를 출력하고
 * - 수정/즐겨찾기 기능을 제공하는 클라이언트 전용 컴포넌트
 */

"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ClientRegisterModal from "@/components/main/ClientModal";
import {updateClient, updateFavorite} from '@/utils/api';

// 거래처 타입 정의
interface Client {
  id: number | null;
  name: string;
  phone: string;
  note?: string;
  isFavorite: boolean;
}

// 컴포넌트 props
interface ClientListProps {
  clients: Client[]; // 렌더링할 거래처 리스트
  onRefresh: () => Promise<void>; // 거래처 갱신 콜백
}


const ClientList = ({clients, onRefresh}: ClientListProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // 거래처 수정 버튼 클릭
  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  // 거래처 정보 수정
  const handleRegisterClient = async (updatedClient: Client) => {
    try {
      await updateClient(updatedClient);
      await onRefresh(); // 클라이언트 상태 갱신
      setIsModalOpen(false);
      alert('거래처 정보가 수정되었습니다.');
    } catch (error) {
      console.error('거래처 정보 수정 실패:', error);
      alert('거래처 정보를 수정하는 중 오류가 발생했습니다.');
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (id: number, isFavorite: boolean) => {
    try {
      await updateFavorite({id, isFavorite: !isFavorite});
      await onRefresh(); // 클라이언트 상태 갱신
    } catch (error) {
      console.error(`즐겨찾기 변경 실패 (거래처 ID: ${id})`, error);
      alert('즐겨찾기 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  // 거래처 상세 페이지로 이동
  const handleGoToHistory = (client: { name: string; id: number | null }) => {
    if (client.id === null) return; // 방어 코드

    const query = new URLSearchParams({
      name: client.name,
      clientId: String(client.id),
    }).toString();

    router.push(`/client-detail/order-history?${query}`);
  };

  return (
    <div className="client-list">
      <h2 className="under-line"> 거래처 리스트</h2>
      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            <div className="client-action-wrap">
              <button onClick={() => handleGoToHistory(client)}>
                <Image src="/images/list.png" alt="거래내역 리스트" width={24} height={24}/>
              </button>
              <div className="client-action">
                <button onClick={() => handleEditClick(client)}>
                  <Image src="/images/edit.png" alt="수정" width={24} height={24}/>
                </button>

                <button onClick={() => toggleFavorite(client.id ?? 0, client.isFavorite)}>
                  <Image
                    src={client.isFavorite ? "/images/favorite-on.png" : "/images/favorite-off.png"}
                    alt="즐겨찾기"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
            <div className="client-info">
              <Link
                href={`/client-detail?name=${encodeURIComponent(client.name)}&clientId=${client.id}`}
                passHref
              >
                <h3>{client.name}</h3>
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <ClientRegisterModal
          isOpen={isModalOpen}
          onCloseAction={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          onRegisterAction={handleRegisterClient}
          initialData={selectedClient}
        />
      )}
    </div>
  );
}
export default ClientList;