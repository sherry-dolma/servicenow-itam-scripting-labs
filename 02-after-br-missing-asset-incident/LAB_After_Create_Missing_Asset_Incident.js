(function executeRule(current, previous /*null when async*/) {

    var inc = new GlideRecord('incident');
    inc.initialize();

    var assetTag = current.getValue('asset_tag') || current.getDisplayValue();
    inc.setValue('short_description', 'Missing/Stolen Hardware Investigation: ' + assetTag);
    inc.setValue('impact', '1');  // Impact 1 + Urgency 2 = Priority 2 (High) via OOB Priority Lookup
    inc.setValue('urgency', '2');

    // Use 'previous' to identify who last had possession before the asset was marked Missing
    var lastOwner = previous.getValue('assigned_to');
    if (lastOwner) {
        inc.setValue('caller_id', lastOwner);
    }

    // Link the CI if one is synchronized with this hardware asset
    var ciId = current.getValue('ci');
    if (ciId) {
        inc.setValue('cmdb_ci', ciId);
    }

    inc.setValue('description',
        'Automated ITAM Security Alert.\n' +
        'Asset Display Name: ' + current.getDisplayValue() + '\n' +
        'Serial Number: ' + (current.getValue('serial_number') || 'N/A') + '\n' +
        'Previous Assigned User: ' + previous.getDisplayValue('assigned_to')
    );

    var newIncId = inc.insert();
    if (newIncId) {
        gs.addInfoMessage('Security Incident ' + inc.getValue('number') + ' created for missing asset.');
    }

})(current, previous);
