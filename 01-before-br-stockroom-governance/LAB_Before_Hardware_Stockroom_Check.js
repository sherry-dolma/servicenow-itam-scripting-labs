(function executeRule(current, previous /*null when async*/) {

    // Verify Stockroom is populated when asset is In stock & Available
    if (current.stockroom.nil()) {
        gs.addErrorMessage('ITAM Policy Error: A Stockroom is required when Hardware State is "In stock (Available)".');
        current.setAbortAction(true);
        return;
    }

    // Auto-clear Assigned to if someone forgot to remove the previous user
    if (!current.assigned_to.nil()) {
        current.setValue('assigned_to', '');
        gs.addInfoMessage('Assigned to was automatically cleared because the asset is now Available in Stock.');
    }

})(current, previous);
