// src/app/api/manual-transaction/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { message, phone_number, secret_key } = await req.json()

    // Verifikasi secret key untuk keamanan
    if (secret_key !== process.env.WHATSAPP_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse pesan
    const messageParts = message.split(" ")
    if (messageParts.length < 2) {
      return NextResponse.json(
        {
          error: "Format pesan tidak valid",
        },
        { status: 400 }
      )
    }

    const categoryName = messageParts[0].toLowerCase()
    const amount = parseFloat(messageParts[1])
    const description = messageParts.slice(2).join(" ")

    // Cari user berdasarkan nomor WhatsApp
    let userData: { id: string }
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", phone_number)
      .single()

    if (userError || !existingUser) {
      // Jika user tidak ditemukan, buat user baru
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          username: `user_${phone_number.replace(/\D/g, "").slice(-6)}`,
          phone_number: phone_number,
        })
        .select("id")
        .single()

      if (createError) {
        return NextResponse.json(
          { error: "Gagal membuat user" },
          { status: 500 }
        )
      }

      userData = newUser as { id: string }
    } else {
      userData = existingUser as { id: string }
    }

    // Cari kategori
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, type")
      .ilike("name", `%${categoryName}%`)
      .single()

    if (categoryError || !categoryData) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      )
    }

    // Sesuaikan jumlah berdasarkan tipe kategori
    const adjustedAmount =
      categoryData.type === "expense" ? -Math.abs(amount) : Math.abs(amount)

    // Buat transaksi
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userData.id,
        category_id: categoryData.id,
        amount: adjustedAmount,
        description: description,
        transaction_date: new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single()

    if (transactionError) {
      return NextResponse.json(
        { error: "Gagal menyimpan transaksi" },
        { status: 500 }
      )
    }

    // Simpan pesan WhatsApp
    await supabase.from("whatsapp_messages").insert({
      user_id: userData.id,
      message: message,
      processed: true,
      transaction_id: transactionData.id,
    })

    return NextResponse.json({
      success: true,
      message: `Transaksi ${categoryName} sebesar ${Math.abs(
        amount
      )} berhasil dicatat.`,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
