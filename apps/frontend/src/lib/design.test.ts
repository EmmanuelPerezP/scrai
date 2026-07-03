import {
  AVATAR_TINTS,
  avatarTint,
  capitalize,
  computeAge,
  initials,
  noteSourceMeta,
  noteStatusMeta,
  parseSoap,
} from './design';

describe('initials', () => {
  it('takes the first letter of each name, uppercased', () => {
    expect(initials('Jane', 'Doe')).toBe('JD');
    expect(initials('aiko', 'tanaka')).toBe('AT');
  });
  it('falls back to a dot when names are missing', () => {
    expect(initials()).toBe('·');
    expect(initials('', '')).toBe('·');
  });
});

describe('capitalize', () => {
  it('uppercases the first character', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
  it('leaves empty strings untouched', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('noteStatusMeta / noteSourceMeta', () => {
  it('maps known statuses', () => {
    expect(noteStatusMeta('completed').label).toBe('Complete');
    expect(noteStatusMeta('failed').label).toBe('Failed');
  });
  it('falls back to pending for unknown statuses', () => {
    expect(noteStatusMeta('who-knows').label).toBe('Pending');
  });
  it('maps sources and falls back to text', () => {
    expect(noteSourceMeta('audio').label).toBe('Audio');
    expect(noteSourceMeta('mystery').label).toBe('Text');
  });
});

describe('avatarTint', () => {
  it('is deterministic for a given seed', () => {
    expect(avatarTint('patient-1')).toEqual(avatarTint('patient-1'));
  });
  it('always returns one of the defined tints', () => {
    expect(AVATAR_TINTS).toContainEqual(avatarTint('any-seed'));
  });
});

describe('computeAge', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T12:00:00Z'));
  });
  afterAll(() => jest.useRealTimers());

  it('counts a birthday that has already passed this year', () => {
    expect(computeAge('2000-06-15')).toBe(26);
  });
  it('does not count a birthday still ahead this year', () => {
    expect(computeAge('2000-12-15')).toBe(25);
  });
  it('returns null for an unparseable date', () => {
    expect(computeAge('')).toBeNull();
    expect(computeAge('not-a-date')).toBeNull();
  });
});

describe('parseSoap', () => {
  it('splits S/O/A/P sections and bullet lines', () => {
    const sections = parseSoap(
      'S (Subjective): Patient reports pain. No fever.\nO (Objective): BP 120/80.',
    );
    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ key: 'S', label: 'Subjective' });
    expect(sections[0].lines).toEqual(['Patient reports pain.', 'No fever.']);
    expect(sections[1]).toMatchObject({ key: 'O', label: 'Objective' });
    expect(sections[1].lines).toEqual(['BP 120/80.']);
  });
  it('returns an empty array for empty or non-SOAP text', () => {
    expect(parseSoap('')).toEqual([]);
    expect(parseSoap(null)).toEqual([]);
    expect(parseSoap('just some prose with no section headers')).toEqual([]);
  });
});
