import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  isCompositeFilterDescriptor,
} from '@progress/kendo-data-query';

export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

const isPresent = (value: any): boolean => !isNullOrUndefined(value);

export function flatten(filter: CompositeFilterDescriptor): FilterDescriptor[] {
  if (isPresent(filter.filters)) {
    return filter.filters.reduce(
      (
        acc: FilterDescriptor[],
        curr: FilterDescriptor | CompositeFilterDescriptor,
      ) =>
        acc.concat(isCompositeFilterDescriptor(curr) ? flatten(curr) : [curr]),
      [],
    );
  }
  return [];
}
