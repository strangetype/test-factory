export function createViewComponent<
    Context extends {},
    Properties extends {
        [key: string]: (element: HTMLElement, ...args: any[]) => void;
    },
>(
    template: string,
    getContext: () => Context = () => ({}) as Context,
    properties: Properties,
    onMount: (element: HTMLElement, context: Context) => void = () => null
) {
    function mount(id: string): {
        [key in keyof Properties]: (...args: any[]) => void;
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

        function effect(key: keyof Properties, ...args: any[]) {
            properties[key](element!, context, ...args);
        }

        function unmount() {
            element!.innerHTML = "";
        }

        const _properties: {
            [key in keyof Properties]: (...args: any[]) => void;
        } = Object.keys(properties).reduce(
            (eff, key) => {
                eff[key as keyof Properties] = (...args: any[]) =>
                    effect(key as keyof Properties, ...args);
                return eff;
            },
            {} as { [key in keyof Properties]: (...args: any[]) => void }
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
