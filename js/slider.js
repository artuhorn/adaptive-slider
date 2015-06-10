/**
 * Created by Aleksandr Pashnin
 */

var Slider = (function() {

   var
      canAnimate         = true,
      timerID            = 0,
      autoSwitchInterval = 3000;

   return {

      /*
      *  INIT
      * */
      init: function() {

         // Create slider toggles
         Slider.createToggles();

         // Enable auto switch
         Slider.setAutoSwitch(true);

         // Click on slider button
         $('.slider__controls-button').on('click', function(e) {
            e.preventDefault();

            Slider.resetTimer();

            var
               $this       = $(this),
               slides      = $this.closest('.slider').find('.slider__item'),
               activeSlide = slides.filter('.slider__item--active'),
               nextSlide   = activeSlide.next(),
               prevSlide   = activeSlide.prev(),
               firstSlide  = slides.first(),
               lastSlide   = slides.last();

            if ($this.hasClass('slider__controls-button--next')) {
               if (nextSlide.length) {
                  Slider.moveSlide(nextSlide, 'forward');
               } else {
                  Slider.moveSlide(firstSlide, 'forward');
               }

            } else {
               if (prevSlide.length) {
                  Slider.moveSlide(prevSlide, 'backward');
               } else {
                  Slider.moveSlide(lastSlide, 'backward');
               }
            }

         }); // -> end click on slider button


         // Click on toggle
         $('.slider__toggle').on('click', function(e) {
            e.preventDefault();

            var
               $this         = $(this),
               toggles       = $this.closest('.slider__toggles').find('.slider__toggle'),
               activeToggle  = toggles.filter('.slider__toggle--active'),
               direction     = ($this.index() > activeToggle.index()) ? 'forward' : 'backward',
               selectedSlide = $this.closest('.slider').find('.slider__item').eq($this.index());

            if (!$this.hasClass('slider__toggle--active')) {
               Slider.resetTimer();
               Slider.moveSlide(selectedSlide, direction);
            }

         }); // -> end click on toggle

      }, // -> end init


      /*
      * MOVE SLIDE
      * */
      moveSlide: function(selectedSlide, direction) {

         if (!canAnimate) return;

         canAnimate = false;

         var
            container    = selectedSlide.closest('.slider'),
            slides       = container.find('.slider__item'),
            activeSlide  = slides.filter('.slider__item--active'),
            slideWidth   = slides.width(),
            duration     = 500,
            leftPosition = 0,
            offset       = 0;

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
            var $this = $(this);

            slides
               .css('left', 0)
               .removeClass('slider__item--active');

            $this.toggleClass('slider__item--selected slider__item--active');

            Slider.setActiveToggle(container.find('.slider__toggles'));

            canAnimate = true;

         });

      }, // -> end moveSlide


      /*
      * CREATE TOGGLES
      * */
      createToggles: function() {

         var container = $('.slider');

         var toggleMarkup = '<li class="slider__toggle"></li>';

         container.each(function() {
            var
               $this            = $(this),
               slides           = $this.find('.slider__item'),
               togglesContainer = $this.find('.slider__toggles');

            for (var i = 0; i < slides.length; i++) {
               togglesContainer.append(toggleMarkup);
            }

            Slider.setActiveToggle(togglesContainer);

         }); // -> end each

      }, // -> end createToggles


      /*
      * SET ACTIVE TOGGLE
      * */
      setActiveToggle: function(togglesContainer) {

         var slides = togglesContainer.closest('.slider').find('.slider__item');

         togglesContainer
            .find('.slider__toggle')
            .eq(slides.filter('.slider__item--active').index())
            .addClass('slider__toggle--active')
            .siblings()
            .removeClass('slider__toggle--active');

      }, // -> end setActiveToggle


      /*
      * SET AUTO SWITCH
      * */
      setAutoSwitch: function(enable) {

         if (enable) {
            timerID = setInterval(function () {
               var
                  slides      = $('.slider__list .slider__item'),
                  activeSlide = slides.filter('.slider__item--active'),
                  nextSlide   = activeSlide.next(),
                  firstSlide  = slides.first();

               if (nextSlide.length) {
                  Slider.moveSlide(nextSlide, 'forward');
               } else {
                  Slider.moveSlide(firstSlide, 'forward');
               }

            }, autoSwitchInterval);

         } else {
            if (timerID) clearInterval(timerID);
         }

      }, // -> end setAutoSwitch

      /*
      * RESET TIMER
      * */
      resetTimer: function() {
         if (timerID) {
            Slider.setAutoSwitch(false);
            Slider.setAutoSwitch(true);
         }
      } // -> end resetTimer
   }

}());


$(document).ready(function() {

   if ($('.slider').length) {
      Slider.init();
   }

});