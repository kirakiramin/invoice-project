export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// GET 요청 - 모든 Client의 최신 Invoice 정보 조회
export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const targetMonth = searchParams.get('month'); // 예: "2025-05"

  if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
    return NextResponse.json({error: 'Invalid or missing month format. Use YYYY-MM.'}, {status: 400});
  }

  try {
    // 모든 Client 조회
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        balance: true,
        invoices: {
          orderBy: {createDate: 'desc'}, // 최신순 정렬
          take: 1, // 최신 Invoice 1개만 가져오기
          select: {balance: true, createDate: true},
        },
      },
    });

    console.log(clients);

    // 결과 데이터 변환 (각 Client에 대해 최신 Invoice 데이터 추출 및 invoiceDate desc 정렬)
    const result = await prisma.$queryRaw<
      {
        clientId: number;
        name: string;
        phone: string;
        latestDate: string;
        totalSales: number;
      }[]
    >`
        SELECT c."id"                        as "clientId",
               c."name",
               c."phone",
               MAX(i."createDate")           as "latestDate",
               SUM(d."quantity" * d."price") as "totalSales"
        FROM "InvoiceDetail" d
                 JOIN "Invoice" i ON d."invoiceId" = i."id"
                 JOIN "Client" c ON i."clientId" = c."id"
        WHERE TO_CHAR(i."createDate", 'YYYY-MM') = ${targetMonth}
          AND d.name != '전잔금'
        GROUP BY c."id", c."name", c."phone"
        ORDER BY "latestDate" DESC;
    `;

    const sanitizedResult = result.map(row => ({
      ...row,
      totalSales: row.totalSales.toString(), // BigInt → string
    }));

    return NextResponse.json({clients: sanitizedResult}, {status: 200});
  } catch (error) {
    console.error('Error fetching latest invoices for all clients:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
