import { DataTableFilterExpression, DataTableFilterResult } from '../types';

type SortOrder = 'asc' | 'desc';

function itemMatchesExpressions<T>(
  item: T,
  expressions: DataTableFilterExpression<T>[],
  operator: 'and' | 'or' | undefined,
) {
  if (expressions.length === 0) {
    return true;
  }

  return operator === 'or'
    ? expressions.some((filterExpression) => filterExpression.expression(item))
    : expressions.every((filterExpression) => filterExpression.expression(item));
}

/**
 * Helper function to filter, sort, and paginate a list of objects.
 * @param items - List of items to be processed.
 * @param expressions - List of keyed filter expressions to apply to each item.
 * @param sort - Sorting parameter in the format 'column.order'.
 * @param page - Current page number for pagination.
 * @param perPage - Number of items per page.
 * @param operator - Filter operator: 'and' or 'or' to combine the expressions.
 */
export function filterObjects<T>(
  items: T[],
  expressions: DataTableFilterExpression<T>[],
  sort: string | undefined,
  page: number,
  perPage: number,
  operator: 'and' | 'or' | undefined,
): DataTableFilterResult<T> {
  // Pagination: calculate offset based on page and per_page
  const offset = (page - 1) * perPage;

  // Sorting: Parse the sort parameter
  const [column, order] = (sort?.split('.').filter(Boolean) ?? [
    'name',
    'asc',
  ]) as [keyof T | undefined, SortOrder | undefined];

  // Apply the filters based on the operator.
  const filteredItems = items.filter((item) =>
    itemMatchesExpressions(item, expressions, operator),
  );

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
  const filteredItemsByExcludedFilterKey = expressions.reduce<
    Record<string, T[]>
  >((filteredItemsByKey, filterExpression) => {
    const otherExpressions = expressions.filter(
      (expression) => expression.filterKey !== filterExpression.filterKey,
    );

    filteredItemsByKey[filterExpression.filterKey] = items.filter((item) =>
      itemMatchesExpressions(item, otherExpressions, operator),
    );

    return filteredItemsByKey;
  }, {});

  return new DataTableFilterResult(
    paginatedItems,
    pageCount,
    unfilteredTotalCount,
    sortedItems,
    filteredItemsByExcludedFilterKey,
  );
}
