import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react"

export function TrustBar() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      description: "Pay securely with M-Pesa or Card",
    },
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: "Fast delivery to your doorstep across Kenya",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "Hassle-free return policy",
    },
    {
      icon: Headphones,
      title: "Local Support",
      description: "24/7 dedicated support team",
    },
  ]

  return (
    <section className="w-full bg-surface border-y border-border py-8 my-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-card transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="text-text font-semibold text-sm">{item.title}</h4>
                  <p className="text-muted text-xs mt-1">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
