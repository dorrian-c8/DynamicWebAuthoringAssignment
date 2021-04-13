$(document).ready(function(){

    $('#btnSearch').click(function(){
        window.location.href = './listings.html?searchTerm=' + $('.searchTerm').val();
    });

    $('#btnBuy').click(function(){
        if ($('.searchTerm').val().length > 0){
            window.location.href = './listings.html?searchTerm=' + $('.searchTerm').val() + '&saleType=Buy';
        }else{
            window.location.href = './listings.html?saleType=Buy';
        }        
    });

    $('#btnRent').click(function(){
        if ($('.searchTerm').val().length > 0){
            window.location.href = './listings.html?searchTerm=' + $('.searchTerm').val() + '&saleType=Rent';
        }else{
            window.location.href = './listings.html?saleType=Rent';
        }  
    });

});