import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, dan nama harus diisi" },
        { status: 400 }
      );
    }

    const existing = await queryOne<{ id: string }>(
      `SELECT "id" FROM "User" WHERE "email" = $1`,
      [email]
    );

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await queryOne<{ id: string; email: string; name: string }>(
      `INSERT INTO "User" ("id", "email", "password", "name", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, now())
       RETURNING "id", "email", "name"`,
      [email, hashed, name]
    );

    if (!user) {
      return NextResponse.json(
        { error: "Gagal membuat akun" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat akun" },
      { status: 500 }
    );
  }
}
