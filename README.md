# 10up Countdown Timer component

> A countdown timer component that displays the number of days, hours, minutes, and seconds remaining until the time specified in the component's `datetime` attribute.

## Installation

### NPM
 `npm install --save @10up/countdown-timer`

### Standalone
 Clone this repo and import `countdown-timer.js` and `countdown-timer.css` from the `dist/` directory.

## API

 This component accepts two arguments, the selector for the component container and an object containing optional settings and callbacks.

### Supported Intervals

The timer can display values for the following time intervals:

 - `years`
 - `weeks`
 - `days`
 - `hours`
 - `minutes`
 - `seconds`

#### Why no months?

Since various months can contain different numbers of days, a month is not an exact unit of time, so it's not as useful for counting toward or away from a specific point in time. All supported intervals contain an exact number of seconds. The one exception is `years`, which can contain either 365 or 366 days. The component will factor this into its calculations by adding an extra day for each leap year as necessary.

### Settings

 - `compact`: Boolean. If `true`, the timer will display only the highest non-zero interval value. This lets you display a more approximate time, e.g. `3 days`. The timer will continue to tick once per second and the interval shown will change as necessary. Default value: `false`
 - `allowNegative`: Boolean. If `true`, the timer will continue to count up once the given `time` has passed. This lets you display the time elapsed since a given `time`. Default value: `false`
 - `padValues`: Boolean. If `true`, single-digit numbers displayed by the timer will be padded with a leading zero. Default value: `false`
 - `separator`: String. Define a string to be rendered between intervals. Default: `, `
 - Interval settings: You may provide settings for each supported interval. You can give each interval property an object with the following options:
   * `allowed`: Boolean. If `false`, this interval will not be displayed in the timer under any circumstances. Useful if you only need to show approximate values (e.g. "3 days, 12 hours since the last error") or if you know the time you're counting to/from falls within a certain period and you won't need to show larger intervals like years or weeks. Note that this won't affect the calculation of time remaining/elapsed, so if you disallow relevant intervals, the time displayed may appear inaccurate to users. Default value: `true`, so that unless `compact` is enabled, all intervals are shown, even if zero.
   * `singular`: String. Allows you to override the default singular label for the interval. Useful if you need to show the timer in a different language, or if you don't want any labels to appear alongside the numbers. Default value: English singular form of the interval.
   * `plural`: String. Allows you to override the default plural label for the interval. Useful if you need to show the timer in a different language, or if you don't want any labels to appear alongside the numbers. Default value: English plural form of the interval.

### Callbacks

 - `onCreate`: Called once per component instance after the instance is initialized on page load. Called with a single argument containing the following properties: `element` (the top-level HTML element of the timer which invoked the callback) and `time` (the time this timer is counting to/from, in UNIX format).
 - `onEnd`: Called once per component instance when the timer reaches zero (if counting toward a future time). Called with a single argument containing the following properties: `element` (the top-level HTML element of the timer which invoked the callback) and `time` (the time this timer is counting to/from, in UNIX format). Note that this callback will never be called if the given time is in the past.
 - `onTick`: Called each time a component instance updates its time (approximately once per second). Called with a single argument, an object that contains the following properties related to the timer instance that called it:

 ```js
 {
	element,    // {object}  The top-level HTML element of the timer which invoked the callback.
	time,       // {number}  The time this timer is counting to/from, in UNIX format.
	diff,       // {number}  The number of milliseconds between `time` and the moment `onTick` was called.
	isNegative, // {boolean} If `true`, `time` is in the past and `diff` is a negative number.
	years,      // {number}  Number of years in `diff`.
	weeks,      // {number}  Number of weeks in `diff`.
	days,       // {number}  Number of days in `diff`.
	hours,      // {number}  Number of hours in `diff`.
	minutes,    // {number}  Number of minutes in `diff`.
	seconds     // {number}  Number of seconds in `diff`.
}
 ```

## Usage

Create a `time` wrapper element and give it a `datetime` attribute with a [valid date string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats). This date string will be used to count to (if it's in the future), or from (if it's in the past, and the `allowNegative` setting is enabled). Make sure the element is targetable with a selector that can be passed to the JavaScript. Refer to the **JavaScript** section below on how to initialize.

For accessibility purposes, we strongly recommend adding some fallback content inside the `time` element which can be shown if the JS is unable to run. This content will be replaced by the countdown elements once the JS is initialized. Also make sure to give your `time` element a [`role="timer"` attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/ARIA_timer_role).

You can create multiple instances on the same page—each will count down independently, as long as they can be targeted by some selector and each contains a valid `datetime` attribute. To create multiple timer instances with shared settings, give the `time` elements the same selector and invoke them once using that selector in JS. To create multiple timer instances with different settings, give the `time` elements different selectors and invoke them separately in JS.

### Dealing with Time Zones

The time displayed by the component will depend on the local time zone of the browser rendering it. You can control the behavior of the component by providing a date string that considers time zone:

 - If you provide a `datetime` without any time zone specification, the component calculates the remaining time based on the user's local time zone. This is useful if you want to count down to an event relative to local time zone.
   * For example, to count down to midnight on New Year's Day in the year 2046 in the user's local time zone: `2046-01-01T00:00:00`
 - If you provide a `datetime` in a specific time zone, the component which will factor in the difference between the specified time zone and the user's local time zone. This is useful if you want to count down to an event that occurs at an exact time in a specific time zone.
   * For example, to count down to midnight on New Year's Day in the year 2046 in Eastern Standard Time (EST): `2046-01-01T00:00:00-04:00`
 - If you provide a `datetime` in UTC, the component will factor in the difference between UTC and the user's local time zone. This is useful if you want to count down to an exact time in UTC.
   * For example, to count down to midnight on New Year's Day in the year 2046 in UTC: `2046-01-01T00:00:00Z`

If the component does not contain a `datetime` attribute, the `datetime` attribute is not a valid date string, or the date string is a date in the past, the component will display zeroes for all intervals.

### Markup

 This is the markup template expected by the component. To count down to midnight on New Year's Day in the year 2046 in UTC:

 ```html
<time class="countdown-timer" datetime="2046-01-01T00:00:00Z" role="timer">
	<!-- Some fallback content, perhaps the date string itself or a message to users or machines that can't view this component with JS. -->
</time>
 ```

### CSS

There is no CSS included with this component. You may target individual interval elements within the component by class name: `.years`, `.weeks`, `.days`, `.hours`, `.minutes`, or `.seconds`. All interval elements are `span` elements and are top-level children of the `time` wrapper element.

### JavaScript

 Create a new instance by supplying the selector to use for the component and an object containing any necessary callback functions.

#### NPM

```javascript
import CountdownTimer from '@10up/countdown-timer';

CountdownTimer( '.countdown-timer', {
	// Settings and callback properties go here.
} );
```

#### Standalone

Include the `countdown-timer.js` file from the `dist/` directory and access the component from the gobal `TenUp` object.

```javascript
let countdownTimer = new TenUp.CountdownTimer( '.countdown-timer', {
	// Settings and callback properties go here.
} );
```

## Demo

Example implementations can be found in the `demo` directory.

## Tests

Run `npm run test`.
