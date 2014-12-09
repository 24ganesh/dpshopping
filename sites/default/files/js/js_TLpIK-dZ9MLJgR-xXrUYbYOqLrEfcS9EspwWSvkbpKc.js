/**
 * @file
 * Attaches preview-related behavior for the Color module.
 */

(function ($) {
  Drupal.color = {
    callback: function(context, settings, form, farb, height, width) {
      // Solid background.
      $('#preview', form).css('backgroundColor', $('#palette input[name="palette[base]"]', form).val());

      // Text preview
      $('#text', form).css('color', $('#palette input[name="palette[text]"]', form).val());
      $('#text a, #text h2', form).css('color', $('#palette input[name="palette[link]"]', form).val());

      // Set up gradients if there are some.
      var color_start, color_end;
      for (i in settings.gradients) {
        color_start = farb.unpack($('#palette input[name="palette[' + settings.gradients[i]['colors'][0] + ']"]', form).val());
        color_end = farb.unpack($('#palette input[name="palette[' + settings.gradients[i]['colors'][1] + ']"]', form).val());
        if (color_start && color_end) {
          var delta = [];
          for (j in color_start) {
            delta[j] = (color_end[j] - color_start[j]) / (settings.gradients[i]['vertical'] ? height[i] : width[i]);
          }
          var accum = color_start;
          // Render gradient lines.
          $('#gradient-' + i + ' > div', form).each(function () {
            for (j in accum) {
              accum[j] += delta[j];
            }
            this.style.backgroundColor = farb.pack(accum);
          });
        }
      }
    }
  };
})(jQuery);
;
/**
 * @file
 * Attaches the behaviors for the Color module.
 */

(function ($) {

Drupal.behaviors.color = {
  attach: function (context, settings) {
    var i, j, colors, field_name;
    // This behavior attaches by ID, so is only valid once on a page.
    var form = $('#system-theme-settings .color-form', context).once('color');
    if (form.length == 0) {
      return;
    }
    var inputs = [];
    var hooks = [];
    var locks = [];
    var focused = null;

    // Add Farbtastic.
    $(form).prepend('<div id="placeholder"></div>').addClass('color-processed');
    var farb = $.farbtastic('#placeholder');

    // Decode reference colors to HSL.
    var reference = settings.color.reference;
    for (i in reference) {
      reference[i] = farb.RGBToHSL(farb.unpack(reference[i]));
    }

    // Build a preview.
    var height = [];
    var width = [];
    // Loop through all defined gradients.
    for (i in settings.gradients) {
      // Add element to display the gradient.
      $('#preview').once('color').append('<div id="gradient-' + i + '"></div>');
      var gradient = $('#preview #gradient-' + i);
      // Add height of current gradient to the list (divided by 10).
      height.push(parseInt(gradient.css('height'), 10) / 10);
      // Add width of current gradient to the list (divided by 10).
      width.push(parseInt(gradient.css('width'), 10) / 10);
      // Add rows (or columns for horizontal gradients).
      // Each gradient line should have a height (or width for horizontal
      // gradients) of 10px (because we divided the height/width by 10 above).
      for (j = 0; j < (settings.gradients[i]['direction'] == 'vertical' ? height[i] : width[i]); ++j) {
        gradient.append('<div class="gradient-line"></div>');
      }
    }

    // Fix preview background in IE6.
    if (navigator.appVersion.match(/MSIE [0-6]\./)) {
      var e = $('#preview #img')[0];
      var image = e.currentStyle.backgroundImage;
      e.style.backgroundImage = 'none';
      e.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image.substring(5, image.length - 2) + "')";
    }

    // Set up colorScheme selector.
    $('#edit-scheme', form).change(function () {
      var schemes = settings.color.schemes, colorScheme = this.options[this.selectedIndex].value;
      if (colorScheme != '' && schemes[colorScheme]) {
        // Get colors of active scheme.
        colors = schemes[colorScheme];
        for (field_name in colors) {
          callback($('#edit-palette-' + field_name), colors[field_name], false, true);
        }
        preview();
      }
    });

    /**
     * Renders the preview.
     */
    function preview() {
      Drupal.color.callback(context, settings, form, farb, height, width);
    }

    /**
     * Shifts a given color, using a reference pair (ref in HSL).
     *
     * This algorithm ensures relative ordering on the saturation and luminance
     * axes is preserved, and performs a simple hue shift.
     *
     * It is also symmetrical. If: shift_color(c, a, b) == d, then
     * shift_color(d, b, a) == c.
     */
    function shift_color(given, ref1, ref2) {
      // Convert to HSL.
      given = farb.RGBToHSL(farb.unpack(given));

      // Hue: apply delta.
      given[0] += ref2[0] - ref1[0];

      // Saturation: interpolate.
      if (ref1[1] == 0 || ref2[1] == 0) {
        given[1] = ref2[1];
      }
      else {
        var d = ref1[1] / ref2[1];
        if (d > 1) {
          given[1] /= d;
        }
        else {
          given[1] = 1 - (1 - given[1]) * d;
        }
      }

      // Luminance: interpolate.
      if (ref1[2] == 0 || ref2[2] == 0) {
        given[2] = ref2[2];
      }
      else {
        var d = ref1[2] / ref2[2];
        if (d > 1) {
          given[2] /= d;
        }
        else {
          given[2] = 1 - (1 - given[2]) * d;
        }
      }

      return farb.pack(farb.HSLToRGB(given));
    }

    /**
     * Callback for Farbtastic when a new color is chosen.
     */
    function callback(input, color, propagate, colorScheme) {
      var matched;
      // Set background/foreground colors.
      $(input).css({
        backgroundColor: color,
        'color': farb.RGBToHSL(farb.unpack(color))[2] > 0.5 ? '#000' : '#fff'
      });

      // Change input value.
      if ($(input).val() && $(input).val() != color) {
        $(input).val(color);

        // Update locked values.
        if (propagate) {
          i = input.i;
          for (j = i + 1; ; ++j) {
            if (!locks[j - 1] || $(locks[j - 1]).is('.unlocked')) break;
            matched = shift_color(color, reference[input.key], reference[inputs[j].key]);
            callback(inputs[j], matched, false);
          }
          for (j = i - 1; ; --j) {
            if (!locks[j] || $(locks[j]).is('.unlocked')) break;
            matched = shift_color(color, reference[input.key], reference[inputs[j].key]);
            callback(inputs[j], matched, false);
          }

          // Update preview.
          preview();
        }

        // Reset colorScheme selector.
        if (!colorScheme) {
          resetScheme();
        }
      }
    }

    /**
     * Resets the color scheme selector.
     */
    function resetScheme() {
      $('#edit-scheme', form).each(function () {
        this.selectedIndex = this.options.length - 1;
      });
    }

    /**
     * Focuses Farbtastic on a particular field.
     */
    function focus() {
      var input = this;
      // Remove old bindings.
      focused && $(focused).unbind('keyup', farb.updateValue)
          .unbind('keyup', preview).unbind('keyup', resetScheme)
          .parent().removeClass('item-selected');

      // Add new bindings.
      focused = this;
      farb.linkTo(function (color) { callback(input, color, true, false); });
      farb.setColor(this.value);
      $(focused).keyup(farb.updateValue).keyup(preview).keyup(resetScheme)
        .parent().addClass('item-selected');
    }

    // Initialize color fields.
    $('#palette input.form-text', form)
    .each(function () {
      // Extract palette field name
      this.key = this.id.substring(13);

      // Link to color picker temporarily to initialize.
      farb.linkTo(function () {}).setColor('#000').linkTo(this);

      // Add lock.
      var i = inputs.length;
      if (inputs.length) {
        var lock = $('<div class="lock"></div>').toggle(
          function () {
            $(this).addClass('unlocked');
            $(hooks[i - 1]).attr('class',
              locks[i - 2] && $(locks[i - 2]).is(':not(.unlocked)') ? 'hook up' : 'hook'
            );
            $(hooks[i]).attr('class',
              locks[i] && $(locks[i]).is(':not(.unlocked)') ? 'hook down' : 'hook'
            );
          },
          function () {
            $(this).removeClass('unlocked');
            $(hooks[i - 1]).attr('class',
              locks[i - 2] && $(locks[i - 2]).is(':not(.unlocked)') ? 'hook both' : 'hook down'
            );
            $(hooks[i]).attr('class',
              locks[i] && $(locks[i]).is(':not(.unlocked)') ? 'hook both' : 'hook up'
            );
          }
        );
        $(this).after(lock);
        locks.push(lock);
      };

      // Add hook.
      var hook = $('<div class="hook"></div>');
      $(this).after(hook);
      hooks.push(hook);

      $(this).parent().find('.lock').click();
      this.i = i;
      inputs.push(this);
    })
    .focus(focus);

    $('#palette label', form);

    // Focus first color.
    focus.call(inputs[0]);

    // Render preview.
    preview();
  }
};

})(jQuery);
;
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;