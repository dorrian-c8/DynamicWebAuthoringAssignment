$(function () {
    drawNavBar();
});

function drawNavBar(){
    var navbar = '';
    navbar += '<nav class="navbar navbar-expand-lg navbar-light bg-light">';
    navbar += '<a class="navbar-brand" href="index.html">Navbar</a>';
    navbar += '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">';
    navbar += '<span class="navbar-toggler-icon"></span>';
    navbar += '</button>';
    navbar += '<div class="collapse navbar-collapse" id="navbarNav">';
    navbar += '<ul class="navbar-nav">';
    navbar += '<li class="nav-item">';
    navbar += '<a class="nav-link" href="index.html">Home <span class="sr-only">(current)</span></a>';
    navbar += '</li>';
    navbar += '<li class="nav-item">';
    navbar += '<a class="nav-link" href="features.html">Features</a>';
    navbar += '</li>';
    navbar += '<li class="nav-item">';
    navbar += '<a class="nav-link" href="pricing.html">Pricing</a>';
    navbar += '</li>';
    navbar += '</ul>';
    navbar += '</div>';
    navbar += '</nav>';

    $("#navbar-frame").html(navbar);

    var id = location.pathname.split('/').slice(-1)[0];
    $('a[href=\'' + id + '\']').addClass("active");
}