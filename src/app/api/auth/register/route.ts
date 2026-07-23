import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, dan nama harus diisi" },
        { status: 400 }
      );
    }

    const db = await getPool();
    const existing = await db
      .request()
      .input("email", email)
      .query("SELECT id FROM [User] WHERE email = @email");

    if (existing.recordset[0]) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const result = await db
      .request()
      .input("email", email)
      .input("password", hashed)
      .input("name", name)
      .query(
        "        INSERT INTO [User] (id, email, password, name, createdAt) OUTPUT INSERTED.id, INSERTED.email, INSERTED.name VALUES (NEWID(), @email, @password, @name, GETDATE())"
      );

    const user = result.recordset[0];

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
