import { TestBed, async, inject } from '@angular/core/testing';

import { CreatorGuard } from './creator.guard';

describe('CreatorGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreatorGuard]
    });
  });

  it('should ...', inject([CreatorGuard], (guard: CreatorGuard) => {
    expect(guard).toBeTruthy();
  }));
});
