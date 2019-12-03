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
	 * @param {object}   options          (Optional) Object containing options. See `defaults` option for possible properties/values.
	 */
	constructor( element, options = {} ) {

		const defaults = {
			onCreate: null,
			onEnd: null,
			onTick: null,
			compact: false,
			allowNegative: false,
			padValues: false,
			years: {
				allowed: true,
				singular: 'year',
				plural: 'years'
			},
			weeks: {
				allowed: true,
				singular: 'week',
				plural: 'weeks'
			},
			days: {
				allowed: true,
				singular: 'day',
				plural: 'days'
			},
			hours: {
				allowed: true,
				singular: 'hour',
				plural: 'hours'
			},
			minutes: {
				allowed: true,
				singular: 'minute',
				plural: 'minutes'
			},
			seconds: {
				allowed: true,
				singular: 'second',
				plural: 'seconds'
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
	}

	/**
	 * Set up a countdown timer.
	 * 
	 * @param {object} timer HTML element for this timer.
	 * @returns null
	 */
	createTimer( timer ) {
		let time = new Date( timer.getAttribute( 'datetime' ) ).getTime();

		// Set role="timer" for assistive technologies, if not already set.
		if ( 'timer' !== timer.getAttribute( 'role' ) ) {
			timer.setAttribute( 'role', 'timer' );
		}

		if ( ! timer.getAttribute( 'tabindex' ) ) {
			timer.setAttribute( 'tabindex', 0 );
		}

		// Set aria-atomic="true" so that when updated, the full time will always be spoken by assistive technologies.
		timer.setAttribute( 'aria-atomic', 'true' );

		// Check for a valid date string in the `datetime` attribute.
		if ( ! time || isNaN( time ) ) {
			console.error( '10up Countdown Timer: Time not found. Each countdown timer must have a datetime attribute with a valid date string. See https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats for details on how to build a valid date string.' ); // eslint-disable-line
			time = new Date().getTime();
		}

		// Clear fallback content.
		timer.textContent = '';

		/**
		 * Called after a countdown timer is initialized.
		 * @callback onCreate
		 */
		if ( this.settings.onCreate && 'function' === typeof this.settings.onCreate ) {
			this.settings.onCreate.call( this, {
				element: timer,
				time
			} );
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
		seconds.setAttribute( 'aria-hidden', 'true' ); // Seconds should not be spoken by assistive technologies unless it's the highest interval.

		if ( this.settings.years.allowed ) {
			fragment.appendChild( years );
			fragment.append( ' ' );
		}

		if ( this.settings.weeks.allowed ) {
			fragment.appendChild( weeks );
			fragment.append( ' ' );
		}

		if ( this.settings.days.allowed ) {
			fragment.appendChild( days );
			fragment.append( ' ' );
		}

		if ( this.settings.hours.allowed ) {
			fragment.appendChild( hours );
			fragment.append( ' ' );
		}

		if ( this.settings.minutes.allowed ) {
			fragment.appendChild( minutes );
			fragment.append( ' ' );
		}

		if ( this.settings.seconds.allowed ) {
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
		 * This is scoped inside startTimer so that it only has access to
		 * the setInterval function that's created within this scope.
		 */
		const updateTime = () => {
			const [ years, weeks, days, hours, minutes, seconds ] = intervals;
			const now = new Date().getTime();
			const diff = time - now;
			const isNegative = 0 > diff;
			const parsedDiff = this.formatDiff( diff, time );
			const [ y, w, d, h, m, s ] = parsedDiff;
			let highestNonzero;

			// Find the highest non-zero value.
			parsedDiff.find( ( remaining, index ) => {
				if ( 0 < remaining ) {
					highestNonzero = index;
					return remaining;
				} else if ( highestNonzero === undefined ) {

					// If the value of this interval is zero and there are no larger non-zero intervals, hide it from assistive technologies.
					intervals[index].setAttribute( 'aria-hidden', 'true' );
				}
			} );

			// If seconds are the highest non-zero interval, unhide them from assitive technologies.
			if ( highestNonzero === intervals.length - 1 ) {
				timer.setAttribute( 'aria-live', 'polite' );
				intervals[highestNonzero].setAttribute( 'aria-hidden', 'false' );
			} else {

				// Only speak timer contents aloud once per minute.
				if ( 0 === parsedDiff[5] ) {
					timer.setAttribute( 'aria-live', 'polite' );
				} else {
					timer.setAttribute( 'aria-live', 'off' );
				}
			}

			// If compact option is enabled.
			if ( this.settings.compact && undefined !== highestNonzero ) {

				// Hide all elements except the highest non-zero value.
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

			// If negative values are not allowed and the time is in the past, set everything to show 0.
			if ( 0 >= diff && ! this.settings.allowNegative ) {
				this.updateDisplay( timer, years, 0, this.settings.years );
				this.updateDisplay( timer, weeks, 0, this.settings.weeks );
				this.updateDisplay( timer, days, 0, this.settings.days );
				this.updateDisplay( timer, hours, 0, this.settings.hours );
				this.updateDisplay( timer, minutes, 0, this.settings.minutes );
				this.updateDisplay( timer, seconds, 0, this.settings.seconds );

				// If the timer is stopped, stop ticking.
				if ( repeat ) {
					window.clearInterval( repeat );
				}

				/**
				 * Called after this countdown timer has reached zero.
				 * @callback onEnd
				 */
				if ( this.settings.onEnd && 'function' === typeof this.settings.onEnd ) {
					this.settings.onEnd.call( this, {
						element: timer,
						time
					} );
				}

				return;
			}

			this.updateDisplay( timer, years, y, this.settings.years );
			this.updateDisplay( timer, weeks, w, this.settings.weeks );
			this.updateDisplay( timer, days, d, this.settings.days );
			this.updateDisplay( timer, hours, h, this.settings.hours );
			this.updateDisplay( timer, minutes, m, this.settings.minutes );
			this.updateDisplay( timer, seconds, s, this.settings.seconds );

			/**
			 * Called after the current countdown timer updates.
			 * @callback onTick
			 */
			if ( this.settings.onTick && 'function' === typeof this.settings.onTick ) {
				this.settings.onTick.call( this, {
					element: timer,
					time,
					diff,
					isNegative,
					years: parseInt( y ),
					weeks: parseInt( w ),
					days: parseInt( d ),
					hours: parseInt( h ),
					minutes: parseInt( m ),
					seconds: parseInt( s )
				} );
			}
		};

		updateTime();

		const repeat = window.setInterval( updateTime, 1000 );
	}

	/**
	 * Calculate the number of days, hours, minutes, and seconds from the given milliseconds.
	 * 
	 * @param {number} milliseconds Number of milliseconds remaining in the countdown.
	 * @param {number} time         Time we're counting to, in milliseconds.
	 */
	formatDiff( milliseconds, time ) {
		const msPerSecond = 1000;
		const msPerMinute = 60 * msPerSecond;
		const msPerHour = 60 * msPerMinute;
		const msPerDay = 24 * msPerHour;
		const msPerWeek = 7 * msPerDay;
		const msPerYear = 365 * msPerDay;
		const isNegative = 0 > milliseconds;
		const now = new Date();
		const currentMonth = now.getMonth();
		const finalMonth = new Date( time ).getMonth();
		const spansFebruary = isNegative ? 1 < currentMonth && 1 >= finalMonth : 1 >= currentMonth && 1 < finalMonth;

		let years = Math.floor( Math.abs( milliseconds ) / msPerYear ),
			weeks = Math.floor( Math.abs( milliseconds ) % msPerYear / msPerWeek ),
			days = Math.floor( Math.abs( milliseconds ) % msPerWeek / msPerDay );

		const hours = Math.floor( Math.abs( milliseconds ) % msPerDay / msPerHour ),
			minutes = Math.floor( Math.abs( milliseconds ) % msPerHour / msPerMinute ),
			seconds = Math.floor( Math.abs( milliseconds ) % msPerMinute / msPerSecond );

		/* 
		 * Add days to accommodate leap years (which are 366 days, not 365).
		 */
		if ( 0 < years || spansFebruary ) {
			let yearToCheck = now.getFullYear();
			const finalYear = isNegative ? yearToCheck - years : yearToCheck + years;
			let checkYear = isNegative ? yearToCheck >= finalYear : yearToCheck <= finalYear;

			// Loop through each year between now and the end time.
			while ( checkYear ) {
				checkYear = isNegative ? yearToCheck >= finalYear : yearToCheck <= finalYear;

				// If the year we're checking is a leap year.
				if ( this.isLeapYear( yearToCheck ) ) {

					// If it's an in-between year, or the diff spans February, add a day.
					if ( yearToCheck !== finalYear || spansFebruary ) {
						days ++;
					}
				}

				if ( 7 <= days ) {
					days = 0;
					weeks ++;
				}

				if ( 52 <= weeks ) {
					weeks = 0;
					years ++;
				}

				if ( isNegative ) {
					yearToCheck --;
				} else {
					yearToCheck ++;
				}
			}
		}

		return [ this.pad( years ), this.pad( weeks ), this.pad( days ), this.pad( hours ), this.pad( minutes ), this.pad( seconds ) ];
	}

	/**
	 * Update the display of the given interval element.
	 * 
	 * @param {object} timer          HTML element for this timer.
	 * @param {object} interval       HTML element for the element to update or remove.
	 * @param {string} value          String value to display in the interval element.
	 * @param {string} label          String value to display as the interval label.
	 */
	updateDisplay( timer, interval, value, label ) {
		if ( timer.contains( interval ) ) {
			// Otherwise, update the display.
			const units = 1 < value || 0 === value ? label.plural : label.singular;

			interval.textContent = `${ value } ${ units }`;
			interval.setAttribute( 'aria-label', `${ value } ${ units }` );
		}
	}

	/**
	 * Check if given number `n` is less than 10, and pad with a leading zero if so.
	 * 
	 * @param {number} n Number to pad.
	 */
	pad( n ) {
		if ( this.settings.padValues ) {
			return 10 > n ? `0${ n }` : n;
		} else {
			return n;
		}
	}

	/**
	 * Check whether the given year is a leap year.
	 * 
	 * @param {number} Year Year to check.
	 */
	isLeapYear( year ) {
		return 0 === year % 100 ? 0 === year % 400 : 0 === year % 4;
	}
}
