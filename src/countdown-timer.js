'use strict';

/**
 * @module @10up/CountdownTimer
 *
 * @description
 *
 * A description goes here.
 *
 * [Link to demo]{@link https://10up.github.io/wp-component-library/}
 */
export default class CountdownTimer {

	/**
	 * 
	 * @param {string}   element          Selector for target elements to receive a countdown timer.
	 * @param {object}   options          (Optional) Object containing options.
	 * @param {function} options.onCreate (Optional) Callback function to invoke after all countdown timers on the page have been created.
	 * @param {function} options.onTick   (Optional) Callback function to invoke each time a countdown timer updates its time.
	 */
	constructor( element, options = {} ) {
		
		const defaults = {
			onCreate: null,
			onTick: null
		};

		this.settings = Object.assign( {}, defaults, options );

		this.$timers = Array.prototype.slice.call( document.querySelectorAll( '.countdown-timer' ) );

		if ( ! element || 0 === this.$timers.length ) {
			console.error( '10up Countdown Timer: Target not found. Please provide a valid target selector.' ); // eslint-disable-line
			return;
		}

		this.$timers.forEach( ( timer ) => {
			this.createTimer( timer );
		} );

		/**
		 * Called after all countdown timers are initialized.
		 * @callback onCreate
		 */
		if ( this.settings.onCreate && 'function' === typeof this.settings.onCreate ) {
			this.settings.onCreate.call();
		}
	}

	/**
	 * Set up a countdown timer.
	 * 
	 * @param {object} timer HTML element for this timer.
	 * @returns null
	 */
	createTimer( timer ) {
		let time = new Date( timer.getAttribute( 'datetime' ) ).getTime();

		if ( ! time || isNaN( time ) ) {
			console.error( '10up Countdown Timer: Time not found. Each countdown timer must have a datetime attribute with a valid date string. See https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats for details on how to build a valid date string.' ); // eslint-disable-line
			time = new Date().getTime();
		}

		this.createElements( timer, time );
	}

	/**
	 * Create child elements for a tiemr.
	 * 
	 * @param {object} timer HTML element for this timer.
	 * @param {number} time  Time to count down to in UNIX time.
	 * @returns void
	 */
	createElements( timer, time ) {
		const days = document.createElement( 'span' );
		const hours = document.createElement( 'span' );
		const minutes = document.createElement( 'span' );
		const seconds = document.createElement( 'span' );
		const fragment = document.createDocumentFragment();

		days.className = 'days';
		days.setAttribute( 'aria-label', 'days' );

		hours.className = 'hours';
		hours.setAttribute( 'aria-label', 'hours' );

		minutes.className = 'minutes';
		minutes.setAttribute( 'aria-label', 'minutes' );

		seconds.className = 'seconds';
		seconds.setAttribute( 'aria-label', 'seconds' );
		
		fragment.appendChild( days );
		fragment.appendChild( hours );
		fragment.appendChild( minutes );
		fragment.appendChild( seconds );

		timer.appendChild( fragment );

		this.startTimer( time, days, hours, minutes, seconds );
	}

	/**
	 * Start updating the display for the given timer elements.
	 * 
	 * @param {number} time    Time to count down to in UNIX time.
	 * @param {object} days    HTML element to display remaining days.
	 * @param {object} hours   HTML element to display remaining hours.
	 * @param {object} minutes HTML element to display remaining minutes.
	 * @param {object} seconds HTML element to display remaining seconds.
	 */
	startTimer( time, days, hours, minutes, seconds ) {
		let interval;

		const updateTime = () => {
			const now = new Date().getTime();
			const diff = time - now;
			const parsedDiff = this.formatDiff( diff );

			if ( 0 >= diff ) {
				days.textContent = '00';
				hours.textContent = '00';
				minutes.textContent = '00';
				seconds.textContent = '00';

				if ( interval ) {
					window.clearInterval( interval );
				}

				return;
			}

			days.textContent = parsedDiff[0];
			days.setAttribute( 'aria-label', parsedDiff[0] + ' days' );

			hours.textContent = parsedDiff[1];
			hours.setAttribute( 'aria-label', parsedDiff[1] + ' hours' );

			minutes.textContent = parsedDiff[2];
			minutes.setAttribute( 'aria-label', parsedDiff[2] + ' minutes' );

			seconds.textContent = parsedDiff[3];
			seconds.setAttribute( 'aria-label', parsedDiff[3] + ' seconds' );

			/**
			 * Called after the current countdown timer updates.
			 * @callback onTick
			 */
			if ( this.settings.onTick && 'function' === typeof this.settings.onTick ) {
				this.settings.onTick.call();
			}
		};

		updateTime();

		interval = window.setInterval( updateTime, 1000 );
	}

	/**
	 * Calculate the number of days, hours, minutes, and seconds from the given milleseconds.
	 * 
	 * @param {number} milliseconds Number of milleseconds remaining in the countdown.
	 */
	formatDiff( milliseconds ) {
		let msPerDay = 24 * 60 * 60 * 1000,
			msPerHour = 60 * 60 * 1000,
			msPerMinute = 60 * 1000,
			msPerSecond = 1000,
			days = Math.floor( milliseconds / msPerDay ),
			hours = Math.floor( ( milliseconds - days * msPerDay ) / msPerHour ),
			minutes = Math.round( ( milliseconds - days * msPerDay - hours * msPerHour ) / msPerMinute ),
			seconds = Math.round( ( milliseconds - days * msPerDay - hours * msPerHour - minutes * msPerMinute ) / msPerSecond ),
			pad = function ( n ) { return 10 > n ? '0' + n : n; };

		if ( 0 > seconds ) {
			minutes --;
			seconds = seconds + 60;
		}

		if ( 60 === minutes ) {
			hours ++;
			minutes = 0;
		}

		if ( 24 === hours ) {
			days ++;
			hours = 0;
		}

		return [ pad( days ), pad( hours ), pad( minutes ), pad( seconds ) ];
	}

}
