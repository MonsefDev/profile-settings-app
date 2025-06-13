// src/app/shared/components/data-table/data-table.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TableColumn, TableAction } from '../../../core/models/table.model';

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
    MatTableModule
  ]
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() isLoading = false;
  @Input() searchable = true;

  @Output() onCreate = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<string>();

  displayedColumns: string[] = [];
  searchTerm = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateDisplayedColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Déclencher la détection seulement si les données importantes ont changé
    if (changes['columns']) {
      this.updateDisplayedColumns();
    }

    // Marquer pour vérification seulement si nécessaire
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

  onSearchChange(event: any) {
    const newSearchTerm = event.target.value || '';

    // Éviter les émissions inutiles
    if (this.searchTerm !== newSearchTerm) {
      this.searchTerm = newSearchTerm;
      this.onSearch.emit(this.searchTerm);
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

  // Fonctions de tracking optimisées pour OnPush
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

  // Getter pour les données à afficher (optimisé pour OnPush)
  get displayedData(): any[] {
    return this.data || [];
  }
}