const TICK_RATE = 60; // Количество тиков в секунду
const TICK_TIME = 1000 // TICK_RATE; // Время одного тика в миллисекундах

let lastTime = 0;
let accumulator = 0;

function gameLoop(currentTime) {
    if (lastTime) {
        const deltaTime = currentTime - lastTime;
        accumulator += deltaTime;
        
        while (accumulator >= TICK_TIME) {
            update(TICK_TIME);
            accumulator -= TICK_TIME;
        }
    }
    
    render();
    
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    console.log('update');
    // Обновление игровой логики
    // Здесь вы можете обновлять позиции объектов, проверять коллизии и т.д.
}

function render() {
    console.log('render');

    // Отрисовка игры
    // Здесь вы можете обновлять визуальное представление игры
}

// Запуск игрового цикла
requestAnimationFrame(gameLoop);