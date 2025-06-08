import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ItemDetailComponent } from './item.detail.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchService } from '../../search/search.service';
import { CommonModule } from '@angular/common';

describe('ItemDetailComponent Integration', () => {
  let fixture: ComponentFixture<ItemDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CommonModule, HttpClientTestingModule, ItemDetailComponent ],
      providers: [ SearchService ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe cargar y mostrar detalles tras el GET real', fakeAsync(() => {
    const id = 42;
    fixture.componentInstance.item = { fields: { 'system.id': id } };
    fixture.detectChanges();
    fixture.componentInstance.ngOnInit();
    tick();
  
    // 1) match recibe HttpRequest
    const reqs = httpMock.match(r =>
      r.method === 'GET' &&
      r.url.includes('/_apis/wit/workitems/')
    );
    expect(reqs.length).toBeGreaterThanOrEqual(1);
  
    // 2) los elementos de reqs son TestRequest 
    const detailReq = reqs.find(r =>
      r.request.url.includes(`/workitems/${id}`)
    )!;
    const otherReqs = reqs.filter(r => r !== detailReq);
  
    // 3) descartar las otras
    otherReqs.forEach(r => r.flush({}));
  
    // 4) responder la de detalle
    detailReq.flush({
      fields: {
        'System.AssignedTo': { displayName: 'Pepita' },
        'System.Tags': 'a;b',
        'Custom.ClienteDestino': 'ACME'
      }
    });
    tick();
    fixture.detectChanges();
  
    // 5) verificar el DOM
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Pepita');
    expect(text).toContain('ACME');
  }));
});
