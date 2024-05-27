export const onlyUniqueByField = <T>(
  value: T,
  index: number,
  arr: T[],
  field: keyof T
) => {
  const firstFoundIndex = arr.findIndex(el => el[field] === value[field]);
  return firstFoundIndex === index;
};
