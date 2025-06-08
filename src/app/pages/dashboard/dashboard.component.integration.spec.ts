/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchService } from '../../search/search.service';

describe('DashboardComponent Integration', () => {
    let fixture: ComponentFixture<DashboardComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
                DashboardComponent
            ],
            providers: [SearchService]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('muestra dos items tras la búsqueda real', fakeAsync(() => {
        fixture.componentInstance.ngOnInit();
        fixture.componentInstance.searchText = 'test';
        fixture.componentInstance.onSearchChange();
        tick(400);

        const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('workitemsearchresults'));
        req.flush({
            results: [
                { fields: { 'system.id': 1, 'system.title': 'Uno', 'system.state': 'new' } },
                { fields: { 'system.id': 2, 'system.title': 'Dos', 'system.state': 'done' } }
            ]
        });
        tick();
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.mb-3');
        expect(items.length).toBe(2);

        expect(items[0].textContent).toContain('Uno');
        expect(items[1].textContent).toContain('Dos');
    }));

    it('muestra los detalles del ítem al hacer clic', fakeAsync(() => {
        fixture.componentInstance.ngOnInit();
        fixture.componentInstance.searchText = 'test';
        fixture.componentInstance.onSearchChange();
        tick(400);

        const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('workitemsearchresults'));
        req.flush({
            results: [
                { fields: { 'system.id': 1, 'system.title': 'Item 1', 'system.state': 'new' } }
            ]
        });
        tick();
        fixture.detectChanges();

        const itemDiv = fixture.nativeElement.querySelector('.mb-3 > div.bg-gray-50');
        itemDiv.click();
        fixture.detectChanges();

        const detailComponent = fixture.nativeElement.querySelector('app-item-detail');
        expect(detailComponent).toBeTruthy();
    }));

    it('debe avanzar y retroceder de página correctamente', fakeAsync(() => {
        // 1) Inicializo y descarto la petición vacía
        fixture.componentInstance.ngOnInit();
        fixture.detectChanges();
        httpMock.match(r => r.method === 'POST' && r.url.includes('workitemsearchresults'))
            .forEach(req => req.flush({ results: [] }));
        tick(); fixture.detectChanges();

        // 2) Preparo 15 ítems y disparo la búsqueda
        const mockResults = Array.from({ length: 15 }, (_, i) => ({
            fields: { 'system.id': i + 1, 'system.title': `Item ${i + 1}`, 'system.state': 'new' }
        }));
        fixture.componentInstance.searchText = 'test';
        fixture.componentInstance.onSearchChange();
        tick(400);

        // 3) Intercepto y respondo la búsqueda “test”
        const all = httpMock.match(r => r.method === 'POST' && r.url.includes('workitemsearchresults'));
        all[all.length - 1].flush({ results: mockResults });
        tick(); fixture.detectChanges();

        // 4) Compruebo primera página (10 ítems)
        let wrappers = fixture.nativeElement.querySelectorAll('.mb-3');
        expect(wrappers.length).toBe(10);

        // 5) Encuentro el botón “Siguiente” usando DebugElement y disparo el click
        const btnDEs = fixture.debugElement.queryAll(By.css('button'));
        const nextBtnDE = btnDEs.find(de => de.nativeElement.textContent.trim() === 'Siguiente');

        // Aseguramos que no sea undefined
        expect(nextBtnDE).toBeTruthy('No se encontró el botón "Siguiente"');

        // Usamos ! para decirle a TS que confíe: sí existe
        nextBtnDE!.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        // 6) Ahora sí deben quedar 5 ítems
        wrappers = fixture.nativeElement.querySelectorAll('.mb-3');
        expect(wrappers.length).toBe(5);
    }));

    it('debe aplicar la clase correcta al estado del ítem', fakeAsync(() => {
        fixture.componentInstance.ngOnInit();
        const mockItem = {
            fields: {
                'system.id': 1,
                'system.title': 'Item',
                'system.state': 'new'
            }
        };

        fixture.componentInstance.searchText = 'new';
        fixture.componentInstance.onSearchChange();
        tick(400);

        const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('workitemsearchresults'));
        req.flush({ results: [mockItem] });
        tick();
        fixture.detectChanges();

        const badge = fixture.nativeElement.querySelector('.inline-block');
        expect(badge.classList.toString()).toContain('bg-blue-100');
    }));

    it('debe mostrar mensaje cuando no hay resultados', fakeAsync(() => {
        fixture.componentInstance.ngOnInit();
        fixture.componentInstance.searchText = 'nada';
        fixture.componentInstance.onSearchChange();
        tick(400);

        const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('workitemsearchresults'));
        req.flush({ results: [] });
        tick();
        fixture.detectChanges();

        const message = fixture.nativeElement.textContent;
        expect(message).toContain('No se encontraron resultados');
    }));
});