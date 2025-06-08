import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
    let service: SearchService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SearchService]
        });
        service = TestBed.inject(SearchService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('searchWorkItems: debe hacer POST con body y headers correctos, y emitir results$', () => {
        const mockResults = { results: [{ id: 1 }, { id: 2 }] };
        const query = 'miBusqueda';

        // Suscribimos para capturar la emisión de results$
        let emitted: any[] | undefined;
        service.results$.subscribe(r => (emitted = r));

        // Llamamos al método bajo prueba
        service.searchWorkItems(query);

        // Interceptamos la petición
        const req = httpMock.expectOne(
            `${service['baseUrl']}/${service['organization']}/${service['project']}` +
            `/_apis/search/workitemsearchresults?api-version=7.1-preview.1`
        );
        expect(req.request.method).toBe('POST');

        // Verificamos body
        expect(req.request.body).toEqual({
            searchText: query,
            $top: 1000,
            filters: null
        });

        // Verificamos headers de autenticación
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        expect(req.request.headers.get('Authorization')).toContain('Basic ');

        // Simulamos respuesta exitosa
        req.flush(mockResults);

        // Ahora results$ debe haber emitido mockResults.results
        expect(emitted).toEqual(mockResults.results);
    });

    it('searchWorkItems: debe manejar error y llamar console.error', () => {
        const query = 'errorCase';
        spyOn(console, 'error');

        service.searchWorkItems(query);

        const req = httpMock.expectOne(() => true);
        expect(req.request.method).toBe('POST');

        // Simulamos error de red
        const mockError = { status: 500, statusText: 'Server Error' };
        req.flush(null, mockError);

        expect(console.error).toHaveBeenCalledWith('Error en la búsqueda:', jasmine.anything());
    });

    it('getWorkItemDetail: debe hacer GET a la URL correcta con headers', () => {
        const id = 42;
        const mockDetail = { id, fields: { foo: 'bar' } };

        // Llamamos y suscribimos
        service.getWorkItemDetail(id).subscribe(response => {
            expect(response).toEqual(mockDetail);
        });

        // Interceptamos la petición GET
        const expectedUrl =
            `https://dev.azure.com/${service['organization']}/_apis/wit/workitems/` +
            `${id}?fields=` +
            [
                'System.AssignedTo',
                'System.Tags',
                'System.Rev',
                'System.CreatedDate',
                'System.ChangedDate',
                'System.CreatedBy',
                'Custom.EndpointOrigen',
                'Custom.ApiProxy',
                'Custom.217e3276-d5f7-4d7a-9b46-62b228cc70ef',
                'Custom.UESDestino',
                'Custom.ClienteDestino'
            ].join(',') +
            `&api-version=7.1-preview.3`;

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toContain('Basic ');
        req.flush(mockDetail);
    });
});
