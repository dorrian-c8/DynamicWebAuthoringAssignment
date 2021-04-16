$(document).ready(function(){

    //Add click event to search button to redirect to listings page passing search term
    $('#btnSearch').click(function(){
        window.location.href = './listings.html?searchTerm=' + $('.searchTerm').val();
    });

    //Add click event to buy button to redirect to listings page passing search term(if entered) and the sale type
    $('#btnBuy').click(function(){
        if ($('.searchTerm').val().length > 0){
            window.location.href = './listings.html?searchTerm=' + $('.searchTerm').val() + '&saleType=Buy';
        }else{
            window.location.href = './listings.html?saleType=Buy';
        }        
    });

    //Add click event to rent button to redirect to listings page passing search term(if entered) and the sale type
    $('#btnRent').click(function(){
        if ($('.searchTerm').val().length > 0){
            window.location.href = './listings.html?searchTerm=' + $('.searchTerm').val() + '&saleType=Rent';
        }else{
            window.location.href = './listings.html?saleType=Rent';
        }  
    });

});