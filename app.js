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
    const spinAction = document.querySelector('#spin');
    const themeAction = document.querySelector('#theme-btn');
    const downAction = document.querySelector('#down-btn');

    const actions = new DOMActions(content, search, order, info);
    const scrollThreshold = window.innerHeight - 50;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            actions.setGeolocation(pos?.coords);
            actions.render();
        }, showGeolocationError);
    }

    saveSelection.addEventListener('click', () => actions.save());
    pickRandom.addEventListener('click', () => actions.random());
    clear.addEventListener('click', () => actions.clear());
    spinAction.addEventListener('click', () => actions.spinTheWheel());
    order.addEventListener('change', () => actions.render());
    search.addEventListener('keydown', event => {
        if (event.key == "Enter") {
            actions.render();
        }
    });

    themeAction.addEventListener('click', () => actions.toggleTheme());
    downAction.addEventListener('click', () => {
        window.scrollTo({ top: scrollThreshold, left: 0, behavior: 'smooth' });
    });

    document.addEventListener('scroll', () => {
        downAction.style.transform = `scaleY(${window.scrollY < scrollThreshold ? '1' : '-1'})`;
    });
});