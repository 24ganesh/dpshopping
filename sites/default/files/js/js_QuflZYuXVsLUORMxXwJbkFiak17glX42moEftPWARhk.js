(function ($) {
  Drupal.behaviors.ToolbarToggle = {
    attach: function(context) {
      $("#toolbar-wrapper .container").append("<div id='toggle' />");
      $("#toggle").html("<a id='toggle-link' href='#'>Toolbar</a>");
      $("#toolbar-wrapper .container .inner").hide();
      $("#toggle-link").click(function() {
        $("#toolbar-wrapper .container .inner").slideToggle();
      });
    }
  }
})(jQuery);
;
(function ($) {
  // Create the dropdown base for Main Menu
  var header = undefined;
  var menu = undefined;
  var menuButton = undefined;

  $(document).ready(function(){
    header = $("#primary-menu-bar");
    menu = $("#primary-menu-bar nav ul");
    menuButton = $("<div class='mobile-menu clearfix'><a id='menu-toggle' href='#'>Menu</a></div>");
    header.prepend(menuButton);
    menuButton.click(showMenu);
  })

  function showMenu (event) {
    if (menu.is(":visible"))
      $('.mobile-menu a').removeClass('menu-down'),
      menu.slideUp({complete:function(){$(this).css('display','')}});
    else
      $('.mobile-menu a').addClass('menu-down'),
      menu.slideDown();
  }

})(jQuery);
;
(function ($) {
  Drupal.behaviors.ContentDisplayFrontPageGrid = {
    attach: function(context) {
      $("body.front #block-system-main").addClass("front-page-grid content-display-grid");
      $("body.front #block-system-main .article-inner").equalHeight();
    }
  }
})(jQuery);
;
(function ($) {
  Drupal.behaviors.ContentDisplayTaxoPageGrid = {
    attach: function(context) {
      $("body.page-taxonomy #block-system-main").addClass("page-taxonomy-grid content-display-grid");
      $("body.page-taxonomy #block-system-main .article-inner").equalHeight();
    }
  }
})(jQuery);
;
