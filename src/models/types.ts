export interface IPagination {
  pageNumber: number;
  pageSize: number;
}

export interface ISort<Fields extends string> {
  sortDirection: 'asc' | 'desc';
  sortField: Fields;
}

export interface IListResponse<M extends Record<string, any>> {
  list: M[];
  pagination: IPagination & {
    pageCount: number;
    total: number;
  };
}
