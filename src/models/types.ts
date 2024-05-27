export interface IPagination {
  pageNumber: number;
  pageSize: number;
}

export interface ISort<M> {
  sortDirection: 'asc' | 'desc';
  sortField: keyof M;
}

export interface IListResponse<M> {
  list: M[];
  pagination: IPagination & {
    pageCount: number;
    total: number;
  };
}
