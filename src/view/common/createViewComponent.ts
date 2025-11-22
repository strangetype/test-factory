import { Drop } from "../../types";

/**
 * Фабричная функция для создания переиспользуемых View-компонентов
 * Реализует функциональный подход к созданию UI-компонентов без использования классов
 * 
 * @template Context - Тип контекста компонента (внутреннее состояние)
 * @template Properties - Объект с методами компонента (публичный API)
 * 
 * @param template - HTML-шаблон компонента
 * @param getContext - Функция для инициализации контекста компонента
 * @param properties - Объект с методами, которые будут доступны после монтирования
 * @param onMount - Callback, вызываемый после монтирования компонента в DOM
 * 
 * @returns Объект с методом mount для монтирования компонента
 * 
 * @example
 * const Button = createViewComponent(
 *   '<button id="btn">Click</button>',
 *   () => ({ count: 0 }),
 *   { onClick: (el, ctx, callback) => { ... } },
 *   (el, ctx) => { console.log('mounted'); }
 * );
 */
export function createViewComponent<
    Context extends {},
    Properties extends {
        [key: string]: (
            element: HTMLElement,
            context: Context,
            ...args: any[]
        ) => void;
    },
>(
    template: string,
    getContext: () => Context = () => ({}) as Context,
    properties: Properties,
    onMount: (element: HTMLElement, context: Context) => void = () => null
) {
    /**
     * Монтирует компонент в DOM-элемент с указанным id
     * 
     * @param id - id DOM-элемента, в который будет вмонтирован компонент
     * @returns Объект с методами компонента, методом unmount и ссылкой на элемент
     */
    function mount(id: string): {
        [key in keyof Properties]: (
            ...args: Drop<Parameters<Properties[key]>, 2>
        ) => void;
    } & {
        unmount: () => void;
        element: HTMLElement;
    } {
        const element = document.getElementById(id);
        const context = getContext();
        if (!element) {
            throw new Error(`Element with id ${id} not found`);
        }
        element.innerHTML = template;

        // Вызывает метод свойства с переданными аргументами
        function effect(key: keyof Properties, ...args: any[]) {
            properties[key](element!, context, ...args);
        }

        // Размонтирует компонент, очищая его содержимое
        function unmount() {
            element!.innerHTML = "";
        }

        // Создаем обертки для всех свойств, убирая первые два параметра (element, context)
        // Это позволяет вызывать методы компонента без передачи element и context
        const _properties: {
            [key in keyof Properties]: (
                ...args: Drop<Parameters<Properties[key]>, 2>
            ) => void;
        } = Object.keys(properties).reduce(
            (eff, key) => {
                eff[key as keyof Properties] = (...args: any[]) =>
                    effect(key as keyof Properties, ...args);
                return eff;
            },
            {} as {
                [key in keyof Properties]: (
                    ...args: Drop<Parameters<Properties[key]>, 2>
                ) => void;
            }
        );

        onMount(element!, context);

        return {
            ..._properties,
            unmount,
            element,
        };
    }

    return {
        mount,
    };
}
