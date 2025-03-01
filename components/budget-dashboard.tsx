"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home,
  Plus,
  ShoppingBag,
} from "lucide-react"
import { ReactNode, useState } from "react"

export default function BudgetDashboard() {
  const [activeTab, setActiveTab] = useState("daily")
  const [currentMonth, setCurrentMonth] = useState("January 2023")

  const handlePreviousMonth = () => {
    // Simple implementation - in a real app, you'd calculate the actual previous month
    setCurrentMonth("December 2022")
  }

  const handleNextMonth = () => {
    // Simple implementation - in a real app, you'd calculate the actual next month
    setCurrentMonth("February 2023")
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold">BudgetTracker</h1>
          <nav className="hidden md:flex space-x-4 text-sm">
            <a href="#" className="text-blue-600 font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-600">
              Transactions
            </a>
            <a href="#" className="text-gray-600">
              Budgets
            </a>
            <a href="#" className="text-gray-600">
              Reports
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-1 h-4 w-4" /> Add Transaction
          </Button>
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-600">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Time Period Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <Tabs defaultValue="daily" className="w-full md:w-auto">
            <TabsList className="bg-gray-100 w-full md:w-auto">
              <TabsTrigger
                value="daily"
                className={`flex-1 md:flex-none ${
                  activeTab === "daily" ? "bg-gray-900 text-white" : ""
                }`}
                onClick={() => setActiveTab("daily")}
              >
                Daily
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className={`flex-1 md:flex-none ${
                  activeTab === "weekly" ? "bg-gray-900 text-white" : ""
                }`}
                onClick={() => setActiveTab("weekly")}
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className={`flex-1 md:flex-none ${
                  activeTab === "monthly" ? "bg-gray-900 text-white" : ""
                }`}
                onClick={() => setActiveTab("monthly")}
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                value="quarterly"
                className={`flex-1 md:flex-none ${
                  activeTab === "quarterly" ? "bg-gray-900 text-white" : ""
                }`}
                onClick={() => setActiveTab("quarterly")}
              >
                Quarterly
              </TabsTrigger>
              <TabsTrigger
                value="yearly"
                className={`flex-1 md:flex-none ${
                  activeTab === "yearly" ? "bg-gray-900 text-white" : ""
                }`}
                onClick={() => setActiveTab("yearly")}
              >
                Yearly
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{currentMonth}</span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialCard
            title="Total Income"
            amount="$8,450.00"
            change="+12%"
            isPositive={true}
          />
          <FinancialCard
            title="Total Expenses"
            amount="$5,240.00"
            change="-8%"
            isPositive={true}
          />
          <FinancialCard
            title="Savings"
            amount="$3,210.00"
            change="+18%"
            isPositive={true}
          />
          <FinancialCard
            title="Balance"
            amount="$12,890.00"
            change="+16%"
            isPositive={true}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-medium">Expense Distribution</h3>
              <div className="flex h-64 items-center justify-center bg-gray-100 text-sm text-gray-500">
                Donut Chart Placeholder
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-medium">Spending Trend</h3>
              <div className="flex h-64 items-center justify-center bg-gray-100 text-sm text-gray-500">
                Line Chart Placeholder
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget vs. Actual */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-medium">Budget vs. Actual</h3>
            <div className="space-y-4">
              <BudgetProgressItem
                category="Housing"
                current={1200}
                total={1500}
                percentage={80}
              />
              <BudgetProgressItem
                category="Transportation"
                current={400}
                total={500}
                percentage={80}
              />
              <BudgetProgressItem
                category="Food & Dining"
                current={500}
                total={800}
                percentage={62.5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Recent Transactions</h3>
              <a href="#" className="text-sm text-blue-600">
                View All
              </a>
            </div>
            <div className="space-y-4">
              <TransactionItem
                icon={<ShoppingBag className="h-5 w-5" />}
                title="Grocery Shopping"
                date="Jan 15, 2023"
                amount="-$125.40"
                isExpense={true}
              />
              <TransactionItem
                icon={<Home className="h-5 w-5" />}
                title="Rent Payment"
                date="Jan 14, 2023"
                amount="-$1,200.00"
                isExpense={true}
              />
              <TransactionItem
                icon={<Briefcase className="h-5 w-5" />}
                title="Salary Deposit"
                date="Jan 13, 2023"
                amount="+$4,200.00"
                isExpense={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface FinancialCardProps {
  title: string
  amount: string
  change: string
  isPositive: boolean
}

function FinancialCard({
  title,
  amount,
  change,
  isPositive,
}: FinancialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm text-gray-600">{title}</h3>
        <p className="mt-1 text-2xl font-bold">{amount}</p>
        <p
          className={`mt-1 text-xs ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change} vs last period
        </p>
      </CardContent>
    </Card>
  )
}

interface BudgetProgressItemProps {
  category: string
  current: number
  total: number
  percentage: number
}

function BudgetProgressItem({
  category,
  current,
  total,
  percentage,
}: BudgetProgressItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{category}</span>
        <span>
          ${current} / ${total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

interface TransactionItemProps {
  icon: ReactNode
  title: string
  date: string
  amount: string
  isExpense: boolean
}

function TransactionItem({
  icon,
  title,
  date,
  amount,
  isExpense,
}: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <span className={isExpense ? "text-red-600" : "text-green-600"}>
        {amount}
      </span>
    </div>
  )
}
