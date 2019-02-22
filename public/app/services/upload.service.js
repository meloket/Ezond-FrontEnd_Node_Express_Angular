/**
 * All data about current user (actually, all data that needs)
 */
ezondapp.service('fileUploadService', function($http, $q) {

    this.uploadFileToUrl = function (file, uploadUrl) {
        //FormData, object of key/value pair for form fields and values
        var fileFormData = new FormData();
        fileFormData.append('uploadedFile', file);

        var deffered = $q.defer();
        
        $http.post(uploadUrl, fileFormData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': "multipart/form-data", "Access-Control-Allow-Origin": "*", 'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS', "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"}

        }).then(function (response) {
            response.header("Access-Control-Allow-Origin", "*");
            response.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            deffered.resolve(response);

        });

        return deffered.promise;
    }
});