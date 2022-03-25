'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('travel-cards');
    const search = document.getElementById('search');
    const order = document.getElementById('order');

    // action buttons
    const save = document.getElementById('save');
    const load = document.getElementById('load');
    const generate = document.getElementById('generate');

    const actions = new DOMActions(content, [], search, order);

    search.addEventListener('keydown', event => {
        if (event.key == "Enter") {
            actions.redraw();
        }
    });

    load.addEventListener('click', () => actions.load());
    save.addEventListener('click', () => actions.save());
    generate.addEventListener('click', () => actions.mock(data));

    order.addEventListener('change', event => {
        actions.redraw(event.target.value);
    });
});
