/**
 * Вспомогательный тип для удаления первых N элементов из кортежа типов
 * Используется для извлечения типов параметров функций без первых N аргументов
 * 
 * @template T - Кортеж типов (массив типов)
 * @template N - Количество элементов для удаления
 * @template Acc - Аккумулятор для рекурсивного подсчета
 * 
 * @example
 * type Original = [string, number, boolean];
 * type Result = Drop<Original, 2>; // [boolean]
 */
export type Drop<
    T extends any[],
    N extends number,
    Acc extends any[] = [],
> = Acc["length"] extends N
    ? T
    : T extends [any, ...infer R]
      ? Drop<R, N, [...Acc, any]>
      : [];
