/* The MIT License (MIT)
*
* Copyright (c) 2018 GeoAnalytic Inc.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
*/


"use strict";
var app = {

    // Application Constructor
    initialize: function() {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            document.addEventListener('deviceready',      this.onDeviceReady.bind(this), false);
        } else {
            document.addEventListener('DOMContentLoaded', this.onDeviceReadyDesktop.bind(this));
        }
    },

    onDeviceReady: function() {
        this.start();
    },

    onDeviceReadyDesktop: function() {
        this.start();
    },

    start: function() {
                                                // examples of urls to a "simple" server:
        const gsServerUrlFileListSimple = "";     // "files_v2.json";
        const gsServerUrlSaveTagFileSimple = "";  // "upload.php";
        const gsFileNameDefault = "tags.json";

        let gsFileName = null;
        let goFiles = null;
        let goSections = [];
        let giSectionSelected = null;
        let giFormSelected = null;
        let giFormItemSelected = null;

        window.onload = clearAll();

        /* ------------------------------------------------------ */
        /*  Check Browser Compatibility
        /* ------------------------------------------------------
          Check for the various File API support.
        */
        if (window.File && window.FileReader && window.FileList && window.Blob && window.URL) {
          // Great success! All the File APIs are supported.
        } else {
          alert('This browser does not support reading and saving files to your local file system.');
        };
        if( window.FormData === undefined ) {
            alert('This browser does not support saving files to a server.');
        }


        // ------  HTML Menu Handlers: -------
        $('#menu-fileNew').click(clearAll);
        // When the open menu item is clicked, send a click to the hidden button to open a local file:
        $('#menu-fileOpen').click( function(e){
                $('#fileOpen').click();
                e.preventDefault(); // prevent navigation to "#"
        });
        $('#fileOpen').change(openFile);
        $('#menu-fileSave').click(saveJSON);

        $('#menu-fileLoadServer').click(loadListFromServer);
        $('#menu-fileSaveServer').click(saveToServer);

        // ------ Hide the server menu items if no server urls defined: ------
        if (gsServerUrlFileListSimple == "") {                                              // no simple server
            if ( (typeof variable == 'undefined') || gsServerUrlFileList.includes("{") ) {  // no django server
                $('#menu-fileLoadServer').hide();
                $('#menu-fileSaveServer').hide();
            }
        } else {
            if (typeof variable == 'undefined') {
                let gsServerUrlFileList    = "";
                let gsServerUrlSaveTagFile = "";
            }
            gsServerUrlFileList    = gsServerUrlFileListSimple;
            gsServerUrlSaveTagFile = gsServerUrlSaveTagFileSimple;
        }

        /* ------------------------------------------------------ */
        /*  File Handling:
        // ------------------------------------------------------
        */
        // ------ Local Open: ------
        //let openFile = function(evt) {
        function openFile(evt) {
            clearAll();  // clear all the forms on the page with any previous content
            
            let files = evt.target.files; // FileList object
            // Loop through the FileList (ToDo: list if multi files selected)
            for (let i = 0, f; f = files[i]; i++) {
                $('#sel-File').append(
                    $('<option/>', {
                        value: f.name,
                        text : f.name
                }));
                gsFileName = f.name;
                
                let reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                     goSections = JSON.parse(e.target.result);
                     populateSectionList(goSections);
                    };
                })(f);
                // Read in the file
                reader.readAsText(f);
            }
        }

        // ------ Local Save: ------
        function saveJSON() {
            let sSections = JSON.stringify(goSections);
            let blSections = new Blob([sSections], {type: "application/json"});
            let uSections = URL.createObjectURL(blSections);
            saveFile(gsFileName,uSections);
        }
        function saveFile(filename, url) {
            let fileLink = document.getElementById('fileSave');
            if (filename) {
                fileLink.download = filename;
            } else {
                fileLink.download = gsFileNameDefault;
            };
            fileLink.href = url;
            fileLink.click();
        }

        // ------ Server Load/Save ------
        $('#sel-File').change(onSelectFile);
        function loadListFromServer(){
            let serverUrl = "";
            if (gsServerUrlFileList || gsServerUrlFileList.includes("{") ) {
                
            }
            $.getJSON( gsServerUrlFileList, function( data ) {
                goFiles = data;
                $('#sel-File').empty();
                populateFileList(goFiles);
                $('#fs-File-List').prop('disabled',false );
            });
        }
        function saveToServer(){
            let sSections = JSON.stringify(goSections);
            let blSections = new Blob([sSections], {type: "application/json"});
            let fileOfBlob = new File([blSections], gsFileName);

            aFormData = new FormData();  	
            aFormData.append("url", fileOfBlob);
            aFormData.append("path", gsFileName);
            aFormData.append("csrfmiddlewaretoken", csrf_token);  // set in html

            jQuery.ajax({
                url: gsServerUrlSaveTagFile,
                data: aFormData,
                filename: gsFileName,
                cache: false,
                contentType: false,
                enctype: 'multipart/form-data',
                processData: false,
                method: 'POST',
                type:   'POST', // For jQuery < 1.9
                success: function(response){
                    console.log(response);		// ToDo: parse [JSON] response
                }
            });
        }
        function populateFileList(files){
            let length = files.count;  // count is a JSON member
            $('#sel-File').append(
                $('<option/>', {
                    value: "",
                    text : "Select a tags file:"
            }));
            for (let i = 0; i < length; i++) {
                $('#sel-File').append(
                    $('<option/>', {
                        value: files.results[i].url,
                        text : files.results[i].path
                }));
            };
        }
        function onSelectFile(){
            let url = $('#sel-File').val();
            clearSection();
            gsFileName = url.split("/").pop();
            if (url != ""){
                $.getJSON( url, function( data ) {
                     goSections = data;
                     populateSectionList(goSections);
                });
            }
        }

        // ------ Clear Page Widgets ------
        function clearAll(){
            goSections = [];
            $('#sel-File').empty();
            clearSection();
            $('#fs-Section-List').prop('disabled',false );  // so user can create a new file
        }
        function clearSection(){
            $('#fs-Section-Details input').val('');
            $('#sel-Section').empty();
            giSectionSelected = null;
            clearForm();
        }
        function clearForm(){
            $('#sel-Form').empty();
            $('#fs-Form-Details input').val('');
            giFormSelected = null;
            clearFormItem();
        }
        function clearFormItem(){
            $('#sel-FormItem').empty();
            $('#fs-FormItem-Details input').val('');
            $('#formItem-Type').val('string');
            giFormItemSelected = null;
            deleteUniqueFormItems();
        }

        /* ------------------------------------------------------
        //  Section Handling:
        // ------------------------------------------------------
        */
        $('#sel-Section').change(onSelectSection);
        $('#btn-SectionNew'   ).click(onClickSectionNew);
        $('#btn-SectionDelete').click(onClickSectionDelete);
        $('#btn-SectionUp'    ).click(onClickSectionUp);
        $('#btn-SectionDown'  ).click(onClickSectionDown);
        $('#btn-SectionSave'  ).click(onClickSectionSave);

        function populateSectionList(){
            $('#fs-Section-List').prop('disabled',false );
            $('#sel-Section').empty();
            for (let i = 0; i < goSections.length; i++) {
                $('#sel-Section').append(
                    $('<option/>', {
                        value: i,
                        text : goSections[i].sectionname
                }));
            };
        }
        function onSelectSection(){
            let selected = $('#sel-Section').val();
            giSectionSelected = selected;          // set the global value
            populateSectionDetails(selected);      // show the details of the selected item
            $('#fs-Section-Details').prop('disabled',false );  //enable the details for editing
            clearForm();                           // erase any existing forms listed
            populateFormList();            // show the forms for this section
            clearFormItem();                       // clear the form items (until the user selects a form)
        }
        function populateSectionDetails(selected){
            $('#section-Name').val(goSections[selected].sectionname);
            $('#section-Description').val(goSections[selected].sectiondescription);
        }
        function onClickSectionNew(){
            let formsArray = [];
            let section = {sectionname:"new", sectiondescription: "new", forms:formsArray };
            goSections.push(section);
            populateSectionList();
            $('#sel-Section').val(goSections.length-1);
            onSelectSection(goSections.length-1)
        }
        function onClickSectionDelete(){
            goSections.splice(giSectionSelected,1);
            $('#fs-Section-Details input').val('');
            clearForm();
            populateSectionList();
        }
        function onClickSectionUp(){
            if (giSectionSelected > 0){
                // --- move in array: ---
                let newSelected = Number(giSectionSelected)-1;
                goSections.move(giSectionSelected,newSelected);
                // --- refresh select box: ---
                populateSectionList();
                // --- set global: ---
                giSectionSelected = newSelected;
                // --- highlight selection: ---
                $('#sel-Section').val(giSectionSelected);
            }
        }
        function onClickSectionDown(){
            if (giSectionSelected < goSections.length - 1){
                // --- move in array: ---
                let newSelected = Number(giSectionSelected)+1;
                goSections.move(giSectionSelected,newSelected);
                // --- refresh select box: ---
                populateSectionList();
                // --- set global: ---
                giSectionSelected = newSelected;
                // --- highlight selection: ---
                $('#sel-Section').val(giSectionSelected);
            }
        }   
        function onClickSectionSave(){
            goSections[giSectionSelected].sectionname = $('#section-Name').val();
            goSections[giSectionSelected].sectiondescription = $('#section-Description').val();
            $('#sel-Section option:selected').text(goSections[giSectionSelected].sectionname);
        }

        /* ------------------------------------------------------
        //  Form Handling:
        // ------------------------------------------------------
        */
        $('#sel-Form').change(onSelectForm);
        $('#btn-FormNew'   ).click(onClickFormNew);
        $('#btn-FormDelete').click(onClickFormDelete);
        $('#btn-FormUp'    ).click(onClickFormUp);
        $('#btn-FormDown'  ).click(onClickFormDown);
        $('#btn-FormSave'  ).click(onClickFormSave);

        function populateFormList(){  
            $('#fs-Form-List').prop('disabled',false );
            $('#sel-Form').empty();
            for (let i = 0; i < goSections[giSectionSelected].forms.length; i++) {
                $('#sel-Form').append(
                    $('<option/>', {
                        value: i,
                        text : goSections[giSectionSelected].forms[i].formname
                }));    
            };
        }
        function onSelectForm(){
            let selected = $('#sel-Form').val();
            giFormSelected = selected;
            populateFormDetails(selected);
            $('#fs-Form-Details').prop('disabled',false );
            clearFormItem();
            populateFormItemList(selected);
        }
        function populateFormDetails(selected){
            $('#form-Name').val(goSections[giSectionSelected].forms[selected].formname);
        }
        function onClickFormNew(){
            let formItemsArray = [];
            let form = {formname:"new", formitems:formItemsArray };
            goSections[giSectionSelected].forms.push(form);
            populateFormList();
            $('#sel-Form').val(goSections[giSectionSelected].forms.length-1);
            onSelectForm(goSections[giSectionSelected].forms.length-1);
        }
        function onClickFormDelete(){
            goSections[giSectionSelected].forms.splice(giFormSelected,1);
            $('#fs-Form-Details input').val('');
            clearFormItem();
            populateFormList();
        }
        function onClickFormUp(){
            if (giFormSelected > 0){
                // --- move in array: ---
                let newSelected = Number(giFormSelected)-1;
                goSections[giSectionSelected].forms.move(giFormSelected,newSelected);
                // --- refresh select box: ---
                populateFormList();
                // --- set global: ---
                giFormSelected = newSelected;
                // --- highlight selection: ---
                $('#sel-Form').val(giFormSelected);
            }
        }
        function onClickFormDown(){
            if (giFormSelected < goSections[giSectionSelected].forms.length - 1){
                // --- move in array: ---
                let newSelected = Number(giFormSelected)+1;
                goSections[giSectionSelected].forms.move(giFormSelected,newSelected);
                // --- refresh select box: ---
                populateFormList();
                // --- set global: ---
                giFormSelected = newSelected;
                // --- highlight selection: ---
                $('#sel-Form').val(giFormSelected);
            }
        }   
        function onClickFormSave(){
            goSections[giSectionSelected].forms[giFormSelected].formname = $('#form-Name').val();
            $('#sel-Form option:selected').text(goSections[giSectionSelected].forms[giFormSelected].formname);
        }

        /* ------------------------------------------------------
        //  FormItem Handling:
        // ------------------------------------------------------
        */
        $('#sel-FormItem').change(onSelectFormItem);
        $('#btn-FormItemNew'   ).click(onClickFormItemNew);
        $('#btn-FormItemDelete').click(onClickFormItemDelete);
        $('#btn-FormItemUp'    ).click(onClickFormItemUp);
        $('#btn-FormItemDown'  ).click(onClickFormItemDown);
        $('#btn-FormItemSave'  ).click(onClickFormItemSave);
        $('#formItem-Type').change(onSelectFormItemType);

        function populateFormItemList(selectedForm){
            $('#fs-FormItem-List').prop('disabled',false );
            $('#sel-FormItem').empty();
            for (let i = 0; i < goSections[giSectionSelected].forms[giFormSelected].formitems.length; i++) {
                let sText = "";
                if (goSections[giSectionSelected].forms[giFormSelected].formitems[i].type.startsWith("label")){
                    sText = goSections[giSectionSelected].forms[giFormSelected].formitems[i].value;
                } else {
                    sText = goSections[giSectionSelected].forms[giFormSelected].formitems[i].key;
                };
                $('#sel-FormItem').append(
                    $('<option/>', {
                        value: i,
                        text : sText
                }));    
            };
            deleteUniqueFormItems();
        }
        function onSelectFormItem(){
            let selected = $('#sel-FormItem').val();
            giFormItemSelected = selected;
            $('#fs-FormItem-Details').prop('disabled',false );
            populateFormItemDetails(selected);
        }
        function populateFormItemDetails(selected){
            let oFormItem = goSections[giSectionSelected].forms[giFormSelected].formitems[selected];

            // ------ common elements: ------
            $('#formItem-Key').val(oFormItem.key);
            $('#formItem-Label').val(oFormItem.label);
            $('#formItem-Value').val(oFormItem.value);
            
            $('#formItem-islabel').prop('checked',oFormItem.islabel==="true" );
            $('#formItem-mandatory').prop('checked',oFormItem.mandatory==="yes");   
            
            SelectElement("formItem-Type",oFormItem.type);  // does this hilite?
            populateUniqueFormItemDetails(oFormItem.type)
        }

        function onSelectFormItemType(){
            let selected = $('#formItem-Type').val();
            populateUniqueFormItemDetails(selected)
        }
        function populateUniqueFormItemDetails(selected){
            let oFormItem = goSections[giSectionSelected].forms[giFormSelected].formitems[giFormItemSelected];
            // ------ type-specific elements: ------
            deleteUniqueFormItems();
            if(selected.startsWith("label")){
        //      $('#formItem-Key').val(oFormItem.value);  // a [form] label has no key (since no input)

                $("<div class='col-4'><label for='Name'>URL:</label></div>").appendTo($('#uniqueFormItems_labels_1'));
                $("<div class='col-4'><input type='text' class='form-control' id='formItem-Url'></div>").appendTo($('#uniqueFormItems_inputs_1'));
                $('#formItem-Url').val(oFormItem.url);
                
                $("<div class='col  '><label for='Name'>Size:</label></div>").appendTo($('#uniqueFormItems_labels_1'));
                $("<div class='col-4'><input type='text' class='form-control' id='formItem-Size'></div>").appendTo($('#uniqueFormItems_inputs_1'));
                $('#formItem-Size').val(oFormItem.size);
                
            } else {
//                $('#formItem-Key').val(oFormItem.key);  // ? (the user may have already typed in a new value)
                
                // under construction: stringcombo, multistringcombo, autocompletestringcombo
                // ToDo:  connectedstringcombo, onetomanystringcombo, autocompleteconnectedstringcombo
                if(selected.endsWith('combo')){   
                    $("<div class='col-4'><label for='Name'>Choices (you can cut-and-paste!):</label></div>").appendTo($('#uniqueFormItems_labels_1'));
                    $("<div class='col-4'><textarea rows='6' class='form-control' id='formItem-Items'></textarea></div>").appendTo($('#uniqueFormItems_inputs_1'));
                    let items = $('#formItem-Items');
                    for (let i = 0; i < oFormItem.values.items.length; i++) {
                        items.val( items.val() + oFormItem.values.items[i].item);
                        if (i!=oFormItem.values.items.length-1) {
                            items.val( items.val() + "\n");
                        }
                    }
                    if(oFormItem.type.startsWith("connected")){
                         $("<div class='switch'><label>Off<input type='checkbox'> <span class='lever'></span> On</label></div>").appendTo($('#uniqueFormItems_labels_1'));
                    }
                }
            }
        }
        function deleteUniqueFormItems(){
            $('#uniqueFormItems_labels_1').empty();
            $('#uniqueFormItems_inputs_1').empty();
        }

        function onClickFormItemNew(){
            let formItem = {key:"new", type:"string", value:"new"};
            goSections[giSectionSelected].forms[giFormSelected].formitems.push(formItem);
            populateFormItemList();
            $('#sel-FormItem').val(goSections[giSectionSelected].forms[giFormSelected].formitems.length-1);
            onSelectFormItem(goSections[giSectionSelected].forms[giFormSelected].formitems.length-1);
        }
        function onClickFormItemDelete(){
            // --- remove item from list: ---
            goSections[giSectionSelected].forms[giFormSelected].formitems.splice(giFormItemSelected,1);
            $('#fs-FormItem-Details input').val(''); // empty all inputs
            $('#formItem-Type').val('string');      // set to a good default
            populateFormItemList(giFormSelected);   // show new list
        }
        function onClickFormItemUp(){
            if (giFormItemSelected > 0){
                // --- move in array: ---
                let newSelected = Number(giFormItemSelected)-1;
                goSections[giSectionSelected].forms[giFormSelected].formitems.move(giFormItemSelected,newSelected);
                // --- refresh select box: ---
                populateFormItemList();
                // --- set global: ---
                giFormItemSelected = newSelected;
                // --- highlight selection: ---
                $('#sel-FormItem').val(giFormItemSelected);
            }
        }
        function onClickFormItemDown(){
            if (giFormItemSelected < goSections[giSectionSelected].forms[giFormSelected].formitems.length - 1){
                // --- move in array: ---
                let newSelected = Number(giFormItemSelected)+1;
                goSections[giSectionSelected].forms[giFormSelected].formitems.move(giFormItemSelected,newSelected);
                // --- refresh select box: ---
                populateFormItemList();
                // --- set global: ---
                giFormItemSelected = newSelected;
                // --- highlight selection: ---
                $('#sel-FormItem').val(giFormItemSelected);
            }   
        }   
        function onClickFormItemSave(){
            let oFormItem = goSections[giSectionSelected].forms[giFormSelected].formitems[giFormItemSelected];

            // ------ common items: ------
            oFormItem.type = $('#formItem-Type').val();

            if ( $('#formItem-Value').length && ($('#formItem-Value').val() != "") ){
                oFormItem.value = $('#formItem-Value').val();
            }

            // ToDo: add "label" handling
            if(oFormItem.type.startsWith("label")){
                let formItemSelected = $('#sel-FormItem option:selected');
                formItemSelected.text(oFormItem.value);
            } else {
                if ( $('#formItem-Key').length && ($('#formItem-Key').val() != "") ){
                    oFormItem.key = $('#formItem-Key').val();
                    let formItemSelected = $('#sel-FormItem option:selected');
                    formItemSelected.text(oFormItem.key);
                }
            }

            if ( $('#formItem-Label').length && ($('#formItem-Label').val() != "") ){
                oFormItem.label = $('#formItem-Label').val();
            }
            if ( $('#formItem-islabel').is(':checked') )  oFormItem.islabel = "true";
            if ( $('#formItem-mandatory').is(':checked') )  oFormItem.mandatory = "yes";
            
            // ------ Type Specific: ------
            if ( $('#formItem-Url').length && ($('#formItem-Url').val() != "") ){
                oFormItem.url = $('#formItem-Url').val();
            }
            if ( $('#formItem-Size').length && ($('#formItem-Size').val() != "") ){
                oFormItem.size = $('#formItem-Size').val();
            }
            
            if ( $('#formItem-Items').length ){
                oFormItem.values.items = [];
                let lines = $('#formItem-Items').val().split('\n');
        //        let i = 0;
                $.each(lines, function(){
                    oFormItem.values.items.push(this);
        //            i++;
                });
            }
        }

        /* ------------------------------------------------------
        //  Misc:
        // ------------------------------------------------------
        */
        function SelectElement(id, valueToSelect){    
            let element = document.getElementById(id);
            element.value = valueToSelect;
        }
        Array.prototype.move = function(from, to) {
            this.splice(to, 0, this.splice(from, 1)[0]);
        };
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }
};

app.initialize();