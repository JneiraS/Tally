/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildExportRows,
  toCsv,
  toJson,
  exportFilename,
  downloadFile,
} from '../utils/export';
import { ScopeMonitoring, DailyActivity } from '../types';

const activity = (
  day: string,
  errors = 0,
  incidents = 0,
  feai: string[] = [],
  handled = false,
  completed = false,
): DailyActivity => ({
  day,
  errors_reported: errors,
  incidents_created: incidents,
  feai,
  handled,
  completed,
});

const scope = (
  name: string,
  kb: string,
  daily_activities: DailyActivity[],
): ScopeMonitoring => ({
  id: `id-${kb}`,
  name,
  knowledge_base_id: kb,
  official_main: 'Alice',
  official_backup: 'Bob',
  billing_code: 'FACT-2026-PAI',
  daily_activities,
});

describe('buildExportRows', () => {
  it('ne conserve que les activités comprises dans la plage de dates', () => {
    const scopes = [
      scope('Périmètre A', 'KB-A-0001', [
        activity('2026-01-10', 1, 0),
        activity('2026-01-20', 2, 1),
        activity('2026-02-05', 3, 0),
      ]),
    ];

    const rows = buildExportRows(scopes, '2026-01-15', '2026-01-31');
    expect(rows).toHaveLength(1);
    expect(rows[0].date).toBe('2026-01-20');
    expect(rows[0].erreurs).toBe(2);
    expect(rows[0].incidents).toBe(1);
  });

  it('mappe les champs métier (FEAI jointes, Oui/Non)', () => {
    const scopes = [
      scope('Périmètre A', 'KB-A-0001', [
        activity('2026-01-20', 2, 1, ['INC000000001', 'INC000000002'], true, false),
      ]),
    ];

    const rows = buildExportRows(scopes, '2026-01-01', '2026-01-31');
    expect(rows[0].perimetre).toBe('Périmètre A');
    expect(rows[0].kb_id).toBe('KB-A-0001');
    expect(rows[0].responsable_principal).toBe('Alice');
    expect(rows[0].responsable_suppleant).toBe('Bob');
    expect(rows[0].references_feai).toBe('INC000000001 | INC000000002');
    expect(rows[0].traite).toBe('Oui');
    expect(rows[0].termine).toBe('Non');
    expect(rows[0].code_facturation).toBe('FACT-2026-PAI');
  });

  it('laisse vide le code de facturation d\'un périmètre qui n\'en porte pas', () => {
    const scopes = [
      {
        ...scope('Périmètre A', 'KB-A-0001', [activity('2026-01-20', 1, 0)]),
        billing_code: null,
      },
    ];

    const rows = buildExportRows(scopes, '2026-01-01', '2026-12-31');
    expect(rows[0].code_facturation).toBe('');
  });

  it('trie les lignes par date croissante puis par périmètre', () => {
    const scopes = [
      scope('Périmètre B', 'KB-B-0001', [activity('2026-03-01', 1, 0)]),
      scope('Périmètre A', 'KB-A-0001', [activity('2026-01-01', 1, 0)]),
      scope('Périmètre C', 'KB-C-0001', [activity('2026-03-01', 1, 0)]),
    ];

    const rows = buildExportRows(scopes, '2026-01-01', '2026-12-31');
    expect(rows.map((r) => r.date)).toEqual([
      '2026-01-01',
      '2026-03-01',
      '2026-03-01',
    ]);
    expect(rows.map((r) => r.perimetre)).toEqual([
      'Périmètre A',
      'Périmètre B',
      'Périmètre C',
    ]);
  });

  it('retourne un tableau vide quand aucune activité ne correspond', () => {
    const scopes = [scope('Périmètre A', 'KB-A-0001', [])];
    expect(buildExportRows(scopes, '2026-01-01', '2026-12-31')).toEqual([]);
  });
});

describe('toCsv', () => {
  const rows = buildExportRows(
    [
      scope('Périmètre A', 'KB-A-0001', [
        activity('2026-01-20', 2, 1, ['INC000000001'], true, true),
      ]),
    ],
    '2026-01-01',
    '2026-12-31',
  );

  it('précède le contenu d\'un BOM UTF-8 et d\'un en-tête', () => {
    const csv = toCsv(rows, ';');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const [header] = csv.slice(1).split('\n');
    expect(header.split(';')).toEqual([
      'Périmètre',
      'KB',
      'Responsable principal',
      'Responsable suppléant',
      'Date',
      'Erreurs',
      'Incidents',
      'Références FEAI',
      'Traité',
      'Terminé',
      'Code de facturation',
    ]);
  });

  it('honore le séparateur choisi', () => {
    const csv = toCsv(rows, ',');
    const [header] = csv.slice(1).split('\n');
    expect(header.split(',')).toHaveLength(11);
    expect(header.split(';')).toHaveLength(1);
  });

  it('échappe les champs contenant séparateur, guillemets ou saut de ligne', () => {
    const tricky = buildExportRows(
      [scope('Nom; "A"\nB', 'KB-TRICKY-01', [activity('2026-01-20', 1, 0)])],
      '2026-01-01',
      '2026-12-31',
    );
    const csv = toCsv(tricky, ';');
    const body = csv.slice(1).split('\n').slice(1).join('\n');
    expect(body).toContain('"Nom; ""A""\nB"');
  });
});

describe('toJson', () => {
  it('sérialise les lignes en JSON lisible et lisible par JSON.parse', () => {
    const rows = buildExportRows(
      [scope('Périmètre A', 'KB-A-0001', [activity('2026-01-20', 2, 1)])],
      '2026-01-01',
      '2026-12-31',
    );
    const json = toJson(rows);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].erreurs).toBe(2);
    expect(json).toContain('\n');
  });
});

describe('exportFilename', () => {
  it('construit un nom de fichier à partir de la plage et du format', () => {
    expect(exportFilename('2026-01-01', '2026-01-31', 'csv')).toBe(
      'supervision_2026-01-01_2026-01-31.csv',
    );
    expect(exportFilename('2026-01-01', '2026-01-31', 'json')).toBe(
      'supervision_2026-01-01_2026-01-31.json',
    );
  });
});

describe('downloadFile', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURL = vi.fn().mockReturnValue('blob:protab-export');
    revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clickSpy.mockRestore();
  });

  it('crée un blob, clique sur le lien puis révoque l\'URL', () => {
    downloadFile('contenu', 'export.csv', 'text/csv;charset=utf-8;');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:protab-export');
    expect(document.querySelector('a[download="export.csv"]')).toBeNull();
  });
});