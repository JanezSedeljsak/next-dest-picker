'use strict';

class DOMActions {

    constructor(content, elements, search, order) {
        this.content = content;
        this.search = search;
        this.order = order;

        this.elements = elements;
        this.visibleElements = elements;
        this.redraw();
    }

    static _createTravelCard({ img, title, description }) {
        const card = document.createElement("div");
        card.className = 'card';
    
        const imgEl = document.createElement("img");
        imgEl.src = img;
    
        const titleEl = document.createElement("h1");
        titleEl.textContent = title;
    
        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = description;
    
        const cardContent = document.createElement("div");
        cardContent.appendChild(titleEl);
        cardContent.appendChild(descriptionEl);
    
        card.appendChild(imgEl);
        card.appendChild(cardContent);
    
        return card;
    }

    static _sort(elements) {
        const sorted = elements.sort((a, b) => a.title < b.title ? 1 : -1);
        return sorted;
    }

    static _filter(elements, query) {
        return elements.filter(el => el.title.toLowerCase().includes(query));
    }

    redraw() {
        this.content.innerHTML = '';
        const sorted = DOMActions._sort(this.elements);
        const filtered = DOMActions._filter(sorted, this.search.value.toLowerCase());
        this.visibleElements = filtered;

        for (const element of this.visibleElements) {
            const card = DOMActions._createTravelCard(element);
            this.content.appendChild(card);
        }
    }
}