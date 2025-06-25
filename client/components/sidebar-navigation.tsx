"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"

interface SidebarNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SidebarNavigation({ activeSection, onSectionChange }: SidebarNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["payments"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const menuItems = [
    {
      id: "edit-profile",
      label: "Edit Profile",
      hasChildren: false,
    },
    {
      id: "my-account",
      label: "My Account",
      hasChildren: true,
      children: [
        { id: "profile", label: "Profile" },
        { id: "settings", label: "Settings" },
      ],
    },
    {
      id: "addresses",
      label: "Addresses",
      hasChildren: true,
      children: [{ id: "edit-address", label: "Edit & add new address" }],
    },
    {
      id: "payments",
      label: "Payments & Refunds",
      hasChildren: true,
      children: [
        { id: "refund-status", label: "Refund status & Payment modes" },
        { id: "payment-modes", label: "Payment modes" },
      ],
    },
    {
      id: "past-orders",
      label: "Past Orders",
      hasChildren: false,
    },
  ]

  return (
    <aside className="w-64 bg-white h-screen ">
      <div className="p-6">
        <h2 className="text-2xl font-medium text-[#6c4323] mb-8">Profile</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.hasChildren) {
                    toggleSection(item.id)
                  } else {
                    onSectionChange(item.id)
                  }
                }}
                className={`w-full flex items-center justify-between text-left py-2 px-0 text-[#6c4323] hover:text-[#cf1a53] transition-colors ${
                  activeSection === item.id ? "text-[#cf1a53]" : ""
                }`}
              >
                <span>{item.label}</span>
                {item.hasChildren ? (
                  expandedSections.includes(item.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {item.hasChildren && expandedSections.includes(item.id) && (
                <div className="ml-4 mt-2 space-y-2">
                  {item.children?.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onSectionChange(child.id)}
                      className={`w-full flex items-center justify-between text-left py-2 px-0 text-[#6c4323] hover:text-[#cf1a53] transition-colors text-sm ${
                        activeSection === child.id ? "text-[#cf1a53]" : ""
                      }`}
                    >
                      <span>{child.label}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
