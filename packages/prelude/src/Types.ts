/** A utility type that returns the values of an object. */
export type ObjectValues<T> = T[keyof T]

export namespace Omit {
  export type Strict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
}
