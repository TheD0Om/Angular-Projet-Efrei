import { PriorityPipe } from './priority.pipe';

describe('PriorityPipe', () => {
  it('should translate priority', () => {
    const pipe = new PriorityPipe();
    expect(pipe.transform('low')).toBe('Faible');
    expect(pipe.transform('medium')).toBe('Moyenne');
    expect(pipe.transform('high')).toBe('Haute');
  });
});
