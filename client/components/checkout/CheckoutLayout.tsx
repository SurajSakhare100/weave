import React from 'react'
import { CheckoutProvider } from './CheckoutProvider'

interface CheckoutLayoutProps {
  children: React.ReactNode
}

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children }) => {
  return (
    <CheckoutProvider>
      {children}
    </CheckoutProvider>
  )
} 