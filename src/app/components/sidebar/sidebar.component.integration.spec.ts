import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('SidebarComponent Integration', () => {
    let fixture: ComponentFixture<SidebarComponent>;
    let router: Router;
    let location: Location;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SidebarComponent,
                RouterTestingModule.withRoutes([
                    { path: 'dashboard', component: SidebarComponent }
                ])
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        location = TestBed.inject(Location);

        fixture = TestBed.createComponent(SidebarComponent);
        router.initialNavigation();
        fixture.detectChanges();
    });

    it('debe ocultar y mostrar la sidebar al hacer toggle', () => {
        const btnDE = fixture.debugElement.query(By.css('button'));
        expect(fixture.componentInstance.isSidebarOpen).toBeTrue();

        btnDE.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(fixture.componentInstance.isSidebarOpen).toBeFalse();

        btnDE.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(fixture.componentInstance.isSidebarOpen).toBeTrue();
    });

    it('debe navegar al hacer click en "Busqueda General"', fakeAsync(() => {
        fixture.componentInstance.isSidebarOpen = true;
        fixture.detectChanges();

        const linkDEs = fixture.debugElement.queryAll(By.css('a'));
        const buscGeneralDE = linkDEs.find(de =>
            de.nativeElement.textContent.trim().includes('Busqueda General')
        )!;
        expect(buscGeneralDE).toBeTruthy('No encontró el enlace de Búsqueda General');

        buscGeneralDE.triggerEventHandler('click', { button: 0 });
        tick();
        fixture.detectChanges();

        expect(location.path()).toBe('/dashboard');
    }));
});
