// src/app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Format pesan dari WhatsApp API
    // Format berbeda tergantung pada provider WhatsApp yang digunakan
    // Contoh untuk Twilio:
    const from = body.From || body.from
    const messageBody = body.Body || body.body || body.text || ""

    console.log("Received WhatsApp message:", { from, messageBody })

    // Format pesan yang diharapkan: [kategori] [jumlah] [deskripsi]
    // Contoh: "makanan 50000 makan siang"
    const messageParts = messageBody.split(" ")
    if (messageParts.length < 2) {
      return NextResponse.json(
        {
          error:
            "Format pesan tidak valid. Gunakan format: [kategori] [jumlah] [deskripsi]",
        },
        { status: 400 }
      )
    }

    const categoryName = messageParts[0].toLowerCase()
    const amount = parseFloat(messageParts[1])
    const description = messageParts.slice(2).join(" ")

    if (isNaN(amount)) {
      return NextResponse.json(
        {
          error:
            "Jumlah tidak valid. Gunakan format: [kategori] [jumlah] [deskripsi]",
        },
        { status: 400 }
      )
    }

    // Cari user berdasarkan nomor WhatsApp
    const { data: userData, error: userQueryError } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", from)
      .single()

    let finalUserData
    if (userQueryError || !userData) {
      // Jika user tidak ditemukan, buat user baru
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          username: `user_${from.replace(/\D/g, "").slice(-6)}`, // Gunakan 6 digit terakhir nomor sebagai username
          phone_number: from,
        })
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json(
          { error: "Gagal membuat user" },
          { status: 500 }
        )
      }

      finalUserData = newUser
    } else {
      finalUserData = userData
    }

    // Cari kategori
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, type")
      .ilike("name", `%${categoryName}%`)
      .single()

    if (categoryError || !categoryData) {
      console.error("Category error:", categoryError)
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      )
    }

    // Sesuaikan jumlah berdasarkan tipe kategori (income positif, expense negatif)
    const adjustedAmount =
      categoryData.type === "expense" ? -Math.abs(amount) : Math.abs(amount)

    // Buat transaksi
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: finalUserData.id,
        category_id: categoryData.id,
        amount: adjustedAmount,
        description: description,
        transaction_date: new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single()

    if (transactionError) {
      console.error("Transaction error:", transactionError)
      return NextResponse.json(
        { error: "Gagal menyimpan transaksi" },
        { status: 500 }
      )
    }

    // Simpan pesan WhatsApp
    await supabase.from("whatsapp_messages").insert({
      user_id: finalUserData.id,
      message: messageBody,
      processed: true,
      transaction_id: transactionData.id,
    })

    // Kirim respons ke WhatsApp
    // Format respons tergantung pada provider yang digunakan
    return NextResponse.json({
      success: true,
      message: `Transaksi ${categoryName} sebesar ${Math.abs(
        amount
      )} berhasil dicatat.`,
      transaction_id: transactionData.id,
    })
  } catch (error) {
    console.error("Error processing WhatsApp message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
