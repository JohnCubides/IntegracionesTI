import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../search/search.service';
import { MatTabsModule } from '@angular/material/tabs';
import { ResourcesDetailsComponent } from '../resourcesDetails/resourcesDetails.component';
import { TargetMappingComponent } from '../target-mapping/target-mapping.component';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, ResourcesDetailsComponent, TargetMappingComponent, MatTabsModule],
  templateUrl: './item.detail.component.html',
})
export class ItemDetailComponent implements OnInit {
  @Input() item: any;
  detailedItem: any;
  loading = true;

  constructor(private searchService: SearchService) { }

  extractUrlFromHtml(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const anchor = doc.querySelector('a');
      return anchor?.href || '';
    } catch {
      return '';
    }
  }

  extractLastSegmentFromSwaggerUrl(html: string): string {
    try {
      const url = this.extractUrlFromHtml(html);
      const lastPart = url.split('/').pop() || '';
      return lastPart.includes('#') ? lastPart.split('#')[1] : lastPart;
    } catch {
      return '';
    }
  }

  ngOnInit(): void {
    if (!this.item || !this.item.fields?.['system.id']) {
      this.loading = false;
      return;
    }

    const id = this.item.fields?.['system.id'];
    if (id) {
      this.searchService.getWorkItemDetail(id).subscribe({
        next: (response) => {
          this.detailedItem = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener detalle del ítem:', error);
          this.loading = false;
        },
      });
    }
  }
}
