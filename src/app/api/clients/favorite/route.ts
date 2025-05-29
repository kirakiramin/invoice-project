export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// PUT 요청 - Client의 즐겨찾기 상태 업데이트
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {id, isFavorite} = body;

    if (!id) {
      return NextResponse.json({error: 'Client ID is required'}, {status: 400});
    }

    const updatedClient = await prisma.client.update({
      where: {id},
      data: {
        isFavorite,
        updateDate: new Date(),
      },
    });

    return NextResponse.json(updatedClient, {status: 200});
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
