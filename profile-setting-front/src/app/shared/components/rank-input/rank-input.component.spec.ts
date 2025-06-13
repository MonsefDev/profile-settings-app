import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankInputComponent } from './rank-input.component';

describe('RankInputComponent', () => {
  let component: RankInputComponent;
  let fixture: ComponentFixture<RankInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RankInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
