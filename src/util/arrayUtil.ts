export const cleanNumArr = (arr: Array<number>) =>
  Array.from(new Set(arr.filter((a) => a !== null))).sort((a, b) => a - b);

export const arrOverlap = <T>(
  bigArr: Array<T>,
  smallArr: Array<T>
): boolean => {
  if (smallArr.length === 0) return false;
  return smallArr.some((i) => bigArr.includes(i));
};

export const arrAllIncludes = <T>(
  bigArr: Array<T>,
  smallArr: Array<T>
): boolean => {
  return smallArr.every((i) => bigArr.includes(i));
};
