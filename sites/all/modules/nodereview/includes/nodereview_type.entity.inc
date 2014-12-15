<?php

/**
 * The class used for model type entities
 */
class NodereviewType extends Entity {

  public $name;
  public $label;
  public $locked;

  public function __construct($values = array()) {
    parent::__construct($values, 'nodereview_type');
  }

}
