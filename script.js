document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на элементы DOM
    const tenseTitleEl = document.getElementById('tense-title');
    const tenseDescriptionEl = document.getElementById('tense-description');
    const formulaOptionsEl = document.getElementById('formula-options');
    const checkBtn = document.getElementById('check-btn');

    let tensesData = [];
    let currentTenseIndex = 0;
    let selectedOption = null;
    let isChecking = false; // Флаг для блокировки действий во время проверки

    // Функция для перемешивания массива (алгоритм Фишера-Йейтса)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Функция для загрузки и отображения нового времени
    function loadTense(index) {
        isChecking = false;
        selectedOption = null;
        checkBtn.disabled = true; // Кнопка неактивна, пока не выбран вариант

        // Очищаем предыдущие стили и варианты
        formulaOptionsEl.innerHTML = '';
        
        // Получаем данные текущего времени
        const currentTense = tensesData[index];
        tenseTitleEl.textContent = `${currentTense.emoji} ${currentTense.title}`;
        tenseDescriptionEl.textContent = currentTense.description;

        // --- Создание вариантов ответов ---
        const correctFormula = currentTense.formula;
        // Получаем все формулы, кроме правильной
        const incorrectFormulas = tensesData
            .filter(tense => tense.id !== currentTense.id)
            .map(tense => tense.formula);
        
        // Перемешиваем неправильные формулы и берем 5 штук
        shuffleArray(incorrectFormulas);
        const options = [correctFormula, ...incorrectFormulas.slice(0, 5)];
        
        // Перемешиваем финальный список из 6 вариантов
        shuffleArray(options);

        // Создаем и добавляем элементы списка на страницу
        options.forEach(formula => {
            const li = document.createElement('li');
            li.textContent = formula;
            li.addEventListener('click', () => {
                // Блокируем выбор, если идет проверка
                if (isChecking) return;

                // Снимаем выделение со старого варианта
                if (selectedOption) {
                    selectedOption.classList.remove('selected');
                }
                // Выделяем новый
                li.classList.add('selected');
                selectedOption = li;
                checkBtn.disabled = false; // Активируем кнопку
            });
            formulaOptionsEl.appendChild(li);
        });
    }

    // Функция проверки ответа
    function checkAnswer() {
        if (!selectedOption || isChecking) return;

        isChecking = true;
        checkBtn.disabled = true;

        const correctFormula = tensesData[currentTenseIndex].formula;
        const selectedFormula = selectedOption.textContent;

        if (selectedFormula === correctFormula) {
            // Правильный ответ
            selectedOption.classList.add('correct');
            selectedOption.classList.remove('selected');

            setTimeout(() => {
                // Переходим к следующему вопросу
                currentTenseIndex++;
                if (currentTenseIndex >= tensesData.length) {
                    currentTenseIndex = 0; // Начинаем заново, если дошли до конца
                }
                loadTense(currentTenseIndex);
            }, 1000); // Задержка в 1 секунду
        } else {
            // Неправильный ответ
            selectedOption.classList.add('incorrect');
            selectedOption.classList.remove('selected');
            
            // Позволяем пользователю выбрать другой вариант
            setTimeout(() => {
                selectedOption.classList.remove('incorrect');
                selectedOption = null;
                isChecking = false;
                // Кнопку не активируем, чтобы пользователь снова выбрал вариант
            }, 1000);
        }
    }

    // --- Инициализация ---
    // Загружаем данные из JSON и запускаем викторину
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            tensesData = data;
            shuffleArray(tensesData); // Перемешиваем порядок времен для разнообразия
            loadTense(currentTenseIndex);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            tenseTitleEl.textContent = "Ошибка!";
            tenseDescriptionEl.textContent = "Не удалось загрузить данные для викторины. Пожалуйста, проверьте файл data.json и обновите страницу.";
        });

    // Назначаем обработчик на кнопку "Проверить"
    checkBtn.addEventListener('click', checkAnswer);
});
