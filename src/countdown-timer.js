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
			onTick: null,
			compact: false,
			allowNegative: true,
			padValues: false,
			allowedIntervals: {
				years: true,
				weeks: true,
				days: true,
				hours: true,
				minutes: true,
				seconds: true
			}
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

		timer.textContent = '';

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
		const span = document.createElement( 'span' );
		const years = span.cloneNode();
		const weeks = span.cloneNode();
		const days = span.cloneNode();
		const hours = span.cloneNode();
		const minutes = span.cloneNode();
		const seconds = span.cloneNode();
		const fragment = document.createDocumentFragment();

		years.className = 'years';
		years.setAttribute( 'aria-label', 'years' );

		weeks.className = 'weeks';
		weeks.setAttribute( 'aria-label', 'weeks' );

		days.className = 'days';
		days.setAttribute( 'aria-label', 'days' );

		hours.className = 'hours';
		hours.setAttribute( 'aria-label', 'hours' );

		minutes.className = 'minutes';
		minutes.setAttribute( 'aria-label', 'minutes' );

		seconds.className = 'seconds';
		seconds.setAttribute( 'aria-label', 'seconds' );

		if ( this.settings.allowedIntervals.years ) {
			fragment.appendChild( years );
			fragment.append( ' ' );
		}

		if ( this.settings.allowedIntervals.weeks ) {
			fragment.appendChild( weeks );
			fragment.append( ' ' );
		}

		if ( this.settings.allowedIntervals.days ) {
			fragment.appendChild( days );
			fragment.append( ' ' );
		}

		if ( this.settings.allowedIntervals.hours ) {
			fragment.appendChild( hours );
			fragment.append( ' ' );
		}

		if ( this.settings.allowedIntervals.minutes ) {
			fragment.appendChild( minutes );
			fragment.append( ' ' );
		}

		if ( this.settings.allowedIntervals.seconds ) {
			fragment.appendChild( seconds );
		}

		timer.appendChild( fragment );

		this.startTimer( timer, time, [ years, weeks, days, hours, minutes, seconds ] );
	}

	/**
	 * Start updating the display for the given timer elements.
	 * 
	 * @param {object} timer     HTML element for this timer.
	 * @param {number} time      Time to count down to in UNIX time.
	 * @param {array}  intervals Array of HTML elements for intervals to display.
	 */
	startTimer( timer, time, intervals ) {

		/**
		 * Update the timer display every second.
		 */
		const updateTime = () => {
			const [ years, weeks, days, hours, minutes, seconds ] = intervals;
			const now = new Date().getTime();
			const diff = time - now;
			const parsedDiff = this.formatDiff( diff );
			const [ y, w, d, h, m, s ] = parsedDiff;
			let highestNonzero;

			// If compact option is enabled.
			if ( this.settings.compact ) {
				// Find the highest non-zero value.
				parsedDiff.find( ( remaining, index ) => {
					if ( 0 < remaining ) {
						highestNonzero = index;
						return remaining;
					}
				} );

				// Hide all elements except the highest non-zero value.
				if ( undefined !== highestNonzero ) {
					intervals.forEach( ( interval, index ) => {
						if ( highestNonzero === index ) {
							if ( ! timer.contains( interval ) ) {
								timer.appendChild( interval );
							}
						} else {
							timer.contains( interval ) && timer.removeChild( interval );
						}
					} );
				}
			}

			// If negative values are not allowed and the time is in the past, set everything to show 0.
			if ( 0 >= diff && ! this.settings.allowNegative ) {
				days.textContent = '00';
				hours.textContent = '00';
				minutes.textContent = '00';
				seconds.textContent = '00';

				if ( interval ) {
					window.clearInterval( interval );
				}

				return;
			}

			this.updateDisplay( timer, years, y, 'year' );
			this.updateDisplay( timer, weeks, w, 'week' );
			this.updateDisplay( timer, days, d, 'day' );
			this.updateDisplay( timer, hours, h, 'hour' );
			this.updateDisplay( timer, minutes, m, 'minute' );
			this.updateDisplay( timer, seconds, s, 'second' );

			/**
			 * Called after the current countdown timer updates.
			 * @callback onTick
			 */
			if ( this.settings.onTick && 'function' === typeof this.settings.onTick ) {
				this.settings.onTick.call( this, {
					element: timer,
					time,
					remaining: diff,
					isNegative: 0 > diff,
					days: parseInt( d ),
					hours: parseInt( h ),
					minutes: parseInt( m ),
					seconds: parseInt( s )
				} );
			}
		};

		updateTime();

		const interval = window.setInterval( updateTime, 1000 );
	}

	/**
	 * Calculate the number of days, hours, minutes, and seconds from the given milliseconds.
	 * 
	 * @param {number} milliseconds Number of milliseconds remaining in the countdown.
	 */
	formatDiff( milliseconds ) {
		const msPerYear = 52 * 7 * 24 * 60 * 60 * 1000;
		const msPerWeek = 7 * 24 * 60 * 60 * 1000;
		const msPerDay = 24 * 60 * 60 * 1000;
		const msPerHour = 60 * 60 * 1000;
		const msPerMinute = 60 * 1000;
		const msPerSecond = 1000;
		
		/**
		 * Check if given number `n` is less than 10, and pad with a leading zero if so.
		 * 
		 * @param {number} n Number to pad.
		 */
		const pad = ( n ) => {
			if ( this.settings.padValues ) {
				return 10 > n ? `0${ n }` : n;
			} else {
				return n;
			}
		};

		const years = Math.floor( Math.abs( milliseconds ) / msPerYear ),
			weeks = Math.floor( Math.abs( milliseconds ) % msPerYear / msPerWeek ), 
			days =  Math.floor( Math.abs( milliseconds ) % msPerWeek / msPerDay ),
			hours = Math.floor( Math.abs( milliseconds ) % msPerDay / msPerHour ),
			minutes = Math.floor( Math.abs( milliseconds ) % msPerHour / msPerMinute ),
			seconds = Math.floor( Math.abs( milliseconds ) % msPerMinute / msPerSecond );

		return [ pad( years ), pad( weeks ), pad( days ), pad( hours ), pad( minutes ), pad( seconds ) ];
	}

	/**
	 * Update the display of the given interval element, or remove it if settings allow.
	 * 
	 * @param {object} timer          HTML element for this timer.
	 * @param {object} interval       HTML element for the element to update or remove.
	 * @param {string} value          String value to display in the interval element.
	 * @param {string} label          String value to display as the interval label.
	 */
	updateDisplay( timer, interval, value, label ) {
		if ( timer.contains( interval ) ) {
			// Otherwise, update the display.
			const s = 1 < value || 0 === value ? 's' : '';

			interval.textContent = `${ value } ${ label }${ s }`;
			interval.setAttribute( 'aria-label', `${ value } ${ label }${ s }` );
		}
	}
}
