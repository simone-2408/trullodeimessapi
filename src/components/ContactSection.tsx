import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Navigation,
  Compass,
  ExternalLink,
  Plane,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:trullodeimessapi@gmail.com?subject=${encodeURIComponent(
      `Richiesta da sito web: ${name || 'Ospite'}`
    )}&body=${encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\nTelefono: ${phone}\n\nMessaggio:\n${message}`
    )}`;
    window.location.href = mailto;
    setIsSent(true);
  };

  const destinations = [
    {
      title: t.location.ceglie,
      desc: t.location.ceglieDesc,
      km: '5 km',
      time: '6 min',
    },
    {
      title: t.location.ostuni,
      desc: t.location.ostuniDesc,
      km: '15 km',
      time: '18 min',
    },
    {
      title: t.location.cisternino,
      desc: t.location.cisterninoDesc,
      km: '18 km',
      time: '20 min',
    },
    {
      title: t.location.alberobello,
      desc: t.location.alberobelloDesc,
      km: '35 km',
      time: '35 min',
    },
    {
      title: t.location.beaches,
      desc: t.location.beachesDesc,
      km: '25-40 km',
      time: '25 min',
    },
    {
      title: t.location.airports,
      desc: t.location.airportsDesc,
      km: 'BDS / BRI',
      time: '35-70 min',
    },
  ];

  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Trullo+dei+Messapi+Contrada+Pisciacalze+Ceglie+Messapica';
  const appleMapsUrl =
    'https://maps.apple.com/?q=Trullo+dei+Messapi&address=Contrada+Pisciacalze,+72013+Ceglie+Messapica+BR';

  return (
    <div id="contatti" className="w-full bg-white">
      {/* ==================================================== */}
      {/* 1. EDITORIAL HEADER */}
      {/* ==================================================== */}
      <div className="pt-10 sm:pt-16 pb-10 sm:pb-14 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-bold block mb-2.5">
          {lang === 'it' ? 'CONTATTI & DOVE SIAMO' : 'CONTACT & LOCATION'}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-stone-900 leading-[1.1] tracking-tight">
          {lang === 'it'
            ? 'Parla con noi & Raggiungi la tenuta'
            : 'Get in touch & Find our estate'}
        </h1>
        <p className="mt-3.5 text-base sm:text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          {lang === 'it'
            ? 'Siamo a Ceglie Messapica, nel cuore quieto della Valle d’Itria. Antonella è a vostra completa disposizione per preventivi su misura, dettagli sulle dimore e consigli autentici per vivere il territorio.'
            : 'Located in the quiet countryside of Ceglie Messapica, in the heart of Itria Valley. Antonella is completely at your disposal for customized quotes, suite details, and authentic local tips.'}
        </p>
      </div>

      {/* ==================================================== */}
      {/* 2. CONTACTS & DIRECT INQUIRY (2-COLUMN EDITORIAL) */}
      {/* ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Host & Direct Contact Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Antonella Host Card */}
            <div className="h-full bg-[#FAF7F2] p-8 sm:p-10 rounded-3xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#B99470] text-white flex items-center justify-center shadow-md shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                      Antonella
                    </h3>
                    <span className="text-xs text-[#B99470] uppercase tracking-wider font-semibold block mt-1">
                      {lang === 'it'
                        ? 'Proprietaria & Host Trullo dei Messapi'
                        : 'Owner & Host of Trullo dei Messapi'}
                    </span>
                  </div>
                </div>

                <blockquote className="font-serif italic text-base sm:text-lg text-[#786C5E] border-l-2 border-[#D6C7B2] pl-4 my-6 leading-relaxed">
                  "{lang === 'it'
                    ? 'Amo accogliere i nostri ospiti con discrezione e calore, condividendo i migliori consigli sui ristoranti tipici e le calette più limpide.'
                    : 'I love welcoming our guests with warm care and discretion, sharing insider tips on authentic trattorias and hidden crystal-clear coves.'}"
                </blockquote>

                <div className="pt-6 border-t border-[#EAE3D7] space-y-5 text-sm sm:text-base text-stone-700">
                  {/* Phone & WhatsApp */}
                  <div className="flex items-start gap-3.5">
                    <Phone size={19} className="text-[#B99470] shrink-0 mt-1" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold mb-0.5">
                        {t.contact.phone}
                      </span>
                      <a
                        href="tel:+393333339347"
                        className="font-serif text-lg sm:text-xl font-bold text-stone-900 hover:text-[#B99470] transition-colors"
                      >
                        +39 333 333 9347
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <Mail size={19} className="text-[#B99470] shrink-0 mt-1" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold mb-0.5">
                        {t.contact.email}
                      </span>
                      <a
                        href="mailto:trullodeimessapi@gmail.com"
                        className="font-serif text-base sm:text-lg font-semibold text-stone-900 hover:text-[#B99470] transition-colors break-all"
                      >
                        trullodeimessapi@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3.5">
                    <MapPin size={19} className="text-[#B99470] shrink-0 mt-1" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold mb-0.5">
                        {t.contact.address}
                      </span>
                      <p className="font-light text-stone-700 leading-relaxed">
                        Contrada Pisciacalze, snc<br />
                        72013 Ceglie Messapica (BR) • Puglia, Italia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct buttons */}
              <div className="pt-8 border-t border-[#EAE3D7] flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/393397985473?text=Salve%20Antonella,%20vorrei%20informazioni%20su%20Trullo%20dei%20Messapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="tel:+393333339347"
                  className="flex-1 py-3.5 px-5 rounded-2xl border border-[#D5CCC0] bg-white hover:bg-[#FAF7F2] text-stone-800 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone size={17} />
                  <span>{lang === 'it' ? 'Chiama Antonella' : 'Call Antonella'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF7F2] p-8 sm:p-10 rounded-3xl border border-[#E8E1D5] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mb-1.5">
                {lang === 'it' ? 'Inviaci un Messaggio Diretto' : 'Send Us a Direct Message'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-light mb-6">
                {lang === 'it'
                  ? 'Hai una domanda particolare o desideri una proposta personalizzata? Rispondiamo con piacere.'
                  : 'Have a specific inquiry or looking for a customized proposal? We are pleased to assist.'}
              </p>

            {isSent ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-2.5">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-emerald-900">
                  {lang === 'it'
                    ? 'Messaggio pronto da inviare!'
                    : 'Inquiry ready to be sent!'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto font-light leading-relaxed">
                  {lang === 'it'
                    ? 'Si è aperto il tuo client email con tutti i dettagli compilati per Antonella a trullodeimessapi@gmail.com.'
                    : 'Your email client has opened with your inquiry pre-filled for Antonella at trullodeimessapi@gmail.com.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="mt-3 text-xs text-[#B99470] underline font-semibold cursor-pointer"
                >
                  {lang === 'it' ? 'Invia un altro messaggio' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {lang === 'it' ? 'Nome e Cognome *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="es. Mario Rossi"
                      className="w-full bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {lang === 'it' ? 'Email *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="es. mario@example.com"
                      className="w-full bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {lang === 'it' ? 'Numero di Telefono' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="es. +39 340 1234567"
                    className="w-full bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {lang === 'it' ? 'Messaggio *' : 'Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      lang === 'it'
                        ? 'Scrivi qui le tue richieste, periodi di interesse o necessità particolari...'
                        : 'Write your questions, dates of interest, or specific requirements here...'
                    }
                    className="w-full bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium py-3.5 px-6 rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send size={16} />
                  <span>{lang === 'it' ? 'Invia Messaggio ad Antonella' : 'Send Message to Antonella'}</span>
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Spazio bianco di respiro */}
      <div className="w-full h-14 sm:h-20 bg-white" />

      {/* ==================================================== */}
      {/* 3. DINTORNI & BORGHI DELLA VALLE D'ITRIA */}
      {/* ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-2.5">
            <Compass size={13} />
            <span>{t.location.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 leading-tight">
            {t.location.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 font-light max-w-xl mx-auto leading-relaxed">
            {t.location.subtitle}
          </p>
        </div>

        {/* 6 Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((d, idx) => (
            <div
              key={idx}
              className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8E1D5] hover:border-[#B99470] transition-all flex flex-col justify-between shadow-xs hover:shadow-md group"
            >
              <div>
                <div className="flex justify-between items-start mb-2.5">
                  <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug group-hover:text-[#B99470] transition-colors">
                    {d.title}
                  </h3>
                  <span className="text-[11px] font-semibold bg-white px-2.5 py-1 rounded-full text-[#B99470] border border-[#B99470]/25 shrink-0 shadow-2xs">
                    {d.time}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  {d.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE3D7] flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>Distanza:</span>
                <span className="font-semibold text-stone-800">{d.km}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spazio bianco di respiro */}
      <div className="w-full h-14 sm:h-20 bg-white" />

      {/* ==================================================== */}
      {/* 4. MAPPA & NAVIGAZIONE (FULL-WIDTH LUXURY STRIP) */}
      {/* ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="bg-[#FAF7F2] border border-[#E8E1D5] rounded-3xl sm:rounded-[36px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
          {/* Map Info & Address (5 cols) */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-bold block mb-2">
                {t.location.addressCardTitle}
              </span>
              <h3 className="font-serif text-3xl font-semibold text-stone-900 mb-4">
                Trullo dei Messapi
              </h3>
              <p className="text-stone-600 font-light text-sm sm:text-base leading-relaxed mb-6">
                Contrada Pisciacalze, snc<br />
                72013 Ceglie Messapica (BR)<br />
                Valle d’Itria, Puglia, Italia
              </p>

              <div className="space-y-3 text-xs text-stone-600 border-t border-[#EAE3D7] pt-5 mb-8">
                <p className="flex items-center gap-2">
                  <Navigation size={15} className="text-[#B99470] shrink-0" />
                  <span>Posizione: Contrada Pisciacalze • Ceglie Messapica (BR)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Plane size={15} className="text-[#B99470] shrink-0" />
                  <span>Aeroporto Brindisi (BDS): 35 min • Bari (BRI): 70 min</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={15} className="text-[#B99470] shrink-0" />
                  <span>Check-in: 15:00 - 20:00 • Check-out: entro le 10:30</span>
                </p>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium py-3.5 px-5 rounded-2xl text-center text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <span>Apri Google Maps</span>
                <ExternalLink size={14} />
              </a>

              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-[#D5CCC0] bg-white hover:bg-[#FAF7F2] text-stone-800 font-medium py-3.5 px-5 rounded-2xl text-center text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Apple Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Interactive Google Map Embed (7 cols) */}
          <div className="lg:col-span-7 min-h-[380px] lg:min-h-full bg-stone-200 relative border-t lg:border-t-0 lg:border-l border-[#E8E1D5]">
            <iframe
              title="Mappa Trullo dei Messapi"
              src="https://maps.google.com/maps?q=Trullo+dei+Messapi+Contrada+Pisciacalze+Ceglie+Messapica&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              className="w-full h-full min-h-[380px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
