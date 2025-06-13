import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeFormComponent } from './scope-form.component';

describe('ScopeFormComponent', () => {
  let component: ScopeFormComponent;
  let fixture: ComponentFixture<ScopeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScopeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
