<?php

/**
 * The controller class used for nodereview state entities
 */
class NodereviewStateController extends EntityAPIControllerExportable {

  public function save($entity, DatabaseTransaction $transaction = NULL) {
    parent::save($entity, $transaction);

    if ($entity->default_state == 1) {
      $query = db_update('nodereview_state')
        ->fields(array('default_state' => 0))
        ->condition('nodereview_state_id', $entity->nodereview_state_id, '<>');
      $query->execute();
    }
  }

}
