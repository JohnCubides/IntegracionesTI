import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetMappingComponent } from './target-mapping.component';

describe('TargetMappingComponent', () => {
  let component: TargetMappingComponent;
  let fixture: ComponentFixture<TargetMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
