// Define the common filterObjects function
type SortOrder = 'asc' | 'desc';

/**
 * Helper function to filter, sort, and paginate a list of objects.
 * @param items - List of items to be processed.
 * @param expressions - List of filter expressions to apply to each item.
 * @param sort - Sorting parameter in the format 'column.order' (e.g., 'name.asc').
 * @param page - Current page number for pagination.
 * @param perPage - Number of items per page.
 * @param operator - Filter operator: 'and' or 'or' to combine the expressions.
 */
export function filterObjects<T>(
  items: T[],
  expressions: ((item: T) => boolean)[],
  sort: string | undefined,
  page: number,
  perPage: number,
  operator: 'and' | 'or' | undefined,
): [T[], number, number] {
  // Pagination: calculate offset based on page and per_page
  const offset = (page - 1) * perPage;

  // Sorting: Parse the sort parameter
  const [column, order] = (sort?.split('.').filter(Boolean) ?? [
    'name',
    'asc',
  ]) as [keyof T | undefined, SortOrder | undefined];

  // Apply the filters based on the operator (AND/OR)
  const filteredItems = items.filter((item) => {
    return operator === 'or'
      ? expressions.some((expr) => expr(item))
      : expressions.every((expr) => expr(item));
  });

  // Sorting
  const sortedItems = column
    ? filteredItems.sort((a, b) => {
        const orderMultiplier = order === 'desc' ? 1 : -1;
        if (typeof a[column] === 'string' && typeof b[column] === 'string') {
          return (
            (a[column] as unknown as string).localeCompare(
              b[column] as unknown as string,
            ) * orderMultiplier
          );
        }
        return 0;
      })
    : filteredItems;

  // Pagination: Limit and Offset
  const paginatedItems = sortedItems.slice(offset, offset + perPage);

  // Calculate the total number of pages
  const filteredTotalCount = filteredItems.length;
  const pageCount = Math.ceil(filteredTotalCount / perPage);
  const unfilteredTotalCount = sortedItems.length;

  return [paginatedItems, pageCount, unfilteredTotalCount];
}
