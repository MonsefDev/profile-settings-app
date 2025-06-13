export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'array';
}

export interface TableAction {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  action: (item: any) => void;
  visible?: (item: any) => boolean;
}