$(document).ready(function () {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('properties');

    // Put the object into storage
    if (retrievedObject == null) {
        localStorage.setItem('properties', JSON.stringify(propertyObject));
    } else {
        // the object in local storage is not up to date, update it
        if (retrievedObject != JSON.stringify(propertyObject)) {
            localStorage.setItem('properties', JSON.stringify(propertyObject));
        }
    }

    // when we get here we will have the most up to date property list
    retrievedObject = localStorage.getItem('properties');
    var json = JSON.parse(retrievedObject);

    // if address-filter-input exists we are on listings page
    if ($('#address-filter-input').length > 0) {

        // set up trigger events for the filter inputs
        $('#address-filter-input').on('input', function () {
            propertySearch(json);
        });

        $('[name="customRadio"]').change(function () {
            updateUrlParam();
            propertySearch(json);
        });

        $('#bedroom-select').change(function () {
            propertySearch(json);
        });

        // Clear button click event resets form and displays all properties
        $('#btn-Clear').click(function () {
            $('#address-filter-input').val('');
            $('#bedroom-select').val('-Please Choose-');
            $('#bedroom-select').change();
            $("[name='customRadio']:checked").removeAttr("checked");
            $('.search-term').remove();
            var newurl = window.location.href.split('?')[0];
            window.history.pushState({ path: newurl }, '', newurl); // removed any params from query string
            resetProperties(json);
        });

        const urlParams = new URLSearchParams(window.location.search);
        var properties = json.houses;
        const searchTerm = urlParams.get('searchTerm'); //Check for params in url. User may have got here using the from page search
        if (searchTerm != null) {
            // display search term to user
            $('.dream').after('<div class="search-term"><br><span>Showing results for search: ' + unescape(searchTerm) + '</span></div>');

            // filter properties based on the search term
            properties = searchAllProperties(properties, unescape(searchTerm))
        }

        // if params have a sale type, check the appropriate checkbox and filter properties again
        const saleType = urlParams.get('saleType');
        if (saleType != null) {
            if (saleType == 'Buy') {
                $('#customRadio2').attr('checked', true);
                properties = multipleFilterProperties(properties, { "SaleType": "Buy" });
            }
            if (saleType == 'Rent') {
                $('#customRadio1').attr('checked', true);
                properties = multipleFilterProperties(properties, { "SaleType": "Rent" });
            }
        }

        // now pass the properties for display
        displayProperties(properties);
    } else {

        // if we are here we are in the single listing page so we can grab the id from the query string
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        // get the chosen property from the list
        var property = getPropertyById(json.houses, propertyId);

        // not display the property info on the page
        displaySingleProperty(property);

        // add a click event to the favourites button
        $('.add-fave').click(function () {
            var button = this;
            var favProperties = localStorage.getItem('favProperties');
            // if not favourites exists in local storage create it
            if (favProperties == null || favProperties.length < 1) {
                favProperties = localStorage.setItem('favProperties', new Array());
            }
            // if the button saves Add to favs we need to do an add function
            if ($(button).text() == 'Add to favourites') {
                var newProps = new Array();
                // add current favourites to an array
                if (favProperties != null){
                    $(JSON.parse(favProperties)).each(function () {
                        newProps.push(this);
                    });
                }
                // now push our new property on to the list
                newProps.push({ "Id": propertyId, "Address": $('#address').text() });
                // update the object in local storage
                localStorage.setItem('favProperties', JSON.stringify(newProps));
                $('#no-favourites').after('<a class="dropdown-item fav-property" data-fave-id="' + propertyId + '" href="singleListing.html?id=' + propertyId + '">' + $('#address').text() + '</a>');
                $('#no-favourites').hide(); // hide the no favourites item as we have just added one
                $(button).text('Remove from favourites'); // Set the button text to remove
            } else {
                // if we are here we are removing a propery from favourites
                var newProps = new Array();
                
                $(JSON.parse(favProperties)).each(function () {
                    if (Number(this["Id"]) != propertyId) {// So add out existing favs to an array where the id is not the one we want to remove
                        newProps.push(this);
                    }
                });
                 // update the object in local storage   
                localStorage.setItem('favProperties', JSON.stringify(newProps));

                // not remove the item from the favourites dropdown
                $('.fav-property').each(function () {
                    if (Number($(this).attr('data-fave-id')) == propertyId) {
                        $(this).remove();
                    }
                });

                // if no other favourites exist show the no favourites item
                $('.fav-property').length > 0 ? $('#no-favourites').hide() : $('#no-favourites').show();
                // reset the button text to add
                $(button).text('Add to favourites');
            }
            
                // now we can update the favourites icon in the nav bar
            $('.num').text($('.fav-property').length);
        });

        var form = document.getElementById("my-form");

        async function handleSubmit(event) {
            event.preventDefault();
            var status = document.getElementById("status");
            var data = new FormData(event.target);
            fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                status.innerHTML = "Thanks for your submission!";
                form.reset()
            }).catch(error => {
                status.innerHTML = "Oops! There was a problem submitting your form"
            });
        }
        form.addEventListener("submit", handleSubmit)
    }
});

/**
 * Function for updating the url based on radio button selection.
 */
function updateUrlParam() {
    const urlParams = new URLSearchParams(window.location.search);

    const saleType = urlParams.get('saleType');
    if (saleType != null) {
        var saleTypeId = $("[name='customRadio']:checked").attr('id');
        var saleTypeVal = $('label[for="' + saleTypeId + '"]').text();
        saleTypeVal = saleTypeVal == 'Both' ? '' : saleTypeVal; // if saletype == Both display all

        if (saleTypeVal.length > 0) {
            var newurl = window.location.href.split(saleType)[0] + saleTypeVal;
            window.history.pushState({ path: newurl }, '', newurl);
        }
    }
}

/**
 * Function for searching through the property list
 *
 * @param {object} json The property portfolio stored as json.
 */
function propertySearch(json) {
    const urlParams = new URLSearchParams(window.location.search);
    var properties = json.houses; // get the propeties from the json
    const searchTerm = urlParams.get('searchTerm');
    if (searchTerm != null) {
        // if a search term exists in the url do the first filter here
        properties = searchAllProperties(properties, unescape(searchTerm))
    }

    // filter again is sale type exists
    const saleType = urlParams.get('saleType');
    var saleTypeId = $("[name='customRadio']:checked").attr('id');
    var saleTypeVal = $('label[for="' + saleTypeId + '"]').text();
    if (saleType != null) {
        if (saleTypeVal != 'Both') {
            if (saleType == 'Buy') {
                properties = multipleFilterProperties(properties, { "SaleType": "Buy" });
            }
            if (saleType == 'Rent') {
                properties = multipleFilterProperties(properties, { "SaleType": "Rent" });
            }
        }
    }

    // now call getSearchParams to check if any on screen filters have been applied
    var searchObj = getSearchParams();
    if (Object.keys(searchObj).length > 0) {
        // if we have on screen filters filter again then pass them for display
        var results = multipleFilterProperties(properties, searchObj);
        displayProperties(results);
    } else if ((Object.keys(searchObj).length == 0 && saleTypeVal == 'Both') || (Object.keys(searchObj).length == 0 && searchTerm != null)) {
        // if there are no on screen filters but query string params display the previously filter properties
        displayProperties(properties);
    } else {
        // not filters so display all
        resetProperties();
    }
}

/**
 * Function for displaying all properties
 */
function resetProperties() {
    // Retrieve the object from storage the pass for display
    var retrievedObject = localStorage.getItem('properties');
    var json = JSON.parse(retrievedObject);

    displayProperties(json.houses);
}

/**
 * Function for setting the correct wording on the favourites button
 *
 * @param {number} x The property Id.
 */
function setFavButtonWording(propertyId) {
    var favProperties = localStorage.getItem('favProperties');
    if (favProperties == null || favProperties.length < 1) {
        return;
    }
    $(JSON.parse(favProperties)).each(function () {
        // If this property id exists in the favourites set the button text to remove, otherwise it will get the default text ->'Add to Favourites'
        if (Number(this["Id"]) == propertyId) {
            $('#btn-AddFave').text('Remove from favourites');
        }
    });
}

/**
 * Function for displaying a property's info on screen.
 *
 * @param {object} property The property to display.
 */
function displaySingleProperty(property) {
    // if this property is undefined display property not found
    if (property == undefined) {
        $('#house-info').hide();
        $('#no-house').show();
    } else {
        $('#no-house').hide();
        $('#address').text(property.Address);

        setFavButtonWording(property.Id);

        // set the enquire and email to a friend button links
        $('#btn-AddFave').after('<a class="btn btn-block" href="contact.html?address=' + property.Address + '">Make an enquiry</a>');
        $('#btn-AddFave').after('<a class="btn btn-block" href="mailto:?subject=Check%20out%20' + property.Address + '&amp;body=View%20the%20property%20at%20' + window.location.href + '">Email to a friend</a>');

        // removed existing carousel items and thumbnails
        $('.carousel-item').remove();
        $('.list-inline-item').remove();

        // now add the images for this house
        $(property.Images).each(function () {
            // need to check if this is the first image so we can set the active flags
            if ($('.carousel-item').length < 1) {
                $('.carousel-caption').after('<div class="active carousel-item" data-slide-number="0"><img class="d-block w-100" src="' + this + '" alt="Propery Image ' + $('.carousel-item').length + '"></div>');
                // add this image to the thumbnail list too
                $('.carousel-indicators').append('<li class="list-inline-item active"> <a id="carousel-selector-' + $('.list-inline-item').length + '" class="selected" data-slide-to="' + $('.list-inline-item').length + '" data-target="#propertyCarousel"> <img class="d-block w-100" src="' + this + '" alt="Propery Thumbnail Image ' + $('.carousel-item').length + '"></a> </li>');
            } else {
                // do the same for the rest without the active flags
                $('.carousel-item').last().after('<div class="carousel-item" ><img class="d-block w-100" src="' + this + '" alt="Propery Image ' + $('.carousel-item').length + '"></div>');
                $('.carousel-indicators').append('<li class="list-inline-item"> <a id="carousel-selector-' + $('.list-inline-item').length + '" class="selected" data-slide-to="' + $('.list-inline-item').length + '" data-target="#propertyCarousel"> <img class="d-block w-100" src="' + this + '" alt="Propery Thumbnail Image ' + $('.list-inline-item').length + '"></a> </li>');
            }
        });
        $('.carousel-indicators li').first().addClass('active'); // set the active flag for the first thumbnail. Could have done this above

        // Now update the easy bits with tje daya
        property.SaleType.toLowerCase() == "buy" ? $('#saleType').text('For sale') : $('#saleType').text('For rent');
        property.SaleType.toLowerCase() == "buy" ? $('.buy').html('TO BUY') : $('.buy').html('TO RENT');
        $('#houseType').text(property.Type);
        $('#price').html('<strong>from</strong>  £' + property.Price.toLocaleString());
        $('#bedrooms').text(property.Bedrooms);
        $('#bathrooms').text(property.Bathrooms);
        $('#receptions').text(property.Receptions);
        $('#heatingType').text(property.HeatingType);
        $('#info').text(property.Description);
        $('.modal-header').text(property.Address);
        $('.modal-body').html(property.MapHtml);
        $('#house-info').show();
    }
}

/**
 * Displays a list of properties on screen.
 *
 * @param {object} properties The list of properties.
 */
function displayProperties(properties) {
    // empty the container divs
    $('.listing-row1').empty();
    $('.listing-row').empty();
    $('.listing-row3').empty();

    if ($(properties).length < 1) {
        // if no properties inform the user
        $('.listing-row1').append('<span class="ml-5">No properties matching search criteria</span>');
    } else {
        // set a count so we know which container to add the property to
        var count = 1;
        $(properties).each(function () {
            // truncate the descripting to 150 chars and create html for the property
            var cardText = this.Description.length > 150 ? this.Description.substr(0, 150) + '...' : this.Description;
            var html = '<div class="col-lg-3 col-md-6 col-sm-6 col-xs-12 listing-col">' +
                '<div class="card">' +
                '<div class="sale-type"><strong>' +
                this.SaleType +
                '</strong></div>' +
                '<img src="' + this.MainImg + '" class="card-img-top" alt="card-img-top">' +
                '<div class="card-body">' +
                '<h2 class="card-title">' + this.Address + '</h2>' +
                '<h3 class="card-price">£' + this.Price.toLocaleString() + '</h3>' +
                '<p class="card-text">' + cardText + '</p>' +
                '' +
                '</div>' +
                '<div class="card-footer">' +
                '<a href="singleListing.html?id=' + this.Id + '">View listing</a>' +
                '</div>' +
                '</div>' +
                '</div>';
            // add propety html to container div
            if (count <= 4) {
                $('.listing-row1').append(html);
            } else if (count > 4 && count <= 8) {
                $('.listing-row').append(html);
            } else if (count > 8) {
                $('.listing-row3').append(html);
            }
            count++;
        });
    }
}


/**
 * Returns an object with a key and value for each search param.
 * 
 * @return {object} containing the search params
 */
function getSearchParams() {

    // get all params from the UI
    var address = $('#address-filter-input').val();
    var saleTypeId = $("[name='customRadio']:checked").attr('id');
    var saleType = $('label[for="' + saleTypeId + '"]').text();
    saleType = saleType == 'Both' ? '' : saleType; // if saletype == Both display all
    var bedrooms = $('#bedroom-select option:selected').attr('value');

    // all params selected
    if (address.length > 0 && saleType.length > 0 && bedrooms !== undefined) {
        return { "Address": address, "SaleType": saleType, "Bedrooms": bedrooms };
    }

    // only address
    if (address.length > 0 && saleType.length < 1 && bedrooms == undefined) {
        return { "Address": address };
    }

    // address and sale type
    if (address.length > 0 && saleType.length > 0 && bedrooms == undefined) {
        return { "Address": address, "SaleType": saleType };
    }

    // address and bedrooms
    if (address.length > 0 && saleType.length < 1 && bedrooms !== undefined) {
        return { "Address": address, "Bedrooms": bedrooms };
    }

    // saletype and 
    if (address.length < 1 && saleType.length > 0 && bedrooms !== undefined) {
        return { "SaleType": saleType, "Bedrooms": bedrooms };
    }

    // only saletype
    if (address.length < 1 && saleType.length > 0 && bedrooms == undefined) {
        return { "SaleType": saleType };
    }

    // only bedroom
    if (address.length < 1 && saleType.length < 1 && bedrooms !== undefined) {
        return { "Bedrooms": bedrooms };
    }
    return {}
}

/**
 * Searches a property's keys against a param.
 *
 * @param {object} obj The property to search.
 * @param {string} str The param to search.
 * @return {object} a property if a match is found.
 */
function searchHouseAttributes(obj, str) {
    for (var key in obj) {
        if (typeof (obj[key]) == typeof (str)) {
            if (obj[key].toLowerCase().includes(str.toLowerCase())) {
                return this;
            }
        }
    }
}

/**
 * Returns a property that matches the id param provided.
 *
 * @param {object} obj The list of properties.
 * @param {string} id The id to search for.
 * @return {object} The request property. undefined if not found.
 */
function getPropertyById(obj, id) {
    var property = undefined;
    $(obj).each(function () {
        // iterate through the properties. If ids match return this property.
        if (this["Id"] == Number(id)) {
            property = this;
        }
    });
    return property;
}

/**
 * Checks a list of properties for dupes.
 *
 * @param {object} obj The list of properties.
 * @param {number} id The id to check for.
 * @return {number} A count of the propertys occurences in the list.
 */
function getInstanceCounts(obj, id) {
    var count = 0;
    $(obj).each(function () {
        if (this["Id"] == id) {
            count++;
        }
    });
    return count;
}

/**
 * Returns a list of properties that contain a search term.
 *
 * @param {object} obj The list of properties.
 * @param {string} searchTerm The search term.
 * @return {object} An array properties that contain the search term.
 */
function searchAllProperties(obj, searchTerm) {
    var results = new Array();
    $(obj).each(function () {
        if (searchHouseAttributes(this, searchTerm) != null) {
            results.push(this);
        }
    });
    return results;
}

/**
 * Returns an array of properties that match multiple params.
 *
 * @param {object} obj The list of properties.
 * @param {object} searchParams An object containing a key and value for each search term.
 * @return {object} an array of properties that match multiple params.
 */
function multipleFilterProperties(obj, searchParams) {
    var results = new Array();
    $(obj).each(function () {
        var house = this;
        var found = false;
        // check each property against each param. If a match occurs push on to array
        for (var key in searchParams) {
            if (key == "Bedrooms") {
                if (searchParams[key] == 4 && house[key] >= 4) {
                    found = true;
                    results.push(house);
                } else if (searchParams[key] == house[key]) {
                    found = true;
                    results.push(house);
                }
            } else if (house[key].toLowerCase().includes(searchParams[key].toLowerCase())) {
                found = true;
                results.push(house); // push this into the array if it matches the criteria
            } else {
                found = false;
            }
            if (!found) {
                break;
            }
        }
    });

    // above code pushes the property on to the array for each param it matches against
    // if if only one param we can return this now
    var paramCount = Object.keys(searchParams).length;
    if (paramCount == 1) {
        return results;
    }


    // now create a final array for houses that meet all the params    
    var finalResults = new Array();
    $(results).each(function () {
        var inFinalResults = getInstanceCounts(finalResults, this["Id"]) > 0;
        // if the count of the property matches the count of the params, this property matches all criteria so we can push it
        if (getInstanceCounts(results, this["Id"]) == paramCount && !inFinalResults) {
            finalResults.push(this);
        }
    });
    return finalResults;
}

// global variable with properties
var propertyObject = {
    "houses": [
        {
            "Id": 1,
            "Address": "14 Garnerville Park, Belfast, BT4",
            "Price": 169950,
            "SaleType": "Buy",
            "Bedrooms": 3,
            "Bathrooms": 1,
            "Receptions": 1,
            "Type": "Semi-detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house1/img1.jpg",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2310.418270022023!2d-5.860380983969594!3d54.61424008026423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48610a269db405e1%3A0x18bec6dfeccf6351!2sGarnerville%20Park%2C%20Belfast!5e0!3m2!1sen!2suk!4v1618353377872!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house1/img1.jpg",
                "images/listings/house1/img2.jpg",
                "images/listings/house1/img3.jpg",
                "images/listings/house1/img4.jpg",
                "images/listings/house1/img5.jpg",
                "images/listings/house1/img6.jpg"
            ]
        },
        {
            "Id": 2,
            "Address": "3 Stockmans Lane, Belfast, BT9",
            "Price": 800 + " pm",
            "SaleType": "Rent",
            "Bedrooms": 1,
            "Bathrooms": 1,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house2/img1.jpg",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d795.3354010237257!2d-5.97508481334179!3d54.57242927925835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48610620273a3943%3A0xaf51b5464bbbab69!2sStockmans%20Ln%2C%20Belfast!5e0!3m2!1sen!2suk!4v1618353409782!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house2/img1.jpg",
                "images/listings/house2/img2.jpg",
                "images/listings/house2/img3.jpg",
                "images/listings/house2/img4.jpg",
                "images/listings/house2/img5.jpg",
                "images/listings/house2/img6.jpg"
            ]
        },
        {
            "Id": 3,
            "Address": "37 Pine Cross Dunmurry, Belfast, BT17",
            "Price": 500 + " pm",
            "SaleType": "Rent",
            "Bedrooms": 2,
            "Bathrooms": 1,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house3/img1.jpg",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2314.4726487706803!2d-6.014786784247383!3d54.542793092120334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486105d72c51d87d%3A0x2c7f2620c8d31db8!2sPine%20Cross%2C%20Dunmurry%2C%20Belfast!5e0!3m2!1sen!2suk!4v1618353257419!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house3/img1.jpg",
                "images/listings/house3/img2.jpg",
                "images/listings/house3/img3.jpg",
                "images/listings/house3/img4.jpg",
                "images/listings/house3/img5.jpg",
                "images/listings/house3/img6.jpg"
            ]
        },
        {
            "Id": 4,
            "Address": "3 Beechwood Gardens, Bangor BT20",
            "Price": 109950,
            "SaleType": "Buy",
            "Bedrooms": 3,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "End Terrace",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house4/img1.png",
            "Description": "This beautifully presented End Terrace property is located off Clandeboye Road, close to shops, schools and Bangor town centre. The accommodation comprises of three bedrooms, one reception room with wood burning stove, modern fitted kitchen and bathroom with luxury white suite. The property also benefits from the installation of gas fired heating and upvc double glazed windows. All in all a well presented starter home in a popular residential location that will appeal to both first time buyers and investors alike.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2308.1476858616124!2d-5.684672784008743!3d54.65422508364263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619e27e44f3ca7%3A0x4f782bf3716856c9!2s3%20Beechwood%20Gardens%2C%20Bangor%20BT20%203JD!5e0!3m2!1sen!2suk!4v1618244476750!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house4/img1.png",
                "images/listings/house4/img2.png",
                "images/listings/house4/img3.png",
                "images/listings/house4/img4.png",
                "images/listings/house4/img5.png",
                "images/listings/house4/img6.png"
            ]
        },
        {
            "Id": 5,
            "Address": "12 Killaire Road, Bangor BT19",
            "Price": 795000,
            "SaleType": "Buy",
            "Bedrooms": 4,
            "Bathrooms": 2,
            "Receptions": 2,
            "Type": "Detached Bungalow In Prime Location",
            "HeatingType": "Gas",
            "MainImg": "images/listings/house5/img1.png",
            "Description": "Sea Garden, 6a Killaire Road, occupies one of the best frontline Marine sites available in North Down. This property has direct access to the coastal path and its own slipway yet remains exceptionally private and well screened in this mature woodland setting.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2307.448964879511!2d-5.709572484008391!3d54.66652558270618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619fcc13ae492d%3A0xd3a8b532df6c689b!2s12%20Killaire%20Rd%2C%20Bangor%20BT19%201EY!5e0!3m2!1sen!2suk!4v1618244561308!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house5/img1.png",
                "images/listings/house5/img2.png",
                "images/listings/house5/img3.png",
                "images/listings/house5/img4.png",
                "images/listings/house5/img5.png",
                "images/listings/house5/img6.png"
            ]
        },
        {
            "Id": 6,
            "Address": "5 College Green, College Avenue, Bangor BT20",
            "Price": 335000,
            "SaleType": "Buy",
            "Bedrooms": 6,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Gas",
            "MainImg": "images/listings/house6/img1.png",
            "Description": "This unique refurbishment offers a select range of mews style townhouses and apartments featuring period elevational features and detailing that reflects the craftsmanship of a bygone era. These unique homes will offer an unrivalled specification and will introduce a whole new choice of stylish family living with a traditional twist to this extremely sought after part of Bangor.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2307.5336884411095!2d-5.662478284008426!3d54.6650341828197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619f5861f4b569%3A0xe46f82059f18ffb2!2sCollege%20Green!5e0!3m2!1sen!2suk!4v1618244864171!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house6/img1.png",
                "images/listings/house6/img2.png",
                "images/listings/house6/img3.png",
                "images/listings/house6/img4.png",
                "images/listings/house6/img5.png",
                "images/listings/house6/img6.png"
            ]
        },
        {
            "Id": 7,
            "Address": "9 Glenavy Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 5,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house7/img1.png",
            "Description": "Well located property situated a short distance from A1 dual carriageway, benefiting from a spacious garden and adjoining yard.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d730.2569252404732!2d-6.0989402707258975!3d54.53141597694995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486103ef756cb155%3A0x527d1aab2774b7c4!2s9%20Glenavy%20Rd%2C%20Lisburn%20BT28%203UT!5e1!3m2!1sen!2suk!4v1618584831777!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house7/img1.png",
                "images/listings/house7/img2.png",
                "images/listings/house7/img3.png",
                "images/listings/house7/img4.png",
                "images/listings/house7/img5.png",
                "images/listings/house7/img6.png"
            ]
        },
        {
            "Id": 8,
            "Address": "1 Finlays Road, Newtownards BT22",
            "Price": 290000,
            "SaleType": "Buy",
            "Bedrooms": 1,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house8/img1.png",
            "Description": "Occupying an incredible site which looks directly onto Strangford Lough and is only separated by the width of the road, we are delighted to offer for sale this unique 4 bed detached family house and must strongly recommend internal inspection.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d686.6164163537404!2d-5.658359170720424!3d54.5720439987659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTTCsDM0JzE5LjQiTiA1wrAzOScyOC4xIlc!5e1!3m2!1sen!2suk!4v1618585273814!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house8/img1.png",
                "images/listings/house8/img2.png",
                "images/listings/house8/img3.png",
                "images/listings/house8/img4.png",
                "images/listings/house8/img5.png",
                "images/listings/house8/img6.png"
            ]
        },
        {
            "Id": 9,
            "Address": "3 Killeen Avenue, Bangor BT19",
            "Price": 450 + " pm",
            "SaleType": "Rent",
            "Bedrooms": 2,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Semi-Detached",
            "HeatingType": "Gas",
            "MainImg": "images/listings/house9/img1.png",
            "Description": "Ideally situated within close proximity of Tesco Springhill this semi-detached chalet has will appeal to a broad spectrum of buyers. The accommodation comprises of 3 bedrooms and a shower room with white suite all on the 1st floor with a lounge, dining room and kitchen on the ground floor as well as the all-important cloakroom with WC. Externally there are very private gardens in lawns and patio, off-street parking, and a recently constructed detached garage. All in all a well presented home in a convenient and popular residential location.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2740.9711957441978!2d-5.700681783854863!3d54.65354578027374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619e2ad435c109%3A0x35e36d1444f0ad9b!2s3%20Killeen%20Ave%2C%20Bangor%20BT19%201NB!5e1!3m2!1sen!2suk!4v1618585635174!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house9/img1.png",
                "images/listings/house9/img2.png",
                "images/listings/house9/img3.png",
                "images/listings/house9/img4.png",
                "images/listings/house9/img5.png",
                "images/listings/house9/img6.png"
            ]
        },
        {
            "Id": 10,
            "Address": "22 Brooklands Park, Whitehead BT38",
            "Price": 179950,
            "SaleType": "Buy",
            "Bedrooms": 4,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house10/img1.png",
            "Description": "Impressive detached property situated in a popular and residential location, internal viewing is essential to appreciate all this fine home has to offer. A credit to its present owners the internal accommodation offers lounge, spacious well fitted kitchen/dining area with patio doors to rear garden, three double bedrooms and a deluxe white bathroom suite. Enhanced further with an oil fired central heating system, double glazing, attached garage and well enclosed rear garden. Situated just a short walk to Whitehead town centre, train station and picturesque coastal Blackhead path.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2733.9525835452605!2d-5.721690183851526!3d54.75753638029886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486199208bc95a71%3A0x1cd07f08f4bf0995!2s22%20Brooklands%20Park%2C%20Whitehead%2C%20Carrickfergus%20BT38%209SN!5e1!3m2!1sen!2suk!4v1618585858358!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house10/img1.png",
                "images/listings/house10/img2.png",
                "images/listings/house10/img3.png",
                "images/listings/house10/img4.png",
                "images/listings/house10/img5.png",
                "images/listings/house10/img6.png"
            ]
        },
        {
            "Id": 11,
            "Address": "1 Palestine Street, Belfast BT7",
            "Price": 1000 + " pm",
            "SaleType": "Rent",
            "Bedrooms": 4,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Terrace",
            "HeatingType": "Gas",
            "MainImg": "images/listings/house11/img1.png",
            "Description": "Offered to rent is this four bedroomed mid terraced property, situated within the \"Holylands\" of South Belfast it is a short stroll to Queens University, Botanic Avenue and Ormeau Road. A popular location for students this property benefits from being HMO registered.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2917.260387471108!2d-5.929939383944222!3d54.58404688898274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486108e5207b4dc1%3A0x91cdf11cc6a5895c!2s1%20Palestine%20St%2C%20Belfast%20BT7%201GX!5e1!3m2!1sen!2suk!4v1618586035559!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house11/img1.png",
                "images/listings/house11/img2.png",
                "images/listings/house11/img3.png",
                "images/listings/house11/img4.png",
                "images/listings/house11/img5.png",
                "images/listings/house11/img6.png"
            ]
        },
        {
            "Id": 12,
            "Address": "10 Brompton Road, Bangor BT20",
            "Price": 1500000,
            "SaleType": "Buy",
            "Bedrooms": 6,
            "Bathrooms": 2,
            "Receptions": 2,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "images/listings/house12/img1.png",
            "Description": "If you have ever enjoyed life in an atmospheric Boutique Hotel and wondered why the rest of your life didn’t match up to those standards then 10 Brompton Road is the ideal solution……..this Property is opulence personified.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2911.342814611294!2d-5.687476083941933!3d54.666648482696665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619e3a39b7394f%3A0x27bf66d712ca90fc!2s10%20Brompton%20Rd%2C%20Bangor%20BT20%203RE!5e1!3m2!1sen!2suk!4v1618586213140!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["images/listings/house12/img1.png",
                "images/listings/house12/img2.png",
                "images/listings/house12/img3.png",
                "images/listings/house12/img4.png",
                "images/listings/house12/img5.png",
                "images/listings/house12/img6.png"
            ]
        },
    ]
};
