export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// GET 요청 - 특정 Invoice 조회
export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url);
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json(
        {error: "유효한 Invoice ID가 필요합니다."},
        {status: 400}
      );
    }

    const id = Number(invoiceId);

    // 1. 현재 invoice 조회
    const invoice = await prisma.invoice.findUnique({
      where: {id},
      include: {
        client: {
          select: {name: true, phone: true},
        },
        details: {
          select: {name: true, spec: true, quantity: true, price: true},
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({error: "Invoice not found"}, {status: 404});
    }

    // 2. 동일 client의 이전 invoice 중 가장 최근 것 조회
    const previousInvoice = await prisma.invoice.findFirst({
      where: {
        clientId: invoice.clientId,
        createDate: {
          lt: invoice.createDate,
        },
      },
      orderBy: {
        createDate: 'desc',
      },
      select: {
        balance: true,
      },
    });

    // 3. 합산 결과 반환
    const result = {
      ...invoice,
      previousBalance: previousInvoice?.balance ?? 0,
    };

    return NextResponse.json(result, {status: 200});
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}