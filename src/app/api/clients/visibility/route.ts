export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT 요청 - Client의 메인 노출 여부 업데이트
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isHidden } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 },
      );
    }

    if (typeof isHidden !== "boolean") {
      return NextResponse.json(
        { error: "isHidden must be a boolean" },
        { status: 400 },
      );
    }

    await prisma.$executeRaw`
      UPDATE "Client"
      SET "isHidden" = ${isHidden}, "updateDate" = ${new Date()}
      WHERE "id" = ${id}
    `;

    const updatedClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error("Error updating client visibility:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
