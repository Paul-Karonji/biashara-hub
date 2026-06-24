"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Smartphone, Loader2, AlertCircle, Check } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { medusa } from "@/lib/medusa"
import { formatKES } from "@/lib/formatters"
import { trackCheckoutStart, trackPaymentSelected, trackOrderComplete } from "@/lib/analytics"
import { CheckoutStepIndicator } from "./components/CheckoutStepIndicator"
import { CheckoutSummary } from "./components/CheckoutSummary"
import { MpesaOverlay, PaystackOverlay } from "./components/MpesaOverlay"

type Step = "address" | "shipping" | "payment" | "review"

// All 47 Kenyan counties for the city/county datalist
const KE_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi",
  "Kitale", "Garissa", "Kisii", "Nyeri", "Machakos", "Meru", "Embu", "Migori",
  "Siaya", "Kakamega", "Bungoma", "Uasin Gishu", "Trans Nzoia", "Nandi",
  "Baringo", "Laikipia", "Nyandarua", "Muranga", "Kirinyaga", "Kiambu",
  "Kajiado", "Makueni", "Kitui", "Tharaka-Nithi", "Isiolo", "Marsabit",
  "Samburu", "West Pokot", "Turkana", "Mandera", "Wajir", "Kwale", "Kilifi",
  "Taita-Taveta", "Lamu", "Tana River", "Homabay", "Vihiga", "Busia",
  "Kericho", "Bomet", "Narok", "Nyamira",
]

export default function CheckoutPage() {
  const { cart, refreshCart, clearCart, isLoading: isCartLoading } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<Step>("address")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isMpesaProcessing, setIsMpesaProcessing] = useState(false)
  const [mpesaTimer, setMpesaTimer] = useState(120)

  // Address form
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("Nairobi")

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState("")
  const [isShippingLoading, setIsShippingLoading] = useState(false)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa")
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [mpesaFlow, setMpesaFlow] = useState<"stk" | "manual">("stk")
  const [manualMpesaCode, setManualMpesaCode] = useState("")
  const [manualMpesaVerified, setManualMpesaVerified] = useState(false)
  const [manualVerifyLoading, setManualVerifyLoading] = useState(false)
  const [manualVerifySuccess, setManualVerifySuccess] = useState("")
  const [manualVerifyError, setManualVerifyError] = useState("")

  const cancelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cancelRejectRef = useRef<((reason?: any) => void) | null>(null)
  const [isRedirectingToPaystack, setIsRedirectingToPaystack] = useState(false)

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shippingTotal = cart?.shipping_total || 0
  const total = cart?.total || subtotal + shippingTotal

  // Pre-fill from saved cart
  useEffect(() => {
    if (!cart) return
    const t = setTimeout(() => {
      if (cart.email) setEmail(cart.email)
      if (cart.shipping_address) {
        setFirstName(cart.shipping_address.first_name || "")
        setLastName(cart.shipping_address.last_name || "")
        setPhone(cart.shipping_address.phone || "")
        setAddress(cart.shipping_address.address_1 || "")
        setCity(cart.shipping_address.city || "Nairobi")
      }
      if (cart.shipping_methods?.length > 0) {
        setSelectedShippingOptionId(cart.shipping_methods[0].shipping_option_id)
      }
    }, 0)
    return () => clearTimeout(t)
  }, [cart])

  useEffect(() => {
    if (cart?.id) trackCheckoutStart(cart.total || cart.subtotal || 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.id])

  useEffect(() => { trackPaymentSelected(paymentMethod) }, [paymentMethod])

  useEffect(() => {
    if (!isCartLoading && items.length === 0 && !isSubmitting) router.push("/shop")
  }, [items.length, isCartLoading, router, isSubmitting])

  const handleCancelMpesa = () => {
    if (cancelIntervalRef.current) { clearInterval(cancelIntervalRef.current); cancelIntervalRef.current = null }
    if (cancelRejectRef.current) { cancelRejectRef.current(new Error("CANCELLED")); cancelRejectRef.current = null }
    setIsMpesaProcessing(false)
    setIsSubmitting(false)
  }

  const handleVerifyManualMpesa = async () => {
    if (!manualMpesaCode.trim()) return
    setManualVerifyLoading(true)
    setManualVerifyError("")
    setManualVerifySuccess("")
    try {
      await medusa.store.payment.initiatePaymentSession(cart, { provider_id: "pp_mpesa_mpesa" })
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/mpesa/c2b-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          body: JSON.stringify({ cart_id: cart.id, trans_id: manualMpesaCode.trim().toUpperCase() }),
        }
      )
      const data = await response.json()
      if (response.ok && data.matched) {
        setManualMpesaVerified(true)
        setManualVerifySuccess("Payment verified successfully!")
      } else {
        setManualVerifyError(data.message || data.error || "Transaction code not found or amount mismatch.")
      }
    } catch (err: any) {
      console.error("Error verifying manual payment:", err)
      setManualVerifyError("Failed to connect to verification server. Please try again.")
    } finally {
      setManualVerifyLoading(false)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart) { setErrorMessage("Cart is not loaded yet. Please wait a moment and try again."); return }
    if (!email || !firstName || !lastName || !phone || !address || !city) {
      setErrorMessage("Please fill in all address details.")
      return
    }
    setIsSubmitting(true)
    setErrorMessage("")
    try {
      await medusa.store.cart.update(cart.id, {
        email,
        shipping_address: { first_name: firstName, last_name: lastName, phone, address_1: address, city, country_code: "ke" },
      })
      await refreshCart()
      setIsShippingLoading(true)
      const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cart.id })
      setShippingOptions(shipping_options || [])
      setIsShippingLoading(false)
      setStep("shipping")
    } catch (error: any) {
      console.error("Error updating address:", error)
      setErrorMessage(error.message || "Failed to update address. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShippingOptionId) { setErrorMessage("Please select a shipping method."); return }
    setIsSubmitting(true)
    setErrorMessage("")
    try {
      await medusa.store.cart.addShippingMethod(cart.id, { option_id: selectedShippingOptionId })
      await refreshCart()
      setStep("payment")
    } catch (error: any) {
      console.error("Error adding shipping method:", error)
      setErrorMessage(error.message || "Failed to select shipping method. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "mpesa" && mpesaFlow === "stk") {
      if (!mpesaPhone) { setErrorMessage("Please enter your M-Pesa phone number."); return }
      const cleanPhone = mpesaPhone.replace(/\s/g, "")
      if (!/^(?:07|01|2547|2541|\+2547|\+2541|7|1)\d{8}$/.test(cleanPhone)) {
        setErrorMessage("Please enter a valid Kenyan phone number (e.g., 0712345678).")
        return
      }
    }
    setStep("review")
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    setErrorMessage("")
    try {
      if (paymentMethod === "mpesa") {
        if (mpesaFlow === "stk") {
          setIsMpesaProcessing(true)
          setMpesaTimer(120)
          await medusa.store.payment.initiatePaymentSession(cart, { provider_id: "pp_mpesa_mpesa" })
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/mpesa/initiate`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '' },
              body: JSON.stringify({ cart_id: cart.id, phone: mpesaPhone }),
            }
          )
          if (!response.ok) {
            const errData = await response.json()
            throw new Error(errData.error || "Failed to trigger Lipa Na M-Pesa payment prompt.")
          }
          const { checkout_request_id: checkoutRequestId } = await response.json()

          await new Promise<void>((resolve, reject) => {
            cancelRejectRef.current = reject
            let attempts = 0
            let consecutiveErrors = 0
            const interval = setInterval(async () => {
              try {
                const statusRes = await fetch(
                  `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/mpesa/status/${checkoutRequestId}?cartId=${encodeURIComponent(cart?.id || '')}`,
                  { headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '' } }
                )
                if (!statusRes.ok) throw new Error("Unable to check payment transaction status.")
                const statusData = await statusRes.json()
                consecutiveErrors = 0
                if (statusData.confirmed || statusData.status === 'authorized') {
                  clearInterval(interval)
                  cancelIntervalRef.current = null
                  cancelRejectRef.current = null
                  const compRes = await medusa.store.cart.complete(cart.id)
                  if (compRes.type === "order" && compRes.order) {
                    trackOrderComplete(compRes.order.id, compRes.order.total, "mpesa")
                    clearCart()
                    router.push(`/order/${compRes.order.id}?success=true`)
                    resolve()
                  } else {
                    reject(new Error("Cart completion failed after payment authorization."))
                  }
                } else if (statusData.status === 'failed') {
                  clearInterval(interval)
                  cancelIntervalRef.current = null
                  cancelRejectRef.current = null
                  reject(new Error(statusData.failure_reason || "M-Pesa STK transaction was cancelled or declined."))
                }
              } catch (pollErr: any) {
                consecutiveErrors++
                if (consecutiveErrors >= 3) {
                  clearInterval(interval)
                  cancelIntervalRef.current = null
                  cancelRejectRef.current = null
                  reject(new Error("Network issue while checking payment status. Please check your connection and try again."))
                }
              }
              attempts++
              setMpesaTimer((prev) => (prev > 3 ? prev - 3 : 0))
              if (attempts >= 40) {
                clearInterval(interval)
                cancelIntervalRef.current = null
                cancelRejectRef.current = null
                reject(new Error("Payment prompt timed out. Please try again or use Manual Till payment."))
              }
            }, 3000)
            cancelIntervalRef.current = interval
          })
        } else {
          if (!manualMpesaVerified) throw new Error("Please verify your manual M-Pesa payment code before completing the order.")
          const compRes = await medusa.store.cart.complete(cart.id)
          if (compRes.type === "order" && compRes.order) {
            trackOrderComplete(compRes.order.id, compRes.order.total, "mpesa")
            clearCart()
            router.push(`/order/${compRes.order.id}?success=true`)
          } else {
            throw new Error("Failed to complete order. Please retry.")
          }
        }
      } else if (paymentMethod === "card") {
        const session = await medusa.store.payment.initiatePaymentSession(cart, { provider_id: "pp_paystack_paystack", data: { email } })
        const paystackSession = session.payment_collection?.payment_sessions?.find((s: any) => s.provider_id === "pp_paystack_paystack")
        const authorizationUrl = (paystackSession?.data as any)?.authorization_url || (paystackSession?.data as any)?.paystackTxAuthorizationUrl
        if (authorizationUrl) {
          setIsRedirectingToPaystack(true)
          window.location.href = authorizationUrl
        } else {
          throw new Error("Paystack card checkout session could not be initialized.")
        }
      } else {
        await medusa.store.payment.initiatePaymentSession(cart, { provider_id: "manual" })
        const response = await medusa.store.cart.complete(cart.id)
        if (response.type === "order" && response.order) {
          trackOrderComplete(response.order.id, response.order.total, paymentMethod)
          clearCart()
          router.push(`/order/${response.order.id}`)
        } else {
          throw new Error("Failed to complete order.")
        }
      }
    } catch (error: any) {
      if (error?.message !== "CANCELLED") {
        console.error("Error placing order:", error)
        setErrorMessage(error.message || "Failed to place order. Please try again.")
      }
      setIsMpesaProcessing(false)
      setIsSubmitting(false)
    }
  }

  const inputCls = "w-full h-12 px-4 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
  const btnBack = "h-12 px-6 border border-border text-text hover:bg-surface text-xs font-semibold rounded-sm flex items-center justify-center transition-colors cursor-pointer"
  const btnNext = "h-12 px-8 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Step Forms */}
        <div className="lg:col-span-2 bg-white rounded-md border border-border p-6 md:p-10 space-y-8">
          <CheckoutStepIndicator current={step} />

          {errorMessage && (
            <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-md">
              {errorMessage}
            </div>
          )}

          {/* ── STEP 1: ADDRESS ── */}
          {step === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <h2 className="text-lg font-bold text-text">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">First Name</label>
                  <input type="text" required placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">Last Name</label>
                  <input type="text" required placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text">Email Address</label>
                <input type="email" required placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">Phone Number</label>
                  <input type="tel" required placeholder="e.g. 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">City / County</label>
                  <input type="text" required list="ke-counties" placeholder="e.g. Nairobi, Mombasa..." value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
                  <datalist id="ke-counties">
                    {KE_COUNTIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text">Delivery Address</label>
                <input type="text" required placeholder="Estate, House No, Street name" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className={btnNext}>
                  Continue to Shipping <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: SHIPPING ── */}
          {step === "shipping" && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-lg font-bold text-text">Select Delivery Method</h2>
                <button type="button" onClick={() => setStep("address")} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                  <ArrowLeft size={12} /> Change Address
                </button>
              </div>
              {isShippingLoading ? (
                <div className="py-12 text-center text-xs text-muted font-medium">Loading delivery speeds and rates...</div>
              ) : shippingOptions.length === 0 ? (
                <div className="p-6 bg-surface border border-border rounded-md text-center text-xs text-muted">
                  No shipping options available for this region. Please go back and verify your address.
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingOptions.map((option: any) => {
                    const isSelected = selectedShippingOptionId === option.id
                    return (
                      <label key={option.id} className={`flex items-center justify-between p-5 border rounded-md cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-border hover:border-muted bg-white"
                      }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shipping_option" value={option.id} checked={isSelected} onChange={() => setSelectedShippingOptionId(option.id)} className="w-4 h-4 text-primary border-border focus:ring-primary" />
                          <div>
                            <span className="text-text font-semibold text-sm block">{option.name}</span>
                            {option.metadata?.delivery_days && (
                              <span className="text-[10px] text-muted font-medium mt-0.5 block">Est. delivery: {option.metadata.delivery_days}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-primary font-bold text-sm">{option.amount === 0 ? "FREE" : formatKES(option.amount)}</span>
                      </label>
                    )
                  })}
                </div>
              )}
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep("address")} className={btnBack}>Back</button>
                <button type="submit" disabled={isSubmitting || !selectedShippingOptionId} className={btnNext}>
                  Continue to Payment <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-lg font-bold text-text">Select Payment Option</h2>
                <button type="button" onClick={() => setStep("shipping")} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                  <ArrowLeft size={12} /> Change Shipping
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(['mpesa', 'card'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                    className={`p-4 border rounded-md flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === m ? "border-primary bg-primary/5" : "border-border hover:border-muted bg-white"
                    }`}>
                    {m === 'mpesa'
                      ? <><Smartphone className={paymentMethod === 'mpesa' ? 'text-primary' : 'text-muted'} size={24} /><span className="text-xs font-bold">M-Pesa STK Push</span></>
                      : <><span className="text-lg font-bold text-text font-serif">Visa/MC</span><span className="text-xs font-bold text-muted">Debit/Credit Card</span></>}
                  </button>
                ))}
              </div>

              {paymentMethod === "mpesa" ? (
                <div className="p-6 bg-surface border border-border rounded-md space-y-5">
                  <div className="flex border border-border rounded-md p-1 bg-white">
                    {(['stk', 'manual'] as const).map((f) => (
                      <button key={f} type="button" onClick={() => { setMpesaFlow(f); setErrorMessage("") }}
                        className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${
                          mpesaFlow === f ? "bg-primary text-white" : "text-muted hover:text-text bg-transparent"
                        }`}>
                        {f === 'stk' ? 'STK Push Prompt' : 'Manual Till Payment'}
                      </button>
                    ))}
                  </div>

                  {mpesaFlow === "stk" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-text font-semibold text-sm">
                        <Smartphone size={18} className="text-primary" />
                        <span>Lipa Na M-Pesa STK Prompt</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">We will send a payment prompt directly to your phone. Enter your M-Pesa PIN on your phone to complete the transaction instantly.</p>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-text">M-Pesa Mobile Number</label>
                        <div className="flex gap-2">
                          <span className="h-12 w-16 bg-white border border-border rounded-md flex items-center justify-center text-sm font-semibold text-text">+254</span>
                          <input type="tel" placeholder="e.g. 0712345678" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)}
                            className="flex-1 h-12 px-4 bg-white border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-border rounded-md space-y-2">
                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">How to Pay Manually:</span>
                        <p className="text-xs text-text leading-relaxed">
                          1. Select **Lipa Na M-Pesa** &gt; **Buy Goods and Services**.<br />
                          2. Enter Till Number: <span className="font-bold text-primary">{process.env.NEXT_PUBLIC_MPESA_TILL_NUMBER || '174379'}</span>.<br />
                          3. Enter exact amount: <span className="font-bold text-primary">{formatKES(total)}</span>.<br />
                          4. Pay and enter the 10-character confirmation code below.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-text">Transaction Code (e.g. QND46T89XZ)</label>
                        <div className="flex gap-2">
                          <input type="text" maxLength={10} placeholder="M-PESA CODE" value={manualMpesaCode}
                            onChange={(e) => setManualMpesaCode(e.target.value.toUpperCase())} disabled={manualMpesaVerified}
                            className="flex-1 h-12 px-4 bg-white border border-border rounded-md text-sm font-semibold tracking-wider text-center uppercase outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50" />
                          <button type="button" onClick={handleVerifyManualMpesa}
                            disabled={manualVerifyLoading || manualMpesaVerified || !manualMpesaCode.trim()}
                            className="h-12 px-5 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-sm flex items-center justify-center transition-colors disabled:opacity-50 min-w-[100px]">
                            {manualVerifyLoading ? <Loader2 className="animate-spin" size={16} /> : "Verify Code"}
                          </button>
                        </div>
                      </div>
                      {manualVerifySuccess && (
                        <div className="p-3 bg-success/10 border border-success/30 rounded-md text-success text-xs font-medium flex items-center gap-2">
                          <Check className="flex-shrink-0" size={16} /><span>{manualVerifySuccess}</span>
                        </div>
                      )}
                      {manualVerifyError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-xs font-medium flex items-start gap-2">
                          <AlertCircle className="flex-shrink-0 mt-0.5" size={16} /><span>{manualVerifyError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-surface border border-border rounded-md space-y-4 text-center">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">Paystack Secure Card Checkout</span>
                  <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">You will be redirected securely to Paystack to complete your card payment. You can pay using Visa, Mastercard, or AMEX.</p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep("shipping")} className={btnBack}>Back</button>
                <button type="submit" disabled={isSubmitting} className={btnNext}>
                  Continue to Review <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: REVIEW ── */}
          {step === "review" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-lg font-bold text-text">Review &amp; Place Order</h2>
                <button type="button" onClick={() => setStep("payment")} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                  <ArrowLeft size={12} /> Change Payment
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border rounded-md p-6 bg-surface">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">Shipping Details</h3>
                  <p className="text-xs text-muted font-medium">{firstName} {lastName}</p>
                  <p className="text-xs text-muted font-medium">{phone}</p>
                  <p className="text-xs text-muted font-medium">{address}, {city}</p>
                  <p className="text-xs text-muted font-medium">{email}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-text uppercase tracking-wider">Payment Method</h3>
                    <p className="text-xs text-muted font-medium">
                      {paymentMethod === "mpesa"
                        ? (mpesaFlow === "stk" ? `M-Pesa STK Prompt (${mpesaPhone})` : `M-Pesa Till (Manual: ${manualMpesaCode || "Unverified"})`)
                        : "Credit / Debit Card"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-text uppercase tracking-wider">VAT &amp; Fees</h3>
                    <p className="text-xs text-muted font-medium">Kenya standard 16% VAT is included in item prices.</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep("payment")} className={btnBack}>Back</button>
                <button type="button" onClick={handlePlaceOrder} disabled={isSubmitting} className={btnNext}>
                  {isSubmitting ? "Completing Purchase..." : "Confirm & Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <CheckoutSummary items={items} subtotal={subtotal} shippingTotal={shippingTotal} total={total} />
      </div>

      {isMpesaProcessing && <MpesaOverlay phone={mpesaPhone} timer={mpesaTimer} onCancel={handleCancelMpesa} />}
      {isRedirectingToPaystack && <PaystackOverlay />}
    </div>
  )
}
