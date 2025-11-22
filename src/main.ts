/**
 * Точка входа в приложение
 * Инициализирует и связывает View-компоненты с Model через паттерн pub/sub
 */

import "./style.css";
import mainHTML from "./main.html?raw";

import { VehicleFactory } from "./view/components/VehicleFactory/VehicleFactory";
import { RepairStation } from "./view/components/RepairStation/RepairStation";
import { Store } from "./view/components/Store/Store";
import { RepairVehicleGameModel } from "./model/RepairVehicleGameModel";
import { ConfigService } from "./ConfigService";

/**
 * Инициализирует приложение
 * Создает View-компоненты и Model, связывает их через события
 */
function initApp() {
    const config = ConfigService.getConfig();
    const storeInitialCountConfiguration =
        ConfigService.getStoreInitialCountConfiguration();

    const app = document.querySelector<HTMLDivElement>("#app")!;

    app.innerHTML = mainHTML;

    // Создаем и монтируем View-компоненты (независимые от Model)
    const repairStation = RepairStation.mount("repair-station");
    const factory = VehicleFactory.mount("vehicle-factory");
    const storeView = Store(storeInitialCountConfiguration).mount("store");

    repairStation.disable();

    // Создаем Model (независимую от View)
    const gameModel = RepairVehicleGameModel(
        config.storeConfiguration,
        config.vehicleConfiguration
    );

    // === СВЯЗЫВАНИЕ VIEW → MODEL (действия пользователя) ===

    factory.setProduceCarClick(() => {
        gameModel.actions.createVehicle("Car");
    });

    factory.setProducePlaneClick(() => {
        gameModel.actions.createVehicle("Plane");
    });

    factory.onVehicleProduced(() => {
        repairStation.enableCheck();
    });

    factory.onVehicleGone(() => {
        repairStation.hideMessage();
    });

    repairStation.setCheckClick(() => {
        repairStation.performCheck();
    });

    repairStation.setCheckCallback(() => {
        gameModel.actions.scanVehicle();
    });

    repairStation.setRepairClick(() => {
        repairStation.performRepair();
    });

    repairStation.setRepairCallback(() => {
        gameModel.actions.repairVehicle();
    });

    // === СВЯЗЫВАНИЕ MODEL → VIEW (события модели) ===

    // Обновление отображения склада при изменении его состояния
    gameModel.on("storeStateUpdated", (store) => {
        storeView.setCount("wheel", store.wheel.count);
        storeView.setCount("wing", store.wing.count);
        storeView.setCount("engine", store.engine.count);
    });

    // Обработка создания техники в модели
    gameModel.on("vehicleCreated", (vehicleType) => {
        console.log("vehicleCreated", vehicleType);
        if (vehicleType === "Car") {
            factory.produceVehicle("car");
        } else if (vehicleType === "Plane") {
            factory.produceVehicle("plane");
        } else {
            repairStation.showMessage(
                "Not enough components to create vehicle",
                "danger"
            );
        }
    });

    // Обработка результата сканирования техники
    gameModel.on("vehicleScanned", (checkResult) => {
        if (checkResult.damaged) {
            repairStation.enableRepair();
            repairStation.disableCheck();
            repairStation.showMessage("Vehicle is damaged", "warning");
        } else {
            repairStation.disableRepair();
            repairStation.disableCheck();
            repairStation.showMessage("Vehicle is not damaged", "success");
            factory.setVehicleGone();
        }
    });

    // Обработка результата ремонта техники
    gameModel.on("vehicleRepaired", (repaired) => {
        if (repaired) {
            repairStation.showMessage("Vehicle is repaired", "success");
            factory.setVehicleGone();
            repairStation.disableCheck();
            repairStation.disableRepair();
        } else {
            repairStation.showMessage("Vehicle is not repaired", "danger");
            factory.setVehicleGone();
            repairStation.disableCheck();
            repairStation.disableRepair();
        }
    });

    console.log("Приложение запущено");
}

// Проверка корректности конфигурации перед запуском приложения
if (ConfigService.checkConfig()) {
    initApp();
} else {
    console.error("Config is not valid");
}
