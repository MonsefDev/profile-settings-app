// src/app/shared/components/data-table/data-table.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TableColumn, TableAction } from '../../../core/models/table.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatTooltipModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule
  ]
})
export class DataTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() isLoading = false;
  @Input() searchable = true;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50];

  @Output() onCreate = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [];
  searchTerm = '';
  dataSource = new MatTableDataSource<any>([]);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateDisplayedColumns();
    this.updateDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      this.updateDisplayedColumns();
    }

    if (changes['data']) {
      this.updateDataSource();
    }

    if (changes['data'] || changes['isLoading'] || changes['columns'] || changes['actions']) {
      this.cdr.markForCheck();
    }
  }

  private updateDisplayedColumns() {
    this.displayedColumns = [
      ...this.columns.map(col => col.key),
      ...(this.actions.length > 0 ? ['actions'] : [])
    ];
  }

  private updateDataSource() {
    // ✅ IMPORTANT: Créer une nouvelle référence ET forcer la détection
    const newData = this.data || [];
    this.dataSource.data = [...newData];

    // Configuration du filtre personnalisé pour la recherche
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      if (!filter) return true;

      const searchTermLower = filter.toLowerCase();
      return this.columns.some(column => {
        const value = data[column.key];
        if (value == null) return false;

        // Gestion spéciale pour les arrays (scopes, etc.)
        if (Array.isArray(value)) {
          return value.some(item =>
            item.toString().toLowerCase().includes(searchTermLower)
          );
        }

        // Gestion pour tous les autres types
        return value.toString().toLowerCase().includes(searchTermLower);
      });
    };

    // Configuration du tri personnalisé
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      const value = data[sortHeaderId];

      // Gestion spéciale pour les dates
      const column = this.columns.find(col => col.key === sortHeaderId);
      if (column?.type === 'date' && value) {
        return new Date(value).getTime();
      }

      // Gestion pour les nombres
      if (column?.type === 'number' && value != null) {
        return Number(value);
      }

      // Gestion pour les booléens
      if (column?.type === 'boolean') {
        return value ? 1 : 0;
      }

      // Gestion pour les arrays (trier par le premier élément)
      if (Array.isArray(value)) {
        return value.length > 0 ? value[0].toString().toLowerCase() : '';
      }

      // Gestion pour les strings
      if (typeof value === 'string') {
        return value.toLowerCase();
      }

      return value || '';
    };

    // Réappliquer le filtre existant après mise à jour des données
    if (this.searchTerm) {
      this.dataSource.filter = this.searchTerm;
    }

    // ✅ FORCER la mise à jour de la table
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    // ✅ FORCER la détection des changements
    this.cdr.detectChanges();
  }

  onSearchChange(event: any) {
    const newSearchTerm = event.target.value || '';

    if (this.searchTerm !== newSearchTerm) {
      this.searchTerm = newSearchTerm;
      this.dataSource.filter = newSearchTerm;
      this.cdr.markForCheck();
    }
  }

  highlightSearchTerm(text: any, searchTerm: string): string {
    if (!text || !searchTerm) return text;
    const textStr = text.toString();
    const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
    return textStr.replace(regex, '<span class="highlight">$1</span>');
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getVisibleActions(row: any): TableAction[] {
    return this.actions.filter(action =>
      !action.visible || action.visible(row)
    );
  }

  trackByColumn = (index: number, column: TableColumn): string => {
    return column.key;
  }

  trackByAction = (index: number, action: TableAction): string => {
    return action.icon + action.label;
  }

  trackByRow = (index: number, item: any): any => {
    return item.id || item.uuid || index;
  }

  trackByArrayItem = (index: number, item: any): any => {
    return typeof item === 'object' ? (item.id || item.name || JSON.stringify(item)) : item;
  }

  get filteredDataCount(): number {
    return this.dataSource.filteredData.length;
  }

  get totalDataCount(): number {
    return this.data.length;
  }
}