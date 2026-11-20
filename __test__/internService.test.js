import { describe, it, expect, jest } from '@jest/globals';

// Mocking um Datenbank nciht zu manipulieren
jest.unstable_mockModule('../src/repositories/internRepository.js', () => ({
  getTagesansicht: jest.fn(),
  getAlleGebuchtenTermine: jest.fn(),
  storniereTermin: jest.fn(),
  erledigt: jest.fn(),
  noShow: jest.fn(),
  updateLeistung: jest.fn().mockResolvedValue(true),
  insertLeistung: jest.fn().mockResolvedValue(7),
  deleteLeistung: jest.fn().mockResolvedValue(true)
}));

const { aendereLeistung, insertLeistungService, deleteLeistungService } = await import('../src/services/internService.js');

describe('internService', () => {
  it('ändert eine Leistung', async () => {
    expect(await aendereLeistung(1, { LEISTUNG: 'Schnitt' })).toBe(true);
  });

  it('legt eine neue Leistung an', async () => {
    expect(await insertLeistungService({ LEISTUNG: 'Balayage' })).toBe(7);
  });

  it('löscht eine Leistung', async () => {
    expect(await deleteLeistungService(3)).toBe(true);
  });
});
