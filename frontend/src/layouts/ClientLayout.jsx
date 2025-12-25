/**
 * ClientLayout - Main layout wrapper for customer-facing pages.
 * Includes navigation, footer, and customer authentication modal.
 */

import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/client/Navbar'
import Footer from '@/components/client/Footer'
import ScrollToTop from '@/components/client/ScrollToTop'
import FloatingCartButton from '@/components/client/FloatingCartButton'
import CustomerLoginModal from '@/components/client/CustomerLoginModal'
import { CustomerProvider } from '@/context/CustomerContext'

export default function ClientLayout() {
  return (
    <CustomerProvider>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <FloatingCartButton />
      <Footer />
      <CustomerLoginModal />
    </CustomerProvider>
  )
}
