import BudgetDashboard from "@/components/budget-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="h-full bg-white">
        <BudgetDashboard />
      </div>
    </main>
  )
}
