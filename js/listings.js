$(document).ready(function () {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('properties');

    // Put the object into storage
    if (retrievedObject == null) {
        localStorage.setItem('properties', JSON.stringify(propertyObject));
    }
    retrievedObject = localStorage.getItem('properties');
    var json = JSON.parse(retrievedObject);

    // if address-filter-input exists we are on listings page
    if ($('#address-filter-input').length > 0) {
        resetProperties();
        $('#address-filter-input').on('input', function () {
            var searchObj = getSearchParams();
            if (Object.keys(searchObj).length > 0) {
                var results = multipleFilterProperties(json.houses, searchObj);
                displayProperties(results);
            } else {
                resetProperties();
            }
        });
    
        $('[name="customRadio"]').change(function () {
            var searchObj = getSearchParams();
            if (Object.keys(searchObj).length > 0) {
                var results = multipleFilterProperties(json.houses, searchObj);
                displayProperties(results);
            } else {
                resetProperties();
            }
        });
    }
});

function resetProperties() {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('properties');
    var json = JSON.parse(retrievedObject);

    displayProperties(json.houses);
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
            if (count <= 4) {
                $('.listing-row1').append('<div class="col-lg-3 col-md-6 col-xs-12 listing-col">' +
                    '<div class="card">' +
                    '<img src="' + this.MainImg + '" class="card-img-top" alt="card-img-top">' +
                    '<div class="card-body">' +
                    '<h5 class="card-title">' + this.Address + '</h5>' +
                    '<h3 class="card-price">£' + this.Price.toLocaleString() + '</h3>' +
                    '<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>' +
                    '<p class="card-text"><small class="view-text">View listing</small></p>' +
                    '</div>' +
                    '</div>' +
                    '</div>');
            } else if (count > 4 && count <= 8) {
                $('.listing-row').append('<div class="col-lg-3 col-md-6 col-xs-12 listing-col">' +
                    '<div class="card">' +
                    '<img src="' + this.MainImg + '" class="card-img-top" alt="card-img-top">' +
                    '<div class="card-body">' +
                    '<h5 class="card-title">' + this.Address + '</h5>' +
                    '<h3 class="card-price">£' + this.Price.toLocaleString() + '</h3>' +
                    '<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>' +
                    '<p class="card-text"><small class="view-text">View listing</small></p>' +
                    '</div>' +
                    '</div>' +
                    '</div>');
            } else if (count > 8) {
                $('.listing-row3').append('<div class="col-lg-3 col-md-6 col-xs-12 listing-col">' +
                    '<div class="card">' +
                    '<img src="' + this.MainImg + '" class="card-img-top" alt="card-img-top">' +
                    '<div class="card-body">' +
                    '<h5 class="card-title">' + this.Address + '</h5>' +
                    '<h3 class="card-price">£' + this.Price.toLocaleString() + '</h3>' +
                    '<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>' +
                    '<p class="card-text"><small class="view-text">View listing</small></p>' +
                    '</div>' +
                    '</div>' +
                    '</div>');
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
    var bedrooms = '';

    // all params selected
    if (address.length > 0 && saleType.length > 0 && bedrooms.length > 0) {
        return { "Address": address, "SaleType": saleType, "Bedrooms": bedrooms };
    }

    // only address
    if (address.length > 0 && saleType.length < 1 && bedrooms.length < 1) {
        return { "Address": address };
    }

    // address and sale type
    if (address.length > 0 && saleType.length > 0 && bedrooms.length < 1) {
        return { "Address": address, "SaleType": saleType };
    }

    // address and bedrooms
    if (address.length > 0 && saleType.length < 1 && bedrooms.length > 0) {
        return { "Address": address, "Bedrooms": bedrooms };
    }

    // saletype and bedroom
    if (address.length < 1 && saleType.length > 0 && bedrooms.length > 0) {
        return { "SaleType": saleType, "Bedrooms": bedrooms };
    }

    // only saletype
    if (address.length < 1 && saleType.length > 0 && bedrooms.length < 1) {
        return { "SaleType": saleType };
    }

    // only bedroom
    if (address.length < 1 && saleType.length < 1 && bedrooms.length > 0) {
        return { "Bedrooms": bedrooms };
    }
    return {}
}

function searchHouseAttributes(obj, str) {
    for (var key in obj) {
        if (obj[key].includes(str)) {
            return this;
        }
    }
}

function searchSpecifiedAttributes(obj, str) {
    for (var key in obj) {
        if (obj[key].includes(str)) {
            return this;
        }
    }
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
            if (house[key].toLowerCase().includes(searchParams[key].toLowerCase())) {
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
            "Address": "#1 Belfast Avenue",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 3,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 2,
            "Address": "#2 Belfast Avenue",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 2,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 3,
            "Address": "#3 Belfast Avenue",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 6,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 4,
            "Address": "#4 Belfast Avenue",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 3,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 5,
            "Address": "#1 Lisburn Lane",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 3,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 6,
            "Address": "#2 Lisburn Lane",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 6,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 7,
            "Address": "#3 Lisburn Lane",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 5,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 8,
            "Address": "#4 Lisburn Lane",
            "Price": 90000,
            "SaleType": "Rent",
            "Bedrooms": 1,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 9,
            "Address": "#1 Falls Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 2,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 10,
            "Address": "#2 Falls Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 4,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 11,
            "Address": "#3 Falls Road",
            "Price": 90000,
            "SaleType": "Rent",
            "Bedrooms": 2,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        },
        {
            "Id": 12,
            "Address": "#4 Falls Road",
            "Price": 90000,
            "SaleType": "Buy",
            "Bedrooms": 1,
            "MainImg": "images/listings/house1.jpg",
            "Description": "This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.",
            "Images": ["./images/HouseOne/front.jpg",
                "./images/HouseOne/back.jpg"
            ]
        }
    ]
};
