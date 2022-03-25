'use strict';

class DOMActions {

    static _sort(elements) {
        const sorted = elements.sort((a, b) => a.title < b.title ? 1 : -1);
        return sorted;
    }

    static _filter(elements, query) {
        return elements.filter(el => el.title.toLowerCase().includes(query));
    }

    static _addIdentifiers(elements) {
        return elements.map((el, index) => ({...el, identifier: `element_${index}`}));
    }

    constructor(content, elements, search, order) {
        this.content = content;
        this.search = search;
        this.order = order;
        this.elements = elements;

        const [status, data] = this._getFromStorage();
        if (status) this.elements = data;
        this.redraw();
    }

    _createTravelCard({ img, title, description, identifier }) {
        const card = document.createElement("div");
        card.className = 'card';

        const imgEl = document.createElement("img");
        imgEl.src = img;
    
        const titleEl = document.createElement("h1");
        titleEl.textContent = title;
    
        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = description;

        const delButton = document.createElement('button');
        delButton.onclick = () => this.delete(identifier);
        delButton.textContent = 'delete';
    
        const cardContent = document.createElement("div");
        cardContent.appendChild(titleEl);
        cardContent.appendChild(descriptionEl);
        cardContent.appendChild(delButton);
    
        card.appendChild(imgEl);
        card.appendChild(cardContent);
    
        return card;
    }

    _getFromStorage() {
        const data = localStorage.getItem('data');
        return data !== null ? [true, JSON.parse(data)] : [false, []];        
    }

    redraw() {
        this.content.innerHTML = '';
        this.elements = DOMActions._addIdentifiers(this.elements);

        const sorted = DOMActions._sort(this.elements);
        const filtered = DOMActions._filter(sorted, this.search.value.toLowerCase());

        for (const element of filtered) {
            const card = this._createTravelCard(element);
            this.content.appendChild(card);
        }
    }

    delete(identifier) {
        this.elements = this.elements.filter(el => el.identifier !== identifier);
        this.redraw();
    }

    save() {
        const str = JSON.stringify(this.elements);
        localStorage.setItem('data', str);
    }

    load() {
        const [status, data] = this._getFromStorage();
        if (status) {
            this.elements = data;
            this.redraw();
        }
    }

    mock(data) {
        this.elements = [...this.elements, ...data];
        this.redraw();
    }
}