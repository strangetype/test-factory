// Пример использования компонента VehicleFactory
import {
    VehicleFactory,
    VehicleType,
} from "./view/components/VehicleFactory/VehicleFactory";

export function exampleUsage() {
    // Монтируем компонент в элемент с id="factory-container"
    const factory = VehicleFactory.mount("factory-container");

    // Подписываемся на событие производства техники
    factory.onVehicleProduced((vehicleType: VehicleType) => {
        console.log(`✅ Vehicle produced: ${vehicleType}`);
        alert(
            `Техника произведена: ${vehicleType === "car" ? "Автомобиль 🚗" : "Самолет ✈️"}`
        );
    });

    // Устанавливаем обработчики кликов на кнопки
    factory.setProduceCarClick(() => {
        console.log("🏭 Producing car...");
        factory.produceVehicle("car");
    });

    factory.setProducePlaneClick(() => {
        console.log("🏭 Producing plane...");
        factory.produceVehicle("plane");
    });

    // Или можно вызвать produceVehicle программно:
    // setTimeout(() => {
    //     factory.produceVehicle("car");
    // }, 1000);
}
