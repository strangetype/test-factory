/**
 * Компонент склада компонентов
 * Отображает список компонентов и их количество в виде таблицы
 */

import { createViewComponent } from "../../common/createViewComponent";
import storeHTML from "./Store.html?raw";
import "./Store.scss";

/**
 * Вспомогательная функция для отрисовки всей таблицы склада
 * @param context - Контекст компонента с данными о компонентах
 */
function renderTable(context: any) {
    if (!context.tableBody) return;

    const itemKeys = Object.keys(context.items);

    if (itemKeys.length === 0) {
        context.tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="store__empty-message">
                    No items in storage
                </td>
            </tr>
        `;
        return;
    }

    context.tableBody.innerHTML = itemKeys
        .map((name) => {
            const count = context.items[name];
            return `
                <tr class="store__table-row" data-item-name="${name}">
                    <td class="store__table-cell store__table-cell--name">${name}</td>
                    <td class="store__table-cell store__table-cell--quantity">${count}</td>
                </tr>
            `;
        })
        .join("");
}

/**
 * Вспомогательная функция для обновления одной строки таблицы
 * Применяет анимацию при изменении количества
 * @param context - Контекст компонента
 * @param name - Название компонента
 * @param count - Новое количество
 */
function updateRow(context: any, name: string, count: number) {
    if (!context.tableBody) return;

    const row = context.tableBody.querySelector(
        `[data-item-name="${name}"]`
    ) as HTMLElement;

    if (row) {
        const quantityCell = row.querySelector(
            ".store__table-cell--quantity"
        ) as HTMLElement;
        if (quantityCell) {
            // Добавляем анимацию изменения
            quantityCell.style.transition = "none";
            quantityCell.style.transform = "scale(1.3)";
            quantityCell.style.color = "#4caf50";
            quantityCell.textContent = String(count);

            // Возвращаем обычный стиль
            setTimeout(() => {
                quantityCell.style.transition = "all 0.3s ease";
                quantityCell.style.transform = "scale(1)";
                quantityCell.style.color = "#1976d2";
            }, 50);
        }
    } else {
        // Если строки нет, перерисовываем всю таблицу
        renderTable(context);
    }
}

/**
 * View-компонент склада компонентов
 * Использует generics для типобезопасной работы с любым набором компонентов
 * Независим от бизнес-логики, работает только с отображением данных
 * 
 * @template Items - Объект с названиями компонентов и их количеством
 * @param items - Начальное состояние склада
 * @returns Объект с методом mount для монтирования компонента
 */
export const Store = <Items extends { [key: string]: number }>(
    items: Items
) => {
    return createViewComponent(
        storeHTML,
        // Инициализация контекста компонента
        () =>
            ({
                tableBody: null,
                items,
            }) as {
                tableBody: HTMLElement | null;
                items: Items;
            },
        // Публичный API компонента
        {
            // Устанавливает количество для указанного компонента
            setCount: (
                element,
                context,
                name: keyof Items,
                count: Items[typeof name]
            ) => {
                if (name in context.items) {
                    context.items[name] = count;
                    updateRow(context, name as string, count);
                }
            },

            // Возвращает количество указанного компонента
            getCount: (element, context, name: keyof Items) => {
                return context.items[name as string] ?? 0;
            },

            // Очищает склад
            clear: (_element, context) => {
                context.items = {} as Items;
                renderTable(context);
            },
        },
        // Callback при монтировании компонента
        (element, context) => {
            context.tableBody = element.querySelector(
                "#store-table-body"
            ) as HTMLElement;

            // Показываем пустое сообщение при инициализации
            renderTable(context);
        }
    );
};
