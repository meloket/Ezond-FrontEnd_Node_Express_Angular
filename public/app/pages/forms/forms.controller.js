/**
 * Global controller for whole app
 * Handles popups
 */
ezondapp.controller('formsController', function($scope, $http, userService, $mdDialog, appDataService) {
    $scope.formsList = [];
    $scope.state = 'listforms';

    $scope.owner_id = userService.user.agencyID ? userService.user.agencyID : userService.user.id;
    $scope.user_id = userService.user.id;

    $scope.newanswername = '';
    $scope.addanswerstate = false;

    $scope.addanswer = function(question, newanswer, newprice) {
        question.answers.push({ answername: newanswer, answerprice: newprice });
        $scope.newanswername = '';
    }

    $scope.calculateVariants = function() {
        $scope.questions.forEach(function(elem, index, array) {

        })
    }

    $scope.delteanswer = function(question, index) {
        question.answers.splice(index, 1);
    }

    $scope.deletequestion = function(index) {
        $scope.questions.splice(index, 1);
    }

    $scope.addquestion = function(newquestion) {
        if (newquestion) {
            $scope.questions.push({ questionName: newquestion, isEdit: false, answers: [] })
            $scope.newquestion = '';
            newquestion = '';
            newoptionprice = '';
        }
    }

    $scope.deleteform = function(form) {
        $http.post("/user/deleteform", { form_id: form.form_id }).then(function(response) {
            $scope.getFormsList()
        })
    }

    $scope.showAlert = function(ev, form) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent('app.ezond.com/publicform/' + form.form_key)
            .ok('Ok')
            .targetEvent(ev)
        );
    };

    $scope.showform = function(form) {
        $scope.setState('showform');
        $scope.showingform = JSON.parse(form.form_fields);
    }

    $scope.deleteoption = function(index) {
        $scope.options.splice(index, 1)
    }

    $scope.formioRadioDefaultSettings = {
        autofocus: false,
        input: true,
        tableView: true,
        hideLabel: true,
        inputType: 'radio',
        key: 'radio',
        values: [],
        defaultValue: '',
        protected: false,
        fieldSet: false,
        persistent: true,
        hidden: false,
        clearOnHide: true,
        type: 'radio',
        validate: {
            required: false,
            custom: '',
            customPrivate: false
        }
    }

    $scope.formioButtonDefaultSettings = {
        autofocus: false,
        input: true,
        label: 'Submit',
        tableView: false,
        key: 'submit',
        size: 'md',
        leftIcon: '',
        rightIcon: '',
        block: false,
        action: 'submit',
        disableOnInvalid: false,
        theme: 'primary'
    }

    $scope.formioTextFieldDefaultSettings = {
        autofocus: false,
        input: true,
        tableView: true,
        inputType: 'text',
        inputMask: '',
        label: 'Text',
        key: 'text',
        placeholder: '',
        type: "textfield",
        prefix: '',
        suffix: '',
        multiple: false,
        defaultValue: '',
        protected: false,
        unique: false,
        persistent: true,
        hidden: false,
        clearOnHide: true,
        spellcheck: true,
        validate: {
            required: false,
            minLength: '',
            maxLength: '',
            pattern: '',
            custom: '',
            customPrivate: false
        },
        conditional: {
            show: null,
            when: null,
            eq: ''
        }
    }

    $scope.formioHtmlElementDefaultSettings = {
        key: 'html',
        label: 'Content',
        hideLabel: true,
        input: false,
        tag: 'p',
        attrs: [],
        className: '',
        content: '',
        type: "htmlelement"
    }

    $scope.formioNumberDefaultSettings = {
        autofocus: false,
        input: true,
        tableView: true,
        inputType: 'number',
        label: 'Number',
        key: 'number',
        placeholder: '',
        prefix: '',
        suffix: '',
        defaultValue: '',
        protected: false,
        persistent: true,
        hidden: false,
        clearOnHide: true,
        validate: {
            required: false,
            min: '',
            max: '',
            step: 'any',
            integer: '',
            multiple: '',
            custom: ''
        },
        type: 'number'
    }

    $scope.formioCheckboxDefaultSettings = {
        autofocus: false,
        input: true,
        inputType: 'checkbox',
        tableView: true,
        // This hides the default label layout so we can use a special inline label
        hideLabel: false,
        label: '',
        dataGridLabel: false,
        key: 'checkboxField',
        defaultValue: false,
        protected: false,
        persistent: true,
        hidden: false,
        name: '',
        value: '',
        clearOnHide: true,
        validate: {
            required: false
        },
        type: 'checkbox'
    }


    $scope.formioColumnsDefaultSettings = {
        clearOnHide: false,
        label: 'Columns',
        hideLabel: true,
        input: false,
        tableView: false,
        key: 'columns',
        columns: [],
        type: 'columns'
    }

    $scope.formioPanelDefaultSettings = {
        clearOnHide: false,
        key: 'panel',
        input: false,
        title: '',
        theme: 'default',
        tableView: false,
        hideLabel: false,
        components: [],
        type: 'panel'
    }

    // New form
    $scope.addnewform = function() {
        $mdDialog.show({
            locals: {},
            fullscreen: true,
            multiple: true,
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {

                $scope.hide = function(servicename, serviceDesc, serviceType) {
                    $mdDialog.hide({ servicename: servicename, serviceDesc: serviceDesc, serviceType: serviceType })
                };
                $scope.cancel = function() {
                    $mdDialog.cancel()
                };

                $scope.servicetype = 'Recurring';

                $scope.saveservicename = function() {
                    $scope.hide($scope.servicename, $scope.servicedesc, $scope.servicetype)
                }
            }],
            parent: angular.element(document.body),
            disableParentScroll: true,
            clickOutsideToClose: true,
            template: `<md-dialog style="height:auto;" ng-class="{'loader': inprog}"> 
            <md-toolbar layout="row" layout-align="start center" class="md-padding"> 
                Add Ezond Service
            </md-toolbar> 
            <md-dialog-content  class="md-padding" layout="column" style="width: 600px;"> 
                <div layout="row">
                    <label class="md-subhead bold" for="">Service name</label>
                    <span flex=""></span>
                </div>
                <input ng-model="servicename" style="border-radius: 70px;" class="headtags" type="text" />

                <div layout="row">
                    <label class="md-subhead bold margin-top" for="">Short description</label>
                    <span flex=""></span>
                </div>
                <textarea ng-model="servicedesc" style="" class="" type="text">
                </textarea>

                <div layout="row" class="margin-top">
                    <input class="margin-sm-right" id="newservicetype1" type="radio" ng-model="servicetype" ng-value="'One-time'" />
                    <label class="md-title margin-right" for="newservicetype1">One-time</label>
                    <input class="margin-sm-right" id="newservicetype2" type="radio" ng-model="servicetype" selected ng-value="'Recurring'" />
                    <label class="md-title" for="newservicetype2">Recurring</label>
                </div>

                <!-- <label for="serviceprice" class="md-subhead bold margin-top">Price</label>
                <input ng-model="serviceprice" style="border-radius: 70px;" class="headtags" type="number" /> -->
            </md-dialog-content> 
            <md-dialog-actions class="md-padding">
                <div style="font-weight: bold; border-width: 2px;border-color: blue;color:blue;" ng-click="saveservicename()" class="headtags curs-pointer">
                    Save
                </div>
            </md-dialog-actions>
        </md-dialog>`
        }).then(
            function(result) {
                $scope.newservicename = result.servicename;
                $scope.newserviceDesc = result.serviceDesc;
                $scope.newserviceType = result.serviceType;
                $scope.state = 'addoptions';
            },
            function(answer) {}
        )
    }

    $scope.options = []
    $scope.questions = []
    $scope.newoptionname = '';
    $scope.newquestion = '';
    $scope.newoptionprice = '';

    $scope.isEdit = function(index) {
        return $scope.options[index].isEdit
    }

    $scope.totalpricefromquestions = {"+" : []};

    $scope.createpagefromquestion = function(question, questionindex) {
        $scope.options_fields_set = []

        panel = angular.copy($scope.formioPanelDefaultSettings);

        let keyname = 'radio_' + questionindex;
        radio = angular.copy($scope.formioRadioDefaultSettings);
        radio.customClass = 'radioStepButtonSelect';
        radio.key = keyname;
        
        question.answers.forEach(function(answer, index) {
            radio.values.push({ value: answer.answerprice, label: answer.answername, shortcut: '' })
        })

        $scope.totalpricefromquestions["+"].push({ "if": [{ "var": "data." + keyname }, { "var": "data." + keyname }, 0] })
        
        // html = angular.copy($scope.formioHtmlElementDefaultSettings);
        // html.content = question.questionName;

        // panel.components.push(html);
        panel.components.push(radio);

        $scope.options_fields_set = panel;
        $scope.options_fields_set.title = question.questionName;

        return $scope.options_fields_set
    }

    $scope.generatepanelsfromoptions = function() {
        $scope.options_fields_set = []
        totals = [];
        $scope.options.forEach(function(option, index) {

            panel = angular.copy($scope.formioPanelDefaultSettings);

            columns = angular.copy($scope.formioColumnsDefaultSettings);

            checkbox = angular.copy($scope.formioCheckboxDefaultSettings);
            checkbox.label = option.optionName;
            checkbox.key = 'optionEnabled' + index;

            summaryprice = angular.copy($scope.formioNumberDefaultSettings);
            summaryprice.defaultValue = option.optionPrice;
            summaryprice.key = 'optionSummaryPrice' + index;
            summaryprice.disabled = true;
            totals.push('optionSummaryPrice' + index);
            summaryprice.label = 'Total'
            summaryprice.calculateValue = {
                "*": [{
                        "var": "data.optionCount" + index
                    },
                    {
                        "var": "data.optionPrice" + index
                    },
                    {
                        "if": [{
                                "var": "data.optionEnabled" + index
                            },
                            1,
                            0
                        ]
                    }
                ]
            }
            summaryprice.conditional = {
                show: "true",
                when: 'optionEnabled' + index,
                eq: "true"
            }

            count = angular.copy($scope.formioNumberDefaultSettings);
            count.defaultValue = 1;
            count.label = 'Count';
            count.key = 'optionCount' + index;
            count.conditional = {
                show: "true",
                when: 'optionEnabled' + index,
                eq: "true"
            }

            price = angular.copy($scope.formioNumberDefaultSettings);
            price.defaultValue = option.optionPrice;
            price.hidden = true;
            price.label = 'Price (HIDDEN)';
            price.key = 'optionPrice' + index;

            html = angular.copy($scope.formioHtmlElementDefaultSettings);
            html.content = "Price per one " + option.optionPrice + "$";

            columns.columns[0].components.push(checkbox);
            columns.columns[1].components.push(html);
            columns.columns[2].components.push(count);
            columns.columns[3].components.push(price);
            columns.columns[3].components.push(summaryprice);

            panel.components.push(columns);

            $scope.options_fields_set.push(panel);
        })
        totalPrice = angular.copy($scope.formioNumberDefaultSettings);
        totalPrice.key = 'Total';
        totalPrice.labelWidth = 80;
        totalPrice.disabled = true;
        totalPrice.style = {
            "margin-top": "20px"
        };

        totalPrice.labelPosition = "left-right";
        totalPrice.label = 'Total'
        totalPrice.calculateValue = { "+": totals.map(function(x) { return { "if": [{ "var": "data." + x }, { "var": "data." + x }, 0] } }) }
        $scope.options_fields_set.push(totalPrice)
        return $scope.options_fields_set
    }

    $scope.addoptionstodefaultform = function() {

        $scope.defaultform.numPages = $scope.questions.length

        totalprice1 = angular.copy($scope.formioNumberDefaultSettings);
        totalprice1.label = 'TOTAL';
        totalprice1.disabled = true;
        totalprice1.hideLabel = true;
        totalprice1.key = 'totel';
        totalprice1.customClass = 'formTotalPriceLabel';
        totalprice1.defaultValue = 0;

        $scope.questions.forEach(function(question, index, array) {
            $scope.defaultform.components.push($scope.createpagefromquestion(question, index))
        })
        totalprice1.calculateValue = $scope.totalpricefromquestions;

        $scope.defaultform.components.forEach(function (q, i, a) {
            q.components.unshift(totalprice1)
        })

        $scope.setState('addnewform');
    }

    $scope.addoption = function(newoptionname, newoptionprice) {
        if (newoptionname) {
            if (!newoptionprice) {
                newoptionprice = 0;
            }
            $scope.options.push({ optionName: newoptionname, optionPrice: newoptionprice, isEdit: false })
            $scope.newoptionname = '';
            $scope.newoptionprice = '';
            newoptionname = '';
            newoptionprice = '';
        }
    }

    $scope.extractformname = function(form) {
        if (!form) return
        return JSON.parse(form.form_fields).name
    }

    $scope.setState = function(state) {
        $scope.state = state;
    }


    $scope.extractform = function(form) {
        if (!form) return
        return JSON.parse(form.form_fields)
    }

    $scope.saveNewForm = function() {
        $scope.saveform = $scope.defaultform;
        $scope.saveform.name = $scope.newservicename;
        $scope.saveform.desc = $scope.newserviceDesc;
        $scope.saveform.type = $scope.newserviceType;
        $http.post('/user/saveAgencyForm', { form: JSON.stringify($scope.saveform), agency_id: $scope.owner_id }).then(function(response) {
            $scope.state = 'listforms';
            $scope.getFormsList()
        })
    }

    $scope.editService = function(form) {
        fields = JSON.parse(form.form_fields)
        $scope.defaultform = form

        $scope.newservicename = form.name;
        $scope.newserviceDesc = form.desc;
        $scope.newserviceType = form.type;
        $scope.state = 'addoptions';
    }

    $scope.getFormsList = function() {
        $scope.formsList = [];
        $http.get('/user/getAgencyForms?agency_id=' + $scope.owner_id).then(function(response) {
            $scope.formsList = response.data.forms;
        })
    }

    $scope.defaultform = {
        components: [],
        display: 'wizard',
        numPages: 2

        // display: 'form'
    };

    $scope.getFormsList();

});