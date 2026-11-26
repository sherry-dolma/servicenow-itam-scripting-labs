(function executeRule(current, previous /*null when async*/) {

    // Only restrict interactive user sessions lacking 'asset' or 'admin' roles
    if (!gs.hasRole('asset') && !gs.hasRole('admin') && gs.isInteractive()) {
        current.addQuery('assigned_to', gs.getUserID());
    }

})(current, previous);
