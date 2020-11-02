function initMap() { //This is here to avoid an uncaught promise

}

document.addEventListener("DOMContentLoaded", function() {

    const galleryLink = 'https://www.randyconnolly.com/funwebdev/3rd/api/art/galleries.php';
    let paintingsLink = 'https://www.randyconnolly.com/funwebdev/3rd/api/art/paintings.php?gallery=';
    const container = document.querySelector('.container');
    const galleryList = document.querySelector('#galleryList');
    const showButton = document.getElementById('show');
    const hideButton = document.getElementById('hide');
    
    //Gallery list show/hide buttons
    hideButton.addEventListener('click', function () {
        galleryList.style.display = 'none';
        container.style.gridTemplateColumns = '8rem 45% auto';
        showButton.style.display = 'block';
        hideButton.style.display = 'none';
    });
    showButton.addEventListener('click', function () {
        galleryList.style.display = 'block';
        container.style.gridTemplateColumns = '20rem 40% auto';
        hideButton.style.display = 'inline-block';
        showButton.style.display = 'none';
    });

    fetch(galleryLink)
    .then( response => response.json() )
    .then( (galleries) => {
        document.querySelector("#loadGif").style.display = "none";
        document.querySelector(".b nav").style.display = "block";
        populateGalleryList(galleries);
    })
    .catch( error => console.log(error) );

    function populateGalleryList(galleries) {
        const galleryList = document.querySelector('#galleryList');
        const sortedGalleries = galleries.sort( (a,b) => {
            return a.GalleryName < b.GalleryName ? -1 : 1;
        } );
        for (const g of sortedGalleries) {
            let newLi = document.createElement('li');
            newLi.textContent = g.GalleryName;
            galleryList.appendChild(newLi);
        }

        //Event delegation
        galleryList.addEventListener('click', function (e) {
            if (e.target && e.target.nodeName.toLowerCase() == 'li') {
                let galleryClicked;
                for (const c of sortedGalleries) {
                    if (e.target.textContent == c.GalleryName) galleryClicked = c;
                }
                populateGalleryInfo(galleryClicked);
                populateMap(galleryClicked);
                getPaintings(galleryClicked);
            }
        });
    }

    function populateGalleryInfo (galleryClicked) {
        document.querySelector('#galleryName').textContent = ' ' + galleryClicked.GalleryName;
        document.querySelector('#nativeName').textContent = ' ' + galleryClicked.GalleryNativeName;
        document.querySelector('#galleryCity').textContent = ' ' + galleryClicked.GalleryCity;
        document.querySelector('#galleryAddress').textContent = ' ' + galleryClicked.GalleryAddress;
        document.querySelector('#galleryCountry').textContent = ' ' + galleryClicked.GalleryCountry;
        document.querySelector('#galleryWebsite').textContent = ' ' + galleryClicked.GalleryWebSite;
        document.querySelector('#galleryWebsite').setAttribute('href', galleryClicked.GalleryWebSite);
    }

    function populateMap (galleryClicked) {
        var map;
        map = new google.maps.Map(document.querySelector('#map'), {
            center: {lat: galleryClicked.Latitude, lng: galleryClicked.Longitude},
            mapTypeId: 'satellite',
            zoom: 18
        });
    }

    function getPaintings (galleryClicked) {
        document.querySelector('#tableDiv').style.display = 'none';
        document.querySelector('#loadGifTwo').style.display = 'block';
        let paintingsListLink = paintingsLink + galleryClicked.GalleryID;
        fetch(paintingsListLink)
        .then( response => response.json())
        .then( (paintings) => {
            document.querySelector('#loadGifTwo').style.display = 'none';
            document.querySelector('#tableDiv').style.display = 'block';
            sortPaintings(paintings);
        })
        .catch( error => console.log(error) );
    }

    function sortPaintings(paintings) {
        //Default sort
        let sortedPaintings = paintings.sort( (a,b) => {
            return a.LastName < b.LastName ? -1 : 1;
        } );
        populatePaintings(sortedPaintings);

        //Sort on selection
        document.querySelector('thead').addEventListener('click', function (e) {
            if (e.target && e.target.nodeName.toLowerCase() == 'th') {
                switch (e.target.textContent) {
                    case 'Title':
                        sortedPaintings = paintings.sort( (a,b) => {
                            return a.Title < b.Title ? -1 : 1;
                        } );
                        populatePaintings(sortedPaintings);
                        break;
                    case 'Year':
                        sortedPaintings = paintings.sort( (a,b) => {
                            return a.YearOfWork < b.YearOfWork ? -1 : 1;
                        } );
                        populatePaintings(sortedPaintings);
                        break;
                    case 'Artist':
                        sortedPaintings = paintings.sort( (a,b) => {
                            return a.LastName < b.LastName ? -1 : 1;
                        } );
                        populatePaintings(sortedPaintings);
                        break;
                }
            }
        });
    }

    //List paintings
    function populatePaintings (sortedPaintings) {
        const tableBody = document.querySelector('#paintings');
        tableBody.textContent = '';
               
        for (const p of sortedPaintings) {
            let newTr = document.createElement('tr');
            let newTdImg = document.createElement('td');
            //Set image
            let imgLink = `https://res.cloudinary.com/funwebdev/image/upload/w_125/art/paintings/${p.ImageFileName}`;
            let newImg = document.createElement('img');
            newImg.setAttribute('src', imgLink)
            newTdImg.appendChild(newImg);
            //Set Artist
            let newTdArtist = document.createElement('td');
            if (p.FirstName) {
                newTdArtist.textContent = p.FirstName + ' ' + p.LastName;
            } else {
                newTdArtist.textContent = p.LastName;
            }
            //set Title
            let newTdTitle = document.createElement('td');
            newTdTitle.setAttribute('class', 'titleLink');
            newTdTitle.textContent = p.Title;
            //set Year
            let newTdYear = document.createElement('td');
            newTdYear.textContent = p.YearOfWork;
            
            newTr.appendChild(newTdImg);
            newTr.appendChild(newTdArtist);
            newTr.appendChild(newTdTitle);
            newTr.appendChild(newTdYear);
            tableBody.appendChild(newTr);
        }

        document.querySelector('#paintings').addEventListener('click', function (e) {
            if (e.target && e.target.className == 'titleLink') {
                let titleSelected = e.target.textContent;
                switchViews(titleSelected, sortedPaintings);
            }
        });
    }

    //Painting View
    function switchViews (titleSelected, sortedPaintings) {
        document.querySelector('#defaultView').style.display = 'none';
        document.querySelector('#singlePageView').style.display = 'grid';
        document.querySelector('#goBack').addEventListener('click', function () {
            document.querySelector('#singlePageView').style.display = 'none';
            document.querySelector('#defaultView').style.display = 'grid';
        });
        //Painting
        const boxH = document.querySelector('.h');
        boxH.innerHTML = '';
        let paintingSelected = sortedPaintings.find( painting => painting.Title == titleSelected);
        let imgLink = `https://res.cloudinary.com/funwebdev/image/upload/h_650/art/paintings/${paintingSelected.ImageFileName}`;
        let newImg = document.createElement('img');
        newImg.setAttribute('src', imgLink);
        newImg.addEventListener('click', function () {
            let largeImgLink = `https://res.cloudinary.com/funwebdev/image/upload/art/paintings/${paintingSelected.ImageFileName}`;
            document.querySelector('#largeImg').setAttribute('src', largeImgLink);
            document.querySelector('#largeImgView').style.display = 'block';
            document.querySelector('#largeImg').addEventListener('click', function () {
                document.querySelector('#largeImgView').style.display = 'none';
            });
        });
        boxH.appendChild(newImg);

        //Painting Info
        document.querySelector('#title').textContent = paintingSelected.Title;
        if (paintingSelected.FirstName) {
            document.querySelector('#artist').textContent = paintingSelected.FirstName + ' ' + paintingSelected.LastName;
        } else {
            document.querySelector('#artist').textContent = paintingSelected.LastName;
        }
        document.querySelector('#year').textContent = 'Made in the year ' + paintingSelected.YearOfWork;
        document.querySelector('#medium').textContent = 'Medium: ' + paintingSelected.Medium;
        document.querySelector('#wh').textContent = 'Size: ' + paintingSelected.Width + 'cm x ' + paintingSelected.Height + 'cm';
        document.querySelector('#gallery').textContent = 'Located at: ' + paintingSelected.GalleryName + ', ';
        document.querySelector('#city').textContent = paintingSelected.GalleryCity;
        document.querySelector('#link').textContent = paintingSelected.MuseumLink;
        document.querySelector('#link').setAttribute('href', paintingSelected.MuseumLink);
        if (paintingSelected.Description) {
            document.querySelector('#description').style.display = 'block';
            document.querySelector('#descriptionBox').textContent = paintingSelected.Description;
        } else {
            document.querySelector('#description').style.display = 'none';
        }
        const colors = document.querySelector('#colorList');
        for (const c of paintingSelected.JsonAnnotations.dominantColors) {
            let newBox = document.createElement('div');
            newBox.setAttribute('class', 'colorBox');
            newBox.style.backgroundColor = c.web;
            let toolTip = document.createElement('span');
            toolTip.setAttribute('class', 'toolTip')
            toolTip.textContent = c.name;
            newBox.appendChild(toolTip);
            colors.appendChild(newBox);
        }
    }

});

