export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// GET 요청 - 최신 Invoice ID 가져오기
export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({error: 'clientId는 필수입니다.'}, {status: 400});
    }

    const latestInvoice = await prisma.invoice.findFirst({
      where: {clientId: Number(clientId)},
      orderBy: {createDate: 'desc'}, // 최신 순으로 정렬하여 첫 번째 데이터 가져오기
    });

    if (!latestInvoice) {
      return NextResponse.json({latestInvoice: null}, {status: 200});
    }

    return NextResponse.json({latestInvoice: latestInvoice}, {status: 200});
  } catch (error) {
    console.error('Error fetching latest invoice:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
