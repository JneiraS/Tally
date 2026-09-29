import { describe, it, expect } from 'vitest';
import {
  isValidFeai,
  validateActivityForm,
  validateScopeForm,
} from '../utils/validation';
import { isValidIsoDate, formatDateFr } from '../utils/date';

describe('Validation des invariants métier ProTab', () => {
  describe('Format FEAI (^INC\\d{9}$)', () => {
    it('valide les codes conformes', () => {
      expect(isValidFeai('INC000000001')).toBe(true);
      expect(isValidFeai('INC123456789')).toBe(true);
      expect(isValidFeai('INC999999999')).toBe(true);
    });

    it('rejette les formats non conformes', () => {
      expect(isValidFeai('INC123')).toBe(false); // trop court
      expect(isValidFeai('INC1234567')).toBe(false); // trop court (7 chiffres)
      expect(isValidFeai('INC1234567890')).toBe(false); // trop long (10 chiffres)
      expect(isValidFeai('inc000000001')).toBe(false); // minuscules
      expect(isValidFeai('FEAI000000001')).toBe(false); // mauvais préfixe
      expect(isValidFeai('INC00000000A')).toBe(false); // lettres au lieu de chiffres
    });
  });

  describe('Validation des activités quotidiennes', () => {
    it('valide une activité conforme', () => {
      const result = validateActivityForm(
        {
          day: '2026-09-19',
          errors_reported: 3,
          incidents_created: 2,
          feai: ['INC000000001', 'INC000000002'],
        },
        { isCreation: true, existingDays: [] }
      );

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('rejette les erreurs négatives', () => {
      const result = validateActivityForm({
        day: '2026-09-19',
        errors_reported: -1,
        incidents_created: 0,
        feai: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.errors_reported).toBeDefined();
    });

    it('rejette les incidents supérieurs aux erreurs (invariant incidents <= erreurs)', () => {
      const result = validateActivityForm({
        day: '2026-09-19',
        errors_reported: 2,
        incidents_created: 3,
        feai: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.incidents_created).toContain('ne peut pas dépasser');
    });

    it('rejette les doublons dans la liste FEAI', () => {
      const result = validateActivityForm({
        day: '2026-09-19',
        errors_reported: 5,
        incidents_created: 2,
        feai: ['INC000000001', 'INC000000001'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.feai_items?.[1]).toContain('doublon');
    });

    it('interdit la création si le jour est déjà présent pour ce périmètre', () => {
      const result = validateActivityForm(
        {
          day: '2026-09-19',
          errors_reported: 0,
          incidents_created: 0,
          feai: [],
        },
        { isCreation: true, existingDays: ['2026-09-19', '2026-09-18'] }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.day).toContain('existe déjà');
    });
  });

  describe('Validation des périmètres (Scope)', () => {
    it('valide un périmètre complet avec KB >= 9 caractères', () => {
      const result = validateScopeForm({
        name: 'Scope A',
        knowledge_base_id: 'KB-00000001', // 13 chars
        official_main: 'Main Responsable',
        official_backup: 'Backup Responsable',
        billing_code: 'FACT-2026-PAI',
      });

      expect(result.isValid).toBe(true);
    });

    it('rejette un identifiant de base de connaissances inférieur à 9 caractères', () => {
      const result = validateScopeForm({
        name: 'Scope A',
        knowledge_base_id: 'KB-1234', // 7 chars
        official_main: 'Main',
        official_backup: 'Backup',
        billing_code: 'FACT-2026-PAI',
      });

      expect(result.isValid).toBe(false);
       expect(result.errors.knowledge_base_id).toContain('au moins 9 caractères');
    });

    it('rejette les champs vides', () => {
      const result = validateScopeForm({
        name: '',
        knowledge_base_id: '',
        official_main: '',
        official_backup: '',
        billing_code: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.official_main).toBeDefined();
      expect(result.errors.official_backup).toBeDefined();
      expect(result.errors.billing_code).toBeDefined();
    });

    it('rejette un code de facturation composé uniquement d\'espaces', () => {
      const result = validateScopeForm({
        name: 'Scope A',
        knowledge_base_id: 'KB-00000001',
        official_main: 'Main',
        official_backup: 'Backup',
        billing_code: '   ',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.billing_code).toBeDefined();
    });

    it('accepte un code de facturation libre', () => {
      const result = validateScopeForm({
        name: 'Scope A',
        knowledge_base_id: 'KB-00000001',
        official_main: 'Main',
        official_backup: 'Backup',
        billing_code: 'FACT-2026-PAI',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.billing_code).toBeUndefined();
    });
  });

  describe('Utilitaires de date', () => {
    it('valide le format ISO YYYY-MM-DD', () => {
      expect(isValidIsoDate('2026-09-19')).toBe(true);
      expect(isValidIsoDate('2026-02-29')).toBe(false); // 2026 n'est pas bissextile
      expect(isValidIsoDate('19-09-2026')).toBe(false);
    });

    it('formate la date en français', () => {
      const formatted = formatDateFr('2026-09-19');
      expect(formatted).toContain('19');
      expect(formatted).toContain('2026');
    });
  });
});
