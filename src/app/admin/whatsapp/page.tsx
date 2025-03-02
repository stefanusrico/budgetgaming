// src/app/admin/whatsapp/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function WhatsAppAdmin() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const secretKey = process.env.NEXT_PUBLIC_WHATSAPP_SECRET_KEY || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/manual-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          message,
          secret_key: secretKey,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Transaksi Berhasil", {
          description: data.message,
        })
        setMessage("")
      } else {
        toast.error("Error", {
          description: data.error || "Terjadi kesalahan",
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error", {
        description: "Terjadi kesalahan saat memproses transaksi",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Input WhatsApp Message Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone-input"
                className="block text-sm font-medium mb-1"
              >
                Nomor Telepon
              </label>
              <Input
                id="phone-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="628123456789"
                required
              />
            </div>
            <div>
              <label
                htmlFor="message-input"
                className="block text-sm font-medium mb-1"
              >
                Pesan WhatsApp
              </label>
              <Textarea
                id="message-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="makanan 50000 makan siang"
                required
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: [kategori] [jumlah] [deskripsi]
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Proses Transaksi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
