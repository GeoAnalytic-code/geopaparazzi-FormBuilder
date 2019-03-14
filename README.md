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
### With a Web server

Set the URL for the list of tags files
Code some server-side scripting to return a JSON list of files:
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

