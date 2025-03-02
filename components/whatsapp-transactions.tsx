// components/whatsapp-transactions.tsx
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

// Definisikan tipe untuk transaksi
interface Category {
  name: string
  type: string
  icon: string
}

interface WhatsappMessage {
  message: string
}

interface Transaction {
  id: string
  amount: number
  description: string
  transaction_date: string
  categories: Category
  whatsapp_messages?: WhatsappMessage[]
}

export default function WhatsappTransactions() {
  // Gunakan tipe yang sudah didefinisikan
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWhatsAppTransactions() {
      setLoading(true)

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          id,
          amount,
          description,
          transaction_date,
          categories(name, type, icon),
          whatsapp_messages(message)
        `
        )
        .not("whatsapp_messages", "is", null)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching WhatsApp transactions:", error)
      } else {
        // Cast data ke tipe Transaction[]
        setTransactions(data ? (data as unknown as Transaction[]) : [])
      }

      setLoading(false)
    }

    fetchWhatsAppTransactions()
  }, [])

  if (loading) {
    return <div>Loading WhatsApp transactions...</div>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">WhatsApp Transactions</h3>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No WhatsApp transactions found</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <span>{transaction.categories?.icon || "💬"}</span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.description || transaction.categories?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      WhatsApp: {transaction.whatsapp_messages?.[0]?.message}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    transaction.amount < 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {transaction.amount < 0 ? "-" : "+"}
                  Rp {Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
