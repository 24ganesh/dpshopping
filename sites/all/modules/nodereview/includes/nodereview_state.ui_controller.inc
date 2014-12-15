<?php

/**
 * UI Controller for nodereview states.
 */
class NodereviewStatesUIController extends EntityDefaultUIController {

  public function overviewForm($form, &$form_state) {
    return drupal_get_form('nodereview_states_overview_form');
  }

}
