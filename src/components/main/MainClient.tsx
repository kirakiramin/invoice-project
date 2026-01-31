/**
 * MainClient 컴포넌트
 *
 * 거래처 메인 페이지
 * - 거래처 목록을 서버에서 불러와 출력
 * - 상단에 Header (거래처 등록 버튼 포함)
 * - 하단에 ClientList 컴포넌트로 리스트 렌더링
 * - 숨김 상태 변경 이벤트를 구독하여 즉시 반영
 */

"use client";
import { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import ClientList from "@/components/main/ClientList";
import { getClientList } from "@/utils/api";
import {
  CLIENT_VISIBILITY_EVENT,
  getHiddenClientIds,
} from "@/utils/clientVisibility";

// 거래처 타입 정의
interface Client {
  id: number | null;
  name: string;
  phone: string;
  note?: string;
  isFavorite: boolean;
}

const MainClient = () => {
  const [clients, setClients] = useState<Client[]>([]);

  // 거래처 목록을 가져와 상태에 저장하는 함수
  const fetchClients = async () => {
    try {
      const clientList = (await getClientList()) as Client[];

      console.log("[MAIN] fetched clientList length =", clientList.length);
      console.log(
        "[MAIN] sample ids =",
        clientList.slice(0, 5).map((c) => [c.id, typeof c.id]),
      );

      const hiddenIds = getHiddenClientIds();
      console.log("[MAIN] hiddenIds =", hiddenIds);

      const visibleClients = clientList.filter((c) => {
        const id = c.id === null ? null : Number(c.id);
        const hidden =
          id !== null && Number.isFinite(id) && hiddenIds.includes(id);

        if (id !== null) {
          console.log("[MAIN] check", {
            rawId: c.id,
            normalizedId: id,
            hidden,
          });
        }

        return !hidden;
      });

      console.log("[MAIN] visibleClients length =", visibleClients.length);

      setClients(
        [...visibleClients].sort(
          (a, b) =>
            Number(b.isFavorite) - Number(a.isFavorite) ||
            a.name.localeCompare(b.name, "ko-KR"),
        ),
      );
    } catch (error) {
      console.error("[MAIN] fetchClients error:", error);
    }
  };

  useEffect(() => {
    fetchClients();

    // 관리 페이지에서 토글을 바꾸면 즉시 반영되도록 이벤트 구독
    const onVisibilityChanged = () => {
      fetchClients();
    };

    window.addEventListener(CLIENT_VISIBILITY_EVENT, onVisibilityChanged);
    return () =>
      window.removeEventListener(CLIENT_VISIBILITY_EVENT, onVisibilityChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header onClientRegistered={fetchClients} />
      <main className="site-content">
        <div className="container">
          <div className="main-wrapper">
            <section>
              <ClientList clients={clients} onRefresh={fetchClients} />
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default MainClient;
