import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    shop: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Best Sellers", href: "/best-sellers" },
      { label: "Special Offers", href: "/offers" },
    ],
    categories: [
      { label: "Electronics", href: "/c/electronics" },
      { label: "Fashion", href: "/c/fashion" },
      { label: "Home & Living", href: "/c/home-living" },
      { label: "Beauty & Health", href: "/c/beauty-health" },
    ],
    support: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
      { label: "M-Pesa Help", href: "/mpesa-help" },
      { label: "Store Locator", href: "/stores" },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Returns Policy", href: "/returns" },
    ],
  }

  return (
    <footer className="bg-navy text-white mt-auto pt-16 pb-8 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Top section: Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand details */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo.png"
              alt="Biashara Hub Logo"
              width={160}
              height={40}
              className="brightness-0 invert"
              style={{ height: "40px", width: "auto" }}
            />
            <p className="text-white/60 text-xs mt-4 leading-relaxed">
              Quality Products. Trusted by Kenyans. The premier ecommerce platform tailored for local payment and delivery standards.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-light hover:text-navy transition-all duration-200 text-white/80">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-light hover:text-navy transition-all duration-200 text-white/80">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-light hover:text-navy transition-all duration-200 text-white/80">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {links.shop.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-white/70 hover:text-gold-light text-xs transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {links.categories.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-white/70 hover:text-gold-light text-xs transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5">
              {links.support.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-white/70 hover:text-gold-light text-xs transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex gap-2.5 text-white/70 text-xs">
                <MapPin size={16} className="text-gold-light flex-shrink-0" />
                <span>Mombasa Road, Nairobi, Kenya</span>
              </li>
              <li className="flex gap-2.5 text-white/70 text-xs">
                <Phone size={16} className="text-gold-light flex-shrink-0" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex gap-2.5 text-white/70 text-xs">
                <Mail size={16} className="text-gold-light flex-shrink-0" />
                <span>support@biasharahub.co.ke</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section: Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-white/50 text-[11px]">
            &copy; {currentYear} Biashara Hub. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {links.legal.map((link, i) => (
              <li key={i}>
                <a href={link.href} className="text-white/50 hover:text-gold-light text-[11px] transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
