import { createViewComponent } from "../../common/createViewComponent";
import vehicleFactoryHTML from "./VehicleFactory.html?raw";
import "./VehicleFactory.scss";

export type VehicleType = "car" | "plane";

export const VehicleFactory = createViewComponent(
    vehicleFactoryHTML,

    //getContext
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
            produceCallback: () => void;
            goneCallback: () => void;
        },

    //properties
    {
        onVehicleProduced: (element, context, callback: () => void) => {
            context.produceCallback = callback;
        },

        produceVehicle: (element, context, vehicleType: VehicleType) => {
            // Блокируем кнопки во время производства
            context.carButton.disabled = true;
            context.planeButton.disabled = true;

            // Определяем эмодзи для типа техники
            const vehicleEmoji = vehicleType === "car" ? "🚗" : "✈️";

            // Устанавливаем начальную позицию и содержимое
            context.vehicleContainer.textContent = vehicleEmoji;
            context.vehicleContainer.classList.remove("hidden");

            // Сбрасываем inline стили, чтобы сработал CSS
            //vehicleContainer.style.right = "";

            // Принудительно перерисовываем, чтобы браузер применил начальное состояние
            void context.vehicleContainer.offsetWidth;

            // Запускаем анимацию через небольшую задержку
            setTimeout(() => {
                context.vehicleContainer.classList.add("moving");

                // После завершения анимации вызываем callback
                setTimeout(() => {
                    context.produceCallback();
                }, 2000); // 2 секунды - длительность анимации
            }, 50);
        },

        setVehicleGone: (element: HTMLElement, context) => {
            context.carButton.disabled = true;
            context.planeButton.disabled = true;
            context.vehicleContainer.classList.add("gone");
            setTimeout(() => {
                context.goneCallback();
                context.vehicleContainer.classList.remove("gone");
                context.vehicleContainer.classList.remove("moving");
                context.vehicleContainer.classList.add("hidden");
                context.carButton.disabled = false;
                context.planeButton.disabled = false;
            }, 2000);
        },

        setProduceCarClick: (
            element: HTMLElement,
            context,
            callback: () => void
        ) => {
            const button = element.querySelector("#produce-car-button");
            if (button) {
                button.addEventListener("click", callback);
            }
        },

        setProducePlaneClick: (
            element: HTMLElement,
            context,
            callback: () => void
        ) => {
            const button = element.querySelector("#produce-plane-button");
            if (button) {
                button.addEventListener("click", callback);
            }
        },
    },

    //onMount
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
