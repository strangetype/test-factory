import { createViewComponent } from "../../common/createViewComponent";
import repairStationHTML from "./RepairStation.html?raw";
import "./RepairStation.scss";

export type MessageType = "success" | "warning" | "danger";

export const RepairStation = createViewComponent(
    repairStationHTML,

    //getContext
    () =>
        ({
            checkButton: null,
            repairButton: null,
            scanner: null,
            tools: null,
            messageContainer: null,
            checkCallback: () => null,
            repairCallback: () => null,
            checkDisabledByUser: false,
            repairDisabledByUser: false,
        }) as {
            checkButton: HTMLButtonElement | null;
            repairButton: HTMLButtonElement | null;
            scanner: HTMLElement | null;
            tools: HTMLElement | null;
            messageContainer: HTMLElement | null;
            checkCallback: () => void;
            repairCallback: () => void;
            checkDisabledByUser: boolean;
            repairDisabledByUser: boolean;
        },

    //properties
    {
        setCheckCallback: (_element, context, callback: () => void) => {
            context.checkCallback = callback;
        },

        setRepairCallback: (_element, context, callback: () => void) => {
            context.repairCallback = callback;
        },

        performCheck: (_element, context) => {
            // Блокируем кнопки во время проверки
            context.checkButton!.disabled = true;
            context.repairButton!.disabled = true;

            // Показываем сканер
            context.scanner!.classList.remove("hidden");
            context.scanner!.classList.add("scanning");

            // После завершения анимации
            setTimeout(() => {
                context.scanner!.classList.remove("scanning");
                context.scanner!.classList.add("hidden");

                // Вызываем callback
                context.checkCallback();

                // Разблокируем кнопки только если они не заблокированы пользователем
                if (!context.checkDisabledByUser) {
                    context.checkButton!.disabled = false;
                }
                if (!context.repairDisabledByUser) {
                    context.repairButton!.disabled = false;
                }
            }, 2000); // 2 секунды - длительность анимации
        },

        performRepair: (_element, context) => {
            // Блокируем кнопки во время ремонта
            context.checkButton!.disabled = true;
            context.repairButton!.disabled = true;

            // Показываем инструменты
            context.tools!.classList.remove("hidden");
            context.tools!.classList.add("repairing");

            // После завершения анимации
            setTimeout(() => {
                context.tools!.classList.remove("repairing");
                context.tools!.classList.add("hidden");

                // Вызываем callback
                context.repairCallback();

                // Разблокируем кнопки только если они не заблокированы пользователем
                if (!context.checkDisabledByUser) {
                    context.checkButton!.disabled = false;
                }
                if (!context.repairDisabledByUser) {
                    context.repairButton!.disabled = false;
                }
            }, 2000); // 2 секунды - длительность анимации
        },

        disable: (_element, context) => {
            context.checkDisabledByUser = true;
            context.repairDisabledByUser = true;
            context.checkButton!.disabled = true;
            context.repairButton!.disabled = true;
        },

        enable: (_element, context) => {
            context.checkDisabledByUser = false;
            context.repairDisabledByUser = false;
            context.checkButton!.disabled = false;
            context.repairButton!.disabled = false;
        },

        disableCheck: (_element, context) => {
            context.checkDisabledByUser = true;
            context.checkButton!.disabled = true;
        },

        enableCheck: (_element, context) => {
            context.checkDisabledByUser = false;
            context.checkButton!.disabled = false;
        },

        disableRepair: (_element, context) => {
            context.repairDisabledByUser = true;
            context.repairButton!.disabled = true;
        },

        enableRepair: (_element, context) => {
            context.repairDisabledByUser = false;
            context.repairButton!.disabled = false;
        },

        showMessage: (
            _element,
            context,
            message: string,
            type: MessageType
        ) => {
            // Создаем элемент сообщения
            const messageElement = document.createElement("div");
            messageElement.className = `repair-station__message repair-station__message--${type}`;
            messageElement.textContent = message;

            // Очищаем контейнер и добавляем новое сообщение
            context.messageContainer!.innerHTML = "";
            context.messageContainer!.appendChild(messageElement);

            // Показываем контейнер с анимацией
            context.messageContainer!.classList.remove("fadeout");
            context.messageContainer!.classList.add("visible");
        },

        hideMessage: (_element, context) => {
            // Запускаем fadeout анимацию
            context.messageContainer!.classList.add("fadeout");

            // После завершения анимации очищаем контейнер
            setTimeout(() => {
                context.messageContainer!.classList.remove("visible");
                context.messageContainer!.classList.remove("fadeout");
                context.messageContainer!.innerHTML = "";
            }, 300); // Длительность fadeout анимации
        },

        setCheckClick: (
            element: HTMLElement,
            _context,
            callback: () => void
        ) => {
            const button = element.querySelector("#check-button");
            if (button) {
                button.addEventListener("click", callback);
            }
        },

        setRepairClick: (
            element: HTMLElement,
            _context,
            callback: () => void
        ) => {
            const button = element.querySelector("#repair-button");
            if (button) {
                button.addEventListener("click", callback);
            }
        },
    },

    //onMount
    (element, context) => {
        context.checkButton = element.querySelector(
            "#check-button"
        ) as HTMLButtonElement;
        context.repairButton = element.querySelector(
            "#repair-button"
        ) as HTMLButtonElement;
        context.scanner = element.querySelector("#scanner") as HTMLElement;
        context.tools = element.querySelector("#tools") as HTMLElement;
        context.messageContainer = element.querySelector(
            "#repair-message-container"
        ) as HTMLElement;
    }
);
