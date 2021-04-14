$(document).ready(function () {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('properties');

    // Put the object into storage
    if (retrievedObject == null) {
        localStorage.setItem('properties', JSON.stringify(propertyObject));
    } else {
        if (retrievedObject != JSON.stringify(propertyObject)) {
            localStorage.setItem('properties', JSON.stringify(propertyObject));
        }
    }

    retrievedObject = localStorage.getItem('properties');
    var json = JSON.parse(retrievedObject);

    // if address-filter-input exists we are on listings page
    if ($('#address-filter-input').length > 0) {

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

        $('#btn-Clear').click(function () {
            $('#address-filter-input').val('');
            $('#bedroom-select').val('-Please Choose-');
            $('#bedroom-select').change();
            $("[name='customRadio']:checked").removeAttr("checked");
            $('.search-term').remove();
            var newurl = window.location.href.split('?')[0];
            window.history.pushState({ path: newurl }, '', newurl);
            resetProperties(json);
        });

        const urlParams = new URLSearchParams(window.location.search);
        var properties = json.houses;
        const searchTerm = urlParams.get('searchTerm');
        if (searchTerm != null) {
            $('.dream').after('<div class="search-term"><br><span>Showing results for search: ' + unescape(searchTerm) + '</span></div>');
            properties = searchAllProperties(properties, unescape(searchTerm))
        }

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
        displayProperties(properties);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        var property = getPropertyById(json.houses, propertyId);
        displaySingleProperty(property);

        $('.add-fave').click(function () {
            var button = this;
            var favProperties = localStorage.getItem('favProperties');
            if (favProperties == null || favProperties.length < 1) {
                favProperties = new Array();
            }

            if ($(button).text() == 'Add to favourites') {
                var newProps = new Array();
                $(JSON.parse(favProperties)).each(function () {
                    newProps.push(this);
                });
                newProps.push({ "Id": propertyId, "Address": $('#address').text() });
                localStorage.setItem('favProperties', JSON.stringify(newProps));
                $('#no-favourites').after('<a class="dropdown-item fav-property" data-fave-id="' + propertyId + '" href="singleListing.html?id=' + propertyId + '">' + $('#address').text() + '</a>');
                $('#no-favourites').hide();
                $(button).text('Remove from favourites');
            } else {
                var newProps = new Array();
                $(JSON.parse(favProperties)).each(function () {
                    if (Number(this["Id"]) != propertyId) {
                        newProps.push(this);
                    }
                });

                localStorage.setItem('favProperties', JSON.stringify(newProps));

                $('.fav-property').each(function () {
                    if (Number($(this).attr('data-fave-id')) == propertyId) {
                        $(this).remove();
                    }
                });

                $('.fav-property').length > 0 ? $('#no-favourites').hide() : $('#no-favourites').show();

                $(button).text('Add to favourites');
            }
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

function propertySearch(json) {
    const urlParams = new URLSearchParams(window.location.search);
    var properties = json.houses;
    const searchTerm = urlParams.get('searchTerm');
    if (searchTerm != null) {
        properties = searchAllProperties(properties, unescape(searchTerm))
    }

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

    var searchObj = getSearchParams();
    if (Object.keys(searchObj).length > 0) {
        var results = multipleFilterProperties(properties, searchObj);
        displayProperties(results);
    } else if ((Object.keys(searchObj).length == 0 && saleTypeVal == 'Both') || (Object.keys(searchObj).length == 0 && searchTerm != null)) {
        displayProperties(properties);
    } else {
        resetProperties();
    }
}

function resetProperties() {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('properties');
    var json = JSON.parse(retrievedObject);

    displayProperties(json.houses);
}

function setFavButtonWording(propertyId) {
    var favProperties = localStorage.getItem('favProperties');
    if (favProperties == null || favProperties.length < 1) {
        return;
    }
    $(JSON.parse(favProperties)).each(function () {
        if (Number(this["Id"]) == propertyId) {
            $('#btn-AddFave').text('Remove from favourites');
        }
    });
}

function displaySingleProperty(property) {
    if (property == undefined) {
        $('#house-info').hide();
        $('#no-house').show();
    } else {
        $('#no-house').hide();
        $('#address').text(property.Address);

        setFavButtonWording(property.Id);
        $('#btn-AddFave').after('<a class="btn btn-block" href="contact.html?address=' + property.Address + '">Make an enquiry</a>');
        $('#btn-AddFave').after('<a class="btn btn-block" href="mailto:?subject=Check%20out%20' + property.Address + '&amp;body=View%20the%20property%20at%20' + window.location.href + '">Email to a friend</a>');

        $('.carousel-item').remove();
        $('.list-inline-item').remove();

        $(property.Images).each(function () {
            if ($('.carousel-item').length < 1) {
                $('.carousel-caption').after('<div class="active carousel-item" data-slide-number="0"><img class="d-block w-100" src="' + this + '" alt="Propery Image ' + $('.carousel-item').length + '"></div>');
                $('.carousel-indicators').append('<li class="list-inline-item active"> <a id="carousel-selector-' + $('.list-inline-item').length + '" class="selected" data-slide-to="' + $('.list-inline-item').length + '" data-target="#propertyCarousel"> <img class="d-block w-100" src="' + this + '" alt="Propery Thumbnail Image ' + $('.carousel-item').length + '"></a> </li>');
            } else {
                $('.carousel-item').last().after('<div class="carousel-item" ><img class="d-block w-100" src="' + this + '" alt="Propery Image ' + $('.carousel-item').length + '"></div>');
                $('.carousel-indicators').append('<li class="list-inline-item"> <a id="carousel-selector-' + $('.list-inline-item').length + '" class="selected" data-slide-to="' + $('.list-inline-item').length + '" data-target="#propertyCarousel"> <img class="d-block w-100" src="' + this + '" alt="Propery Thumbnail Image ' + $('.list-inline-item').length + '"></a> </li>');
            }
        });
        $('.carousel-indicators li').first().addClass('active');

        property.SaleType.toLowerCase() == "buy" ? $('#saleType').text('For sale') : $('#saleType').text('For rent');
        property.SaleType.toLowerCase() == "buy" ? $('.buy').html('TO BUY') : $('.buy').html('TO RENT');
        $('#houseType').text(property.Type);
        $('#price').html('<b>from</b>  £' + property.Price.toLocaleString());
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

function displayProperties(properties) {
    $('.listing-row1').empty();
    $('.listing-row').empty();
    $('.listing-row3').empty();

    if ($(properties).length < 1) {
        $('.listing-row1').append('<span class="ml-5">No properties matching search criteria</span>');
    } else {
        var count = 1;
        $(properties).each(function () {
            var cardText = this.Description.length > 150 ? this.Description.substr(0, 150) + '...' : this.Description;
            var html = '<div class="col-lg-3 col-md-6 col-xs-12 listing-col">' +
                '<div class="card">' +
                '<div class="sale-type">' +
                this.SaleType +
                '</div>' +
                '<img src="' + this.MainImg + '" class="card-img-top" alt="card-img-top">' +
                '<div class="card-body">' +
                '<h5 class="card-title">' + this.Address + '</h5>' +
                '<h3 class="card-price">£' + this.Price.toLocaleString() + '</h3>' +
                '<p class="card-text">' + cardText + '</p>' +
                '<p class="card-text"><small class="view-text"><a href="singleListing.html?id=' + this.Id + '">View listing</a></small></p>' +
                '</div>' +
                '</div>' +
                '</div>';
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

function getSearchParams() {

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

function searchHouseAttributes(obj, str) {
    for (var key in obj) {
        if (typeof (obj[key]) == typeof (str)) {
            if (obj[key].toLowerCase().includes(str.toLowerCase())) {
                return this;
            }
        }
    }
}

function getPropertyById(obj, id) {
    var property = undefined;
    $(obj).each(function () {
        if (this["Id"] == Number(id)) {
            property = this;
        }
    });
    return property;
}

function getInstanceCounts(obj, id) {
    var count = 0;
    $(obj).each(function () {
        if (this["Id"] == id) {
            count++;
        }
    });
    return count;
}

function searchAllProperties(obj, searchTerm) {
    var results = new Array();
    $(obj).each(function () {
        if (searchHouseAttributes(this, searchTerm) != null) {
            results.push(this);
        }
    });
    return results;
}

function multipleFilterProperties(obj, searchParams) {
    var results = new Array();
    $(obj).each(function () {
        var house = this;
        var found = false;
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

    var paramCount = Object.keys(searchParams).length;
    if (paramCount == 1) {
        return results;
    }

    // now create a final array for houses that meet all the params    
    var finalResults = new Array();
    $(results).each(function () {
        var inFinalResults = getInstanceCounts(finalResults, this["Id"]) > 0;
        if (getInstanceCounts(results, this["Id"]) == paramCount && !inFinalResults) {
            finalResults.push(this);
        }
    });
    return finalResults;
}

const sort_by = (field, desc) => {

    const key = function (x) {
        return x[field]
    };

    desc = !desc ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), desc * ((a > b) - (b > a));
    }
}

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
            "MainImg": "./images/listings/house1/img1.jpg",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2310.418270022023!2d-5.860380983969594!3d54.61424008026423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48610a269db405e1%3A0x18bec6dfeccf6351!2sGarnerville%20Park%2C%20Belfast!5e0!3m2!1sen!2suk!4v1618353377872!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house1/img1.jpg",
                "./images/listings/house1/img2.jpg",
                "./images/listings/house1/img3.jpg",
                "./images/listings/house1/img4.jpg",
                "./images/listings/house1/img5.jpg",
                "./images/listings/house1/img6.jpg"
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
            "MainImg": "./images/listings/house2/img1.jpg",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d795.3354010237257!2d-5.97508481334179!3d54.57242927925835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48610620273a3943%3A0xaf51b5464bbbab69!2sStockmans%20Ln%2C%20Belfast!5e0!3m2!1sen!2suk!4v1618353409782!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house2/img1.jpg",
                "./images/listings/house2/img2.jpg",
                "./images/listings/house2/img3.jpg",
                "./images/listings/house2/img4.jpg",
                "./images/listings/house2/img5.jpg",
                "./images/listings/house2/img6.jpg"
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
            "MainImg": "./images/listings/house3/img1.jpg",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2314.4726487706803!2d-6.014786784247383!3d54.542793092120334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486105d72c51d87d%3A0x2c7f2620c8d31db8!2sPine%20Cross%2C%20Dunmurry%2C%20Belfast!5e0!3m2!1sen!2suk!4v1618353257419!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house3/img1.jpg",
                "./images/listings/house3/img2.jpg",
                "./images/listings/house3/img3.jpg",
                "./images/listings/house3/img4.jpg",
                "./images/listings/house3/img5.jpg",
                "./images/listings/house3/img6.jpg"
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
            "MainImg": "./images/listings/house4/img1.png",
            "Description": "This beautifully presented End Terrace property is located off Clandeboye Road, close to shops, schools and Bangor town centre. The accommodation comprises of three bedrooms, one reception room with wood burning stove, modern fitted kitchen and bathroom with luxury white suite. The property also benefits from the installation of gas fired heating and upvc double glazed windows. All in all a well presented starter home in a popular residential location that will appeal to both first time buyers and investors alike.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2308.1476858616124!2d-5.684672784008743!3d54.65422508364263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619e27e44f3ca7%3A0x4f782bf3716856c9!2s3%20Beechwood%20Gardens%2C%20Bangor%20BT20%203JD!5e0!3m2!1sen!2suk!4v1618244476750!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house4/img1.png",
                "./images/listings/house4/img2.png",
                "./images/listings/house4/img3.png",
                "./images/listings/house4/img4.png",
                "./images/listings/house4/img5.png",
                "./images/listings/house4/img6.png"
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
            "MainImg": "./images/listings/house5/img1.png",
            "Description": "Sea Garden, 6a Killaire Road, occupies one of the best frontline Marine sites available in North Down. This property has direct access to the coastal path and its own slipway yet remains exceptionally private and well screened in this mature woodland setting.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2307.448964879511!2d-5.709572484008391!3d54.66652558270618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619fcc13ae492d%3A0xd3a8b532df6c689b!2s12%20Killaire%20Rd%2C%20Bangor%20BT19%201EY!5e0!3m2!1sen!2suk!4v1618244561308!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house5/img1.png",
                "./images/listings/house5/img2.png",
                "./images/listings/house5/img3.png",
                "./images/listings/house5/img4.png",
                "./images/listings/house5/img5.png",
                "./images/listings/house5/img6.png"
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
            "MainImg": "./images/listings/house6/img1.png",
            "Description": "This unique refurbishment offers a select range of mews style townhouses and apartments featuring period elevational features and detailing that reflects the craftsmanship of a bygone era. These unique homes will offer an unrivalled specification and will introduce a whole new choice of stylish family living with a traditional twist to this extremely sought after part of Bangor.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2307.5336884411095!2d-5.662478284008426!3d54.6650341828197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48619f5861f4b569%3A0xe46f82059f18ffb2!2sCollege%20Green!5e0!3m2!1sen!2suk!4v1618244864171!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house6/img1.png",
                "./images/listings/house6/img2.png",
                "./images/listings/house6/img3.png",
                "./images/listings/house6/img4.png",
                "./images/listings/house6/img5.png",
                "./images/listings/house6/img6.png"
            ]
        },
        {
            "Id": 7,
            "Address": "#3 Lisburn Lane",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 5,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "./images/listings/house7/img1.png",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1158.2481961086469!2d-6.059753412914514!3d54.50710657962411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486104635e6ef0a7%3A0x7cfb28ea31729258!2s13%20Jubilee%20Ave%2C%20Lisburn%20BT28%201EB!5e0!3m2!1sen!2suk!4v1617957253292!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house7/img1.png",
                "./images/listings/house7/img2.png",
                "./images/listings/house7/img3.png",
                "./images/listings/house7/img4.png",
                "./images/listings/house7/img5.png",
                "./images/listings/house7/img6.png"
            ]
        },
        {
            "Id": 8,
            "Address": "#4 Lisburn Lane",
            "Price": 90000,
            "SaleType": "Rent",
            "Bedrooms": 1,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "./images/listings/house8/img1.png",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1158.2481961086469!2d-6.059753412914514!3d54.50710657962411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486104635e6ef0a7%3A0x7cfb28ea31729258!2s13%20Jubilee%20Ave%2C%20Lisburn%20BT28%201EB!5e0!3m2!1sen!2suk!4v1617957253292!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house8/img1.png",
                "./images/listings/house8/img2.png",
                "./images/listings/house8/img3.png",
                "./images/listings/house8/img4.png",
                "./images/listings/house8/img5.png",
                "./images/listings/house8/img6.png"
            ]
        },
        {
            "Id": 9,
            "Address": "#1 Falls Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 2,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "./images/listings/house9/img1.png",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1158.2481961086469!2d-6.059753412914514!3d54.50710657962411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486104635e6ef0a7%3A0x7cfb28ea31729258!2s13%20Jubilee%20Ave%2C%20Lisburn%20BT28%201EB!5e0!3m2!1sen!2suk!4v1617957253292!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house9/img1.png",
                "./images/listings/house9/img2.png",
                "./images/listings/house9/img3.png",
                "./images/listings/house9/img4.png",
                "./images/listings/house9/img5.png",
                "./images/listings/house9/img6.png"
            ]
        },
        {
            "Id": 10,
            "Address": "#2 Falls Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 4,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "./images/listings/house10/img1.png",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1158.2481961086469!2d-6.059753412914514!3d54.50710657962411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486104635e6ef0a7%3A0x7cfb28ea31729258!2s13%20Jubilee%20Ave%2C%20Lisburn%20BT28%201EB!5e0!3m2!1sen!2suk!4v1617957253292!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house10/img1.png",
                "./images/listings/house10/img2.png",
                "./images/listings/house10/img3.png",
                "./images/listings/house10/img4.png",
                "./images/listings/house10/img5.png",
                "./images/listings/house10/img6.png"
            ]
        },
        {
            "Id": 11,
            "Address": "#3 Falls Road",
            "Price": 90000,
            "SaleType": "Rent",
            "Bedrooms": 2,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "./images/listings/house11/img1.png",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1158.2481961086469!2d-6.059753412914514!3d54.50710657962411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486104635e6ef0a7%3A0x7cfb28ea31729258!2s13%20Jubilee%20Ave%2C%20Lisburn%20BT28%201EB!5e0!3m2!1sen!2suk!4v1617957253292!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house11/img1.png",
                "./images/listings/house11/img2.png",
                "./images/listings/house11/img3.png",
                "./images/listings/house11/img4.png",
                "./images/listings/house11/img5.png",
                "./images/listings/house11/img6.png"
            ]
        },
        {
            "Id": 12,
            "Address": "#4 Falls Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 1,
            "Bathrooms": 2,
            "Receptions": 1,
            "Type": "Detached",
            "HeatingType": "Oil",
            "MainImg": "./images/listings/house12/img1.png",
            "Description": "Immaculately presented spacious detached home, situated in Belfast, it enjoys a good position within a popular and quiet cul-de-sac with an open outlook to the front with an enclosed private garden. The property is convenient location to the local shops and Carrick primary school is within walking distance, making it desirable for those with young families. The interior of the home has been finished to a very high ‘Show home’ specification and provides bright, spacious accommodation. Accommodation comprises of; Hallway, Reception Room, Kitchen/Dining Room, Three Bedrooms, and Bathroom. There is a tarmac driveway with off street parking for several vehicles. Early Viewing is highly recommended.",
            "MapHtml": '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1158.2481961086469!2d-6.059753412914514!3d54.50710657962411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486104635e6ef0a7%3A0x7cfb28ea31729258!2s13%20Jubilee%20Ave%2C%20Lisburn%20BT28%201EB!5e0!3m2!1sen!2suk!4v1617957253292!5m2!1sen!2suk" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            "Images": ["./images/listings/house12/img1.png",
                "./images/listings/house12/img2.png",
                "./images/listings/house12/img3.png",
                "./images/listings/house12/img4.png",
                "./images/listings/house12/img5.png",
                "./images/listings/house12/img6.png"
            ]
        },
    ]
};
