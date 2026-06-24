'use client'

import React, { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'

interface VerifyPageProps {
  params: Promise<{ id: string }>
}

export default function MpesaC2bVerifyPage({ params }: VerifyPageProps) {
  const router = useRouter()
  const { id: orderOrCartId } = use(params)
  
  const [transId, setTransId] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'flagged' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transId.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/mpesa/c2b-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          order_id: orderOrCartId,
          trans_id: transId.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.matched) {
        setStatus('success')
        setMessage('Your payment was successfully verified!')
        
        // Wait 2 seconds and redirect back to the order page
        // If it returned a cart_id match, we complete the cart first, or if order already completed we redirect
        setTimeout(() => {
          if (data.order_id) {
            router.push(`/order/${data.order_id}?success=true`)
          } else {
            // It was a cart matching, redirect to checkout review to complete or redirect back
            router.push(`/checkout?cart_id=${orderOrCartId}`)
          }
        }, 2000)
      } else {
        if (data.status === 'not_found') {
          setStatus('not_found')
          setMessage(data.message || 'M-Pesa transaction code not found yet. It usually takes 1-2 minutes for callbacks to arrive. Please try again shortly.')
        } else if (data.status === 'flagged' || data.status === 'pending_review') {
          setStatus('flagged')
          setMessage(data.message || 'This transaction has been flagged for manual verification. Our support team will review this shortly.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to verify transaction code. Please ensure you entered the code correctly.')
        }
      }
    } catch (error: any) {
      console.error('Error verifying manual payment:', error)
      setStatus('error')
      setMessage('Network error. Unable to connect to verification server. Please try again.')
    }
  }

  return (
    <div className="flex-1 bg-background py-16 md:py-24 animate-fade-in">
      <div className="max-w-[500px] mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-text tracking-tight">
            Verify M-Pesa Payment
          </h1>
          <p className="text-muted text-xs max-w-sm mx-auto">
            If you have paid manually to our Till Number, please paste your 10-character M-Pesa confirmation code below.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-6">
          
          <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Payment Instructions</span>
            <p className="text-xs text-text leading-relaxed">
              1. Open M-Pesa menu or Lipa Na M-Pesa on your phone.<br />
              2. Select **Buy Goods and Services**.<br />
              3. Enter Till Number: <span className="font-bold text-primary">{process.env.NEXT_PUBLIC_MPESA_TILL_NUMBER || '174379'}</span>.<br />
              4. Enter the exact order total amount.<br />
              5. Enter your PIN and complete payment.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text block">
                M-Pesa Transaction Code
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. QND46T89XZ"
                value={transId}
                onChange={(e) => setTransId(e.target.value.toUpperCase())}
                disabled={status === 'loading' || status === 'success'}
                className="w-full h-12 px-4 bg-white border border-border rounded-xl text-sm font-semibold tracking-wider outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 uppercase text-center"
              />
            </div>

            {status === 'loading' && (
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted py-2">
                <Loader2 className="animate-spin text-primary" size={16} />
                Checking receipt logs...
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 bg-success/10 border border-success/30 rounded-xl text-success text-xs font-medium flex items-start gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <span>{message} Redirecting...</span>
              </div>
            )}

            {(status === 'not_found' || status === 'error') && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs font-medium flex items-start gap-2.5">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'flagged' && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl text-warning text-xs font-medium flex items-start gap-2.5">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success' || !transId.trim()}
              className="w-full h-12 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Verify Payment
              <ArrowRight size={14} />
            </button>
          </form>

        </div>

        {/* Back Link */}
        <div className="flex justify-center">
          <Link
            href={`/checkout?cart_id=${orderOrCartId}`}
            className="text-xs text-muted font-bold hover:text-text flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Checkout
          </Link>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center gap-2 justify-center text-[10px] text-muted">
          <ShieldCheck size={14} className="text-success" />
          <span>Lipa na M-Pesa automated transaction verification.</span>
        </div>

      </div>
    </div>
  )
}
