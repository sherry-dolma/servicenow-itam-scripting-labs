(function executeRule(current, previous /*null when async*/) { 
 
    var stockroomId = current.getValue('stockroom'); 
    if (!stockroomId) { 
        return; 
    } 
 
    var ga = new GlideAggregate('alm_hardware'); 
    ga.addQuery('stockroom', stockroomId); 
    ga.addQuery('install_status', '6'); // In stock 
    ga.addAggregate('SUM', 'cost'); 
    ga.addAggregate('COUNT'); 
    ga.setGroup(false); // Important when aggregating across the whole filtered set without groupBy 
    ga.query(); 
 
    if (ga.next()) { 
        var totalCost = ga.getAggregate('SUM', 'cost') || '0'; 
        var assetCount = ga.getAggregate('COUNT') || '0'; 
 
        gs.info('[LAB_ITAM_ASYNC] Stockroom "' + current.getDisplayValue('stockroom') + 
            '" now holds ' + assetCount + ' In-Stock hardware assets totaling $' + totalCost); 
    } 
 
})(current, previous); 
