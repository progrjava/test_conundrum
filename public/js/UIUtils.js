import { elements } from './elements.js';

/**
 * Класс для управления пользовательским интерфейсом
 */
export class UIUtils {
    /**
     * Инициализация всех обработчиков событий
     */
    static initialize() {
        this.initializeInputTypeHandlers();
    }



    /**
     * Инициализация обработчиков для переключения типа ввода
     */
    static initializeInputTypeHandlers() {
        if (elements.inputTypeSelect) {
            elements.inputTypeSelect.addEventListener('change', () => this.toggleInputs());
            this.toggleInputs(); // Вызываем сразу для установки начального состояния
        }
    }

    /**
     * Переключение видимости полей ввода
     */
    static toggleInputs() {
        const selectedType = elements.inputTypeSelect.value;
        
        elements.documentTextarea.style.display = selectedType === 'text' ? 'block' : 'none';
        elements.fileUploadInput.style.display = selectedType === 'file' ? 'block' : 'none';
        elements.topicInput.style.display = selectedType === 'topic' ? 'block' : 'none';
    }

    /**
     * Показать попап
     * @param {HTMLElement} popup - Элемент попапа
     */
    static showPopup(popup) {
        if (popup) {
            popup.style.display = 'block';
        }
    }

    /**
     * Скрыть попап
     * @param {HTMLElement} popup - Элемент попапа
     */
    static hidePopup(popup) {
        if (popup) {
            popup.style.display = 'none';
        }
    }

    /**
     * Обработка клика вне попапа
     * @param {Event} event - Событие клика
     */
    static handleOutsideClick(event) {
        const popups = document.querySelectorAll('.popup');
        popups.forEach(popup => {
            if (event.target === popup) {
                this.hidePopup(popup);
            }
        });
    }

    /**
     * Показать сообщение об ошибке
     * @param {string} message - Текст сообщения
     */
    static showError(message) {
        alert(message);
    }

    /**
     * Показать сообщение об успехе
     * @param {string} message - Текст сообщения
     */
    static showSuccess(message) {
        alert(message);
    }
}
