import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Navigation,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface LocationContactSectionProps {
  settings: BusinessSettings;
}

export const LocationContactSection: React.FC<LocationContactSectionProps> = ({ settings }) => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const cleanWhatsapp = settings.whatsapp.replace(/\D/g, '');
  const formattedWhatsapp = cleanWhatsapp.startsWith('0') ? `254${cleanWhatsapp.slice(1)}` : cleanWhatsapp;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    // Build WhatsApp message link for direct verified reach
    const text = encodeURIComponent(
      `Hello Joy and Ride Laundry,\nMy Name: ${inquiryName}\nPhone: ${inquiryPhone}\nMessage: ${inquiryMessage || 'I would like to inquire about laundry services.'}`
    );
    window.open(`https://wa.me/${formattedWhatsapp}?text=${text}`, '_blank');
    setInquirySubmitted(true);
  };

  return (
    <section id="contact-location" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            Find & Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visit Joy and Ride Laundry in Eldoret
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conveniently located along Hawai Road, Eldoret. Reach out to our customer care team via Call, WhatsApp, or visit us in person.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Business Location & Info Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-sm">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{settings.businessName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{settings.address}</p>
                </div>
              </div>

              {/* Contact Methods List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <a
                  href={`tel:${settings.phone}`}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition group space-y-1 block"
                >
                  <div className="flex items-center gap-2 text-cyan-700 text-xs font-bold uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-cyan-600" />
                    Direct Call
                  </div>
                  <div className="font-extrabold text-slate-900 text-base">{settings.phone}</div>
                  <span className="text-[11px] text-slate-500 block">Click to call immediately</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('Hello Joy and Ride Laundry, I would like to inquire about laundry services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition group space-y-1 block"
                >
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    WhatsApp Us
                  </div>
                  <div className="font-extrabold text-slate-900 text-base">{settings.whatsapp}</div>
                  <span className="text-[11px] text-slate-500 block">Instant chat & updates</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${settings.email}`}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group space-y-1 block sm:col-span-2"
                >
                  <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Desk
                  </div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base break-all">{settings.email}</div>
                  <span className="text-[11px] text-slate-500 block">For corporate inquiries and receipts</span>
                </a>
              </div>

              {/* Operating Hours */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  Operating & Service Hours
                </div>
                <div className="space-y-1.5 text-xs">
                  {settings.openingHours.map((oh, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600 font-medium">{oh.days}</span>
                      <span className="text-slate-900 font-bold">{oh.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get Directions Button */}
              <a
                href={settings.verifiedMapsUrl || 'https://www.google.com/maps/search/?api=1&query=Hawai+Road+Eldoret+Kenya'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                id="get-directions-btn"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions to Hawai Road, Eldoret</span>
              </a>
            </div>
          </div>

          {/* Quick Inquiry / Direct Chat Form */}
          <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Send className="w-3 h-3" />
                Direct Desk Message
              </div>
              <h3 className="text-2xl font-bold text-white">Send Us a Quick Message</h3>
              <p className="text-xs text-slate-300 mt-1">
                Have a question regarding bulk laundry, delicate garments, or pickup schedules along Hawai Road? Send us a quick note below.
              </p>
            </div>

            {inquirySubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Inquiry Connected!</h4>
                <p className="text-xs text-emerald-200">
                  Your message was sent to our Eldoret team. We will get in touch with you shortly.
                </p>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="text-xs text-cyan-300 font-semibold underline cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Brenda Koech"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Phone Number (M-Pesa / Calls) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Laundry Inquiry / Location Notes
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="e.g. Looking for weekly pickup of office suits & duvets in Elgon View."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry via WhatsApp / Desk</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
