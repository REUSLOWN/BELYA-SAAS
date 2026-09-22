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
                    <li key={lien}>
                      <button
                        onClick={() => allerA('calculateur')}
                        className="lift souligne-anime text-left text-[15px] text-creme/70 hover:text-creme"
                      >
                        {lien}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-creme/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="legende text-creme/60">
            © {new Date().getFullYear()} Belya · Abidjan, Côte d’Ivoire
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {PIED.legal.map((lien) => (
              <li key={lien}>
                <button className="legende lift text-creme/60 hover:text-creme">{lien}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
