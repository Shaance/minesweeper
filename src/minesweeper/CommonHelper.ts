export function isNumber(str: string): boolean {
  return !Number.isNaN(Number(str));
}

export type Predicate<T> = (t: T) => boolean;

export type BiConsumer<T, U> = (t: T, u: U) => void;
