$(function () {
    drawNavBar();
});

// Call this so same nav is present on all pages
function drawNavBar(){
    var navbar = '';
    navbar += '<nav class="navbar navbar-expand-lg navbar-light">';
    navbar += '<a class="navbar-brand" href="index.html"><img src="images/Logo_header.png" alt="Housepal Logo"></a>';
    navbar += '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">';
    navbar += '<span class="navbar-toggler-icon"></span>';
    navbar += '</button>';
    navbar += '<div class="collapse navbar-collapse" id="navbarNav">';
    navbar += '<ul class="navbar-nav left-nav">';
    navbar += '<li class="nav-item">';
    navbar += '<a class="nav-link" href="index.html">Home</a>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="listings.html">Listings</a>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="aboutUs.html">About Us</a>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="testimonials.html">Testimonials</a>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="contact.html">Contact</a>';
    navbar += '</li>';
    navbar += '</ul>';
    navbar += '<ul class="navbar-nav media-nav">';
    navbar += '<li class="nav-item dropdown">';
    navbar += '<a class="nav-link dropdown-toggle" href="#" id="favouriteShortcuts" aria-label="View your favourite properties" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
    navbar += '<i class="fa fa-heart fa-2x" aria-hidden="true">';
    navbar += '<span class="fa fa-circle"></span>';
    navbar += '<span class="num">0</span>';
    navbar += '</i></a>';
    navbar += '<div class="dropdown-menu" aria-labelledby="favouriteShortcuts">';
    navbar += '<a class="dropdown-item" id="no-favourites" style="display: none;" href="#">No favourites have been added.</a>';
    navbar += '</div>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="https://en-gb.facebook.com/" aria-label="Facebook link" target="_blank"><i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i></a>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="https://www.instagram.com/" aria-label="Instagram link" target="_blank"><i class="fa fa-instagram fa-2x" aria-hidden="true"></i></a>';
    navbar += '</li>';
    navbar += '<li class="nav-item ml-4">';
    navbar += '<a class="nav-link" href="https://twitter.com/login?lang=en-gb" aria-label="Twitter link" target="_blank"><i class="fa fa-twitter fa-2x" aria-hidden="true"></i></a>';
    navbar += '</li>';
    navbar += '</ul>';
    navbar += '</div>';
    navbar += '</nav>';

    $("#navbar-frame").html(navbar);

    var id = location.pathname.split('/').slice(-1)[0];
    $('a[href=\'' + id + '\']').addClass("active"); //find the link for the active page and set active css class

    var favProperties = localStorage.getItem('favProperties');    

    // Check if any favourite properties have been stored in browser
    if (favProperties == null || favProperties.length < 1) {
        return;
    }else{
        // if we get here, favourite properties exists so populate the dropdown
        $(JSON.parse(favProperties)).each(function () {
            $('#no-favourites').after('<a class="dropdown-item fav-property" data-fave-id="' + this.Id + '" href="singleListing.html?id=' + this.Id + '">' + this.Address +'</a>');
        });
    }

    // finally display no favourites if needed and populate number with favourites count
    $('.fav-property').length > 0 ? $('#no-favourites').hide() : $('#no-favourites').show();
    $('.num').text($('.fav-property').length);
}