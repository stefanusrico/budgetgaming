// src/app/api/whatsapp-webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Fungsi untuk verifikasi webhook
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Token verifikasi - harus sama dengan yang Anda masukkan di Meta Dashboard
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "gggaming"

  console.log("Verifying webhook:", { mode, token, challenge })

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified successfully!")
    return new Response(challenge, { status: 200 })
  }

  console.log("Webhook verification failed")
  return new Response("Verification failed", { status: 403 })
}

// Fungsi untuk menerima pesan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Received webhook data:", JSON.stringify(body))

    // Ekstrak data pesan dari format Meta API
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      console.log("No messages in the webhook")
      return NextResponse.json({ status: "No messages found" })
    }

    const message = messages[0]
    const from = message.from // Nomor pengirim
    const messageText = message.text?.body // Isi pesan

    console.log("Extracted message:", { from, messageText })

    if (!messageText) {
      console.log("Empty message text")
      return NextResponse.json({ status: "Empty message" })
    }

    // Proses pesan (format: kategori jumlah deskripsi)
    const messageParts = messageText.split(" ")
    if (messageParts.length < 2) {
      console.log("Invalid message format")
      await sendWhatsAppMessage(
        from,
        "Format pesan tidak valid. Gunakan: kategori jumlah deskripsi"
      )
      return NextResponse.json({ status: "Invalid format" })
    }

    const categoryName = messageParts[0].toLowerCase()
    const amount = parseFloat(messageParts[1])
    const description = messageParts.slice(2).join(" ")

    if (isNaN(amount)) {
      console.log("Invalid amount")
      await sendWhatsAppMessage(
        from,
        "Jumlah tidak valid. Gunakan angka untuk jumlah."
      )
      return NextResponse.json({ status: "Invalid amount" })
    }

    // Simpan ke Supabase
    // 1. Cari atau buat user
    let userData: { id: string }
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", from)
      .single()

    if (userError || !existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          username: `user_${from.substring(from.length - 6)}`,
          phone_number: from,
        })
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating user:", createError)
        await sendWhatsAppMessage(
          from,
          "Terjadi kesalahan saat mendaftarkan nomor Anda."
        )
        return NextResponse.json({ status: "User creation failed" })
      }

      userData = newUser as { id: string }
    } else {
      userData = existingUser as { id: string }
    }

    // 2. Cari kategori
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, type, name")
      .ilike("name", `%${categoryName}%`)
      .single()

    if (categoryError || !categoryData) {
      console.error("Category error:", categoryError)
      await sendWhatsAppMessage(
        from,
        `Kategori "${categoryName}" tidak ditemukan. Silakan gunakan kategori yang valid.`
      )
      return NextResponse.json({ status: "Category not found" })
    }

    // 3. Buat transaksi
    const adjustedAmount =
      categoryData.type === "expense" ? -Math.abs(amount) : Math.abs(amount)

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
      console.error("Transaction error:", transactionError)
      await sendWhatsAppMessage(
        from,
        "Terjadi kesalahan saat menyimpan transaksi."
      )
      return NextResponse.json({ status: "Transaction failed" })
    }

    // 4. Simpan pesan WhatsApp
    await supabase.from("whatsapp_messages").insert({
      user_id: userData.id,
      message: messageText,
      processed: true,
      transaction_id: transactionData.id,
    })

    // 5. Kirim konfirmasi ke pengguna
    await sendWhatsAppMessage(
      from,
      `Transaksi berhasil dicatat!\nKategori: ${
        categoryData.name
      }\nJumlah: ${Math.abs(amount)}\nDeskripsi: ${description}`
    )

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    )
  }
}

// Fungsi untuk mengirim pesan WhatsApp
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    // Ganti phone number ID dengan milik Anda
    const phoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID || "518272034711699"

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    )

    const data = await response.json()
    console.log("WhatsApp API response:", data)
    return data
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return null
  }
}
