import { Language } from '../types';
import { CONTACT_INFO } from '../constants/contact';
export function PrivacyPage({ lang }: { lang: Language }) {
  const it = lang === 'it';
  const sections = it ? [
    ['Richieste di soggiorno', 'Il preventivo viene calcolato nel browser. I dati inseriti nei moduli non vengono inviati a un server del sito e non vengono salvati in un account. I pulsanti email e WhatsApp aprono il servizio scelto con una bozza: puoi controllarla prima di inviarla.'],
    ['Contatti e dati condivisi', 'Se decidi di inviare una richiesta, comunichi al destinatario i recapiti e le informazioni sul soggiorno che hai incluso. Evita di inserire documenti o informazioni sensibili nelle note. Per domande sull’uso dei dati comunicati, utilizza il contatto riportato qui sotto.'],
    ['Servizi esterni', 'Il sito è pubblicato su GitHub Pages. I caratteri sono caricati da Google Fonts e la pagina contatti include una mappa Google Maps. Questi servizi ricevono dati tecnici della connessione, come l’indirizzo IP, secondo le proprie informative. WhatsApp e il servizio email scelto si aprono solo quando usi i relativi collegamenti.'],
    ['Memorizzazione nel browser', 'Il codice del sito non imposta cookie di profilazione, non integra strumenti di analisi del traffico e non memorizza i dati del preventivo in localStorage. Le scelte del modulo restano temporaneamente nella pagina aperta.'],
    ['Ambito di questa pagina', 'Questa pagina descrive il funzionamento tecnico del sito. Per informazioni sul trattamento dei dati di una richiesta o di un soggiorno e per esercitare i tuoi diritti, contatta direttamente la struttura.']
  ] : [
    ['Stay inquiries', 'Estimates are calculated in your browser. Details entered in the forms are not sent to a website server or saved in an account. Email and WhatsApp buttons open your selected service with a draft for you to review before sending.'],
    ['Contact and shared information', 'If you send an inquiry, you share the contact and stay details included in your message with its recipient. Please avoid adding documents or sensitive information in the notes. For questions about information you have shared, use the contact below.'],
    ['External services', 'This website is hosted on GitHub Pages. Fonts are loaded from Google Fonts, and the contact page includes a Google Maps map. These services receive technical connection data, such as your IP address, under their own privacy notices. WhatsApp and your email service open only when you use their links.'],
    ['Browser storage', 'The website code does not set profiling cookies, include traffic analytics or store quote details in localStorage. Form selections remain temporarily in the open page.'],
    ['Scope of this page', 'This page describes how the website works. For information about the processing of inquiry or stay details and to exercise your rights, contact the property directly.']
  ];
  return <article className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
    <h1 className="font-serif text-4xl sm:text-5xl mb-6">{it ? 'Privacy e utilizzo del sito' : 'Privacy and use of this website'}</h1>
    {sections.map(([title, content]) => <section key={title} className="mt-8"><h2 className="font-serif text-2xl mb-3">{title}</h2><p className="text-stone-600 leading-relaxed">{content}</p></section>)}
    <p className="mt-8">{CONTACT_INFO.hostName} · <a className="underline" href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></p>
    <p className="mt-6 flex flex-wrap gap-5 text-sm underline"><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub Privacy</a><a href="https://policies.google.com/privacy">Google Privacy</a><a href="https://www.whatsapp.com/legal/privacy-policy">WhatsApp Privacy</a></p>
  </article>;
}
