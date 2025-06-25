"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AddressCard } from "@/components/address-card"
import { AddressFormModal } from "@/components/address-form-modal"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"

export default function AddressPage() {
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState("snehal")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addresses, setAddresses] = useState([
    {
      id: "snehal",
      name: "Snehal Dinde",
      address: ["17B, Orchid Residency", "Link Road, Malad West", "Mumbai, Maharashtra – 400064"],
    },
    {
      id: "rohit",
      name: "Rohit Sharma",
      address: ["Flat No. 402, Aster Heights", "Palm Grove Road, Indiranagar", "Bangalore, Karnataka – 560038"],
    },
    {
      id: "amit",
      name: "Amit Desai",
      address: ["Plot No. 11, Sunrise Enclave", "Sector 45, Near Metro Station", "Gurgaon, Haryana – 122003"],
    },
  ])

  const handleAddAddress = (newAddress: any) => {
    const address = {
      id: Date.now().toString(),
      name: `${newAddress.firstName} ${newAddress.lastName}`,
      address: [`${newAddress.building}`, `${newAddress.area}`, `${newAddress.state} – ${newAddress.pincode}`],
    }
    setAddresses([...addresses, address])
  }

  return (
   <Layout>
     <div className="min-h-screen bg-[#fafafa] text-black">

<div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
  <nav className="text-[#6c4323] mb-8">
    <span>Home</span>
    <span className="mx-2">{">"}</span>
    <span>Cart</span>
    <span className="mx-2">{">"}</span>
    <span>Select Address</span>
  </nav>

  {addresses.length === 0 ? (
    <div className="text-center py-20">
      <p className="text-[#6c4323] mb-4">All Addresses (0)</p>
      <Button
        variant="link"
        onClick={() => setShowAddressForm(true)}
        className="text-[#cf1a53] text-lg underline hover:no-underline"
      >
        Add Delivery Address
      </Button>
    </div>
  ) : (
    <div className="bg-white rounded-lg p-8">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          name={address.name}
          address={address.address}
          isSelected={selectedAddress === address.id}
          onSelect={() => setSelectedAddress(address.id)}
        />
      ))}

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="link"
          onClick={() => setShowAddressForm(true)}
          className="text-[#cf1a53] underline hover:no-underline"
        >
          Add Delivery Address
        </Button>

        <Button
          onClick={() => router.push("/checkout/order-summary")}
          className="bg-[#cf1a53] hover:bg-[#cf1a53]/90 text-white px-8"
        >
          Deliver to this address
        </Button>
      </div>
    </div>
  )}

  <AddressFormModal
    isOpen={showAddressForm}
    onClose={() => setShowAddressForm(false)}
    onSubmit={handleAddAddress}
  />
</div>
</div>
   </Layout>
  )
}