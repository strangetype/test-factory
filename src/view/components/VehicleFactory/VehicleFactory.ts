/**
 * Компонент фабрики по производству техники
 * Отображает кнопки для создания разных типов техники и анимацию их производства
 */

import { createViewComponent } from "../../common/createViewComponent";
import vehicleFactoryHTML from "./VehicleFactory.html?raw";
import "./VehicleFactory.scss";

export type VehicleType = "car" | "plane";

/**
 * View-компонент фабрики техники
 * Независим от бизнес-логики, работает только с отображением и пользовательским вводом
 */
export const VehicleFactory = createViewComponent(
    vehicleFactoryHTML,

    // Инициализация контекста компонента
    () =>
        ({
            vehicleContainer: null,
            carButton: null,
            planeButton: null,
            produceCallback: () => null,
            goneCallback: () => null,
        }) as {
            vehicleContainer: HTMLElement | null;
            carButton: HTMLButtonElement | null;
            planeButton: HTMLButtonElement | null;
            produceCallback: (vehicleType: VehicleType) => void;
            goneCallback: () => void;
        },

    // Публичный API компонента
    {
        // Устанавливает callback для события завершения производства техники
        onVehicleProduced: (
            _element,
            context,
            callback: (vehicleType: VehicleType) => void
        ) => {
            context.produceCallback = callback;
        },

        // Запускает анимацию производства техники
        produceVehicle: (_element, context, vehicleType: VehicleType) => {
            // Блокируем кнопки во время производства
            context.carButton!.disabled = true;
            context.planeButton!.disabled = true;

            // Определяем эмодзи для типа техники
            const vehicleEmoji = vehicleType === "car" ? "🚗" : "✈️";

            // Устанавливаем начальную позицию и содержимое
            context.vehicleContainer!.textContent = vehicleEmoji;
            context.vehicleContainer!.classList.remove("hidden");

            // Принудительно перерисовываем, чтобы браузер применил начальное состояние
            void context.vehicleContainer!.offsetWidth;

            // Запускаем анимацию через небольшую задержку
            setTimeout(() => {
                context.vehicleContainer!.classList.add("moving");

                // После завершения анимации вызываем callback
                setTimeout(() => {
                    context.produceCallback(vehicleType);
                }, 2000); // 2 секунды - длительность анимации
            }, 50);
        },

        // Запускает анимацию ухода техники с фабрики
        setVehicleGone: (_element: HTMLElement, context) => {
            context.carButton!.disabled = true;
            context.planeButton!.disabled = true;
            context.vehicleContainer!.classList.add("gone");
            setTimeout(() => {
                context.goneCallback();
                context.vehicleContainer!.classList.remove("gone");
                context.vehicleContainer!.classList.remove("moving");
                context.vehicleContainer!.classList.add("hidden");
                context.carButton!.disabled = false;
                context.planeButton!.disabled = false;
            }, 2000);
        },

        // Устанавливает callback для события ухода техники
        onVehicleGone: (
            _element: HTMLElement,
            context,
            callback: () => void
        ) => {
            context.goneCallback = callback;
        },

        // Устанавливает обработчик клика на кнопку производства автомобиля
        setProduceCarClick: (
            element: HTMLElement,
            _context,
            callback: () => void
        ) => {
            const button = element.querySelector("#produce-car-button");
            if (button) {
                button.addEventListener("click", callback);
            }
        },

        // Устанавливает обработчик клика на кнопку производства самолета
        setProducePlaneClick: (
            element: HTMLElement,
            _context,
            callback: () => void
        ) => {
            const button = element.querySelector("#produce-plane-button");
            if (button) {
                button.addEventListener("click", callback);
            }
        },
    },

    // Callback при монтировании компонента
    (element, context) => {
        context.vehicleContainer = element.querySelector(
            "#vehicle-container"
        ) as HTMLElement;
        context.carButton = element.querySelector(
            "#produce-car-button"
        ) as HTMLButtonElement;
        context.planeButton = element.querySelector(
            "#produce-plane-button"
        ) as HTMLButtonElement;
    }
);
