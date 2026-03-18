import boto3
import uuid
import os
from dotenv import load_dotenv

load_dotenv()
bucket_name = os.getenv("S3_BUCKET_NAME")

if not bucket_name:
    raise ValueError("S3_BUCKET_NAME environment variable is not set in .env")
s3= boto3.client("s3")

def upload_file(file_obj):
    file_key = f"{uuid.uuid4()}.jpg"

    s3.upload_fileobj(
        file_obj,
        bucket_name,
        file_key,
        ExtraArgs = {"ContentType":"image/jpeg"}
    )

    url = f"https://{bucket_name}.s3.amazonaws.com/{file_key}"
    return url

def generate_presigned_url(image_url, expiration=3600):
    try:
        # Extract the key from the image URL
        # URL format: https://bucket-name.s3.amazonaws.com/e755f1bc.jpg
        # Or: https://bucket-name.s3.us-east-1.amazonaws.com/e755f1bc.jpg
        file_key = image_url.split('/')[-1]
        
        response = s3.generate_presigned_url('get_object',
                                            Params={'Bucket': bucket_name,
                                                    'Key': file_key},
                                            ExpiresIn=expiration)
        return response
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return image_url # fallback to the original if it fails    