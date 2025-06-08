import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ItemDetailComponent } from './item.detail.component';
import { SearchService } from '../../search/search.service';
import { ApigeeService } from '../../services/apigee.service';

describe('ItemDetailComponent', () => {
  let component: ItemDetailComponent;
  let fixture: ComponentFixture<ItemDetailComponent>;
  let searchServiceMock: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    searchServiceMock = jasmine.createSpyObj('SearchService', ['getWorkItemDetail']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ItemDetailComponent],
      providers: [
        ApigeeService,
        { provide: SearchService, useValue: searchServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 123,
      fields: {
        'System.Id': 123,
        'System.Title': 'Item de prueba',
        'Custom.kvm': 'miKvm:key1,key2'
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('extractUrlFromHtml', () => {
    it('should extract the URL from HTML string', () => {
      const html = '<a href="https://example.com">Link</a>';
      expect(component.extractUrlFromHtml(html)).toBe('https://example.com/');
    });

    it('should return empty string if no anchor found', () => {
      const html = '<div>No link here</div>';
      expect(component.extractUrlFromHtml(html)).toBe('');
    });
  });

  describe('extractLastSegmentFromSwaggerUrl', () => {
    it('should extract last segment after slash', () => {
      const html = '<a href="https://example.com/docs/endpoint">Endpoint</a>';
      expect(component.extractLastSegmentFromSwaggerUrl(html)).toBe('endpoint');
    });

    it('should extract after hash (#) if present', () => {
      const html = '<a href="https://example.com/docs#endpoint">Endpoint</a>';
      expect(component.extractLastSegmentFromSwaggerUrl(html)).toBe('endpoint');
    });
  });

  describe('ngOnInit', () => {
    it('should call searchService.getWorkItemDetail if item has ID', fakeAsync(() => {
      const mockResponse = { id: 123, fields: { 'System.Title': 'mock item' } };
      searchServiceMock.getWorkItemDetail.and.returnValue(of(mockResponse));

      component.item = {
        id: 123,
        fields: { 'System.Id': 123 }
      };
      component.ngOnInit();
      tick();

      expect(searchServiceMock.getWorkItemDetail).toHaveBeenCalledWith(123);
      expect(component.detailedItem).toEqual(mockResponse);
      expect(component.loading).toBeFalse();
    }));

    it('should not call searchService.getWorkItemDetail if item has no ID', () => {
      component.item = { fields: {} };
      component.ngOnInit();

      expect(searchServiceMock.getWorkItemDetail).not.toHaveBeenCalled();
    });

    it('should handle error in getWorkItemDetail', () => {
      spyOn(console, 'error');
      const error = new Error('error');
      searchServiceMock.getWorkItemDetail.and.returnValue(throwError(() => error));

      component.item = {
        id: 123,
        fields: { 'System.Id': 123 }
      };
      component.ngOnInit();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalledWith('Error al obtener detalle del ítem:', error);
    });
  });
});
