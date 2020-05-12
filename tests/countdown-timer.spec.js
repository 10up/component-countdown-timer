import puppeteer from 'puppeteer';

const APP = 'https://10up.github.io/component-countdown-timer/demo/';
const width = 1440;
const height = 860;

let page;
let browser;

beforeAll( async () => {

	browser = await puppeteer.launch( {
		headless: true,
	} );

	page = await browser.newPage();

	await page.setViewport( {
		width,
		height
	} );

} );

describe( 'Accessibility Tests: Countdown Timer', () => {

	test( 'Container ARIA attributes', async () => {

		// Visit the page in headless Chrome
		await page.goto( APP );

		const timers = await page.$$eval( '.tenup-countdown-timer', el => {
			return el.map( x => {
				return {
					role: x.getAttribute( 'role' ),
					atomic: x.getAttribute( 'aria-atomic' ),
					live: x.getAttribute( 'aria-live' )
				};
			 } );
		} );

		// Check timer role and aria-atomic attributes
		timers.forEach( attrs => {
			expect( attrs.role ).toEqual( 'timer' );
			expect( attrs.atomic ).toEqual( 'true' );
		} );
	} );

	test( 'Child elements creation', async () => {

		// Visit the page in headless Chrome
		await page.goto( APP );

		const timers = await page.$$eval( '.tenup-countdown-timer', el => {
			return el.map( x => {
				const children = Array.from( x.children );
				return children.map( child => child.className );
			 } );
		} );

		// Check the class name for each top-level child element of each timer container
		timers.forEach( children => {

			// Each timer should have six child elements, one for each interval.
			expect( children.length ).toEqual( 6 );

			children.forEach( ( child, index ) => {
				switch( index ) {
					case 0:
						expect( child ).toEqual( 'tenup-countdown-timer-years' );
						break;
					case 1:
						expect( child ).toEqual( 'tenup-countdown-timer-weeks' );
						break;
					case 2:
						expect( child ).toEqual( 'tenup-countdown-timer-days' );
						break;
					case 3:
						expect( child ).toEqual( 'tenup-countdown-timer-hours' );
						break;
					case 4:
						expect( child ).toEqual( 'tenup-countdown-timer-minutes' );
						break;
					case 5:
						expect( child ).toEqual( 'tenup-countdown-timer-seconds' );
						break;
				}
			} );
		} )
	} );

} );

afterAll( () => {
	browser.close();
} );
