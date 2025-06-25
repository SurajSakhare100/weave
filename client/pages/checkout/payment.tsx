"use client"

import { useState } from "react"
import { PaymentOption } from "@/components/payment-option"
import { BankOption } from "@/components/bank-option"
import { SuccessModal } from "@/components/success-modal"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"

export default function PaymentPage() {
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState("online")
  const [selectedBank, setSelectedBank] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePayment = () => {
    setShowSuccess(true)
  }

  return (
    <Layout>

    <div className="min-h-screen bg-[#fafafa]">

      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <nav className="text-[#6c4323] mb-8">
          <span>Home</span>
          <span className="mx-2">{">"}</span>
          <span>Cart</span>
          <span className="mx-2">{">"}</span>
          <span>Select Address</span>
          <span className="mx-2">{">"}</span>
          <span>Place Your Order</span>
          <span className="mx-2">{">"}</span>
          <span>Payment Method</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PaymentOption
              label="Pay Online"
              amount="2200"
              isSelected={selectedPayment === "online"}
              onSelect={() => setSelectedPayment("online")}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-[#e5e5e5] rounded">
                  <div className="text-blue-600 font-bold text-sm">UPI</div>
                  <span className="text-[#6c4323]">Pay by any UPI App</span>
                </div>
                <Button variant="link" className="text-[#cf1a53] p-0 h-auto font-normal">
                  Add UPI ID +
                </Button>

                <div className="border border-[#e5e5e5] rounded p-3">
                  <span className="text-[#6c4323]">Debit/Credit Cards</span>
                </div>

                <div className="border border-[#e5e5e5] rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#6c4323] font-medium">Net Banking</span>
                  </div>
                  <div className="space-y-2">
                    <BankOption
                      icon={
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          S
                        </div>
                      }
                      name="State Bank of India"
                      isSelected={selectedBank === "sbi"}
                      onSelect={() => setSelectedBank("sbi")}
                    />
                    <BankOption
                      icon={
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          H
                        </div>
                      }
                      name="HDFC Bank"
                      isSelected={selectedBank === "hdfc"}
                      onSelect={() => setSelectedBank("hdfc")}
                    />
                    <BankOption
                      icon={
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          I
                        </div>
                      }
                      name="ICICI Netbanking"
                      isSelected={selectedBank === "icici"}
                      onSelect={() => setSelectedBank("icici")}
                    />
                    <BankOption
                      icon={
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          A
                        </div>
                      }
                      name="Axis Bank"
                      isSelected={selectedBank === "axis"}
                      onSelect={() => setSelectedBank("axis")}
                    />
                  </div>
                  <Button variant="link" className="text-[#cf1a53] p-0 h-auto font-normal mt-4">
                    View all banks
                  </Button>
                </div>
              </div>
            </PaymentOption>
          </div>

          <div className="bg-[#fff9f5] p-6 rounded-lg h-fit">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#6c4323] text-white rounded text-xs flex items-center justify-center font-bold">
                  ₹
                </div>
                <span className="text-[#6c4323] font-medium">To Pay</span>
                <span className="text-[#6c4323] line-through text-sm">₹ 6,997</span>
                <span className="text-[#6c4323] font-bold">₹ 5,754</span>
              </div>
            </div>
            <div className="text-[#cf1a53] text-sm mb-4">₹ 243 saved on the total!</div>

            <Button onClick={handlePayment} className="w-full bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white">
              Continue to checkout
            </Button>
          </div>
        </div>

        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          onContinueShopping={() => router.push("/")}
        />
      </div>
    </div>
    </Layout>

  )
}
