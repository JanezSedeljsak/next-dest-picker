'use strict';

class DOMActions {

    static _sort(elements, order) {
        switch (order) {
            case 'name-asc':
                return elements.sort((a, b) => a.name > b.name ? 1 : -1);
            case 'name-desc':
                return elements.sort((a, b) => a.name < b.name ? 1 : -1);
            case 'region-asc':
                return elements.sort((a, b) => a.region > b.region ? 1 : -1);
            case 'region-desc':
                return elements.sort((a, b) => a.region < b.region ? 1 : -1);
            default:
                return elements;
        }
    }

    static _filter(elements, query) {
        return elements.filter(el => el.name.toLowerCase().includes(query));
    }

    static _getFromStorage() {
        const data = localStorage.getItem('data');
        return data !== null ? [true, JSON.parse(data)] : [false, []];
    }

    static async _fetchRandom() {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const countries = await response.json();
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        return {
            name: randomCountry?.name?.common,
            img: randomCountry?.flags?.png,
            capital: randomCountry?.capital[0],
            region: randomCountry?.region,
            geolocation: randomCountry?.maps?.googleMaps
        };
    }

    constructor(content, search, order, info) {
        this.content = content;
        this.search = search;
        this.order = order;
        this.elements = [];
        this.info = info;

        const [status, data] = DOMActions._getFromStorage();
        if (status) this.elements = data;
        this.redraw();
    }

    _createTravelCard({ img, name, region, capital, geolocation, idx }) {
        var div = document.createElement('div');
        div.innerHTML = `
            <div class='card'>
                <img src='${img}'/>
                <div class='card-content'>
                    <div>
                        <h1>${name}</h1>
                        <hr/>
                        ${('geolocation' in navigator) ?
                            `<p><a target='_blank' href='${geolocation}'>Google maps for ${name}</a></p>`
                            : ''
                        }
                        <p><a target='_blank' href='${geolocation}'>Flights to ${name}</a></p>
                        <p>Capital: <b>${capital}</b></p>
                        <p>Region: <b>${region}</b></p>
                    </div>
                    <div>
                        <button class='del-button'>
                            Delete destination
                        </button>
                    </div>
                </div>
            </div>
        `.trim();

        const card = div.firstChild;
        const delButton = card.querySelector('button');
        delButton.onclick = () => this.delete(idx);

        return card;
    }

    _setInfo() {
        this.info.textContent = `You have selected ${this.visible.length}/5 countries!`;
        this.info.style.color = this.visible.length === 5 ? 'green' : 'red';
    }

    redraw() {
        const sorted = DOMActions._sort(this.elements, this.order.value);
        const filtered = DOMActions._filter(sorted, this.search.value.toLowerCase());

        this.content.innerHTML = '';
        this.visible = filtered;
        this._setInfo();

        filtered.forEach((element, idx) => {
            const card = this._createTravelCard({ ...element, idx });
            this.content.appendChild(card);
        });
    }

    delete(idx) {
        this.elements.splice(idx, 1);
        this.redraw();
    }

    save() {
        const str = JSON.stringify(this.elements);
        localStorage.setItem('data', str);
    }

    clear() {
        this.elements = [];
        this.redraw();
    }

    async random() {
        const loading = document.createElement('div');
        loading.className = 'spinner';
        this.content.prepend(loading);

        while (true) {
            const picked = await DOMActions._fetchRandom();
            if (!this.elements.some(el => el.name === picked.name)) {
                this.elements.push(picked);
                this.redraw();
                break;
            }
        }
    }
}