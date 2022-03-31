'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('#travel-cards');
    const search = document.querySelector('#search');
    const order = document.querySelector('#order');
    const info = document.querySelector('#info');

    // action buttons
    const saveSelection = document.querySelector('#save-selection');
    const pickRandom = document.querySelector('#pick-random');
    const clear = document.querySelector('#clear');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            window.userLocation = pos?.coords;
            actions.redraw();
        }, showGeolocationError);
    }

    const actions = new DOMActions(content, search, order, info, window);
    search.addEventListener('keydown', event => {
        if (event.key == "Enter") {
            actions.redraw();
        }
    });

    saveSelection.addEventListener('click', () => actions.save());
    pickRandom.addEventListener('click', () => actions.random());
    clear.addEventListener('click', () => actions.clear());

    order.addEventListener('change', event => {
        actions.redraw(event.target.value);
    });
});