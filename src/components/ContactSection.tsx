import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:trullodeimessapi@gmail.com?subject=${encodeURIComponent(
      `Messaggio dal sito web da ${name || 'Ospite'}`
    )}&body=${encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\nTelefono: ${phone}\n\nMessaggio:\n${message}`
    )}`;
    window.location.href = mailto;
    setIsSent(true);
  };

  return (
    <section id="contatti" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <Phone size={14} />
            <span>{t.contact.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-light">
            {lang === 'it'
              ? 'Siamo a vostra completa disposizione per preventivi su misura, dettagli sulle dimore o qualunque richiesta particolare.'
              : 'We are entirely at your disposal for customized quotes, suite details, or any special requests.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Contact Action Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Phone & WhatsApp Card */}
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E7D7C1]/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#B99470] text-white flex items-center justify-center shrink-0 shadow-md">
                <Phone size={22} />
              </div>
              <div className="flex-1">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">
                  {t.contact.phone}
                </span>
                <a
                  href="tel:+393333339347"
                  className="font-serif text-xl font-bold text-gray-900 hover:text-[#B99470] transition-colors block mt-0.5"
                >
                  +39 333 333 9347
                </a>
                <p className="text-xs text-gray-500 mt-1">Antonella • Host Trullo dei Messapi</p>
                <div className="flex gap-2 mt-3">
                  <a
                    href="https://wa.me/393333339347?text=Salve%20Antonella,%20vorrei%20informazioni%20su%20Trullo%20dei%20Messapi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors shadow-sm"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="tel:+393333339347"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-200 text-gray-800 text-xs font-semibold hover:bg-gray-300 transition-colors"
                  >
                    <Phone size={14} />
                    <span>{lang === 'it' ? 'Chiama' : 'Call'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E7D7C1]/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1E2226] text-[#DFD0B8] flex items-center justify-center shrink-0 shadow-md">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">
                  {t.contact.email}
                </span>
                <a
                  href="mailto:trullodeimessapi@gmail.com"
                  className="font-serif text-xl font-bold text-gray-900 hover:text-[#B99470] transition-colors block mt-0.5 break-all"
                >
                  trullodeimessapi@gmail.com
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'it' ? 'Rispondiamo entro poche ore' : 'We reply within a few hours'}
                </p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E7D7C1]/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A5645] text-white flex items-center justify-center shrink-0 shadow-md">
                <MapPin size={22} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">
                  {t.contact.address}
                </span>
                <p className="font-serif text-lg font-bold text-gray-900 mt-0.5">
                  Contrada Pisciacalze, snc
                </p>
                <p className="text-xs text-gray-500">
                  72013 Ceglie Messapica (BR) • Puglia, Italia
                </p>
              </div>
            </div>

            {/* Legal Badges */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-1 font-mono">
              <div>CIN: IT074003C100028899</div>
              <div>CIS: BR07400361000008508</div>
            </div>
          </div>

          {/* Direct Message Form */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-7 sm:p-9 rounded-3xl border border-[#E7D7C1]/60 shadow-lg">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
              {lang === 'it' ? 'Inviaci un Messaggio' : 'Send Us a Message'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {lang === 'it'
                ? 'Compila i campi sottostanti per richiedere informazioni o richiedere disponibilità.'
                : 'Fill in the fields below to ask questions or inquire about dates.'}
            </p>

            {isSent ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-emerald-900">
                  {lang === 'it' ? 'Messaggio Preparato con Successo!' : 'Message Prepared Successfully!'}
                </h4>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  {lang === 'it'
                    ? 'Si è aperto il tuo client email con il messaggio pronto da inviare a trullodeimessapi@gmail.com.'
                    : 'Your email client has opened with your inquiry ready to be sent to trullodeimessapi@gmail.com.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="mt-3 text-xs text-[#B99470] underline font-semibold"
                >
                  {lang === 'it' ? 'Invia un altro messaggio' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {lang === 'it' ? 'Nome e Cognome *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="es. Mario Rossi"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {lang === 'it' ? 'Email *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="es. mario@example.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'it' ? 'Numero di Telefono' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="es. +39 340 1234567"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {lang === 'it' ? 'Messaggio *' : 'Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      lang === 'it'
                        ? 'Scrivi qui le tue domande, periodi di interesse o richieste speciali...'
                        : 'Write your questions, dates of interest or special inquiries here...'
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B99470] hover:bg-[#A37E5A] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send size={16} />
                  <span>{lang === 'it' ? 'Invia Messaggio' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
