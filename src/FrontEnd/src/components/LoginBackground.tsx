import wavesDark from '../assets/layered-waves-dark.svg';
import wavesLight from '../assets/layered-waves-light.svg';
import { useTheme } from '../hooks/useTheme';

/**
 * Fond décoratif plein écran de la page de connexion.
 *
 * Les deux vagues sont dans la palette Nord du projet, aucun voile n'est
 * nécessaire. L'image est purement décorative : elle est masquée aux lecteurs
 * d'écran et ne doit jamais capter le pointeur.
 */
export function LoginBackground() {
  const { isNord } = useTheme();

  return (
    <img
      src={isNord ? wavesDark : wavesLight}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  );
}
