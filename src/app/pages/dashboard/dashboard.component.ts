import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../app/components/header/header.component';
import { ItemDetailComponent } from '../itemDetails/item.detail.component';
import { SearchService } from '../../search/search.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ItemDetailComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  results: any[] = [];
  searchText: string = '';
  private searchTextChanged = new Subject<string>();
  private subscription: Subscription = new Subscription();

  openedItems: Set<number> = new Set();

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedResults() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.results.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.results.length / this.itemsPerPage);
  }

  changePage(delta: number) {
    const total = this.totalPages;
    this.currentPage = Math.max(1, Math.min(this.currentPage + delta, total));
  }
  
  goToPreviousPage() {
    this.changePage(-1);
  }
  
  goToNextPage() {
    this.changePage(1);
  }  

  toggleItemDetails(itemId: number) {
    this.openedItems.has(itemId)
      ? this.openedItems.delete(itemId)
      : this.openedItems.add(itemId);
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'bugget':
        return 'bg-pink-100 text-pink-800';
      case 'estimated':
        return 'bg-orange-100 text-orange-800';
      case 'priorization':
        return 'bg-purple-100 text-purple-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }  

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.subscription.add(
      this.searchService.results$.subscribe((data: any[]) => {
        this.results = data;
        this.currentPage = 1;
      })
    );

    this.subscription.add(
      this.searchTextChanged.pipe(debounceTime(400)).subscribe((text) => {
        if (text.length > 2) {
          this.searchService.searchWorkItems(text);
        } else {
          this.results = [];
        }
      })
    );
  }

  onSearchChange() {
    this.searchTextChanged.next(this.searchText);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
