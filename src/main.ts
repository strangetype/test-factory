import "./style.css";
import mainHTML from "./main.html?raw";

import {
    VehicleFactory,
    VehicleType,
} from "./view/components/VehicleFactory/VehicleFactory";
import { RepairStation } from "./view/components/RepairStation/RepairStation";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = mainHTML;

// Создаем и монтируем RepairStation
const repairStation = RepairStation.mount("repair-station");

// Устанавливаем callbacks для кнопок
repairStation.setCheckCallback(() => {
    console.log("✅ Check completed!");
    repairStation.showMessage("Check completed successfully!", "success");
    setTimeout(() => {
        repairStation.hideMessage();
    }, 3000);
    vehicleFactory.setVehicleGone();
});

repairStation.setRepairCallback(() => {
    console.log("🔧 Repair completed!");
    repairStation.showMessage("Repair completed successfully!", "success");
    setTimeout(() => {
        repairStation.hideMessage();
    }, 3000);
});

// Устанавливаем обработчики кликов
repairStation.setCheckClick(() => {
    console.log("🔍 Performing check...");
    repairStation.performCheck();
});

repairStation.setRepairClick(() => {
    console.log("🔧 Performing repair...");
    repairStation.performRepair();
});

const vehicleFactory = VehicleFactory.mount("vehicle-factory");
vehicleFactory.onVehicleProduced((vehicleType: VehicleType) => {
    console.log(`✅ Vehicle produced: ${vehicleType}`);
    repairStation.performCheck();
});

vehicleFactory.setProduceCarClick(() => {
    console.log("🏭 Producing car...");
    vehicleFactory.produceVehicle("car");
});

vehicleFactory.setProducePlaneClick(() => {
    console.log("🏭 Producing plane...");
    vehicleFactory.produceVehicle("plane");
});

console.log("Приложение запущено");

// Примеры использования новых методов:
// repairStation.disableCheck(); // Блокирует только кнопку Check
// repairStation.enableCheck();  // Разблокирует кнопку Check
// repairStation.disableRepair(); // Блокирует только кнопку Repair
// repairStation.enableRepair();  // Разблокирует кнопку Repair
// repairStation.disable();       // Блокирует обе кнопки
// repairStation.enable();        // Разблокирует обе кнопки

// Важно: если кнопка заблокирована через disableCheck/disableRepair/disable,
// она останется заблокированной даже после завершения анимации performCheck/performRepair
