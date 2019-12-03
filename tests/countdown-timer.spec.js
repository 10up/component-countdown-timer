import puppeteer from 'puppeteer';

const APP = 'http://localhost:2222/demo/';
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
			expect( attrs.live ).toEqual( 'off' );
		} );
	} );

	test( 'Child elements creation', async () => {

		// Visit the page in headless Chrome
		await page.goto( APP );

		const timers = await page.$$eval( '.tenup-countdown-timer', el => {
			return el.map( x => {
				const children = Array.from( x.children );
				const childAttrs = children.map( child => child.className );

				return childAttrs;
			 } );
		} );

		timers.forEach( children => {
			children.forEach( ( child, index ) => {
				switch( index ) {
					case 0:
						expect( child ).toEqual( 'years' );
						break;
					case 1:
						expect( child ).toEqual( 'weeks' );
						break;
					case 2:
						expect( child ).toEqual( 'days' );
						break;
					case 3:
						expect( child ).toEqual( 'hours' );
						break;
					case 4:
						expect( child ).toEqual( 'minutes' );
						break;
					case 5:
						expect( child ).toEqual( 'seconds' );
						break;
				}
			} );
		} )
	} );
} );

afterAll( () => {
	browser.close();
} );
