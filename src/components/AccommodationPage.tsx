import { Accommodation, Language } from '../types';
import { AppRoute } from '../utils/routes';
import { AccommodationCard } from './AccommodationCard';
import { SiteLink } from './SiteLink';
export function AccommodationPage({ accommodation, lang, onOpenDetails, onSelectForQuote, onNavigate }: {
  accommodation: Accommodation; lang: Language; onOpenDetails: (item: Accommodation) => void;
  onSelectForQuote: (id: Accommodation['id']) => void; onNavigate: (route: AppRoute) => void;
}) {
  return <article>
    <header className="max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center">
      <SiteLink route="suites" lang={lang} onNavigate={onNavigate} className="text-sm underline underline-offset-4 text-[#87613F]">{lang === 'it' ? 'Le tre dimore' : 'Our three residences'}</SiteLink>
      <h1 className="font-serif text-4xl sm:text-6xl mt-4 mb-5">{accommodation.name}</h1>
      <p className="text-stone-600 leading-relaxed">{lang === 'it'
        ? `${accommodation.sqm} m², ${accommodation.bedroomsCount} ${accommodation.bedroomsCount === 1 ? 'camera' : 'camere'} e fino a ${accommodation.capacityMax} ospiti. Cucina autonoma, spazio esterno e accesso alla piscina condivisa con le altre dimore.`
        : `${accommodation.sqm} m², ${accommodation.bedroomsCount} ${accommodation.bedroomsCount === 1 ? 'bedroom' : 'bedrooms'} and up to ${accommodation.capacityMax} guests. Your own kitchen, outdoor space and access to the pool shared with the other residences.`}</p>
    </header>
    <AccommodationCard accommodation={accommodation} lang={lang} onOpenDetails={onOpenDetails} onSelectForQuote={onSelectForQuote} />
    <nav aria-label={lang === 'it' ? 'Continua a esplorare' : 'Explore further'} className="max-w-4xl mx-auto px-6 py-12 flex flex-wrap justify-center gap-6 text-[#87613F] underline underline-offset-4">
      {(['quercia','corbezzolo','melograno'] as const).filter(id => id !== accommodation.id).map(id => <SiteLink key={id} route={id} lang={lang} onNavigate={onNavigate}>{id.charAt(0).toUpperCase() + id.slice(1)}</SiteLink>)}
      <SiteLink route="piscina" lang={lang} onNavigate={onNavigate}>{lang === 'it' ? 'La piscina' : 'The pool'}</SiteLink>
      <SiteLink route="contatti" lang={lang} onNavigate={onNavigate}>{lang === 'it' ? 'Posizione e contatti' : 'Location and contact'}</SiteLink>
    </nav>
  </article>;
}
