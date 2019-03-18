# geopaparazzi-FormBuilder
A javascript/HTML based tool for creating geopaparazzi forms. 

![ScreenShot](https://github.com/GeoAnalytic-code/geopaparazzi-FormBuilder/raw/master/images/sample.jpg)

## What It Does
* read and write [Geopaparazzi tags files](https://geopaparazzi.github.io/geopaparazzi/#_using_form_based_notes) in JSON format (e.g. "tags.json")
* it does NOT require a web server; you can just load into your browser to run.
* read (and save) tags.json files from:
  - your local file system.
  - from a web server.
* since it is HTML and Javascript, it can run in any modern browser.
* runs on mobile devices too!
* it does assume you have an Internet connection as it relies on (and fetches) Bootstrap and jQuery.

## What it Doesn't Do
* it does not create, modify, or read from a database
* it does not contain any server-side scripting to generate the JSON from a database
* it does not deal with the Notes created from using the tags.json file with Geopaparazzi

## Using FormBuilder
### Stand-alone (without a web server)
  You can use FormBuilder with a web server.  Simply copy formbuilder.html, formbuilder.js, and formbuilder.css on to your computer or phone and open formbuilder.html with your browser.  You will need an Internet connection as FormBuilder requires (and automatically gets) the jquery and Bootstrap components.  Once the FormBuilder page has loaded, you will be able to load an existing tags.json file (using FormBuilder's File -> Open Local File menu option).  You can then edit and save the tags.json file.
  
### With a Web server
If you have the skills to set up a web server, you can make FormBuilder available from your server.  the user will then be able to load and save tags file to their local device.  If you edit the fomrbuilder.js and supply values for download and upload, your server can send and receive tags files from FormBuilder.  Edit the lines aroud 50 and 51 in formbuilder.js to supply the location of your download and upload scripts:
```JavaScript
        const gsServerUrlFileListSimple = "test/server/files_simple.json";
        const gsServerUrlSaveTagFileSimple = "test/server/upload.php";
```
To do the download, FormBuilder expects a list of tags files in JSON format.  The "url" is the URL of tha tags file on your server.  The "path" is the eventual location of the tags file on a Geopaparazzi Android device.  Currently only the file name portion is used to name the file when saving; the full path is not currently used.

An example of a list of tags files:
```JSON
{
    "results": [{
        "path": "/geopaparazzi/data/demo/bolzano/bolzano_field_survey_en.json",
        "url": "tags/bolzano/bolzano_field_survey_en.json"
    },
    {
        "path": "/Trails/waiparous/tags.json",
        "url": "tags/waiparous/tags.json"
    },
    {
        "path": "/Trails/trailguide/trailguide.json",
        "url": "tags/trailguide/TrailGuide.json"
    }]
}
```

