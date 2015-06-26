/**
 * Created by Aleksandr Pashnin
 */
"use strict";

class Slider {

   constructor() {
      this.autoSwitchInterval  = 3000;
      this.animatingContainers = [];
      this.timers              = [];
   }

   /**
    * Проверяет возожможно ли выполнить переключение слайда в конкретном контейнере.
    * @param slider - HTMLElement, в котором располагаются слайды
    * @returns {boolean} - true, если переключение возможно. Если переключение уже выполняется, то
    * возвращается false
    */
   canAnimate(slider) {
      var element             = $(slider)[0],
          animatingContainers = this.animatingContainers;

      for (var i = 0; i < animatingContainers.length; i++) {
         if (animatingContainers[i] === element) {
            return false;
         }
      }

      return true;
   } // -> end canAnimate


   /**
    * Устанавливает состояние анимации для указанного слайдера
    * @param slider - jQuery Element
    * @param state - состояние:
    *    true - в слайдере выполняется переключение слайда
    *    false - анимация закончена
    */
   setAnimationState(slider, state) {
      var element             = $(slider)[0],
          animatingContainers = this.animatingContainers;

      if (state) {
         animatingContainers.push(element);
      } else {
         animatingContainers.splice(animatingContainers.indexOf(element), 1);
      }
   } // -> end setAnimationState


   /**
    * Функция сохраняет в специальном внутреннем контейнере идентификаторы таймеров
    * для каждого слайдера
    * @param slider - jQuery Element
    * @param timerID {number}
    */
   setTimerID(slider, timerID) {

      var element = $(slider)[0],
          timers  = this.timers;

      // Функция ищет индекс элемента, в котором хранится инденификатор таймера
      // для указанного слайдера
      function indexOf() {
         for (var i = 0; i < timers.length; i++) {
            if (timers[i]['element'] === element) {
               return i;
            }
         }

         return -1;
      }

      var index = indexOf();
      // Если инденификатор таймера указан, то необходимо его сохранить
      if (timerID) {
         // Если для слайдера уже ранее запускался обработчик setInterval, то
         // необходимо его отключить, после чего записать новый идентификатор
         if (index > - 1) {
            clearInterval(timers[index]['timerID']);
            timers[index]['timerID'] = timerID;
         // В противном случае добавляем новый объект с информацией в массив
         } else {
            timers.push({'element': element, 'timerID': timerID});
         }

      // Если идентификатор не указан, то необходимо отключить обработчик setInterval
      // для указанного слайдера
      } else {
         if (index > -1) {
            clearInterval(timers[index]['timerID']);
            timers.splice(index, 1);
         }
      }
   } // -> end setTimerID


   /**
    * Функция возвращает элементы, ближайший parentSelector которых указанный container
    *
    * Необходима для выбора только тех элементов, которые находятся непосредственно в
    * указанном контейнере, без учета аналогичных вложенных контейнеров
    *
    * Например, когда требуется выбрать все слайды конкретного слайдера, без учета
    * слайдов, которые лежат во вложенном слайдере
    * */
   getChildElements(container, parentSelector, childrenSelector) {
      return container.find(childrenSelector).filter(function() {
         return $(this).closest(parentSelector)[0] === container[0];
      });
   }


   /**
    * Инициализация работы объекта
    */
   init() {

      this.createToggles();
      this.createControls();
      this.runAutoSwitch();

      $('.adaptive-slider__controls-button').on('click', {self: this}, this.onControlClick);
      $('.adaptive-slider__toggle').on('click', {self: this}, this.onToggleClick);
   }


   /**
    * Создает переключатели для навигации по слайдам
    */
   createToggles() {

      var sliders      = $('.adaptive-slider'),
          toggleMarkup = '<li class="adaptive-slider__toggle"></li>';

      // Создаем переключатели для каждого слайдера
      var self = this;
      sliders.each(function() {

         var $slider    = $(this),
             useToggles = $slider.data("toggles");
         if (!useToggles) return;

         var slides           = self.getChildElements($slider, '.adaptive-slider', '.adaptive-slider__item'),
             togglesContainer = self.getChildElements($slider, '.adaptive-slider', '.adaptive-slider__toggles');

         for (var i = 0; i < slides.length; i++) {
            togglesContainer.append(toggleMarkup);
         }

         self.setActiveToggle(togglesContainer);

      }); // -> end sliders.each(...)

   } // -> end createToggles()


   /**
    * Делает активным переключатель, соответствующий индексу активного слайда
    * @param togglesContainer - ul, в котором находятся переключатели
    */
   setActiveToggle(togglesContainer) {

      var slider  = togglesContainer.closest('.adaptive-slider'),
          slides  = this.getChildElements(slider, '.adaptive-slider', '.adaptive-slider__item'),
          toggles = togglesContainer.find('.adaptive-slider__toggle');

      toggles.eq(slides.filter('.adaptive-slider__item--active').index())
         .addClass('adaptive-slider__toggle--active')
         .siblings()
         .removeClass('adaptive-slider__toggle--active');

   } // -> end setActiveToggle()


   /**
    * Создает кнопки для навигации по слайдам вперед-назад
    */
   createControls() {

      var sliders        = $('.adaptive-slider'),
          controlsMarkup = '\
               <div class="adaptive-slider__controls-button adaptive-slider__controls-button--next">&gt</div> \
               <div class="adaptive-slider__controls-button adaptive-slider__controls-button--prev">&lt</div>';

      // Создаем кнопки для каждого слайдера
      var self = this;
      sliders.each(function() {

         var $slider     = $(this),
             useControls = $slider.data("controls");

         if (!useControls) return;

         var controlsContainer = self.getChildElements($slider, '.adaptive-slider', '.adaptive-slider__controls');
         controlsContainer.append(controlsMarkup);

      }); // -> end sliders.each()

   } // -> end createControls()

   /**
    * Функция выполняет запуск функции автоматического пролистывания слайдов у тех
    * слайдеров, у которых данная настройка включена
    */
   runAutoSwitch() {

      var sliders = $('.adaptive-slider');

      // Запускаем обработчики для каждого слайдера
      var self = this;
      sliders.each(function() {

         var $slider       = $(this),
             useAutoSwitch = $slider.data("autoswitch");

         if (useAutoSwitch) {
            self.setAutoSwitch($slider, true);
         }

      }); // end sliders.each()

   } // -> end runAutoSwitch


   /**
    * Функция выполняет подключение функции для автоматического перелистывания слайдов
    * с указанной периодичностью
    * @param slider - jQuery Element
    * @param enable {boolean} - Если указано false, то автоматическое пролистывание отключается
    */
   setAutoSwitch(slider, enable) {

      if (enable) {

         var timerID = setInterval( () => {

            var slides      = this.getChildElements(slider, '.adaptive-slider', '.adaptive-slider__item'),
                activeSlide = slides.filter('.adaptive-slider__item--active'),
                nextSlide   = activeSlide.next(),
                firstSlide  = slides.first();

            if (nextSlide.length) {
               this.moveSlide(nextSlide, 'forward');
            } else {
               this.moveSlide(firstSlide, 'forward');
            }

         }, this.autoSwitchInterval);

         this.setTimerID(slider, timerID);

      } else {
         this.setTimerID(slider, null);
      }

   } // -> end setAutoSwitch


   /**
    * Функция сбрасывает таймер для автоматического перелистывания слайдов
    * @param slider - jQuery Element
    */
   resetTimer(slider) {

      if (slider) {
         var useAutoSwitch = slider.data("autoswitch");

         this.setAutoSwitch(slider, false);
         if (useAutoSwitch) {
            this.setAutoSwitch(slider, useAutoSwitch);
         }
      }
   } // -> end resetTimer

   /**
    * Функция выполняет перелистывание слайдов
    * @param selectedSlide - jQuery Element - Слайд, который необходимо показать
    * @param direction - Направление перелистывания
    *    'forward' - перелистывание вперед (следующий слайд)
    *    'backward' - перелистывание назад (предыдущий слайд)
    */
   moveSlide(selectedSlide, direction) {

      var slider       = selectedSlide.closest('.adaptive-slider'),
          slides       = this.getChildElements(slider, '.adaptive-slider', '.adaptive-slider__item'),
          activeSlide  = slides.filter('.adaptive-slider__item--active'),
          slideWidth   = slides.width(),
          duration     = 500,
          leftPosition = 0,
          offset       = 0;

      // Если анимация перелистывания уже выполняется, то ничего не делаем
      if (!this.canAnimate(slider)) {
         return;
      } else {
         this.setAnimationState(slider, true);
      }

      if (slides.length <= 1) return;

      if (direction === 'forward') {
         leftPosition = slideWidth;
         offset       = -slideWidth;

      } else if (direction === 'backward') {
         leftPosition = -slideWidth;
         offset       = slideWidth;
      }

      // Сдвигаем текущий активный слайд
      activeSlide.animate({left: offset}, duration);

      // Сдвигаем выбранный слайд
      var self = this;
      selectedSlide.css('left', leftPosition)
         .addClass('adaptive-slider__item--selected');
      selectedSlide.animate({left: 0}, duration, function () {

         var $this            = $(this),
             slider           = $this.closest('.adaptive-slider'),
             togglesContainer = self.getChildElements(slider, '.adaptive-slider', '.adaptive-slider__toggles');

         slides.css('left', 0)
            .removeClass('adaptive-slider__item--active');

         $this.toggleClass('adaptive-slider__item--selected adaptive-slider__item--active');

         self.setActiveToggle(togglesContainer);
         self.setAnimationState(slider, false);

      }); // -> end selectedSlide.animate()

   } // -> end moveSlide


   /**
    * Обработчик события клика по переключателю
    * @param event
    */
   onToggleClick(event) {
      event.preventDefault();

      var self = event.data.self;

      var $this         = $(this),
          container     = $this.closest('.adaptive-slider'),
          toggles       = $this.closest('.adaptive-slider__toggles').find('.adaptive-slider__toggle'),
          activeToggle  = toggles.filter('.adaptive-slider__toggle--active'),
          direction     = ($this.index() > activeToggle.index()) ? 'forward' : 'backward',
          slides        = self.getChildElements(container, '.adaptive-slider', '.adaptive-slider__item'),
          selectedSlide = slides.eq($this.index());

      if (!$this.hasClass('adaptive-slider__toggle--active')) {
         self.resetTimer(container);
         self.moveSlide(selectedSlide, direction);
      }
   }


   /**
    * Обработчик события клика по кнопке
    * @param event
    */
   onControlClick(event) {
      event.preventDefault();

      var self = event.data.self;

      var $this       = $(this),
          container   = $this.closest('.adaptive-slider'),
          slides      = self.getChildElements(container, '.adaptive-slider', '.adaptive-slider__item'),
          activeSlide = slides.filter('.adaptive-slider__item--active'),
          nextSlide   = activeSlide.next(),
          prevSlide   = activeSlide.prev(),
          firstSlide  = slides.first(),
          lastSlide   = slides.last();

      self.resetTimer(container);

      // Смотрим, на какую кнопку нажали
      if ($this.hasClass('adaptive-slider__controls-button--next')) {
         if (nextSlide.length) {
            self.moveSlide(nextSlide, 'forward');
         } else {
            self.moveSlide(firstSlide, 'forward');
         }

      } else {
         if (prevSlide.length) {
            self.moveSlide(prevSlide, 'backward');
         } else {
            self.moveSlide(lastSlide, 'backward');
         }
      }
   } // -> end onControlClick

} // -> end class Slider