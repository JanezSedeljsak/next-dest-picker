'use strict';

class DOMActions {

    static _setTheme(isDarkTheme) {
        const themeObj = {
            'content-background': isDarkTheme ? '#333' : '#eee',
            'text-color': isDarkTheme ? '#ccc' : '#333',
            'body-background': isDarkTheme ? '#444' : '#fff'
        };

        for (const attr in themeObj) {
            document.documentElement.style.setProperty(`--${attr}`, themeObj[attr]);
        }
    }

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
            case 'population-asc':
                return elements.sort((a, b) => parseInt(a.population) > parseInt(b.population) ? 1 : -1);
            case 'population-desc':
                return elements.sort((a, b) => parseInt(a.population) < parseInt(b.population) ? 1 : -1);
            default:
                return elements;
        }
    }

    static _filter(elements, query) {
        return elements.filter(el => el.name.toLowerCase().includes(query));
    }

    static _winnerFromRotation(deg) {
        const offset = Math.floor((deg % 360) / 90);
        const offsetToIndex = { 0: 0, 1: 2, 2: 3, 3: 1 };
        return offsetToIndex[`${offset}`];
    }

    static _getFromStorage(key) {
        const data = localStorage.getItem(key);
        return data !== null ? [true, JSON.parse(data)] : [false, []];
    }

    static _formatPopulation(population) {
        if (population < 1_000) {
            return population;
        } else if (population < 1_000_000) {
            return `${(population / 1_000).toFixed(2)} thousand`;
        } else {
            return `${(population / 1_000_000).toFixed(2)} million`; 
        }
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

    static async _fetchRandom(query, seen) {
        const countries = await DOMActions._getAndCacheCountries();
        const filtered = countries.filter(country => {
            const name = country?.name?.common?.toLowerCase() ?? null;
            if (name === null) return false;

            if (name.includes(query) && !seen.has(name)) {
                // debugger;
                return true;
            }

            return false;
        });

        if (filtered.length === 0) {
            alert(`There is no country that contains ${query}`);
            return null;
        }

        const randomCountry = filtered[randInt(filtered.length)];
        const obj = {
            name: randomCountry?.name?.common,
            img: randomCountry?.flags?.png,
            capital: randomCountry?.capital ? randomCountry?.capital[0] : randomCountry?.name?.common,
            region: randomCountry?.region,
            geolocation: randomCountry?.maps?.googleMaps,
            population: randomCountry?.population
        };

        return {
            ...obj,
            _original: { ...obj },
            _identifier: `__${randomCountry?.name?.common}__`,
            _edited: false
        };
    }

    constructor(content, search, order, info) {
        this.content = content;
        this.search = search;
        this.order = order;
        this.elements = [];
        this.info = info;
        this.regions = [];

        const [themeStatus, darkTheme] = DOMActions._getFromStorage('darkTheme');
        this.darkTheme = themeStatus ? darkTheme : false;
        DOMActions._setTheme(this.darkTheme);

        const [status, data] = DOMActions._getFromStorage('data');
        if (status) this.elements = data;

        this._setRegions();
        this.render();
    }

    _setRegions() {
        DOMActions._getAndCacheCountries().then(countries => {
            const unsorted = [...new Set(countries.map(country => country?.region))];
            console.log(countries);
            this.regions = unsorted.sort((a, b) => a > b ? 1 : -1);
        })
    }

    _createTravelCard({ img, name, region, capital, geolocation, population, _identifier, _original, _edited }) {
        const div = document.createElement('div');

        let travelTo = ``;
        if (this?.geolocation) {
            const { latitude, longitude } = this.geolocation;
            const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${capital}`;
            travelTo = `<p><a target='_blank' href='${url}'>Travel to ${capital}</a></p>`;
        }

        div.innerHTML = `
            <div class='card ${_edited ? 'card-edited' : ''}'>
                <img src='${img}'/>
                <div class='card-content'>
                    <div>
                        <h1>${name}</h1>
                        ${travelTo}
                        <p><a target='_blank' href='${geolocation}'>Google maps</a></p>
                        <p>Capital: <b>${capital}</b></p>
                        <p>Population: <b>${DOMActions._formatPopulation(population)}</b></p>
                        <p>Region: <b>${region}</b></p>
                    </div>
                    <div>
                        <button class='primary edit-button'>Edit</button>
                        ${_edited ?
                            '<button class="secondary reset-button">Reset</button>' 
                            : ''
                        }
                        <button class='del-button'>Delete</button>
                    </div>
                </div>
            </div>
        `.trim();

        const card = div.firstChild;

        const delButton = card.querySelector('.del-button');
        delButton.onclick = () => this.delete(_identifier);

        const editButton = card.querySelector('.edit-button');
        editButton.onclick = () => this.edit(_identifier, { name, capital, region, population, _original });
            
        if (_edited) {
            const resetButton = card.querySelector('.reset-button');
            resetButton.onclick = () => {
                for (let i = 0; i < this.elements.length; i++) {
                    if (this.elements[i]._identifier === _identifier) {
                        this.elements[i] = { 
                            ...this.elements[i], 
                            ...this.elements[i]._original, 
                            _edited: false 
                        };
                        break;
                    }
                }
    
                this.render();
            }
        }

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

    delete(identifier) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i]._identifier === identifier) {
                this.elements.splice(i, 1);
                this.render();
                return true;
            }
        }

        alert('The country you want to delete was not found!');
        return false;
    }

    edit(identifier, { name, capital, region, population, _original }) {
        const div = document.createElement('div');
        div.setAttribute('id', 'wheel-container');
        div.className = 'modal-wrapper flex-center';
        document.body.appendChild(div);

        div.innerHTML = `
            <div class='container modal' style='padding-top: 0px'>
                <div class='modal-header'>
                    <h2>Edit country - ${_original.name}</h2>
                    <h4 id='exit'>X</h4>
                </div>

                <form>
                    <label for='countryName'>Country name</label>
                    <input id='countryName' value='${name}' class='form-element' minlength="5" minlength="50" required />
                    
                    <label for='countryCapital'>Capital</label>
                    <input id='countryCapital' value='${capital}' class='form-element' minlength="5" maxlength="50" required />
                    
                    <label for='countryPopulation'>Population</label>
                    <input type='number' id='countryPopulation' value='${population}' class='form-element' min="0" required />
                    
                    <label for='countryRegion'>Region</label>
                    <select class='form-element' name='countryRegion' id='countryRegion'>
                        ${this.regions.map(option => 
                            `<option value='${option}' ${option === region ? 'selected' : ''}>${option}</option>`
                        )}
                    </select>

                    <button type='submit' class='primary'>Update</button>
                </form>
            </div>
        `;

        div.onclick = event => {
            event.stopPropagation();
            if (event.target === event.currentTarget) {
                div.remove();
            }
        }

        const closeButton = div.querySelector('#exit');
        closeButton.onclick = () => div.remove();

        const form = div.querySelector('form');
        form.onsubmit = event => {
            event.preventDefault();
            const newCountryData = {
                name: document.querySelector('#countryName').value,
                capital: document.querySelector('#countryCapital').value,
                region: document.querySelector('#countryRegion').value,
                population: document.querySelector('#countryPopulation').value
            }

            for (let i = 0; i < this.elements.length; i++) {
                if (this.elements[i]._identifier === identifier) {
                    this.elements[i] = { ...this.elements[i], ...newCountryData, _edited: true };
                    break;
                }
            }

            div.remove();
            this.render();
        }
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

        const seen = new Set(this.elements.map(el => el._original.name.toLowerCase()));
        const picked = await DOMActions._fetchRandom(this.search.value.toLowerCase(), seen);
        if (picked !== null) {
            this.elements.push(picked);
            this.render();
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

        this.visible.forEach(el => {
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
            alert(`Looks like you're going to visit: ${this.visible[winner].name}`);
            div.remove();
        }, 4200);
    }

    toggleTheme() {
        this.darkTheme = !this.darkTheme;
        localStorage.setItem('darkTheme', this.darkTheme);
        DOMActions._setTheme(this.darkTheme);
    }
}