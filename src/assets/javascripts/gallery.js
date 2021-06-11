import $ from 'jquery';
window.jQuery = $;
window.$ = $;

$(function () {
    console.log("i loaded");

    $(".order-link").click(function(e) {
        var el = $(e.currentTarget);
        var id = el.prop("id").split("-")[1];

        const csrfToken = document.querySelector("[name=_csrf]").content;
        const headers = {
          "X-CSRF-TOKEN": csrfToken,
        }
        
        var url = `/upload_to_scalable_press?file_url=https://i.imgur.com/${id}.png`
        
        $.ajax({
            url: url,
            headers: headers,
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
        })
        .done(function (e) {
            var data = JSON.parse(e);
  
            console.log(data);
    
            window.open("/show_scalable_product_categories?designId=" + data["designId"])
    
        });
  
      e.preventDefault();
    })
})

