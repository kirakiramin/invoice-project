"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getClientList } from "@/utils/api";
import {
  getHiddenClientIds,
  setHiddenClientIds,
} from "@/utils/clientVisibility";
import { formatPhone } from "@/utils/format";

// 거래처 타입 정의 (메인과 동일)
interface Client {
  id: number | null;
  name: string;
  phone: string;
  note?: string;
  isFavorite: boolean;
}

const ClientVisibilityTable = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 거래처 목록 + 숨김 상태 초기 로드
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const list: Client[] = await getClientList();
        setClients(list);
      } catch (e) {
        console.error("거래처 목록 가져오기 실패:", e);
        setErrorMsg("거래처 목록을 불러오지 못했습니다.");
      } finally {
        // localStorage에서 숨김 목록 로드
        setHiddenIds(getHiddenClientIds());
        setLoading(false);
      }
    };

    init();
  }, []);

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  }, [clients]);

  const handleToggleHidden = (clientId: number) => {
    const next = hiddenIds.includes(clientId)
      ? hiddenIds.filter((id) => id !== clientId)
      : [...hiddenIds, clientId];

    console.log("[ADMIN] next hiddenIds =", next);

    // 화면 즉시 반영
    setHiddenIds(next);

    // localStorage 저장 + 메인 반영 이벤트 발행(유틸 내부에서 처리)
    setHiddenClientIds(next);
  };

  if (loading) {
    return (
      <section className="clients-table-state">
        <p>불러오는 중...</p>
      </section>
    );
  }

  if (errorMsg) {
    return (
      <section className="clients-table-state">
        <p>{errorMsg}</p>
      </section>
    );
  }

  return (
    <table className="clients-table">
      <thead>
        <tr>
          <th>No</th>
          <th>거래처 명</th>
          <th>연락처</th>
          <th>메인 노출</th>
          <th>삭제</th>
        </tr>
      </thead>

      <tbody>
        {sortedClients.length === 0 ? (
          <tr>
            <td colSpan={5} className="empty">
              거래처가 없습니다.
            </td>
          </tr>
        ) : (
          sortedClients.map((client, index) => {
            const disabled = client.id === null;
            const id = client.id ?? -1;
            const isHidden = !disabled && hiddenIds.includes(id);

            return (
              <tr key={`${client.id ?? "null"}-${client.name}-${index}`}>
                <td className="id">{index + 1}</td>
                <td className="store">{client.name}</td>
                <td className="contact">
                  {client.phone ? formatPhone(client.phone) : ""}
                </td>

                <td className="hide">
                  <label className={`switch ${disabled ? "is-disabled" : ""}`}>
                    <input
                      type="checkbox"
                      checked={!isHidden && !disabled}
                      disabled={disabled}
                      onChange={() => {
                        if (disabled) return;
                        handleToggleHidden(id);
                      }}
                      aria-label={`${client.name} 메인 노출 토글`}
                    />
                    <span className="slider" />
                  </label>
                </td>

                {/* 삭제는 비워둠 */}
                <td className="delete" />
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default ClientVisibilityTable;
