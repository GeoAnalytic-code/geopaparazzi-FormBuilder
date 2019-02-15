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

gsFileName = null;
goFiles = null;
goSections = [];
giSectionSelected = null;
giFormSelected = null;
giFormItemSelected = null;

window.onload = clearAll();

/* ------------------------------------------------------
//  Check Browser Compatibility
// ------------------------------------------------------
  https://www.html5rocks.com/en/tutorials/file/dndfiles/
  Check for the various File API support.
*/
switch(window.location.protocol) {
   case 'http:':
   case 'https:':
//   alert("Server!");
     //remote file over http or https
     break;
   case 'file:':
     //local file
//   alert("File!");
     break;
   default: 
     //some other protocol
}
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
//  alert('The File APIs are not fully supported in this browser.');
  alert('This browser does not support reading and saving files to your local file system.');
};

if( window.FormData === undefined ) {
    alert('This browser does not support saving files to a server.');
}
/* ------------------------------------------------------
//  File Handling:
// ------------------------------------------------------
//https://www.html5rocks.com/en/tutorials/file/dndfiles/
*/
// ------ Open: ------
function openFile(evt) {
    clearAll();  // clear all the forms on the page
    
    var files = evt.target.files; // FileList object
    // Loop through the FileList (we only use one)
    for (var i = 0, f; f = files[i]; i++) {
        $('#sel-File').append(
            $('<option/>', {
                value: f.name,
                text : f.name
        }));
        gsFileName = f.name;
        
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
             goSections = JSON.parse(e.target.result);
//           console.log(goSections);
             populateSectionList(goSections);
            };
        })(f);
        // Read in the file
        reader.readAsText(f);
    }
}
document.getElementById('fileOpen').addEventListener('change', openFile, false);
// ------ Save: ------
// https://stackoverflow.com/questions/16329293/save-json-string-to-client-pc-using-html5-api#16330385
function saveJSON() {
    var sSections = JSON.stringify(goSections);
    var blSections = new Blob([sSections], {type: "application/json"});
    var uSections = URL.createObjectURL(blSections);
    saveFile(gsFileName,uSections);
}
function saveFile(filename, url) {
    document.getElementById('fileSave').download = filename;
    document.getElementById('fileSave').href = url;
}
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

function saveToServer(){
    var sSections = JSON.stringify(goSections);
    var blSections = new Blob([sSections], {type: "application/json"});
    var fileOfBlob = new File([blSections], gsFileName);

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
			alert(response);		// todo: parse returned json
		}
	});
}
function loadListFromServer(){
// https://geo.trailstewards.com/tags/?format=json
    $.getJSON( gsServerUrlFileList, function( data ) {
        goFiles = data;
        $('#sel-File').empty();
        populateFileList(goFiles);
        $('#fs-File-List').prop('disabled',false );
    });

}
function populateFileList(files){
    var length = files.count;  // count is a json member
    $('#sel-File').append(
        $('<option/>', {
            value: "",
            text : "Select a tags file:"
    }));
	
    for (var i = 0; i < length; i++) {
        $('#sel-File').append(
            $('<option/>', {
                value: files.results[i].url,
                text : files.results[i].path
        }));
    }
}
function onSelectFile(url){
        clearSection();
		gsFileName = url.split("/").pop();
        if (url != ""){
            $.getJSON( url, function( data ) {
                 goSections = data;
    //           console.log(goSections);
                 populateSectionList(goSections);
            });
        }
}
/* ------------------------------------------------------
//  Section Handling:
// ------------------------------------------------------
*/
function populateSectionList(){
    $('#fs-Section-List').prop('disabled',false );
    $('#sel-Section').empty();
    for (i = 0; i < goSections.length; i++) {
        $('#sel-Section').append(
            $('<option/>', {
                value: i,
                text : goSections[i].sectionname
        }));
    };
}
function onSelectSection(selected){
    giSectionSelected = selected;          // set the global value
    populateSectionDetails(selected);      // show the details of the selected item
    $('#fs-Section-Details').prop('disabled',false );  //enable the details for editing
    clearForm();                           // erase any existing forms listed
    populateFormList(selected);            // show the forms for this section
    clearFormItem();                       // clear the form items (until the user selects a form)
}
function populateSectionDetails(selected){
    $('#section-Name').val(goSections[selected].sectionname);
    $('#section-Description').val(goSections[selected].sectiondescription);
}
function onClickSectionNew(){
    var formsArray = [];
    var section = {sectionname:"new", sectiondescription: "new", forms:formsArray };
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
        var newSelected = Number(giSectionSelected)-1;
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
        var newSelected = Number(giSectionSelected)+1;
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
function populateFormList(selectedSection){  // To Do: remove parameter?
    $('#fs-Form-List').prop('disabled',false );
    $('#sel-Form').empty();
    for (i = 0; i < goSections[selectedSection].forms.length; i++) {
        $('#sel-Form').append(
            $('<option/>', {
                value: i,
                text : goSections[selectedSection].forms[i].formname
        }));    
    };
}
function onSelectForm(selected){
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
    var formItemsArray = [];
    var form = {formname:"new", formitems:formItemsArray };
    goSections[giSectionSelected].forms.push(form);
    populateFormList(giSectionSelected);
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
        var newSelected = Number(giFormSelected)-1;
        goSections[giSectionSelected].forms.move(giFormSelected,newSelected);
        // --- refresh select box: ---
        populateFormList(giSectionSelected);
        // --- set global: ---
        giFormSelected = newSelected;
        // --- highlight selection: ---
        $('#sel-Form').val(giFormSelected);
    }
}
function onClickFormDown(){
    if (giFormSelected < goSections[giSectionSelected].forms.length - 1){
        // --- move in array: ---
        var newSelected = Number(giFormSelected)+1;
        goSections[giSectionSelected].forms.move(giFormSelected,newSelected);
        // --- refresh select box: ---
        populateFormList(giSectionSelected);
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
function populateFormItemList(selectedForm){
    $('#fs-FormItem-List').prop('disabled',false );
    $('#sel-FormItem').empty();
    for (i = 0; i < goSections[giSectionSelected].forms[giFormSelected].formitems.length; i++) {
        sType = goSections[giSectionSelected].forms[giFormSelected].formitems[i].type.substring(0,5);
        if ( sType === "label"){
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
function onSelectFormItem(selected){
    giFormItemSelected = selected;
    $('#fs-FormItem-Details').prop('disabled',false );
    populateFormItemDetails(selected);
}
function populateFormItemDetails(selected){
    var oFormItem = goSections[giSectionSelected].forms[giFormSelected].formitems[selected];

    // ------ common elements: ------
    $('#formItem-Label').val(oFormItem.label);
    $('#formItem-Value').val(oFormItem.value);
    
    $('#formItem-islabel').prop('checked',oFormItem.islabel==="true" );
    $('#formItem-mandatory').prop('checked',oFormItem.mandatory==="yes");   
    
    SelectElement("formItem-Type",oFormItem.type);  // does this hilite?
    populateUniqueFormItemDetails(oFormItem.type)
}

function onSelectFormItemType(selected){
    populateUniqueFormItemDetails(selected)
}
function populateUniqueFormItemDetails(selected){
    var oFormItem = goSections[giSectionSelected].forms[giFormSelected].formitems[giFormItemSelected];
    // ------ type-specific elements: ------
    deleteUniqueFormItems();
    if(oFormItem.type.substring(0,5)==="label"){
//      $('#formItem-Key').val(oFormItem.value);  // a [form] label has no key (since no input)

        $("<div class='col-4'><label for='Name'>URL:</label></div>").appendTo($('#uniqueFormItems_labels_1'));
        $("<div class='col-4'><input type='text' class='form-control' id='formItem-Url'></div>").appendTo($('#uniqueFormItems_inputs_1'));
        $('#formItem-Url').val(oFormItem.url);
        
        $("<div class='col  '><label for='Name'>Size:</label></div>").appendTo($('#uniqueFormItems_labels_1'));
        $("<div class='col-4'><input type='text' class='form-control' id='formItem-Size'></div>").appendTo($('#uniqueFormItems_inputs_1'));
        $('#formItem-Size').val(oFormItem.size);
        
    } else {
        $('#formItem-Key').val(oFormItem.key);
		
        // under construction: stringcombo, multistringcombo, autocompletestringcombo
		// ToDo:  connectedstringcombo, onetomanystringcombo, autocompleteconnectedstringcombo
        if(oFormItem.type.endsWith('combo')){   
            $("<div class='col-4'><label for='Name'>Choices (you can cut-and-paste!):</label></div>").appendTo($('#uniqueFormItems_labels_1'));
            $("<div class='col-4'><textarea rows='6' class='form-control' id='formItem-Items'></textarea></div>").appendTo($('#uniqueFormItems_inputs_1'));
            var items = $('#formItem-Items');
            for (i = 0; i < oFormItem.values.items.length; i++) {
                items.val( items.val() + oFormItem.values.items[i].item);
                if (i!=oFormItem.values.items.length-1) {
                    items.val( items.val() + "\n");
                }
            }
			if(oFormItem.type.substring(0,9)==="connected"){
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
    var formItem = {key:"new", type:"string", value:"new"};
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
        var newSelected = Number(giFormItemSelected)-1;
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
        var newSelected = Number(giFormItemSelected)+1;
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
    var oFormItem = goSections[giSectionSelected].forms[giFormSelected].formitems[giFormItemSelected];

    // ------ common items: ------
    oFormItem.type = $('#formItem-Type').val();
    if ( $('#formItem-Key').length && ($('#formItem-Key').val() != "") ){
        oFormItem.key = $('#formItem-Key').val();
		var formItemSelected = $('#sel-FormItem option:selected');
		formItemSelected.text(oFormItem.key);
    }
    if ( $('#formItem-Label').length && ($('#formItem-Label').val() != "") ){
        oFormItem.label = $('#formItem-Label').val();
    }
    if ( $('#formItem-Value').length && ($('#formItem-Value').val() != "") ){
        oFormItem.value = $('#formItem-Value').val();
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
        var lines = $('#formItem-Items').val().split('\n');
//        var i = 0;
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
    var element = document.getElementById(id);
    element.value = valueToSelect;
}
Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
/*
$('#btn-SectionNew').on('click', function (e) {
     alert("New!");
})
*/
