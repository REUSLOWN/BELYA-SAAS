import { PIED, allerA } from '../donnees'

export default function Footer() {
  return (
    <footer className="rounded-t-[4rem] bg-encre px-6 pb-12 pt-20 text-creme sm:px-10 sm:pt-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div>
            <p className="text-[2rem] font-extrabold tracking-tresserre">
              Belya<span className="text-magenta-clair">.</span>
            </p>
            <p className="mt-4 max-w-xs font-drama text-[1.6rem] italic leading-snug text-creme/75">
              {PIED.slogan}
            </p>

            <div className="mt-8 flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="micro text-creme/70">Système opérationnel</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {PIED.colonnes.map((colonne) => (
              <div key={colonne.titre}>
                <p className="micro text-creme/75">{colonne.titre}</p>
                <ul className="mt-5 space-y-3">
                  {colonne.liens.map((lien) => (
                    <li key={lien.libelle}>
                      {lien.ancre ? (
                        <a
                          href={`#${lien.ancre}`}
                          onClick={(e) => {
                            e.preventDefault()
                            allerA(lien.ancre)
                          }}
                          className="lift souligne-anime text-left text-[15px] text-creme/70 hover:text-creme"
                        >
                          {lien.libelle}
                        </a>
                      ) : (
                        <span className="text-[15px] text-creme/55">{lien.libelle}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-creme/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          {/*
            L'année est calculée au build côté serveur et à la visite
            côté client : entre un build de décembre et une visite de
            janvier, les deux diffèrent. React corrige le texte sans
            bruit avec cet attribut, au lieu de signaler une
            désynchronisation d'hydratation.
          */}
          <p className="legende text-creme/60" suppressHydrationWarning>
            © {new Date().getFullYear()} Belya · Abidjan, Côte d’Ivoire
          </p>
          {PIED.legal.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {PIED.legal.map((lien) => (
                <li key={lien.libelle}>
                  <a href={lien.href} className="legende lift text-creme/60 hover:text-creme">
                    {lien.libelle}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
