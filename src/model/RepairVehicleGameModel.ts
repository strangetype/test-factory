import mitt from "mitt";

/**
 * Модель игры по производству и ремонту техники
 * Реализована как чистая функция, полностью независимая от View-слоя
 *
 * Использует generics для типобезопасного расширения на основе config.json:
 * - Store - типы компонентов и их характеристики (count, price)
 * - VehicleConfiguration - типы техники и требуемые компоненты
 *
 * @template Store - Конфигурация хранилища компонентов
 * @template VehicleConfiguration - Конфигурация типов техники
 *
 * @param store - Начальное состояние хранилища компонентов
 * @param vehicleConfiguration - Конфигурация типов техники и их компонентов
 *
 * @returns API модели с actions (действия) и on (подписка на события)
 *
 * @example
 * const gameModel = RepairVehicleGameModel(
 *   { wheel: { count: 100, price: 2 } },
 *   { Car: { wheel: 4 } }
 * );
 * gameModel.actions.createVehicle('Car');
 * gameModel.on('vehicleCreated', (type) => console.log(type));
 */
export function RepairVehicleGameModel<
    Store extends { [key: string]: { count: number; price: number } },
    VehicleConfiguration extends {
        [key: string]: {
            [key in keyof Store]?: number;
        };
    },
>(store: Store, vehicleConfiguration: VehicleConfiguration) {
    // Типы, выведенные из конфигурации
    type ComponentType = keyof Store;
    type VehicleType = keyof VehicleConfiguration;

    // Структура техники с компонентами
    type Vehicle = {
        type: VehicleType;
        components: {
            damaged: boolean;
            componentType: ComponentType;
        }[];
    };

    // Результат сканирования техники на повреждения
    type ScanResult = {
        damaged: { [key in ComponentType]?: number } | false;
        price: number;
    };

    // События модели для связи с View
    type Events = {
        vehicleCreated: VehicleType | false;
        vehicleScanned: ScanResult;
        vehicleRepaired: boolean;
        storeStateUpdated: Store;
    };

    // Event emitter для pub/sub паттерна
    const emitter = mitt<Events>();

    // Внутреннее состояние модели
    let currentVehicle: Vehicle | null = null;
    let scanResult: ScanResult | null = null;

    // === ДЕЙСТВИЯ (ACTIONS) ===

    /**
     * Создает технику указанного типа
     * Проверяет наличие компонентов, списывает их со склада и генерирует повреждения
     *
     * @param vehicleType - Тип техники для создания
     * @emits vehicleCreated - Событие создания техники (или false при нехватке компонентов)
     * @emits storeStateUpdated - Событие обновления склада после списания компонентов
     */
    function createVehicle(vehicleType: VehicleType) {
        if (!checkCreatePossibility(vehicleType)) {
            emitter.emit("vehicleCreated", false);
            return;
        }

        const vehicleComponents = vehicleConfiguration[vehicleType];

        Object.keys(vehicleComponents).forEach((componentType) => {
            store[componentType].count -= vehicleComponents[componentType]!;
        });

        const isVehicleDamaged = Math.random() > 0.7;

        const components = Object.keys(vehicleComponents).reduce(
            (acc, componentType) => {
                for (let i = 0; i < vehicleComponents[componentType]!; i++) {
                    acc.push({
                        damaged: isVehicleDamaged ? Math.random() > 0.6 : false,
                        componentType,
                    });
                }
                return acc;
            },
            [] as {
                damaged: boolean;
                componentType: ComponentType;
            }[]
        );

        currentVehicle = {
            type: vehicleType,
            components,
        };

        emitter.emit("vehicleCreated", vehicleType);
        emitter.emit("storeStateUpdated", store);
    }

    /**
     * Сканирует текущую технику на наличие повреждений
     * Подсчитывает поврежденные компоненты и стоимость ремонта
     *
     * @emits vehicleScanned - Событие с результатами сканирования
     */
    function scanVehicle() {
        if (!currentVehicle) return;
        const damaged: { [key in ComponentType]?: number } = {};
        let isDamaged = false;
        let price = 0;
        for (const component of currentVehicle.components) {
            if (component.damaged) {
                isDamaged = true;
                ((damaged[component.componentType] =
                    (damaged![component.componentType] || 0) + 1),
                    (price += store[component.componentType].price));
            }
        }
        scanResult = {
            damaged: isDamaged ? damaged : false,
            price,
        };
        emitter.emit("vehicleScanned", {
            damaged: isDamaged ? damaged : false,
            price,
        });
    }

    /**
     * Проверяет возможность создания техники указанного типа
     * Сравнивает требуемые компоненты с наличием на складе
     *
     * @param vehicleType - Тип техники для проверки
     * @returns true если все компоненты доступны в достаточном количестве
     */
    function checkCreatePossibility(vehicleType: VehicleType) {
        const vehicleComponents = vehicleConfiguration[vehicleType];
        return Object.keys(vehicleComponents).every((key: ComponentType) => {
            return store[key].count >= vehicleComponents[key]!;
        });
    }

    /**
     * Проверяет возможность ремонта текущей техники
     * Проверяет наличие на складе компонентов для замены поврежденных
     *
     * @returns true если ремонт возможен
     */
    function checkRepairPossibility() {
        if (!currentVehicle) return false;
        if (!scanResult) return false;
        if (scanResult.damaged === false) return false;
        return Object.keys(scanResult.damaged).some((key: ComponentType) => {
            if (
                (scanResult!.damaged as { [key in ComponentType]: number })[
                    key
                ]! > store[key].count
            )
                return false;
            return true;
        });
    }

    /**
     * Ремонтирует текущую технику
     * Заменяет поврежденные компоненты, списывая их со склада
     *
     * @emits vehicleRepaired - Событие завершения ремонта (true - успех, false - неудача)
     * @emits storeStateUpdated - Событие обновления склада после списания компонентов
     */
    function repairVehicle() {
        if (!currentVehicle) return;
        if (!scanResult) return;
        if (scanResult.damaged === false) return;
        if (!checkRepairPossibility()) {
            emitter.emit("vehicleRepaired", false);
            return;
        }
        currentVehicle.components.forEach((component) => {
            if (component.damaged) {
                store[component.componentType].count--;
                component.damaged = false;
            }
        });
        emitter.emit("vehicleRepaired", true);
        emitter.emit("storeStateUpdated", store);
    }

    return {
        actions: {
            createVehicle,
            scanVehicle,
            repairVehicle,
        },
        on: emitter.on.bind(emitter),
    };
}
