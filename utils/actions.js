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

    static _winnerFromRotation(deg) {
        const offset = Math.floor((deg % 360) / 90);
        const offsetToIndex = {0: 0, 1: 2, 2: 3, 3: 1};
        return offsetToIndex[`${offset}`];
    }

    static _getFromStorage(key) {
        const data = localStorage.getItem(key);
        return data !== null ? [true, JSON.parse(data)] : [false, []];
    }

    static async _getAndCacheCountries() {
        const [status, countries] = DOMActions._getFromStorage('countries');
        if (status) {
            await sleep(500); // smoother behavior
            return countries;
        }

        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        localStorage.setItem('countries', JSON.stringify(data));
        return data;
    }

    static async _fetchRandom() {
        const countries = await DOMActions._getAndCacheCountries();
        const randomCountry = countries[randInt(countries.length)];
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

        const [status, data] = DOMActions._getFromStorage('data');
        if (status) this.elements = data;
        this.render();
    }

    _createTravelCard({ img, name, region, capital, geolocation, idx }) {
        const div = document.createElement('div');

        let travelTo = ``;
        if (this?.geolocation) {
            const { latitude, longitude } = this.geolocation;
            const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${capital}`;
            travelTo = `<p><a target='_blank' href='${url}'>Travel to ${capital}</a></p>`;
        }

        div.innerHTML = `
            <div class='card'>
                <img src='${img}'/>
                <div class='card-content'>
                    <div>
                        <h1>${name}</h1>
                        ${travelTo}
                        <p><a target='_blank' href='${geolocation}'>Google maps</a></p>
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
        const numForWheel = 4;
        const spinBtn = document.querySelector('#spin');
        spinBtn.disabled = this.visible.length !== numForWheel;

        this.info.textContent = `You have selected ${this.visible.length}/${numForWheel} countries!`;
        this.info.style.color = this.visible.length === numForWheel ? 'green' : 'red';
    }

    render() {
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
        this.render();
    }

    save() {
        const str = JSON.stringify(this.elements);
        localStorage.setItem('data', str);
    }

    clear() {
        this.elements = [];
        this.render();
    }

    setGeolocation(geolocation) {
        this.geolocation = geolocation;
    }

    async random() {
        const loading = document.createElement('div');
        loading.className = 'lds-dual-ring';

        if (this?.loading) {
            alert('Already loading country!');
            return;
        }

        const spinnerContainer = document.querySelector('#spinner-container');
        spinnerContainer.appendChild(loading);
        this.loading = true;

        while (true) {
            const picked = await DOMActions._fetchRandom();
            if (!this.elements.some(el => el.name === picked.name)) {
                this.elements.push(picked);
                this.render();
                break;
            }
        }

        this.loading = false;
        loading.remove();
    }
    
    spinTheWheel() {
        const div = document.createElement('div');
        div.setAttribute('id', 'wheel-container');
        div.className = 'modal-wrapper flex-center';

        const arrow = document.createElement('div');
        arrow.className = `arrow`;
        div.appendChild(arrow);

        const wheel = document.createElement('div');
        wheel.className = 'spin-the-wheel';
        div.appendChild(wheel);

        this.elements.forEach(el => {
            const option = document.createElement('div');
            option.className = 'flex-center';
            option.style.backgroundImage = `url('${el.img}')`;
            wheel.appendChild(option);
        });
        
        const rotation = randInt(720) + 720;
        const winner = DOMActions._winnerFromRotation(rotation);

        document.documentElement.style.setProperty('--rotation', `${rotation}deg`);
        document.body.appendChild(div);
        setTimeout(() => {
            alert(`Looks like you're going to visit: ${this.elements[winner].name}`);
            div.remove();
        }, 4200);
    }
}