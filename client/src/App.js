import React, { Component, createRef, useEffect } from 'react';
import axios from 'axios';
import './css/style.css';
import './css/word-soup.css';


/**
 * Класс, отвечающий за отображение и управление подсказками кроссворда и филворда
 */
class CluesDisplay {
  /**
   * Отображает подсказки для кроссворда
   * @param {Array<Object>} words - Массив объектов слов, содержащих позицию и ориентацию
   */
  static displayCrosswordClues(words) {
      const cluesContainer = document.getElementById('clues-container');
      cluesContainer.innerHTML = '';

      const acrossClues = words.filter(wordData => wordData.orientation === 'across')
          .sort((a, b) => a.position - b.position);
      const downClues = words.filter(wordData => wordData.orientation === 'down')
          .sort((a, b) => a.position - b.position);

      const acrossContainer = this.createClueList(acrossClues, 'По горизонтали');
      const downContainer = this.createClueList(downClues, 'По вертикали');

      cluesContainer.appendChild(acrossContainer);
      cluesContainer.appendChild(downContainer);
  }

  /**
   * Отображает подсказки для филворда
   * @param {Array<Object>} words - Массив объектов слов
   */
  static displayWordSoupClues(words) {
      const cluesContainer = document.getElementById('clues-container');
      cluesContainer.innerHTML = '';

      // Преобразуем слова в формат для отображения
      const cluesData = words.map((word, index) => ({
          position: index + 1,
          clue: word.clue,
          word: word.word,
          cleanWord: word.word.replace(/\s+/g, '')
      }));

      const container = this.createClueList(cluesData, 'Слова в филворде');
      cluesContainer.appendChild(container);
  }

  /**
   * Создает список подсказок
   * @private
   */
  static createClueList(clues, title) {
      const list = document.createElement('ul');
      list.className = 'word-list';

      clues.forEach(wordData => {
          const li = document.createElement('li');
          li.className = 'word-item';
          if (wordData.cleanWord) {
              li.setAttribute('data-word', wordData.word);
              li.setAttribute('data-clean-word', wordData.cleanWord);
          }
          
          const clueText = document.createElement('span');
          clueText.textContent = `${wordData.position}. ${wordData.clue}`;
          li.appendChild(clueText);

          const showAnswerButton = document.createElement('button');
          showAnswerButton.textContent = 'Показать ответ';
          showAnswerButton.className = 'show-answer-button';
          showAnswerButton.addEventListener('click', () => {
              showAnswerButton.remove();
              const displayWord = wordData.originalWord || wordData.word;
              clueText.textContent += ` (${displayWord})`;
          });
          li.appendChild(showAnswerButton);
          list.appendChild(li);
      });

      const container = document.createElement('div');
      container.className = 'clues-section';
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      container.appendChild(titleElement);
      container.appendChild(list);
      return container;
  }
}


/**
 * Базовый класс для отображения игрового поля
 * Содержит общую логику для всех типов игр
 */
class DisplayBase {
  /**
   * Отображает индикатор загрузки
   */
  static displayLoadingIndicator() {
      if (elements.cluesContainer) {
          elements.cluesContainer.style.display = 'none';
      }

      if (elements.crosswordContainer) {
          elements.crosswordContainer.innerHTML = '<div class="loading-indicator">Загрузка...</div>';
      }
  }

  /**
   * Скрывает индикатор загрузки
   */
  static hideLoadingIndicator() {
      const loadingIndicator = document.querySelector('.loading-indicator');
      
      if (loadingIndicator) {
          loadingIndicator.remove();
      }

      if (elements.cluesContainer) {
          elements.cluesContainer.style.display = 'flex';
      }
  }

  /**
   * Базовый обработчик ввода
   * @param {Event} event - Событие ввода
   * @param {Function} validateInput - Функция валидации ввода
   * @param {Function} onValidInput - Колбэк для обработки правильного ввода
   * @param {Function} onInvalidInput - Колбэк для обработки неправильного ввода
   */
  static handleInput(event, validateInput, onValidInput, onInvalidInput) {
      const input = event.target;
      const userInput = input.value.toUpperCase();

      if (validateInput(userInput)) {
          input.classList.remove('invalid');
          input.classList.add('valid');
          if (onValidInput) onValidInput(input, userInput);
      } else {
          input.classList.remove('valid');
          input.classList.add('invalid');
          if (onInvalidInput) onInvalidInput(input, userInput);
      }
  }

  /**
   * Базовый обработчик нажатия клавиш
   * @param {KeyboardEvent} event - Событие клавиатуры
   * @param {Function} onEnter - Колбэк для обработки нажатия Enter
   * @param {Function} onArrow - Колбэк для обработки нажатия стрелок
   */
  static handleKeydown(event, onEnter, onArrow) {
      if (event.key === 'Enter' && onEnter) {
          event.preventDefault();
          onEnter(event.target);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) && onArrow) {
          event.preventDefault();
          onArrow(event.target, event.key);
      }
  }

  /**
   * Очищает игровое поле
   */
  static clearGameField() {
      if (elements.crosswordContainer) {
          elements.crosswordContainer.innerHTML = '';
      }

      if (elements.cluesContainer) {
          elements.cluesContainer.innerHTML = '';
      }
  }

  /**
   * Создает и добавляет элемент на страницу
   * @param {string} tag - HTML тег элемента
   * @param {Object} attributes - Атрибуты элемента
   * @param {string} content - Содержимое элемента
   * @param {HTMLElement} parent - Родительский элемент
   * @returns {HTMLElement} Созданный элемент
   */
  static createElement(tag, attributes = {}, content = '', parent = null) {
      const element = document.createElement(tag);
      
      // Устанавливаем атрибуты
      Object.entries(attributes).forEach(([key, value]) => {
          if (key === 'className') {
              element.className = value;
          } else {
              element.setAttribute(key, value);
          }
      });

      // Устанавливаем содержимое
      if (content) {
          element.innerHTML = content;
      }

      // Добавляем к родительскому элементу
      if (parent) {
          parent.appendChild(element);
      }

      return element;
  }
}

/**
 * Класс, отвечающий за отображение и взаимодействие с кроссвордом
 */
class CrosswordDisplay extends DisplayBase {
    static currentDirection = null; // Добавляем статическое свойство для хранения текущего направления

    /**
     * Отображает сетку кроссворда и слова
     * @param {Array<Array<string>>} grid - Двумерный массив, представляющий сетку кроссворда
     * @param {Array<Object>} words - Массив объектов слов, содержащих позицию и ориентацию
     */
    static displayCrossword(grid, words) {
        console.log("Сетка в displayCrossword:", grid);
        console.log("Слова в displayCrossword:", words);

        // Сбрасываем направление при новом отображении
        this.currentDirection = null;

        // Очищаем игровое поле
        this.clearGameField();

        // Проверяем входные данные
        if (!grid || !words) {
            console.error("Отсутствует сетка или слова!");
            GameStateManager.displayError('Не удалось получить данные кроссворда');
            return;
        }

        // Создаем таблицу
        const table = this.createElement('table', { className: 'crossword-table' });
        const crosswordContainer = document.getElementById('crossword-container');

        // Генерируем ячейки кроссворда
        grid.forEach((row, rowIndex) => {
            const tr = this.createElement('tr', {}, '', table);
            row.forEach((cell, colIndex) => {
                if (cell !== '') {
                    // Проверяем, начинается ли слово в этой позиции
                    const wordData = words.find(word =>
                        word.startx - 1 === colIndex && word.starty - 1 === rowIndex && word.orientation !== 'none'
                    );

                    // Создаем ячейку
                    const td = this.createElement('td', {
                        className: 'crossword-cell',
                        'data-correct-letter': cell.toUpperCase()
                    }, '', tr);

                    // Добавляем номер слова, если есть
                    if (wordData) {
                        this.createElement('span', 
                            { className: 'word-number' }, 
                            wordData.position, 
                            td
                        );
                    }

                    // Добавляем поле ввода
                    this.createElement('input', {
                        type: 'text',
                        maxLength: '1',
                        className: 'crossword-input'
                    }, '', td);
                } else {
                    this.createElement('td', { className: 'black-cell' }, '', tr);
                }
            });
        });

        crosswordContainer.appendChild(table);

        // Отображаем подсказки
        CluesDisplay.displayCrosswordClues(words);

        // Добавляем обработчики событий
        table.addEventListener('input', (event) => {
            if (event.target.classList.contains('crossword-input')) {
                // Определяем направление при первом клике, если оно еще не установлено
                if (!this.currentDirection) {
                    this.currentDirection = this.determineWordDirection(event.target.parentNode, grid);
                }

                const validateInput = (input) => {
                    return input === event.target.parentNode.dataset.correctLetter;
                };

                const onValidInput = (input) => {
                    input.parentNode.style.backgroundColor = '#c8e6c9';
                    const nextInput = this.findNextInput(input, grid);
                    if (nextInput) {
                        nextInput.focus();
                    }
                    GameStateManager.checkCrosswordSolved();
                };

                const onInvalidInput = (input) => {
                    input.parentNode.style.backgroundColor = '#ffcdd2';
                };

                this.handleInput(event, validateInput, onValidInput, onInvalidInput);
            }
        });

        table.addEventListener('keydown', (event) => {
            if (event.target.classList.contains('crossword-input')) {
                const onEnter = (input) => {
                    const nextInput = this.findNextInput(input, grid);
                    if (nextInput) {
                        nextInput.focus();
                    }
                };

                const onArrow = (input, key) => {
                    // При нажатии стрелок меняем направление
                    if (key === 'ArrowRight' || key === 'ArrowLeft') {
                        this.currentDirection = 'across';
                    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
                        this.currentDirection = 'down';
                    }

                    const currentCell = input.parentNode;
                    const row = currentCell.parentNode.rowIndex;
                    const col = currentCell.cellIndex;
                    let nextInput;

                    switch (key) {
                        case 'ArrowRight':
                            if (col + 1 < grid[row].length) {
                                nextInput = currentCell.parentNode.cells[col + 1].querySelector('input');
                            }
                            break;
                        case 'ArrowLeft':
                            if (col > 0) {
                                nextInput = currentCell.parentNode.cells[col - 1].querySelector('input');
                            }
                            break;
                        case 'ArrowDown':
                            if (row + 1 < grid.length) {
                                nextInput = table.rows[row + 1].cells[col].querySelector('input');
                            }
                            break;
                        case 'ArrowUp':
                            if (row > 0) {
                                nextInput = table.rows[row - 1].cells[col].querySelector('input');
                            }
                            break;
                    }

                    if (nextInput) {
                        nextInput.focus();
                    }
                };

                this.handleKeydown(event, onEnter, onArrow);
            }
        });

        // Добавляем обработчик клика для установки направления
        table.addEventListener('click', (event) => {
            if (event.target.classList.contains('crossword-input')) {
                // Сбрасываем направление при клике на новую ячейку
                this.currentDirection = null;
            }
        });
    }

    /**
     * Находит следующую ячейку для ввода на основе текущей ячейки и сетки
     * @param {HTMLElement} currentInput - Текущая ячейка для ввода
     * @param {Array<Array<string>>} grid - Сетка кроссворда
     * @returns {HTMLElement|null} Следующая ячейка для ввода или null, если не найдена
     */
    static findNextInput(currentInput, grid) {
        const currentCell = currentInput.parentNode;
        const row = currentCell.parentNode.rowIndex;
        const col = currentCell.cellIndex;

        // Используем сохраненное направление, если оно есть
        const direction = this.currentDirection || this.determineWordDirection(currentCell, grid);
        
        if (direction === 'down') {
            // Если слово идет вниз, проверяем ячейку снизу
            if (row + 1 < grid.length && grid[row + 1][col] !== '') {
                const nextRow = currentCell.parentNode.parentNode.rows[row + 1];
                const nextCell = nextRow.cells[col];
                const nextInput = nextCell.querySelector('input');
                if (nextInput) return nextInput;
            }
        } else {
            // Если слово идет вправо, проверяем ячейку справа
            if (col + 1 < grid[row].length && grid[row][col + 1] !== '') {
                const nextCell = currentCell.parentNode.cells[col + 1];
                const nextInput = nextCell.querySelector('input');
                if (nextInput) return nextInput;
            }
        }

        return null;
    }

    /**
     * Определяет направление слова на основе текущей ячейки
     * @param {HTMLElement} cell - Текущая ячейка
     * @param {Array<Array<string>>} grid - Сетка кроссворда
     * @returns {string} 'across' для горизонтального направления, 'down' для вертикального
     */
    static determineWordDirection(cell, grid) {
        const row = cell.parentNode.rowIndex;
        const col = cell.cellIndex;
        
        // Проверяем, является ли текущая ячейка началом слова
        const wordNumber = cell.querySelector('.word-number');
        if (wordNumber) {
            // Проверяем направление слова, начинающегося в этой ячейке
            const hasRight = col + 1 < grid[row].length && grid[row][col + 1] !== '';
            const hasDown = row + 1 < grid.length && grid[row + 1][col] !== '';
            
            if (hasDown && !hasRight) return 'down';
            if (hasRight && !hasDown) return 'across';
        }
        
        // Если это не начало слова, определяем направление по соседним ячейкам
        const hasLeft = col > 0 && grid[row][col - 1] !== '';
        const hasRight = col + 1 < grid[row].length && grid[row][col + 1] !== '';
        const hasUp = row > 0 && grid[row - 1][col] !== '';
        const hasDown = row + 1 < grid.length && grid[row + 1][col] !== '';

        // Если есть соседи слева или справа, значит слово горизонтальное
        if (hasLeft || hasRight) return 'across';
        // Если есть соседи сверху или снизу, значит слово вертикальное
        if (hasUp || hasDown) return 'down';

        return 'across'; // По умолчанию горизонтальное направление
    }
}




/**
 * Модуль elements.js
 * Содержит ссылки на DOM-элементы, используемые в приложении
 */

const elements = {
  // Элементы формы кроссворда
  crosswordForm: document.getElementById('crossword-form'),
  gameTypeSelect: document.getElementById('game-type'),
  inputTypeSelect: document.getElementById('input-type'),
  documentTextarea: document.getElementById('document'),
  fileUploadInput: document.getElementById('file-upload'),
  topicInput: document.getElementById('topic'),
  totalWordsInput: document.getElementById('total-words'),

  // Элементы игрового поля
  crosswordContainer: document.getElementById('crossword-container'),
  cluesContainer: document.getElementById('clues-container')
};


/**
 * Класс, отвечающий за управление состоянием игры и отображение сообщений
 */
class GameStateManager extends DisplayBase {
    /**
     * Проверяет, решен ли кроссворд
     */
    static checkCrosswordSolved() {
        const cells = document.querySelectorAll('.crossword-cell input');

        for (const input of cells) {
            const userInput = input.value.toUpperCase();
            const correctLetter = input.parentNode.dataset.correctLetter;

            if (userInput !== correctLetter) {
                return false;
            }
        }

        // Отображаем сообщение об успехе
        this.displaySuccessMessage();
        return true;
    }

    /**
     * Отображает сообщение об ошибке
     * @param {string} message - Сообщение об ошибке
     */
    static displayError(message) {
        if (elements.crosswordContainer) {
            elements.crosswordContainer.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    /**
     * Отображает сообщение об успехе
     */
    static displaySuccessMessage() {
        // Используем метод clearGameField из базового класса
        this.clearGameField();

        const successMessage = document.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.innerHTML = `
            <h2>Поздравляем!</h2>
            <p>Вы успешно решили кроссворд!</p>
        `;

        if (elements.crosswordContainer) {
            elements.crosswordContainer.appendChild(successMessage);
        }
    }
}

/**
 * Класс для управления пользовательским интерфейсом
 */
class UIUtils {
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
        const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
        inputTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.toggleInputs());
        });
        this.toggleInputs();
    }

    /**
     * Переключение видимости полей ввода
     */
    static toggleInputs() {
        const selectedTypeElement = document.querySelector('input[name="inputType"]:checked');
        
        if (selectedTypeElement) {
            const selectedType = selectedTypeElement.value;
            
            elements.documentTextarea.style.display = selectedType === 'text' ? 'block' : 'none';
            elements.fileUploadInput.style.display = selectedType === 'file' ? 'block' : 'none';
            elements.topicInput.style.display = selectedType === 'topic' ? 'block' : 'none';
        }
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

class WordSoupDisplay extends DisplayBase {
    constructor(gameData) {
        super();
        this.gameData = gameData;
        this.selectedCells = [];
        this.isSelecting = false;
        this.foundWords = new Set();
        this.currentDirection = null; // Добавляем свойство для хранения текущего направления
        this.setupEventListeners();
    }

    /**
     * Отображает игровое поле с супом из слов
     */
    display() {
        DisplayBase.clearGameField();
        this.createGrid();
        this.displayClues();
    }

    /**
     * Отображает подсказки
     */
    displayClues() {
        CluesDisplay.displayWordSoupClues(this.gameData.words);
    }

    /**
     * Создает сетку игры
     */
    createGrid() {
        const container = DisplayBase.createElement('div', { className: 'word-soup-container' });
        const table = DisplayBase.createElement('table', { className: 'word-soup-grid' });
        
        // Вычисляем размер ячейки на основе размера сетки
        const gridSize = this.gameData.gridSize || 20;
        const cellSize = Math.max(30, Math.min(40, Math.floor(window.innerWidth * 0.8 / gridSize))); // Адаптивный размер
        
        this.gameData.grid.forEach((row, rowIndex) => {
            const tr = DisplayBase.createElement('tr', {}, '', table);
            
            row.forEach((cell, colIndex) => {
                const td = DisplayBase.createElement('td', {
                    className: 'word-soup-cell',
                    'data-row': rowIndex,
                    'data-col': colIndex,
                    'data-letter': cell,
                    style: `width: ${cellSize}px; height: ${cellSize}px; font-size: ${Math.floor(cellSize * 0.6)}px;`
                }, cell, tr);

                td.addEventListener('mousedown', () => this.startSelection(td));
                td.addEventListener('mouseover', () => this.continueSelection(td));
                td.addEventListener('mouseup', () => this.endSelection());
            });
        });

        
        container.appendChild(table);
        elements.crosswordContainer.appendChild(container);
    }
        

    /**
     * Начинает выделение слова
     */
    startSelection(cell) {
        this.isSelecting = true;
        this.selectedCells = [cell];
        this.currentDirection = null; // Сбрасываем направление
        cell.classList.add('selected');
    }

    /**
     * Продолжает выделение слова
     */
    continueSelection(cell) {
        if (!this.isSelecting) return;

        // Если ячейка уже выбрана, проверяем, не возвращается ли пользователь назад
        const cellIndex = this.selectedCells.indexOf(cell);
        if (cellIndex !== -1) {
            // Если это не последняя ячейка, значит пользователь вернулся назад
            // Удаляем все ячейки после текущей
            if (cellIndex < this.selectedCells.length - 1) {
                const removedCells = this.selectedCells.splice(cellIndex + 1);
                removedCells.forEach(removedCell => {
                    removedCell.classList.remove('selected');
                });
                // Если это первая ячейка, сбрасываем направление
                if (this.selectedCells.length === 1) {
                    this.currentDirection = null;
                }
            }
            return;
        }

        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        const isAdjacent = this.isAdjacentCell(lastCell, cell);

        if (isAdjacent) {
            this.selectedCells.push(cell);
            cell.classList.add('selected');
        }
    }

    /**
     * Заканчивает выделение и проверяет слово
     */
    endSelection() {
        if (!this.isSelecting || this.selectedCells.length === 0) return;

        const selectedWord = this.getSelectedWord();
        const reversedWord = selectedWord.split('').reverse().join('');
        
        const foundWord = this.gameData.words.find(w => {
            const cleanWord = w.word.toUpperCase().replace(/\s+/g, '');
            return cleanWord === selectedWord || cleanWord === reversedWord;
        });

        if (foundWord && !this.foundWords.has(foundWord.word)) {
            this.foundWords.add(foundWord.word);
            
            this.selectedCells.forEach(cell => {
                cell.classList.remove('selected', 'incorrect');
                cell.classList.add('found');
            });

            const wordElement = document.querySelector(`[data-word="${foundWord.word}"]`);
            if (wordElement) {
                wordElement.classList.add('found');
            }

            if (this.foundWords.size === this.gameData.words.length) {
                setTimeout(() => this.showVictoryMessage(), 500);
            }
        } else {
            this.selectedCells.forEach(cell => {
                if (!cell.classList.contains('found')) {
                    cell.classList.remove('selected');
                    cell.classList.add('incorrect');
                    
                    setTimeout(() => {
                        cell.classList.remove('incorrect');
                    }, 500);
                }
            });
        }

        this.selectedCells = [];
        this.isSelecting = false;
        this.currentDirection = null; // Сбрасываем направление
    }

    /**
     * Получает выбранное слово из выделенных ячеек
     */
    getSelectedWord() {
        return this.selectedCells
            .map(cell => cell.getAttribute('data-letter'))
            .join('')
            .toUpperCase(); // Приводим к верхнему регистру для сравнения
    }

    /**
     * Проверяет, являются ли ячейки соседними и соответствуют ли направлению
     */
    isAdjacentCell(cell1, cell2) {
        const row1 = parseInt(cell1.getAttribute('data-row'));
        const col1 = parseInt(cell1.getAttribute('data-col'));
        const row2 = parseInt(cell2.getAttribute('data-row'));
        const col2 = parseInt(cell2.getAttribute('data-col'));

        // Если это вторая ячейка в выделении, устанавливаем направление
        if (this.selectedCells.length === 1) {
            this.currentDirection = this.getDirection(row1, col1, row2, col2);
        }

        // Если направление уже установлено, проверяем соответствие
        if (this.selectedCells.length > 1) {
            const isInDirection = this.isInCurrentDirection(row1, col1, row2, col2);
            if (!isInDirection) return false;
        }

        return true;
    }

    /**
     * Определяет направление между двумя ячейками
     */
    getDirection(row1, col1, row2, col2) {
        const rowDiff = row2 - row1;
        const colDiff = col2 - col1;

        // Горизонтальное направление
        if (rowDiff === 0 && Math.abs(colDiff) === 1) {
            return { rowStep: 0, colStep: Math.sign(colDiff) };
        }
        // Вертикальное направление
        else if (colDiff === 0 && Math.abs(rowDiff) === 1) {
            return { rowStep: Math.sign(rowDiff), colStep: 0 };
        }
        // Диагональное направление (вправо-вниз или влево-вниз)
        else if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
            return { rowStep: Math.sign(rowDiff), colStep: Math.sign(colDiff) };
        }

        return null;
    }

    /**
     * Проверяет, соответствует ли новая ячейка текущему направлению
     */
    isInCurrentDirection(row1, col1, row2, col2) {
        if (!this.currentDirection) return false;

        const expectedRow = row1 + this.currentDirection.rowStep;
        const expectedCol = col1 + this.currentDirection.colStep;

        return row2 === expectedRow && col2 === expectedCol;
    }

    /**
     * Показывает сообщение о победе
     */
    showVictoryMessage() {
        const message = DisplayBase.createElement('div', {
            className: 'victory-message'
        }, 'Поздравляем! Вы нашли все слова!');

        elements.crosswordContainer.appendChild(message);
    }

    /**
     * Показывает ответ для конкретного слова
     */
    showAnswer(word) {
        // Находим все ячейки, содержащие буквы этого слова
        const cells = Array.from(document.querySelectorAll('.grid-cell'))
            .filter(cell => {
                const row = parseInt(cell.getAttribute('data-row'));
                const col = parseInt(cell.getAttribute('data-col'));
                return this.gameData.grid[row][col].words.includes(word);
            });

        // Подсвечиваем ячейки
        cells.forEach(cell => {
            cell.classList.add('highlighted');
        });

        // Убираем подсветку через 2 секунды
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('highlighted');
            });
        }, 2000);

        // Обновляем элемент в списке слов
        const wordItem = document.querySelector(`[data-word="${word}"]`);
        if (wordItem) {
            const button = wordItem.querySelector('.show-answer-button');
            if (button) {
                button.remove();
            }
        }
    }

    /**
     * Настраивает обработчики событий
     */
    setupEventListeners() {
        // Отключаем выделение при выходе за пределы сетки
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
}


class App extends Component {
  constructor(props) {
    super(props);
    this.crosswordFormRef = createRef();
    this.gameTypeRef = createRef();
    this.inputTypeRef = createRef();
    this.documentTextRef = createRef();
    this.totalWordsRef = createRef();
    this.topicRef = createRef();
    this.fileInputRef = createRef();
    this.crosswordContainerRef = createRef();
    this.cluesContainerRef = createRef();
  }

    // Инициализация обработчиков событий
    componentDidMount() {
        UIUtils.initialize();
        // Инициализация объекта elements
        elements.inputTypeSelect = document.querySelector('input[name="inputType"]:checked');
        elements.documentTextarea = this.documentTextRef.current;
        elements.totalWordsInput = this.totalWordsRef.current;
        elements.topicInput = this.topicRef.current;
        elements.fileUploadInput = this.fileInputRef.current;
        elements.crosswordForm = this.crosswordFormRef.current;
        elements.gameTypeSelect = document.querySelector('input[name="gameType"]:checked');
        elements.crosswordContainer = this.crosswordContainerRef.current;
        elements.cluesContainer = this.cluesContainerRef.current;
    }

  handleSubmit = async (event) => {
    event.preventDefault();
    // Получение значений из формы
    const gameType = document.querySelector('input[name="gameType"]:checked').value;
    const inputType = document.querySelector('input[name="inputType"]:checked');
    const documentText = this.documentTextRef.current.value;
    const totalWords = parseInt(this.totalWordsRef.current.value);
    const topic = this.topicRef.current.value;
    const fileInput = this.fileInputRef.current;
    // Валидация введенных данных
    if (inputType === '') {
        return UIUtils.showError('Выберите тип ввода.');
    }
    if (inputType === 'text' && documentText.trim() === '') {
        return UIUtils.showError('Введите текст.');
    }

    if (inputType === 'topic' && topic.trim() === '') {
        return UIUtils.showError('Введите тему.');
    }

    if (inputType === 'file' && !fileInput.files.length) {
        return UIUtils.showError('Выберите файл.');
    }

    if (isNaN(totalWords) || totalWords < 1) {
        return UIUtils.showError('Введите корректное количество слов (больше 0).');
    }

    // Показываем индикатор загрузки
    DisplayBase.displayLoadingIndicator();

    try {
        // Отправка данных на сервер
        const formData = new FormData(event.target);
        const response = await axios.post('http://localhost:8089/generate-game', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Отображение игры в зависимости от выбранного типа
        if (gameType === 'wordsoup') {
            if (response.data.grid && response.data.words) {
                const display = new WordSoupDisplay(response.data);
                display.display();
            } else {
                UIUtils.showError('Не удалось получить данные для игры');
            }
        } else {
            if (response.data.crossword && response.data.layout.result) {
                CrosswordDisplay.displayCrossword(response.data.crossword, response.data.layout.result);
            } else {
                UIUtils.showError('Не удалось получить данные кроссворда');
            }
        }
    } catch (error) {
        console.error(error);
        if (error.response?.data?.error) {
            UIUtils.showError(error.response.data.error);
        } else {
            UIUtils.showError("Произошла ошибка при генерации игры. Пожалуйста, попробуйте снова.");
        }
    } finally {
        DisplayBase.hideLoadingIndicator();
    }
  }

  render() {
    return (
      <main> 
        <div className="container">
          <form id="crossword-form" encType='multipart/form-data'
            onSubmit={this.handleSubmit} ref={this.crosswordFormRef}>
            <label htmlFor="game-type">Тип игры:</label>
            <div id="game-type">
                <label>
                    <input type="radio" name="gameType" value="crossword" ref={this.gameTypeRef} onChange={this.cccc}/> Кроссворд
                </label>
                <label>
                    <input type="radio" name="gameType" value="wordsoup" ref={this.gameTypeRef} onChange={this.cccc}/> Суп из слов
                </label>
            </div>
    
  
            {/*<label htmlFor="input-type">Тип ввода:</label>
            <select id="input-type" name="inputType" ref={this.inputTypeRef}> 
              <option value="">Не выбрано</option> 
              <option value="text">Текст</option>
              <option value="file">Файл</option>
              <option value="topic">Тема</option>
            </select>*/}

            <label htmlFor="input-type">Тип ввода:</label>
            <div id="input-type">
                <label>
                    <input type="radio" name="inputType" value="text" ref={this.inputTypeRef} /> Текст
                </label>
                <label>
                    <input type="radio" name="inputType" value="file" ref={this.inputTypeRef} /> Файл
                </label>
                <label>
                    <input type="radio" name="inputType" value="topic" ref={this.inputTypeRef} /> Тема
                </label>
            </div>
  
            <textarea id="document" ref={this.documentTextRef} name="text" placeholder="Вставьте текст..."  style={{ display: 'none' }}></textarea>
            <input type="file" id="file-upload" ref={this.fileInputRef} name="file-upload"  style={{ display: 'none' }}/>
            <input type="text" id="topic" ref={this.topicRef} name="topic" placeholder="Введите тему кроссворда"  style={{ display: 'none' }}/>
  
            <label htmlFor="total-words">Общее количество слов:</label>
            <input type="number" ref={this.totalWordsRef} id="total-words" name="totalWords" max="20" min="5"/>
            <button type="submit">Сгенерировать игру</button>
            <div id="crossword-container" ref={this.crosswordContainerRef}></div>
            <div id="clues-container" ref={this.cluesContainerRef}></div> 
          </form>
        </div>
      </main>
    );
  }
  
}

export default App;

