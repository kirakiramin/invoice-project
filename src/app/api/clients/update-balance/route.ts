export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// PUT 요청 - 특정 Client의 balance 업데이트
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {clientId, balance} = body;

    if (!clientId || balance === undefined) {
      return NextResponse.json({error: 'clientId와 balance 값은 필수입니다.'}, {status: 400});
    }

    // Client 존재 여부 확인
    const existingClient = await prisma.client.findUnique({
      where: {id: clientId},
    });

    if (!existingClient) {
      return NextResponse.json({error: '해당 ID의 Client를 찾을 수 없습니다.'}, {status: 404});
    }

    // Client balance 업데이트
    const updatedClient = await prisma.client.update({
      where: {id: clientId},
      data: {balance},
    });

    return NextResponse.json(updatedClient, {status: 200});
  } catch (error) {
    console.error('Error updating client balance:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
