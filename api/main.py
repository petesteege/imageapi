from fastapi import FastAPI, HTTPException, UploadFile, Request, File, Form
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Dict, Optional
import uuid
import os
import logging
from jinja2 import Environment, FileSystemLoader, select_autoescape
from starlette.middleware.cors import CORSMiddleware
import base64
from playwright.async_api import async_playwright
import asyncio
from fastapi.staticfiles import StaticFiles



# Define the directory for images
IMAGE_DIRECTORY = '/app/api/output'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI()


# CONST VALIDATIONS -----------------------------------------
def to_bool(value):
    return str(value).strip().lower() in ["true", "1", "yes"]


    
    
# CONSTANTS -------------------------------------------------
API_KEY  = os.getenv("API_KEY")
API_PORT = os.getenv("API_PORT","8000")
SERVER_NAME_API = os.getenv("SERVER_NAME_API","localhost")
IMAGE_PREFIX = os.getenv("FILE_PREFIX","")
PROTC = os.getenv("PROTOCOL", "https")
USE_PROXY = to_bool(os.getenv("USE_PROXY", False))


def server_url():
    if USE_PROXY:
        url = f"{PROTC}://{SERVER_NAME_API}"
        logger.info("[NET] Using proxy mask")
    else:
        url = f"{PROTC}://{SERVER_NAME_API}:{API_PORT}"
        logger.info("[NET] Using direct server address & port")

    return url

SERVER_URL = server_url()


# Dependency function for API key verification
async def verify_api_key(request: Request):
    api_key = request.headers.get("X-API-Key")
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid API key")





# Enable CORS if necessary
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to your PHP application's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up Jinja2 template environment
template_loader = FileSystemLoader('/app/api/templates')
jinja_env = Environment(
    loader=template_loader,
    autoescape=select_autoescape(['html', 'xml'])
)

# Ensure output directory exists
OUTPUT_DIR = 'api/output'
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Pydantic model for generating image from template content
class GenerateImageRequest(BaseModel):
    template_content: str
    width: int = 800
    height: int = 600
    delay: Optional[int] = 1000
    data: Dict[str, str]





# Helper function to render HTML to PNG using Playwright
async def render_html_to_png(html_content: str, width: int, height: int, delay: int) -> str:
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
            page = await browser.new_page()
            await page.set_viewport_size({"width": width, "height": height})
            await page.set_content(html_content)
            await asyncio.sleep(delay / 1000)  # Add delay to ensure all elements are loaded
            png_bytes = await page.screenshot(full_page=True)
            await browser.close()
            return base64.b64encode(png_bytes).decode('utf-8')
    except Exception as e:
        logger.error(f"Error in render_html_to_png: {str(e)}")
        raise

# Pydantic model for generating image using a saved template
class GenerateRequest(BaseModel):
    template_id: str
    width: Optional[int] = 800
    height: Optional[int] = 600
    delay: Optional[int] = 1000
    data: Dict[str, str]

# Endpoint to generate image using a saved template
@app.post("/api/generate_image")
async def generate_image(request: Request, payload: GenerateImageRequest):
    # Verify API key from headers
    await verify_api_key(request)
    
    template_content = payload.template_content
    data = payload.data
    width = payload.width
    height = payload.height
    delay = payload.delay

    logger.info(f"Received request to generate image with width: {width}, height: {height}, delay: {delay}")

    try:
        template = jinja_env.from_string(template_content)
        rendered_html = template.render(**data)
        logger.info("Template rendered successfully.")
    except Exception as e:
        logger.error(f"Template rendering error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Template rendering error: {str(e)}")

    try:
        image_data = await render_html_to_png(rendered_html, width, height, delay)
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")

    return {"image_data": image_data}

# Endpoint to generate image from template content
@app.post("/api/make_image")
async def make_image(request: Request, payload: GenerateRequest):
    # Verify API key from headers
    await verify_api_key(request)

    template_id = payload.template_id
    data = payload.data
    width = payload.width
    height = payload.height
    delay = payload.delay

    logger.info(f"Received request to generate image from template {template_id} with width: {width}, height: {height}, delay: {delay}")

    template_filename = f"{template_id}.html"
    template_path = os.path.join('/app/api/templates', template_filename)

    if not os.path.exists(template_path):
        logger.error("Template not found.")
        raise HTTPException(status_code=404, detail="Template not found")

    try:
        template = jinja_env.get_template(template_filename)
        rendered_html = template.render(**data)
        logger.info("Template rendered successfully.")
    except Exception as e:
        logger.error(f"Template rendering error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Template rendering error: {str(e)}")

    # Generate the filename
    artistname = data.get("artistname", "").replace(" ", "_")
    title = data.get("title", "").replace(" ", "_")
    file_prefix = IMAGE_PREFIX or ""

    if artistname and title:
        output_filename = f"{file_prefix}{artistname}-{title}.png"
    else:
        output_filename = f"{uuid.uuid4()}.png"

    output_filepath = os.path.join(OUTPUT_DIR, output_filename)

    try:
        await render_html_to_file(rendered_html, output_filepath, width, height, delay)
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")

    file_url = f"{SERVER_URL}/output/{output_filename}"
    return JSONResponse(content={
        "status": "success",
        "file_url": file_url
    })




# Helper function to render HTML to PNG file using Playwright
async def render_html_to_file(html_content: str, output_path: str, width: int, height: int, delay: int):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
            page = await browser.new_page()
            await page.set_viewport_size({"width": width, "height": height})
            await page.set_content(html_content)
            await asyncio.sleep(delay / 1000)  # Add delay to ensure all elements are loaded
            await page.screenshot(path=output_path, full_page=True)
            await browser.close()
    except Exception as e:
        logger.error(f"Error in render_html_to_file: {str(e)}")
        raise

# Endpoint to serve generated images
@app.get("/api/output/{image_filename}")
async def get_generated_image(image_filename: str):
    file_path = os.path.join(OUTPUT_DIR, image_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path, media_type='image/png')

# Endpoint to upload a new template
@app.post("/api/upload_template")
async def upload_template(template_id: str, file: UploadFile = File(...)):
    if not template_id:
        raise HTTPException(status_code=400, detail="Template ID is required")

    template_filename = f"{template_id}.html"
    template_path = os.path.join('/app/api/templates', template_filename)

    # Save the uploaded template file
    with open(template_path, 'wb') as f:
        content = await file.read()
        f.write(content)

    return {"status": "success", "message": "Template uploaded successfully"}


# Endpoint to retrieve available templates with creation date
@app.get("/api/templates")
def get_templates():
    from datetime import datetime
    
    templates_dir = '/app/api/templates'
    template_list = []
    
    for filename in os.listdir(templates_dir):
        if filename.endswith('.html'):
            template_path = os.path.join(templates_dir, filename)
            
            # Get file creation timestamp and format it
            creation_time = os.path.getctime(template_path)
            formatted_date = datetime.fromtimestamp(creation_time).strftime('%Y-%m-%d %H:%M:%S')
            
            template_list.append({
                "name": filename,
                "created_at_formatted": formatted_date
            })
    
    return {"templates": template_list}

# Optional: Endpoint to download a template
@app.get("/api/download_template/{template_id}")
async def download_template(template_id: str):
    template_filename = f"{template_id}.html"
    template_path = os.path.join('/app/api/templates', template_filename)
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    return FileResponse(template_path, media_type='text/html', filename=template_filename)


# delete template

@app.delete("/api/delete_template/{template_id}")
async def delete_template(request: Request, template_id: str):
    # Verify API key from headers
    await verify_api_key(request)
    
    template_filename = f"{template_id}.html"
    template_path = os.path.join('/app/api/templates', template_filename)
    
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    
    try:
        os.remove(template_path)
        logger.info(f"Template {template_id} deleted successfully.")
        return {"status": "success", "message": f"Template '{template_id}' deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting template: {str(e)}")

# delete images endpoints 


@app.get("/api/delete_image")
async def delete_image(file: str):
    # Construct the full path
    file_path = os.path.join(IMAGE_DIRECTORY, file)
    
    # Check if the file exists and delete it
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"status": "success", "message": f"{file} deleted successfully"}
    else:
        return {"status": "failure", "message": "File not found"}, 404
    
    
@app.get("/api/delete_all_images")
async def delete_all_images():
    # Check if the directory exists
    if not os.path.exists(IMAGE_DIRECTORY):
        return {"status": "failure", "message": "Directory not found"}, 404
    
    # Loop through each file in the directory and delete it
    deleted_files = []
    for filename in os.listdir(IMAGE_DIRECTORY):
        file_path = os.path.join(IMAGE_DIRECTORY, filename)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
                deleted_files.append(filename)
        except Exception as e:
            return {"status": "failure", "message": f"Error deleting {filename}: {str(e)}"}, 500
    
    return {"status": "success", "message": "All files deleted successfully", "deleted_files": deleted_files}



# Optional: Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Image Generation API!"}



# Save Template Endpoint
@app.post("/api/save_template")
async def save_template(template_name: str = Form(...), template_content: str = Form(...)):
    logger.info(f"Received request to save template: {template_name}")

    # Validate input
    if not template_name:
        logger.error("template_name is missing or empty.")
        raise HTTPException(status_code=400, detail="template_name is missing or empty.")
    if not template_content:
        logger.error("template_content is missing or empty.")
        raise HTTPException(status_code=400, detail="template_content is missing or empty.")

    # Ensure the directory exists
    template_path = os.path.join('/app/api/templates', template_name)
    os.makedirs(os.path.dirname(template_path), exist_ok=True)

    # Try saving the template
    try:
        with open(template_path, 'w') as file:
            file.write(template_content)
        logger.info(f"Template '{template_name}' saved successfully.")
        return {"status": "success", "message": f"Template '{template_name}' saved successfully."}
    except Exception as e:
        error_message = f"Error saving template '{template_name}': {e}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)


@app.get("/api/list_images")
async def list_images():
    # Check if the directory exists
    if not os.path.exists(IMAGE_DIRECTORY):
        raise HTTPException(status_code=404, detail="Image directory not found")
    
    images = []
    for filename in os.listdir(IMAGE_DIRECTORY):
        file_path = os.path.join(IMAGE_DIRECTORY, filename)
        if os.path.isfile(file_path):
            # Determine the URL based on the USE_PROXY variable

            # Get file details
            file_info = {
                "filename": filename,
                "url": SERVER_URL,  # Expose file URL based on proxy settings
                "size": os.path.getsize(file_path),  # File size in bytes
                "created_at": os.path.getctime(file_path),  # Creation time
                # Add other details if needed
            }
            images.append(file_info)

    # Return JSON response
    return JSONResponse(content={"images": images})


# Flask or FastAPI backend, for example
@app.get("/api/config")
async def get_config():
    return {
        "server_name": os.getenv("SERVER_NAME"),
        "api_key": os.getenv("API_KEY")
    }




if os.path.exists(IMAGE_DIRECTORY):
    app.mount("/output", StaticFiles(directory=IMAGE_DIRECTORY), name="output")