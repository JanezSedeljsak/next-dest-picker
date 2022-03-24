'use strict';

const createTravelCard = ({ img, title, description }) => {
    const card = document.createElement("div");
    card.className = 'card';

    const imgEl = document.createElement("img");
    imgEl.src = img;
    imgEl.alt = "banner image";

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

window.addEventListener('DOMContentLoaded', event => {
    const content = document.getElementById('travel-cards');
    for (let i = 0; i < 10; i++) {
        const card = createTravelCard({
            img: 'https://www.adorama.com/alc/wp-content/uploads/2018/11/landscape-photography-tips-yosemite-valley-feature.jpg', 
            title: "hello", 
            description: "testest" 
        });
        content.appendChild(card);
    }
});
