import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrgeRelapse } from './urge-relapse';

describe('UrgeRelapse', () => {
  let component: UrgeRelapse;
  let fixture: ComponentFixture<UrgeRelapse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeRelapse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrgeRelapse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
