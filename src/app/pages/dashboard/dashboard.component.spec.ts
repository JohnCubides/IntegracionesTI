import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { SearchService } from '../../search/search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let searchServiceMock: jasmine.SpyObj<SearchService>;
  let resultsSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    // Crear un BehaviorSubject para controlar las emisiones de results$
    resultsSubject = new BehaviorSubject<any[]>([]);

    // Crear un mock del SearchService con results$ como BehaviorSubject
    searchServiceMock = jasmine.createSpyObj('SearchService', ['searchWorkItems'], {
      results$: resultsSubject.asObservable(),
    });

    // Mock de ActivatedRoute
    const activatedRouteMock = {
      snapshot: {
        paramMap: new Map(),
        queryParamMap: new Map(),
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        DashboardComponent // Importamos el componente standalone
      ],
      providers: [
        { provide: SearchService, useValue: searchServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignorar componentes hijos
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Reiniciar los espías antes de cada prueba
    searchServiceMock.searchWorkItems.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to searchService results and set initial results in ngOnInit', fakeAsync(() => {
    // Configurar los resultados que emitirá el BehaviorSubject
    const mockResults = [
      { id: 1, estado: 'new', title: 'Item 1' },
      { id: 2, estado: 'done', title: 'Item 2' },
    ];

    // Ejecutar ngOnInit para configurar la suscripción
    component.ngOnInit();
    fixture.detectChanges();

    // Emitir los resultados después de la suscripción
    resultsSubject.next(mockResults);
    fixture.detectChanges();

    // Verificar que los resultados se asignaron y currentPage se reinició
    expect(component.results.length).toBe(2);
    expect(component.results).toEqual(mockResults);
    expect(component.currentPage).toBe(1);
  }));

  it('should call searchWorkItems with debounce for search text longer than 2 characters', fakeAsync(() => {
    // Espiar el Subject para depurar emisiones
    spyOn(component['searchTextChanged'], 'next').and.callThrough();

    // Ejecutar ngOnInit para configurar las suscripciones
    component.ngOnInit();

    // Configurar el texto de búsqueda y disparar manualmente
    component.searchText = 'test';
    component.onSearchChange(); // Dispara el Subject
    tick(400); // Avanzar el tiempo para el debounce

    // Verificar que el Subject se llamó una vez
    expect(component['searchTextChanged'].next).toHaveBeenCalledTimes(1);
    expect(component['searchTextChanged'].next).toHaveBeenCalledWith('test');

    // Verificar que searchWorkItems se llamó correctamente
    expect(searchServiceMock.searchWorkItems).toHaveBeenCalledWith('test');
    expect(searchServiceMock.searchWorkItems).toHaveBeenCalledTimes(1);
  }));

  it('should clear results and not call searchWorkItems for search text with 2 or fewer characters', fakeAsync(() => {
    // Ejecutar ngOnInit para configurar las suscripciones
    component.ngOnInit();
    fixture.detectChanges();

    // Configurar el texto de búsqueda
    component.searchText = 'te';
    component.onSearchChange(); // Dispara el Subject
    tick(400); // Avanzar el tiempo para el debounce
    fixture.detectChanges();

    // Verificar que searchWorkItems no se llamó y los resultados se limpiaron
    expect(searchServiceMock.searchWorkItems).not.toHaveBeenCalled();
    expect(component.results).toEqual([]);
  }));

  it('should return correct CSS classes for each estado in getEstadoClass', () => {
    // Probar cada estado definido
    expect(component.getEstadoClass('new')).toBe('bg-blue-100 text-blue-800');
    expect(component.getEstadoClass('bugget')).toBe('bg-pink-100 text-pink-800');
    expect(component.getEstadoClass('estimated')).toBe('bg-orange-100 text-orange-800');
    expect(component.getEstadoClass('priorization')).toBe('bg-purple-100 text-purple-800');
    expect(component.getEstadoClass('in progress')).toBe('bg-yellow-100 text-yellow-800');
    expect(component.getEstadoClass('locked')).toBe('bg-red-100 text-red-800');
    expect(component.getEstadoClass('done')).toBe('bg-green-100 text-green-800');

    // Probar caso por defecto
    expect(component.getEstadoClass('unknown')).toBe('bg-gray-100 text-gray-800');

    // Probar manejo de mayúsculas/minúsculas
    expect(component.getEstadoClass('NEW')).toBe('bg-blue-100 text-blue-800');
    expect(component.getEstadoClass('In Progress')).toBe('bg-yellow-100 text-yellow-800');
  });

  it('should handle pagination correctly', () => {
    // Configurar datos de prueba
    const mockResults = [
      { id: 1, estado: 'new', title: 'Item 1' },
      { id: 2, estado: 'done', title: 'Item 2' },
      { id: 3, estado: 'in progress', title: 'Item 3' },
      { id: 4, estado: 'locked', title: 'Item 4' },
      { id: 5, estado: 'done', title: 'Item 5' },
    ];
    component.results = mockResults;
    component.itemsPerPage = 2;

    // Probar paginatedResults
    component.currentPage = 1;
    expect(component.paginatedResults).toEqual(mockResults.slice(0, 2)); // Items 1-2
    component.currentPage = 2;
    expect(component.paginatedResults).toEqual(mockResults.slice(2, 4)); // Items 3-4
    component.currentPage = 3;
    expect(component.paginatedResults).toEqual(mockResults.slice(4, 5)); // Item 5

    // Probar totalPages
    expect(component.totalPages).toBe(3); // 5 items, 2 por página -> 3 páginas

    // Probar goToNextPage
    component.currentPage = 1;
    component.goToNextPage();
    expect(component.currentPage).toBe(2);
    component.goToNextPage();
    expect(component.currentPage).toBe(3);
    component.goToNextPage();
    expect(component.currentPage).toBe(3); // No pasar del máximo

    // Probar goToPreviousPage
    component.currentPage = 3;
    component.goToPreviousPage();
    expect(component.currentPage).toBe(2);
    component.goToPreviousPage();
    expect(component.currentPage).toBe(1);
    component.goToPreviousPage();
    expect(component.currentPage).toBe(1); // No bajar de 1
  });

  it('should toggle item details in openedItems set', () => {
    // Estado inicial: openedItems vacío
    expect(component.openedItems.size).toBe(0);

    // Añadir un item
    component.toggleItemDetails(1);
    expect(component.openedItems.has(1)).toBeTrue();
    expect(component.openedItems.size).toBe(1);

    // Añadir otro item
    component.toggleItemDetails(2);
    expect(component.openedItems.has(2)).toBeTrue();
    expect(component.openedItems.size).toBe(2);

    // Quitar el primer item
    component.toggleItemDetails(1);
    expect(component.openedItems.has(1)).toBeFalse();
    expect(component.openedItems.has(2)).toBeTrue();
    expect(component.openedItems.size).toBe(1);

    // Quitar el segundo item
    component.toggleItemDetails(2);
    expect(component.openedItems.has(2)).toBeFalse();
    expect(component.openedItems.size).toBe(0);
  });

  it('should unsubscribe from all subscriptions in ngOnDestroy', () => {
    // Espiar el método unsubscribe del Subscription
    const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe').and.callThrough();

    // Ejecutar ngOnInit para configurar las suscripciones
    component.ngOnInit();

    // Llamar a ngOnDestroy
    component.ngOnDestroy();

    // Verificar que unsubscribe se llamó
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination edge cases correctly', () => {
    // Caso 1: Lista vacía
    component.results = [];
    component.itemsPerPage = 2;
    component.currentPage = 1;
    expect(component.paginatedResults).toEqual([]);
    expect(component.totalPages).toBe(0);
    component.goToNextPage();
    expect(component.currentPage).toBe(1); // No cambia
    component.goToPreviousPage();
    expect(component.currentPage).toBe(1); // No cambia

    // Caso 2: Un solo ítem
    component.results = [{ id: 1, estado: 'new', title: 'Item 1' }];
    component.itemsPerPage = 2;
    component.currentPage = 1;
    expect(component.paginatedResults).toEqual(component.results);
    expect(component.totalPages).toBe(1);
    component.goToNextPage();
    expect(component.currentPage).toBe(1); // No cambia
    component.goToPreviousPage();
    expect(component.currentPage).toBe(1); // No cambia

    // Caso 3: Cambiar itemsPerPage
    component.results = [
      { id: 1, estado: 'new', title: 'Item 1' },
      { id: 2, estado: 'done', title: 'Item 2' },
      { id: 3, estado: 'in progress', title: 'Item 3' },
    ];
    component.itemsPerPage = 5; // Más ítems por página que elementos
    component.currentPage = 1;
    expect(component.paginatedResults).toEqual(component.results);
    expect(component.totalPages).toBe(1);
  });
});