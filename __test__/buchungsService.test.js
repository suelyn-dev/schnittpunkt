import { describe, it, expect, jest } from '@jest/globals';

// Mocking um Datenbank nicht zu manipulieren
jest.unstable_mockModule('../src/repositories/buchungsRepository.js', () => ({
  createNewTermin: jest.fn().mockResolvedValue({ terminId: 42 }),
  cancelTerminByToken: jest.fn().mockResolvedValue(true)
}));

const { buchungErstellen, terminStornieren } = await import('../src/services/buchungsService.js');

describe('buchungsService', () => {
  it('erstellt einen Termin mit Storno-Token', async () => {
    const ergebnis = await buchungErstellen({
      vorname: 'Max', nachname: 'Mustermann', telefon: '0170123',
      datum: '2026-05-10', uhrzeit: '14:30 Uhr', mitarbeiterId: 2, leistungId: 5
    });

    expect(ergebnis.terminId).toBe(42);
    expect(ergebnis.stornoToken).toBeDefined();
  });

  it('storniert einen Termin', async () => {
    expect(await terminStornieren('abc-123')).toBe(true);
  });
});
