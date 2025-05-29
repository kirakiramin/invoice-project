export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// POST 요청 - 새로운 Client 생성
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {name, phone, note, isFavorite} = body;

    // 필수 데이터 확인
    if (!name) {
      console.error("필수 데이터 누락:", {name}); // 로그 추가
      return NextResponse.json({error: 'Name and phone are required'}, {status: 400});
    }

    // 데이터 생성
    const newClient = await prisma.client.create({
      data: {
        name,
        phone: phone ?? "",
        note: note ?? "",
        isFavorite: isFavorite ?? false, // 기본값 설정
      },
    });

    return NextResponse.json(newClient, {status: 201});
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
