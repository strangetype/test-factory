import config from "./config.json";

/**
 * Сервис для работы с конфигурацией игры
 * Предоставляет методы для валидации и получения конфигурации из config.json
 */
export const ConfigService = {
    /**
     * Проверяет корректность конфигурации
     * Валидирует, что все компоненты, необходимые для техники, присутствуют в хранилище
     *
     * @returns true если конфигурация корректна
     * @throws Error если конфигурация содержит ошибки
     */
    checkConfig() {
        const storeConfiguration = config.storeConfiguration;
        const vehicleConfiguration = config.vehicleConfiguration;

        try {
            // Получаем список всех доступных компонентов из хранилища
            const availableComponents = Object.keys(storeConfiguration);

            // Проверяем каждый тип техники
            for (const vehicleType in vehicleConfiguration) {
                const requiredComponents = Object.keys(
                    vehicleConfiguration[
                        vehicleType as keyof typeof vehicleConfiguration
                    ]
                );

                // Проверяем, что все необходимые компоненты есть в хранилище
                for (const component of requiredComponents) {
                    if (!availableComponents.includes(component)) {
                        throw new Error(
                            `Компонент "${component}" требуется для "${vehicleType}", но отсутствует в хранилище`
                        );
                    }
                }
            }

            return true;
        } catch (error) {
            console.error("Ошибка конфигурации:", error);
            throw error;
        }
    },

    /**
     * Возвращает начальное количество компонентов для склада
     * Извлекает только поле count из конфигурации хранилища
     *
     * @returns Объект с названиями компонентов и их начальным количеством
     */
    getStoreInitialCountConfiguration() {
        const storeConfiguration = config.storeConfiguration;
        return Object.keys(storeConfiguration).reduce(
            (acc, key) => {
                acc[key] =
                    storeConfiguration[
                        key as keyof typeof storeConfiguration
                    ].count;
                return acc;
            },
            {} as { [key: string]: number }
        );
    },

    /**
     * Возвращает полную конфигурацию из config.json
     *
     * @returns Объект конфигурации с настройками техники и хранилища
     */
    getConfig() {
        return config;
    },
};
