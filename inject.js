/* Copyright(c) 2016 Philip Mulcahy. */
/* global window */
/* jshint strict: true, esversion: 6 */

const amazon_order_history_inject = (function() {
    'use strict';

    let request_scheduler = amazon_order_history_request_scheduler.create();

	function getYears() {
		if(typeof(getYears.years) === 'undefined') {
            console.log('getYears() needs to do something');
			const snapshot = amazon_order_history_util.findMultipleNodeValues(
				'//select[@name=\"orderFilter\"]/option[@value]',
				document,
				document);
			getYears.years = snapshot.map( elem => {
                return elem.textContent
                           .replace('en', '')  // amazon.fr
                           .replace('nel', '')  // amazon.it
                           .trim();
            }).filter( (element, index, array) => {
                return(/^\d+$/).test(element);
            });
		}
        console.log('getYears() returning ', getYears.years);
		return getYears.years;
	}

    function resetScheduler() {
        request_scheduler.shutdown()
        request_scheduler = amazon_order_history_request_scheduler.create();
    }

    function fetchAndShowOrders(years) {
        resetScheduler();
		amazon_order_history_order.getOrdersByYear(
            years, request_scheduler
        ).then(
			orderPromises => {
				amazon_order_history_table.displayOrders(orderPromises, true);
				return document.querySelector('[id=\"order_table\"]');
			}
		);
    }

    function addYearButtons() {
        console.log('addYearButtons starting');
        const years = getYears();
        if(years.length > 0) {
            amazon_order_history_util.addButton(
                'All years',
                () => {
                    fetchAndShowOrders(years);
                }
            );
        } else {
            console.log('addYearButtons no years found');
        }
        years.forEach( year => {
            amazon_order_history_util.addButton(
                [year],
                () => {
                    fetchAndShowOrders([year]);
                }
            );
        });
    }

    function addInfoPoints() {
        const progress = document.createElement('div');
        progress.setAttribute('id', 'order_reporter_progress');
        progress.setAttribute('class', 'order_reporter_progress');
        progress.setAttribute(
            'style', 'position:absolute; top:0; right:0; color:orange; padding:0.2em; font-size:75%');
        document.body.insertBefore(
            progress,
            document.body.firstChild
        );
    }

    console.log('Amazon Order History Reporter starting');
    addYearButtons();
    addInfoPoints();
})();
