/**
 * Integrations service
 */
ezondapp.service('integrationsService', function($http, $q, integrationProviders) {
    var self = this;
    
    self.integrations = integrationProviders.providers;

    // Add Account Informations to Networks List Handler
    this.addConnectionInfoRecords = function(network_index, records) {
        /*if(self.integrations[network_index].connectionInfoRecords) {
            for(record in records)
                self.integrations[network_index].connectionInfoRecords.push(record);
        } else {
            self.integrations[network_index].connectionInfoRecords = records;    
        }*/

        self.integrations[network_index].connectionInfoRecords = records;
    }

    // Setting Account-Binding Information's index : 0-index in connection info records
    this.addActiveRecordIdx = function(network_index, index) {
        self.integrations[network_index].connected = true;
        self.integrations[network_index].activeRecordIdx = index;
    }

    // Clear Account-Binding Information of Network
    this.removeConnectionInfoRecords = function(network_index) {
        self.integrations[network_index].connected = false;        
        self.integrations[network_index].connectionInfoRecords = undefined;
    }

});