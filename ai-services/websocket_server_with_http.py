#!/usr/bin/env python3
"""
WebSocket server with HTTP health check endpoint
Combines WebSocket server with simple HTTP server for CORS and health checks
"""

import asyncio
import json
import logging
import os
import uuid
from aiohttp import web, WSMsgType
from aiohttp.web import Response
import traceback

# Import the lightweight server components
from lightweight_realtime_server import LightweightRealTimeServer, LightweightAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the real-time server instance
realtime_server = LightweightRealTimeServer()

# WebSocket handler
async def websocket_handler(request):
    """Handle WebSocket connections"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    client_id = str(uuid.uuid4())
    logger.info(f"New WebSocket client connected: {client_id}")
    
    # Add to clients
    realtime_server.clients.add(ws)
    
    try:
        # Send welcome message
        await ws.send_json({
            'type': 'connected',
            'clientId': client_id,
            'message': 'WebSocket connection established'
        })
        
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    data = json.loads(msg.data)
                    await realtime_server.process_message(ws, client_id, msg.data)
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON from client {client_id}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
            elif msg.type == WSMsgType.ERROR:
                logger.error(f"WebSocket error: {ws.exception()}")
                
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
    finally:
        realtime_server.clients.discard(ws)
        await realtime_server.cleanup_client(client_id)
        logger.info(f"Client {client_id} disconnected")
    
    return ws

# HTTP health check endpoint
async def health_check(request):
    """HTTP health check endpoint"""
    return Response(
        text=json.dumps({
            'status': 'healthy',
            'service': 'WebSocket Real-Time Analysis Server',
            'clients': len(realtime_server.clients),
            'sessions': len(realtime_server.client_sessions)
        }),
        content_type='application/json',
        headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*'
        }
    )

# CORS preflight handler
async def options_handler(request):
    """Handle CORS preflight requests"""
    return Response(
        status=200,
        headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '3600'
        }
    )

async def init_app():
    """Initialize the aiohttp application"""
    app = web.Application()
    
    # Add routes
    app.router.add_get('/ws', websocket_handler)
    app.router.add_get('/api/health', health_check)
    app.router.add_get('/', health_check)
    app.router.add_options('/{path:.*}', options_handler)
    
    return app

async def start_background_tasks(app):
    """Start background analysis tasks"""
    async def process_analysis():
        while True:
            try:
                await realtime_server._process_analysis()
                await asyncio.sleep(3.0)  # Analyze every 3 seconds
            except Exception as e:
                logger.error(f"Error in analysis loop: {e}")
                await asyncio.sleep(1)
    
    # Start background task
    app['analysis_task'] = asyncio.create_task(process_analysis())

async def cleanup_background_tasks(app):
    """Cleanup background tasks"""
    if 'analysis_task' in app:
        app['analysis_task'].cancel()
        try:
            await app['analysis_task']
        except asyncio.CancelledError:
            pass

async def main():
    """Main function"""
    app = await init_app()
    
    # Setup background tasks
    app.on_startup.append(start_background_tasks)
    app.on_cleanup.append(cleanup_background_tasks)
    
    # Start server
    runner = web.AppRunner(app)
    await runner.setup()
    
    site = web.TCPSite(runner, 'localhost', 8765)
    await site.start()
    
    logger.info("🚀 WebSocket server with HTTP health check running on ws://localhost:8765")
    logger.info("📊 Health check available at http://localhost:8765/api/health")
    
    try:
        # Keep server running
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
    finally:
        await runner.cleanup()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped")
    except Exception as e:
        logger.error(f"Server error: {e}")
        traceback.print_exc()





