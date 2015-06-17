/**
 * Created by Aleksandr Pashnin
 */

var Slider = (function() {

   var
      autoSwitchInterval  = 3000,
      animatingContainers = [],
      timers              = [];

   /*
    *  CAN ANIMATE
    * */
   function canAnimate(container) {
      var element = $(container)[0];
      for (var i = 0; i < animatingContainers.length; i++) {
         if (animatingContainers[i] === element) {
            return false;
         }
      }

      return true;
   }

   /*
    *  SET ANIMATION STATE
    * */
   function setAnimationState(container, isAnimation) {
      var element = $(container)[0];
      if (isAnimation) {
         animatingContainers.push(element);
      } else {
         animatingContainers.splice(animatingContainers.indexOf(element), 1);
      }
   }

   /*
    *  SET TIMER ID
    * */
   function setTimerID(container, timerID) {

      var element = $(container)[0];

      function indexOf() {
         for (var i = 0; i < timers.length; i++) {
            if (timers[i][0] === element) {
               return i;
            }
         }

         return -1;
      }

      var index = indexOf();
      if (timerID) {
         // Set timer id
         if (index > - 1) {
            clearInterval(timers[index][1]);
            timers[index][1] = timerID;

         } else {
            timers.push([element, timerID]);
         }

      } else {
         // Clear interval
         if (index > -1) {
            clearInterval(timers[index][1]);
            timers.splice(index, 1);
         }
      }
   }


   return {

      /*
      *  INIT
      * */
      init: function() {

         // Create slider toggles
         Slider._createToggles();

         // Create slider arrows
         Slider._createControls();

         // Run auto switch for each slider on page
         Slider._runAutoSwitch();

         // Click on controls
         $('.slider__controls-button').on('click', function(e) {
            e.preventDefault();

            var
               $this       = $(this),
               container   = $this.closest('.slider'),
               slides      = container.find('.slider__item'),
               activeSlide = slides.filter('.slider__item--active'),
               nextSlide   = activeSlide.next(),
               prevSlide   = activeSlide.prev(),
               firstSlide  = slides.first(),
               lastSlide   = slides.last();

            Slider._resetTimer(container);

            if ($this.hasClass('slider__controls-button--next')) {
               if (nextSlide.length) {
                  Slider._moveSlide(nextSlide, 'forward');
               } else {
                  Slider._moveSlide(firstSlide, 'forward');
               }

            } else {
               if (prevSlide.length) {
                  Slider._moveSlide(prevSlide, 'backward');
               } else {
                  Slider._moveSlide(lastSlide, 'backward');
               }
            }

         }); // -> end click on slider button


         // Click on toggle
         $('.slider__toggle').on('click', function(e) {
            e.preventDefault();

            var
               $this         = $(this),
               container     = $this.closest('.slider'),
               toggles       = $this.closest('.slider__toggles').find('.slider__toggle'),
               activeToggle  = toggles.filter('.slider__toggle--active'),
               direction     = ($this.index() > activeToggle.index()) ? 'forward' : 'backward',
               selectedSlide = $this.closest('.slider').find('.slider__item').eq($this.index());

            if (!$this.hasClass('slider__toggle--active')) {
               Slider._resetTimer(container);
               Slider._moveSlide(selectedSlide, direction);
            }

         }); // -> end click on toggle

      }, // -> end init


      /*
      * MOVE SLIDE
      * */
      _moveSlide: function(selectedSlide, direction) {

         var
            container    = selectedSlide.closest('.slider'),
            slides       = container.find('.slider__item'),
            activeSlide  = slides.filter('.slider__item--active'),
            slideWidth   = slides.width(),
            duration     = 500,
            leftPosition = 0,
            offset       = 0;

         if (!canAnimate(container)) {
            return;
         } else {
            setAnimationState(container, true);
         }

         if (slides.length <= 1) return;

         if (direction === 'forward') {
            leftPosition = slideWidth;
            offset       = -slideWidth;

         } else if (direction === 'backward') {
            leftPosition = -slideWidth;
            offset       = slideWidth;
         }

         selectedSlide
            .css('left', leftPosition)
            .addClass('slider__item--selected');

         activeSlide.animate({left: offset}, duration);

         selectedSlide.animate({left: 0}, duration, function() {
            var
               $this        = $(this),
               container    = $this.closest('.slider');

            slides
               .css('left', 0)
               .removeClass('slider__item--active');

            $this.toggleClass('slider__item--selected slider__item--active');

            Slider._setActiveToggle(container.find('.slider__toggles'));

            setAnimationState(container, false);

         });

      }, // -> end _moveSlide


      /*
      * CREATE TOGGLES
      * */
      _createToggles: function() {

         var containers = $('.slider');

         var toggleMarkup = '<li class="slider__toggle"></li>';

         containers.each(function() {
            var
               $this            = $(this),
               slides           = $this.find('.slider__item'),
               togglesContainer = $this.find('.slider__toggles'),
               useToggles       = $this.data("toggles");

            if (!useToggles) return;

            for (var i = 0; i < slides.length; i++) {
               togglesContainer.append(toggleMarkup);
            }

            Slider._setActiveToggle(togglesContainer);

         }); // -> end each

      }, // -> end _createToggles


      /*
       * CREATE ARROWS
       * */
      _createControls: function() {

         var containers = $('.slider');

         var controlsMarkup = '\
            <div class="slider__controls-button slider__controls-button--next">&gt</div> \
            <div class="slider__controls-button slider__controls-button--prev">&lt</div>';

         containers.each(function() {
            var
               $this             = $(this),
               controlsContainer = $this.find('.slider__controls'),
               useControls       = $this.data("controls");

            if (useControls)
               controlsContainer.append(controlsMarkup);

         }); // -> end each

      }, // -> end _createControls


      /*
      * SET ACTIVE TOGGLE
      * */
      _setActiveToggle: function(togglesContainer) {

         var slides = togglesContainer.closest('.slider').find('.slider__item');

         togglesContainer
            .find('.slider__toggle')
            .eq(slides.filter('.slider__item--active').index())
            .addClass('slider__toggle--active')
            .siblings()
            .removeClass('slider__toggle--active');

      }, // -> end _setActiveToggle


      /*
       * RUN AUTO SWITCH
       * */
      _runAutoSwitch: function() {

         var containers = $('.slider');

         containers.each(function() {
            var
               $this         = $(this),
               useAutoSwitch = $this.data("autoswitch");

            if (useAutoSwitch) {
               Slider._setAutoSwitch($this, true);
            }
         }); // end each

      }, // -> end _runAutoSwitch


      /*
      * SET AUTO SWITCH
      * */
      _setAutoSwitch: function(container, enable) {

         if (enable) {
            timerID = setInterval(function (data) {

               var
                  slides      = container.find('.slider__item'),
                  activeSlide = slides.filter('.slider__item--active'),
                  nextSlide   = activeSlide.next(),
                  firstSlide  = slides.first();

               if (nextSlide.length) {
                  Slider._moveSlide(nextSlide, 'forward');
               } else {
                  Slider._moveSlide(firstSlide, 'forward');
               }

            }, autoSwitchInterval);

            setTimerID(container, timerID);

         } else {
            setTimerID(container, null);
         }

      }, // -> end _setAutoSwitch

      /*
      * RESET TIMER
      * */
      _resetTimer: function(container) {
         if (container) {
            Slider._setAutoSwitch(container, false);
            Slider._setAutoSwitch(container, true);
         }
      } // -> end _resetTimer
   }

}());


$(document).ready(function() {

   if ($('.slider').length) {
      Slider.init();
   }

});