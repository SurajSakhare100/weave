"use client"

import { useState } from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { ProductCard } from "@/components/product-card"
import { AddressCard } from "@/components/address-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { DeleteAccountModal } from "@/components/delete-account-modal"
import { EditProfileField } from "@/components/edit-profile-field"
import { PaymentOption } from "@/components/payment-option"
import { BankOption } from "@/components/bank-option"
import Layout from "@/components/Layout"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("refund-status")
  const [selectedAddress, setSelectedAddress] = useState("snehal")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "Snehal",
    lastName: "Dinde",
    email: "abc@gmail.com",
    phone: "+91 9455638924",
  })
  const [selectedPayment, setSelectedPayment] = useState("online")
  const [selectedBank, setSelectedBank] = useState("")

  const getBreadcrumbItems = () => {
    switch (activeSection) {
      case "refund-status":
        return ["Payments & Refunds", "Refund Status"]
      case "payment-modes":
        return ["Payments & Refunds", "Payment modes"]
      case "past-orders":
        return ["Past Orders"]
      case "edit-address":
        return ["Addresses", "Edit & add new address"]
      case "settings":
        return ["Profile", "Settings"]
      case "profile":
        return ["My Account", "Profile"]
      case "edit-profile":
        return ["Edit Profile"]
      default:
        return [activeSection.replace("-", " ")]
    }
  }

  const getPageTitle = () => {
    switch (activeSection) {
      case "refund-status":
        return "Payments & Refunds > Refund Status"
      case "payment-modes":
        return "Payments & Refunds > Payment modes"
      case "past-orders":
        return "Past Orders"
      case "edit-address":
        return "Addresses > Edit & add new address"
      case "settings":
        return "Profile > Settings"
      case "profile":
        return "My Account > Profile"
      case "edit-profile":
        return "Edit Profile"
      default:
        return activeSection.replace("-", " ")
    }
  }

  const pastOrders = [
    {
      name: "Bag name",
      price: "₹ 1999",
      size: "Large",
      color: "Pink",
      quantity: 1,
      image: "/tote-bag-product.png",
    },
    {
      name: "Bag name",
      price: "₹ 1999",
      size: "Large",
      color: "Pink",
      quantity: 2,
      image: "/tote-bag-product.png",
    },
  ]

  const addresses = [
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
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "refund-status":
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">{getPageTitle()}</h1>
            <EmptyState message="You don't have any past refund" />
          </div>
        )

      case "past-orders":
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">Past Orders</h1>
            <div>
              {pastOrders.map((order, index) => (
                <ProductCard key={index} {...order} />
              ))}
            </div>
          </div>
        )

      case "edit-address":
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">{getPageTitle()}</h1>
            <div className="bg-white rounded-lg">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  name={address.name}
                  address={address.address}
                  isSelected={selectedAddress === address.id}
                  onSelect={() => setSelectedAddress(address.id)}
                />
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Button  className=" text-lg underline hover:no-underline">
                Add Delivery Address
              </Button>
            </div>
          </div>
        )
      case "settings":
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">{getPageTitle()}</h1>
            <div className="bg-[#fff9f5] p-6 rounded-lg inline-block">
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                className="border-[#cf1a53]  hover:bg-[#cf1a53] hover:text-white px-8"
              >
                Delete Weave Account
              </Button>
            </div>
            <DeleteAccountModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={() => {
                // Handle account deletion
                setShowDeleteModal(false)
              }}
            />
          </div>
        )

      case "edit-profile":
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">Edit Profile</h1>
            <div className="max-w-4xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <EditProfileField
                  label="First Name"
                  value={profileData.firstName}
                  onUpdate={(value) => setProfileData({ ...profileData, firstName: value })}
                />
                <EditProfileField
                  label="Last Name"
                  value={profileData.lastName}
                  onUpdate={(value) => setProfileData({ ...profileData, lastName: value })}
                />
              </div>
              <EditProfileField
                label="Email Address"
                value={profileData.email}
                type="email"
                onUpdate={(value) => setProfileData({ ...profileData, email: value })}
              />
              <EditProfileField
                label="Phone number"
                value={profileData.phone}
                type="tel"
                onUpdate={(value) => setProfileData({ ...profileData, phone: value })}
              />
            </div>
          </div>
        )

      case "payment-modes":
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">{getPageTitle()}</h1>
            <div className="max-w-2xl">
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
                  <Button  className=" p-0 h-auto font-normal">
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
                    <Button  className=" p-0 h-auto font-normal mt-4">
                      View all banks
                    </Button>
                  </div>
                </div>
              </PaymentOption>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <h1 className="text-2xl font-medium text-[#6c4323] mb-8">
              {activeSection.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </h1>
            <EmptyState message="Content coming soon..." />
          </div>
        )
    }
  }

  return (
   <Layout>
     <div className="h-screen bg-[#fafafa]">
      <div className=" mx-auto px-4 lg:px-6 py-8">
        <div className="flex gap-8 h-full">
          <SidebarNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

          <main className="flex-1 bg-white rounded-lg p-8">{renderContent()}</main>
        </div>
      </div>
    </div>
   </Layout>
  )
}
