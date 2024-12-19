const removeItem = <T>(arr: Array<T>, value: T): Array<T> => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUnique = (value: any, index: number, array: any[]): boolean => {
  return array.indexOf(value) === array.lastIndexOf(value);
};

export { removeItem, isUnique };
