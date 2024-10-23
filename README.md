# imageapi

Note: This is still a working progress but mostly there. 

An API / web gui for docker that uses html as a template to render down to an image.

Can be used for Music Cover art generation / banners etc. 

1. Setup your environment variables in the .env file, and install using the docker-compose.yml, this creates two containers, the API and a web GUI.

2. create an html template in the gui or upload one via the API (i think that works).

3 in the template add any api  variables you wish to send to you template using  - {{my_api_var}}. 

    <div class="album-id">{{album_id}}</div>

then in the API you can send this variable - 

  https://api.myserver.com/api/make_image?{=&album_id=My Great Album&}

  or as JSON - 

      e.g. -
    
      { 
        "template_id": "2",
        "width": 1400,
        "height": 1400,
        "data":{"artist_name": "Bob",
                "track_title": "McBobface",
                "back_url": "null",
                "artworkcopy": "Image (c) courtesy of someone with a camera",
                "release_date": "produciton date",
                "font_col": "%23FFFFFF",
                "back_col": "%23FFFFFF",
                "track_col": "%23FFFFFF",
                "album_id": "34786259",
                "copyright":"Copyright (c) McBobface Music, . All rights reserved."
            }
        }


API auth

Header - X-API-Key: <api key in the .env file>

4. click download image button (if using the GUI) or the API should return the following JSON -

        {
            "status": "success",
            "file_url": "https://api.myserver.com/output/1f4c8db8-a604-4daa-bf2d-9548d35a1f78.png"
        }


Any questions (or improvements) get in touch. As i say, this is still a working progress :)



endpoints available  <server url>/docs



# Screenshot


![Uploading imageapi_screenshot.png…]()


