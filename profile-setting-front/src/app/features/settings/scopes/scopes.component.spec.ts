import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopesComponent } from './scopes.component';

describe('ScopesComponent', () => {
  let component: ScopesComponent;
  let fixture: ComponentFixture<ScopesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScopesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
