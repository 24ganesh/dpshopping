<?php

/**
 * Nodereview Type UI controller.
 */
class NodereviewTypeUIController extends EntityDefaultUIController {

  /**
   * Overrides hook_menu() defaults.
   */
  public function hook_menu() {
    $items = parent::hook_menu();
    $items[$this->path]['description'] = t('Manage nodereview entity types, including adding and removing fields and the display of fields.');
    return $items;
  }

}
