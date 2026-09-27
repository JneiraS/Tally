/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import wavesDark from '../assets/layered-waves-dark.svg';
import wavesLight from '../assets/layered-waves-light.svg';
import { LoginBackground } from '../components/LoginBackground';
import { ThemeProvider } from '../hooks/useTheme';

function renderBackground(theme: 'light' | 'nord'): HTMLImageElement | null {
  localStorage.setItem('protab_theme', theme);
  const { container } = render(
    <ThemeProvider>
      <LoginBackground />
    </ThemeProvider>,
  );
  return container.querySelector('img');
}

describe('LoginBackground', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  // The src is compared against the imported asset, not against a filename:
  // Vite inlines the smaller SVG as a data URI and emits the other as a file,
  // so a hardcoded path would describe the bundler, not the behaviour.
  it('suit le thème : asset sombre sous nord, clair sous light', () => {
    expect(renderBackground('light')?.getAttribute('src')).toBe(wavesLight);
    expect(renderBackground('nord')?.getAttribute('src')).toBe(wavesDark);
  });

  it('est décorative : ni texte alternatif ni lecture par un lecteur d’écran', () => {
    const image = renderBackground('light');

    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });
});
