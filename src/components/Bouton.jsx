/*
 * Bouton magnétique : scale(1.03) au survol, et une couche de fond
 * qui remonte depuis le bas plutôt qu'un simple changement de couleur.
 * Le magenta ne sert que de fond, jamais de couleur de texte sur crème.
 */
export default function Bouton({
  children,
  onClick,
  variante = 'accent',
  taille = 'normal',
  className = '',
  type = 'button',
  desactive = false,
}) {
  const palettes = {
    accent: {
      base: 'bg-magenta text-creme',
      voile: 'bg-encre',
      survol: 'group-hover:text-creme',
    },
    clair: {
      base: 'bg-creme text-encre',
      voile: 'bg-magenta',
      survol: 'group-hover:text-creme',
    },
    contour: {
      base: 'bg-transparent text-creme border border-creme/40',
      voile: 'bg-creme',
      survol: 'group-hover:text-encre',
    },
    contourSombre: {
      base: 'bg-transparent text-encre border border-encre/25',
      voile: 'bg-encre',
      survol: 'group-hover:text-creme',
    },
  }

  // Plancher à 13 px, comme le reste de la page.
  const tailles = {
    petit: 'px-5 py-2.5 text-[13px]',
    normal: 'px-7 py-3.5 text-[15px]',
    grand: 'px-9 py-4 text-[16px]',
  }

  const palette = palettes[variante] ?? palettes.accent

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={desactive}
      aria-disabled={desactive || undefined}
      className={`glisse group relative isolate overflow-hidden rounded-full text-center font-semibold tracking-serre ${
        desactive ? 'cursor-not-allowed opacity-40' : 'magnetique'
      } ${palette.base} ${tailles[taille]} ${className}`}
    >
      <span className={`voile absolute inset-0 -z-10 ${palette.voile}`} aria-hidden="true" />
      <span className={`relative transition-colors duration-500 ${palette.survol}`}>{children}</span>
    </button>
  )
}
