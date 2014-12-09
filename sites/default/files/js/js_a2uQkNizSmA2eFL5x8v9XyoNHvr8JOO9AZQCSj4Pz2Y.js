(function($) {

/**
 * jQuery debugging helper.
 *
 * Invented for Dreditor.
 *
 * @usage
 *   $.debug(var [, name]);
 *   $variable.debug( [name] );
 */
jQuery.extend({
  debug: function () {
    // Setup debug storage in global window. We want to look into it.
    window.debug = window.debug || [];

    args = jQuery.makeArray(arguments);
    // Determine data source; this is an object for $variable.debug().
    // Also determine the identifier to store data with.
    if (typeof this == 'object') {
      var name = (args.length ? args[0] : window.debug.length);
      var data = this;
    }
    else {
      var name = (args.length > 1 ? args.pop() : window.debug.length);
      var data = args[0];
    }
    // Store data.
    window.debug[name] = data;
    // Dump data into Firebug console.
    if (typeof console != 'undefined') {
      console.log(name, data);
    }
    return this;
  }
});
// @todo Is this the right way?
jQuery.fn.debug = jQuery.debug;

})(jQuery);
;
/**
 * @file
 * Modifies the file selection and download access expiration interfaces.
 */

var uc_file_list = {};

/**
 * Adds files to delete to the list.
 */
function _uc_file_delete_list_populate() {
  jQuery('.affected-file-name').empty().append(uc_file_list[jQuery('#edit-recurse-directories').attr('checked')]);
}

jQuery(document).ready(
  function() {
    _uc_file_delete_list_populate();
  }
);

// When you (un)check the recursion option on the file deletion form.
Drupal.behaviors.ucFileDeleteList = {
  attach: function(context, settings) {
    jQuery('#edit-recurse-directories:not(.ucFileDeleteList-processed)', context).addClass('ucFileDeleteList-processed').change(
      function() {
        _uc_file_delete_list_populate()
      }
    );
  }
}

/**
 * Give visual feedback to the user about download numbers.
 *
 * TODO: would be to use AJAX to get the new download key and
 * insert it into the link if the user hasn't exceeded download limits.
 * I dunno if that's technically feasible though.
 */
function uc_file_update_download(id, accessed, limit) {
  if (accessed < limit || limit == -1) {

    // Handle the max download number as well.
    var downloads = '';
    downloads += accessed + 1;
    downloads += '/';
    downloads += limit == -1 ? 'Unlimited' : limit;
    jQuery('td#download-' + id).html(downloads);
    jQuery('td#download-' + id).attr("onclick", "");
  }
}
;
