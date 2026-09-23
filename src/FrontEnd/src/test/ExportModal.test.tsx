/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportModal } from '../components/ExportModal';
import { ToastProvider } from '../hooks/useToast';
import { ScopeMonitoring } from '../types';
import { addDaysIso, getTodayIsoDate } from '../utils/date';
import * as exportUtils from '../utils/export';

vi.mock('../utils/export', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/export')>();
  return {
    ...actual,
    downloadFile: vi.fn(),
  };
});

const scope = (name: string, kb: string): ScopeMonitoring => ({
  id: `id-${kb}`,
  name,
  knowledge_base_id: kb,
  official_main: 'Alice',
  official_backup: 'Bob',
  daily_activities: [
    {
      day: '2026-09-15',
      errors_reported: 2,
      incidents_created: 1,
      feai: ['INC000000001'],
      handled: false,
      completed: false,
    },
  ],
});

const today = getTodayIsoDate();
const defaultFrom = addDaysIso(today, -29);

const renderModal = (overrides: Partial<Parameters<typeof ExportModal>[0]> = {}) => {
  return render(
    <ToastProvider>
      <ExportModal
        isOpen
        onClose={() => {}}
        scopes={[scope('Périmètre Alpha', 'KB-ALPHA-0001')]}
        filteredScopes={[]}
        filteredCount={0}
        {...overrides}
      />
    </ToastProvider>
  );
};

describe('ExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la période par défaut (30 jours) et le format CSV', () => {
    renderModal();

    expect(screen.getByRole('heading', { name: /Exporter les données/i })).toBeInTheDocument();
    const duInput = screen.getByLabelText('Du') as HTMLInputElement;
    const auInput = screen.getByLabelText('Au') as HTMLInputElement;
    expect(duInput.value).toBe(defaultFrom);
    expect(auInput.value).toBe(today);
    expect(screen.getByText(new RegExp(`supervision_${defaultFrom}_${today}\\.csv`))).toBeInTheDocument();
  });

  it('désactive l\'export quand la plage est invalide (Du > Au)', () => {
    const { rerender } = renderModal();

    fireEvent.change(screen.getByLabelText('Au'), {
      target: { value: addDaysIso(defaultFrom, -1) },
    });
    rerender(
      <ToastProvider>
        <ExportModal
          isOpen
          onClose={() => {}}
          scopes={[scope('Périmètre Alpha', 'KB-ALPHA-0001')]}
          filteredScopes={[]}
          filteredCount={0}
        />
      </ToastProvider>
    );

    expect(screen.getByRole('button', { name: /Exporter/ })).toBeDisabled();
    expect(
      screen.getByText(/La date « Du » doit être antérieure ou égale à « Au »/)
    ).toBeInTheDocument();
  });

  it('télécharge un CSV séparé par point-virgule avec BOM', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /Exporter/ }));

    await waitFor(() => {
      expect(exportUtils.downloadFile).toHaveBeenCalledTimes(1);
    });
    const [content, filename, mimeType] = vi.mocked(exportUtils.downloadFile).mock.calls[0];
    expect(filename).toBe(`supervision_${defaultFrom}_${today}.csv`);
    expect(mimeType).toBe('text/csv;charset=utf-8;');
    expect(content.charCodeAt(0)).toBe(0xfeff);
    const [, header] = content.slice(1).split('\n');
    expect(header.split(';')).toHaveLength(10);
  });

  it('permet de choisir le séparateur virgule', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /, \(standard\)/ }));
    fireEvent.click(screen.getByRole('button', { name: /Exporter/ }));

    await waitFor(() => {
      expect(exportUtils.downloadFile).toHaveBeenCalledTimes(1);
    });
    const [content] = vi.mocked(exportUtils.downloadFile).mock.calls[0];
    const [, header] = content.slice(1).split('\n');
    expect(header.split(',')).toHaveLength(10);
    expect(header.split(';')).toHaveLength(1);
  });

  it('exporte en JSON si le format est changé', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /^json$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Exporter/ }));

    await waitFor(() => {
      expect(exportUtils.downloadFile).toHaveBeenCalledTimes(1);
    });
    const [content, filename, mimeType] = vi.mocked(exportUtils.downloadFile).mock.calls[0];
    expect(filename).toBe(`supervision_${defaultFrom}_${today}.json`);
    expect(mimeType).toBe('application/json;charset=utf-8;');
    const parsed = JSON.parse(content);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].perimetre).toBe('Périmètre Alpha');
  });

  it('désactive la portée « Filtrés » quand aucun périmètre filtré', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Filtrés \(0\)/ })).toBeDisabled();
  });
});