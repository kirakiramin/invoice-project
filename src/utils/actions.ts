'use server';

import {revalidatePath} from 'next/cache';

/**
 * 클라이언트 데이터를 다시 불러오기 위한 서버 액션
 * - 페이지 캐시를 무효화하고 데이터를 갱신함
 */
export async function refreshClientsAction() {
  revalidatePath('/'); // or 필요한 경로로 수정 가능
}
