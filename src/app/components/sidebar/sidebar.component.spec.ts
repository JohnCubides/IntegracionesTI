import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  const mockActivatedRoute = {
    params: of({}), // si usas route.params
    snapshot: {
      paramMap: {
        get: () => null // si usas route.snapshot.paramMap.get('algo')
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should toggle sidebar open/close', () => {
    expect(component.isSidebarOpen).toBeTrue();
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeFalse();
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeTrue();
  });
});
