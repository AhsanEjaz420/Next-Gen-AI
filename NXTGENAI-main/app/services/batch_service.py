import pandas as pd
import io
import json
import asyncio
from typing import List, Dict, Any
from app.schemas.paid.product_description import ProductDescriptionRequest
from app.schemas.caption import CaptionRequest
from app.services.paid.product_description_service import generate_product_description
from app.services.caption_service import generate_captions
from app.services.subscription_service import SubscriptionService
from app.services.history_service import HistoryService
from app.services.profile_service import ProfileService

class BatchService:
    @staticmethod
    async def process_product_description_csv(file_content: bytes, user, db):
        # 1. Read CSV
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            raise Exception(f"Failed to parse CSV: {str(e)}")
        
        # 2. Validate columns
        required_cols = ['product_name', 'product_category', 'key_features', 'target_audience', 'tone']
        for col in required_cols:
            if col not in df.columns:
                raise Exception(f"Missing required column: {col}")
        
        results = []
        profile = await ProfileService.get_profile(db, user.id)
        
        # Limit batch size to 20 for safety
        if len(df) > 20:
             raise Exception("Batch size exceeds limit (max 20 rows).")

        for _, row in df.iterrows():
            try:
                # Prepare request object
                key_features = [f.strip() for f in str(row['key_features']).split(',')] if pd.notna(row['key_features']) else []
                seo_keywords = [k.strip() for k in str(row['seo_keywords']).split(',')] if 'seo_keywords' in df.columns and pd.notna(row['seo_keywords']) else None
                
                req_data = ProductDescriptionRequest(
                    product_name=str(row['product_name']),
                    product_category=str(row['product_category']),
                    key_features=key_features,
                    target_audience=str(row['target_audience']),
                    tone=str(row['tone']),
                    brand_name=str(row['brand_name']) if 'brand_name' in df.columns and pd.notna(row['brand_name']) else None,
                    price_range=str(row['price_range']) if 'price_range' in df.columns and pd.notna(row['price_range']) else None,
                    seo_keywords=seo_keywords
                )
                
                async with SubscriptionService.credit_session(db, user, amount=2):
                    result = await generate_product_description(req_data, profile)
                    
                    await HistoryService.save_history(
                        db=db,
                        user_id=user.id,
                        tool_name="product_description",
                        input_data=req_data.dict(),
                        output_content=json.dumps(result)
                    )
                    
                    results.append({
                        "status": "success",
                        "identifier": req_data.product_name,
                        "data": result
                    })
            except Exception as e:
                results.append({
                    "status": "error",
                    "identifier": str(row.get('product_name', 'Unknown')),
                    "error": str(e)
                })
        
        return results

    @staticmethod
    async def process_caption_csv(file_content: bytes, user, db):
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            raise Exception(f"Failed to parse CSV: {str(e)}")
        
        required_cols = ['topic', 'platform', 'tone']
        for col in required_cols:
            if col not in df.columns:
                raise Exception(f"Missing required column: {col}")
        
        results = []
        profile = await ProfileService.get_profile(db, user.id)
        
        if len(df) > 20:
             raise Exception("Batch size exceeds limit (max 20 rows).")

        for _, row in df.iterrows():
            try:
                req_data = CaptionRequest(
                    topic=str(row['topic']),
                    platform=str(row['platform']),
                    tone=str(row['tone']),
                    keywords=str(row['keywords']) if 'keywords' in df.columns and pd.notna(row['keywords']) else None
                )
                
                async with SubscriptionService.credit_session(db, user, amount=1):
                    result = await generate_captions(req_data, profile)
                    
                    await HistoryService.save_history(
                        db=db,
                        user_id=user.id,
                        tool_name="caption",
                        input_data=req_data.dict(),
                        output_content=result
                    )
                    
                    results.append({
                        "status": "success",
                        "identifier": req_data.topic,
                        "data": result
                    })
            except Exception as e:
                results.append({
                    "status": "error",
                    "identifier": str(row.get('topic', 'Unknown')),
                    "error": str(e)
                })
        
        return results
