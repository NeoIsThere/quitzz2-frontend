import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Challenge } from './challenge';

describe('Challenge', () => {
  let component: Challenge;
  let fixture: ComponentFixture<Challenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Challenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Challenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
