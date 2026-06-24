'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { medusa } from '@/lib/medusa'
import Link from 'next/link'

function PaystackCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') // Typically cart_id
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      setErrorMessage('Missing transaction reference from Paystack.')
      return
    }

    let isMounted = true
    let attempts = 0
    const maxAttempts = 10
    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout

    const checkOrderAndComplete = async () => {
      try {
        // 1. Check if the order is already created
        const { orders } = await medusa.store.order.list({
          cart_id: reference,
        } as any)

        if (orders && orders.length > 0) {
          if (isMounted) {
            setStatus('success')
            clearInterval(intervalId)
            // Clear cart from local state/cookie if any
            localStorage.removeItem('medusa_cart_id')
            setTimeout(() => {
              router.push(`/order/${orders[0].id}?success=true`)
            }, 1500)
          }
          return
        }

        // 2. If order not created, try to complete the cart
        try {
          const result = await medusa.store.cart.complete(reference)
          if (result.type === 'order' && result.order) {
            if (isMounted) {
              setStatus('success')
              clearInterval(intervalId)
              localStorage.removeItem('medusa_cart_id')
              setTimeout(() => {
                router.push(`/order/${result.order.id}?success=true`)
              }, 1500)
            }
            return
          }
        } catch (completeErr: any) {
          // If authorization is still pending on webhook, complete might fail. We'll retry.
          console.warn('Cart completion attempt failed, waiting for webhook:', completeErr.message)
        }

        attempts++
        if (attempts >= maxAttempts) {
          if (isMounted) {
            setStatus('failed')
            setErrorMessage('Payment verification timed out. If you received a confirmation email, your order went through.')
            clearInterval(intervalId)
          }
        }
      } catch (err: any) {
        console.error('Error during Paystack verification:', err)
      }
    }

    // Run first check immediately
    checkOrderAndComplete()

    // Poll every 3 seconds
    intervalId = setInterval(checkOrderAndComplete, 3000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [reference, router])

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center max-w-md mx-auto px-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <h1 className="text-xl font-bold text-text">Verifying Payment...</h1>
        <p className="text-xs text-muted leading-relaxed">
          Please do not close this window or click back. We are verifying your card payment with Paystack and securing your order.
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center max-w-md mx-auto px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success">
          <CheckCircle2 size={36} className="animate-scale-up" />
        </div>
        <h1 className="text-xl font-bold text-text">Payment Confirmed!</h1>
        <p className="text-xs text-muted leading-relaxed">
          Your order has been placed successfully. Redirecting you to order confirmation details...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center max-w-md mx-auto px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
        <AlertCircle size={36} />
      </div>
      <h1 className="text-xl font-bold text-text">Verification Failed</h1>
      <p className="text-xs text-muted leading-relaxed">
        {errorMessage || 'We were unable to verify your payment. Please contact support if your account was debited.'}
      </p>
      <div className="flex gap-4 w-full">
        <Link
          href="/checkout"
          className="flex-1 h-12 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          Return to Checkout
        </Link>
        <Link
          href="/support"
          className="flex-1 h-12 bg-white hover:bg-surface text-muted border border-border text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}

export default function PaystackCallbackPage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <h1 className="text-xl font-bold text-text">Loading...</h1>
        </div>
      }>
        <PaystackCallbackContent />
      </Suspense>
    </div>
  )
}
