# 10up Countdown Timer component

> A countdown timer component that displays the number of days, hours, minutes, and seconds remaining until the time specified in the component's `datetime` attribute.

## Installation

### NPM
 `npm install --save @10up/countdown-timer`

### Standalone
 Clone this repo and import `countdown-timer.js` and `countdown-timer.css` from the `dist/` directory.

## API

 This component accepts two arguments, the selector for the component container and an object containing optional callbacks.

### Callbacks

 - `onCreate`: Called after the component is initialized on page load
 - `onTick`: Called each time the component updates its time (approximately once per second). This callback is called with a single argument that represents the HTML element of the timer component that called it.

## Usage

Create an empty `time` element and give it a `datetime` attribute with a [valid date string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats) to count down to. Make sure the element is targetable with a selector that can be passed to the JavaScript. See the **JavaScript** section below on how to init. 

You can create multiple instances on the same page—each will count down independently, as long as they can be targeted by the same selector and each contains a valid `datetime` attribute.

Note that the remaining time displayed by the component will depend on the local time zone of the browser rendering it. You can control the behavior of the component by providing a date string that factors in time zone:

 - If you provide a `datetime` in a local time zone, the component calculates the remaining time based on the user's local time zone. This is useful if you want to count down to an event relative to local time zone.
   * For example, to count down to midnight on New Year's Day in the year 2046 in the user's local time zone: `2046-01-01T00:00:00`
 - If you provide a `datetime` in a specific time zone, the component which will factor in the difference between the specified time zone and the user's local time zone. This is useful if you want to count down to an event that occurs at an exact time in a specific time zone.
   * For example, to count down to midnight on New Year's Day in the year 2046 in Eastern Standard Time (EST): `2046-01-01T00:00:00-04:00`
 - If you provide a `datetime` in Greenwich Mean Time (GMT), the component will factor in the difference between GMT and the user's local time zone. This is useful if you want to count down to an exact time in GMT.
   * For example, to count down to midnight on New Year's Day in the year 2046 in GMT: `2046-01-01T00:00:00Z`

If the component does not contain a `datetime` attribute, the `datetime` attribute is not a valid date string, or the date string is a date in the past, the component will display `00 : 00 : 00 : 00`.

### Markup

 This is the markup template expected by the component. To count down to midnight on New Year's Day in the year 2046 in GMT:

 ```html
<time class="countdown-timer" datetime="2046-01-01T00:00:00Z"></time>
 ```

### CSS

 The styles can be imported into your existing codebase by using PostCSS imports, or by including the standalone CSS file in your project.

#### PostCSS Imports
 `@import '@10up/countdown-timer';`

#### Standalone
 Include the `countdown-timer.css` file from the `dist/` directory.

### JavaScript

 Create a new instance by supplying the selector to use for the component and an object containing any necessary callback functions.

#### NPM

```javascript
import CountdownTimer from '@10up/countdown-timer';

component( '.countdown-timer', {
	onCreate: function() {
		console.log( 'onCreate callback' );
	},

	onTick: function() {
		console.log( 'onTick callback' );
	}
} );
```

#### Standalone

Include the `countdown-timer.js` file from the `dist/` directory and access the component from the gobal `TenUp` object.

```javascript
let countdownTimer = new TenUp.CountdownTimer( '.countdown-timer', {
	onCreate: function() {
		console.log( 'onCreate callback' );
	},

	onTick: function() {
		console.log( 'onTick callback' );
	}
} );
```

## Demo

Example implementations can be found in the `demo` directory.
