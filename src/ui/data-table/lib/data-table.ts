import { type Column } from '@tanstack/react-table';

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  /**
   * Whether to show a box shadow on the right side of the last left pinned column or the left side of the first right pinned column.
   * This is useful for creating a border between the pinned columns and the scrollable columns.
   * @default false
   */
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? '-4px 0 4px -4px hsl(var(--border)) inset'
        : isFirstRightPinnedColumn
          ? '4px 0 4px -4px hsl(var(--border)) inset'
          : undefined
      : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    width: column.getSize(),
  };
}

export function getCommonPinningClasses<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  withBorder?: boolean;
}): string {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  let classes = '';
  classes += isPinned ? 'sticky ' : 'relative ';
  classes += isPinned ? 'z-10 ' : 'z-0 ';

  if (withBorder) {
    if (isLastLeftPinnedColumn) {
      classes += 'shadow-[inset_-4px_0_4px_-4px_hsl(var(--border))] ';
    } else if (isFirstRightPinnedColumn) {
      classes += 'shadow-[inset_4px_0_4px_-4px_hsl(var(--border))] ';
    }
  }

  return classes.trim();
}
