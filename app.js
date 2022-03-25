'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('travel-cards');
    const search = document.getElementById('search');
    const order = document.getElementById('order');
    const actions = new DOMActions(content, data, search, order);

    search.addEventListener('keydown', event => {
        if (event.key == "Enter") {
            actions.redraw();
        }
    });

    order.addEventListener('change', event => {
        actions.redraw(event.target.value);
    });
});
