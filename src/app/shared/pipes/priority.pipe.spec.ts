import { PriorityPipe } from './priority.pipe';

describe('PriorityPipe', () => {
  it('should translate priority values', () => {
    const pipe = new PriorityPipe();
    expect(pipe.transform('low')).toBe('Faible');
    expect(pipe.transform('medium')).toBe('Moyenne');
    expect(pipe.transform('high')).toBe('Haute');
  });

  it('should return original value for unknown', () => {
    const pipe = new PriorityPipe();
    expect(pipe.transform('weird' as any)).toBe('weird');
  });
});
