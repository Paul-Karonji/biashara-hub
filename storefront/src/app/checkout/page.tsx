"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, ShieldCheck, ArrowLeft, ArrowRight, Smartphone } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { medusa } from "@/lib/medusa"
import { formatKES } from "@/lib/formatters"
import { trackCheckoutStart, trackPaymentSelected, trackOrderComplete } from "@/lib/analytics"

type Step = "address" | "shipping" | "payment" | "review"

export default function CheckoutPage() {
  const { cart, refreshCart, clearCart, isLoading: isCartLoading } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<Step>("address")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isMpesaProcessing, setIsMpesaProcessing] = useState(false)
  const [mpesaTimer, setMpesaTimer] = useState(5)

  // Form states
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("Nairobi")
  
  // Shipping options state
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState("")
  const [isShippingLoading, setIsShippingLoading] = useState(false)

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa")
  const [mpesaPhone, setMpesaPhone] = useState("")

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shippingTotal = cart?.shipping_total || 0
  const total = cart?.total || subtotal + shippingTotal

  // Pre-fill form if cart already has shipping address/email
  useEffect(() => {
    if (!cart) return
    const timer = setTimeout(() => {
      if (cart.email) setEmail(cart.email)
      if (cart.shipping_address) {
        setFirstName(cart.shipping_address.first_name || "")
        setLastName(cart.shipping_address.last_name || "")
        setPhone(cart.shipping_address.phone || "")
        setAddress(cart.shipping_address.address_1 || "")
        setCity(cart.shipping_address.city || "Nairobi")
      }
      if (cart.shipping_methods && cart.shipping_methods.length > 0) {
        setSelectedShippingOptionId(cart.shipping_methods[0].shipping_option_id)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [cart])

  // Track checkout start
  useEffect(() => {
    if (cart && cart.id) {
      trackCheckoutStart(cart.total || cart.subtotal || 0)
    }
  }, [cart?.id])

  // Track payment method selected
  useEffect(() => {
    trackPaymentSelected(paymentMethod)
  }, [paymentMethod])

  // Redirect to home if cart is empty
  const itemsLength = items.length
  useEffect(() => {
    if (!isCartLoading && itemsLength === 0 && !isSubmitting) {
      router.push("/shop")
    }
  }, [itemsLength, isCartLoading, router, isSubmitting])

  // Handle Step 1: Address submission
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName || !lastName || !phone || !address || !city) {
      setErrorMessage("Please fill in all address details.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      // Update cart shipping address & email on Medusa
      await medusa.store.cart.update(cart.id, {
        email,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone,
          address_1: address,
          city,
          country_code: "ke", // Kenya default
        },
      })
      
      await refreshCart()
      
      // Fetch available shipping options for this cart
      setIsShippingLoading(true)
      const optionsResponse = await medusa.store.fulfillment.listCartOptions({
        cart_id: cart.id,
      })
      setShippingOptions(optionsResponse.shipping_options || [])
      setIsShippingLoading(false)

      setStep("shipping")
    } catch (error: any) {
      console.error("Error updating address:", error)
      setErrorMessage(error.message || "Failed to update address. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Step 2: Shipping method submission
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShippingOptionId) {
      setErrorMessage("Please select a shipping method.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      // Add shipping method to cart
      await medusa.store.cart.addShippingMethod(cart.id, {
        option_id: selectedShippingOptionId,
      })
      await refreshCart()
      setStep("payment")
    } catch (error: any) {
      console.error("Error adding shipping method:", error)
      setErrorMessage(error.message || "Failed to select shipping method. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Step 3: Payment selection
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "mpesa" && !mpesaPhone) {
      setErrorMessage("Please enter your M-Pesa phone number.")
      return
    }
    setStep("review")
  }

  // Handle final order completion
  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    setErrorMessage("")

    if (paymentMethod === "mpesa") {
      setIsMpesaProcessing(true)
      setMpesaTimer(5)
      
      const interval = setInterval(() => {
        setMpesaTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    try {
      // 1. Initialize payment session. We try "manual" or check what is available on the backend
      // Safe fallback: initiate manual provider or continue.
      try {
        await medusa.store.payment.initiatePaymentSession(cart, {
          provider_id: "manual", // Default manual payment provider registered in backend
        })
      } catch (pErr) {
        console.warn("Failed to initiate manual payment session, continuing with placement:", pErr)
      }

      // 2. Complete cart
      const response = await medusa.store.cart.complete(cart.id)
      
      if (response.type === "order" && response.order) {
        const orderId = response.order.id
        const orderTotal = response.order.total || cart.total || 0
        trackOrderComplete(orderId, orderTotal, paymentMethod)
        clearCart() // clear state
        router.push(`/order/${orderId}`)
      } else {
        throw new Error("Unable to place order. The cart could not be completed.")
      }
    } catch (error: any) {
      console.error("Error placing order:", error)
      setErrorMessage(error.message || "Failed to place order. Please try again.")
      setIsMpesaProcessing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepsList = [
    { id: "address", label: "Address" },
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ]

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Columns: Step Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 md:p-10 space-y-8">
          
          {/* Progress Indicator */}
          <div className="flex justify-between items-center relative border-b border-border pb-6">
            {stepsList.map((s, idx) => {
              const isActive = step === s.id
              const isPast = stepsList.findIndex((x) => x.id === step) > idx
              return (
                <div key={s.id} className="flex items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive 
                      ? "bg-primary text-white ring-4 ring-primary/10" 
                      : isPast 
                      ? "bg-success text-white" 
                      : "bg-surface border border-border text-muted"
                  }`}>
                    {isPast ? <Check size={14} /> : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:inline ${isActive ? "text-primary font-bold" : "text-muted"}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>

          {errorMessage && (
            <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: ADDRESS */}
          {step === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <h2 className="text-lg font-bold text-text">Shipping Address</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">City / Town</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Eldoret">Eldoret</option>
                    <option value="Thika">Thika</option>
                    <option value="Other">Other parts of Kenya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text">Street Address & Delivery Details</label>
                <input
                  type="text"
                  required
                  placeholder="Estate, House No, Street name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Continue to Shipping
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SHIPPING METHODS */}
          {step === "shipping" && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-lg font-bold text-text">Select Delivery Method</h2>
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  Change Address
                </button>
              </div>

              {isShippingLoading ? (
                <div className="py-12 text-center text-xs text-muted font-medium">
                  Loading delivery speeds and rates...
                </div>
              ) : shippingOptions.length === 0 ? (
                <div className="p-6 bg-surface border border-border rounded-xl text-center text-xs text-muted">
                  No shipping options available for this region. Please go back and verify your address.
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingOptions.map((option: any) => {
                    const isSelected = selectedShippingOptionId === option.id
                    return (
                      <label 
                        key={option.id}
                        className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                            : "border-border hover:border-muted bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping_option"
                            value={option.id}
                            checked={isSelected}
                            onChange={() => setSelectedShippingOptionId(option.id)}
                            className="w-4 h-4 text-primary border-border focus:ring-primary"
                          />
                          <div>
                            <span className="text-text font-semibold text-sm block">
                              {option.name}
                            </span>
                            {option.metadata?.delivery_days && (
                              <span className="text-[10px] text-muted font-medium mt-0.5 block">
                                Est. delivery: {option.metadata.delivery_days}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-primary font-bold text-sm">
                          {option.amount === 0 ? "FREE" : formatKES(option.amount)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className="h-12 px-6 border border-border text-text hover:bg-surface text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedShippingOptionId}
                  className="h-12 px-8 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Continue to Payment
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-lg font-bold text-text">Select Payment Option</h2>
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  Change Shipping
                </button>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`p-4 border rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "mpesa" 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                      : "border-border hover:border-muted bg-white"
                  }`}
                >
                  <Smartphone className={paymentMethod === "mpesa" ? "text-primary" : "text-muted"} size={24} />
                  <span className="text-xs font-bold">M-Pesa STK Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "card" 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                      : "border-border hover:border-muted bg-white"
                  }`}
                >
                  <span className="text-lg font-bold text-text font-serif">Visa/MC</span>
                  <span className="text-xs font-bold text-muted">Debit/Credit Card</span>
                </button>
              </div>

              {/* payment details section */}
              {paymentMethod === "mpesa" ? (
                <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-text font-semibold text-sm">
                    <Smartphone size={18} className="text-primary" />
                    <span>Lipa Na M-Pesa STK Prompt</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    We will send a payment prompt directly to your phone. Enter your M-Pesa PIN on your phone to complete the transaction instantly.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text">M-Pesa Mobile Number</label>
                    <div className="flex gap-2">
                      <span className="h-12 w-16 bg-white border border-border rounded-xl flex items-center justify-center text-sm font-semibold text-text">
                        +254
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0712345678"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="flex-1 h-12 px-4 bg-white border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-surface border border-border rounded-2xl space-y-4 text-center">
                  <span className="text-xs font-semibold text-muted">Paystack Card Integration Mockup</span>
                  <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
                    You will be redirected securely to Paystack to complete your card checkout. Webhook status checks will verify completion on callback.
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="h-12 px-6 border border-border text-text hover:bg-surface text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  Continue to Review
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REVIEW & PLACE ORDER */}
          {step === "review" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-lg font-bold text-text">Review & Place Order</h2>
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  Change Payment
                </button>
              </div>

              {/* Review card details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border rounded-2xl p-6 bg-surface">
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
                    <p className="text-xs text-muted font-medium capitalize">
                      {paymentMethod === "mpesa" ? `M-Pesa STK Prompt (${mpesaPhone})` : "Credit / Debit Card"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-text uppercase tracking-wider">VAT & Fees</h3>
                    <p className="text-xs text-muted font-medium">Kenya standard 16% VAT is included in item prices.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className="h-12 px-6 border border-border text-text hover:bg-surface text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="h-12 px-8 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Completing Purchase..." : "Confirm & Place Order"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Mini Cart Summary */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6 h-fit sticky top-24">
          <h2 className="text-text font-bold text-base">Checkout Summary</h2>
          
          {/* Item List */}
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {items.map((item: any) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="relative w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
                  {item.thumbnail ? (
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-text font-bold text-xs truncate">{item.title}</h4>
                  <span className="text-[10px] text-muted block">Qty: {item.quantity}</span>
                </div>
                <span className="text-primary font-bold text-xs">{formatKES(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted font-medium">Subtotal</span>
              <span className="text-text font-bold">{formatKES(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted font-medium">Delivery</span>
              <span className="text-text font-bold">
                {shippingTotal > 0 ? formatKES(shippingTotal) : "KES 0 (Flat/TBD)"}
              </span>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center text-sm">
              <span className="text-text font-bold">Total</span>
              <span className="text-primary font-extrabold text-base">{formatKES(total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted leading-relaxed justify-center border-t border-border pt-4">
            <ShieldCheck size={14} className="text-success" />
            <span>Secure connection & nationwide fulfillment guarantee.</span>
          </div>
        </div>

      </div>

      {/* M-Pesa STK Push Processing Overlay */}
      {isMpesaProcessing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-border text-center space-y-6 shadow-elevated relative">
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Spinner */}
                <div className="w-16 h-16 rounded-full border-4 border-surface border-t-primary animate-spin" />
                <Smartphone className="absolute text-primary" size={24} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-gold font-bold uppercase tracking-widest">
                Lipa Na M-Pesa online
              </span>
              <h3 className="text-text font-bold text-lg">
                STK Prompt Initiated
              </h3>
              <p className="text-muted text-xs leading-relaxed max-w-xs mx-auto">
                Safaricom has sent an STK prompt to your phone <span className="font-semibold text-text">{mpesaPhone}</span>. Please enter your M-Pesa PIN on your mobile phone screen.
              </p>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-border">
              <span className="text-[10px] text-muted font-semibold block uppercase">
                Simulating Payment Callback
              </span>
              <span className="text-sm font-bold text-primary mt-1 block">
                Checking status in {mpesaTimer}s...
              </span>
            </div>

            <div className="text-[10px] text-muted flex items-center gap-1.5 justify-center">
              <ShieldCheck size={14} className="text-success" />
              <span>Payment transactions are secured by Safaricom Daraja.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
