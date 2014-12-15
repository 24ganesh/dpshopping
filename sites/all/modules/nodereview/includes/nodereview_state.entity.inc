<?php

/**
 * The class used for nodereview state entities
 */
class NodereviewState extends Entity {

  public $name, $label, $description, $default_state,
    $active, $show_on_form, $weight;

  public function __construct($values = array()) {
    parent::__construct($values, 'nodereview_state');
  }

}
