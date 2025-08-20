#!/usr/bin/env python3
"""
Enhanced Real-Time WebSocket Server for AI Communication Analysis
Fixed version with better error handling and connection stability
"""

import asyncio
import websockets
import json
import base64
import cv2
import numpy as np
import logging
import time
import os
import threading
from typing import Dict, Set, Optional, List
import uuid
from simplified_realtime_analyzer import SimplifiedRealTimeAnalyzer as RealTimeAnalyzer
import openai
from dotenv import load_dotenv
from collections import deque
import traceback

# Load environment variables
load_dotenv('env.local')

# Configure logging with better formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('realtime_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EnhancedRealTimeServer:
    """Enhanced real-time WebSocket server with improved stability"""
    
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.client_sessions: Dict[str, dict] = {}
        self.running = False
        
        # Initialize OpenAI client with better error handling
        openai_api_key = "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"
        if openai_api_key and openai_api_key.startswith('sk-'):
            openai.api_key = openai_api_key
            self.openai_available = True
            logger.info("OpenAI API key found - GPT feedback enabled")
        else:
            self.openai_available = False
            logger.warning("OpenAI API key not found or invalid - GPT feedback disabled")
        
        # Initialize real-time analyzer with error handling
        try:
            self.analyzer = RealTimeAnalyzer(openai_api_key=openai_api_key)
            logger.info("Real-time analyzer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize real-time analyzer: {e}")
            logger.error(traceback.format_exc())
            self.analyzer = None
        
        # Session management
        self.active_sessions = {}
    
    async def start(self):
        """Start the enhanced WebSocket server"""
        self.running = True
        logger.info(f"Starting Enhanced Real-Time Analysis Server on {self.host}:{self.port}")
        
        async with websockets.serve(self.handle_client, self.host, self.port):
            logger.info("WebSocket server started successfully")
            
            # Keep server running
            while self.running:
                try:
                    await asyncio.sleep(1)
                except Exception as e:
                    logger.error(f"Error in main event loop: {str(e)}")
                    await asyncio.sleep(1)
    
    async def handle_client(self, websocket, path):
        """Enhanced client connection handler with better error handling"""
        client_id = str(uuid.uuid4())
        session_id = str(uuid.uuid4())
        
        try:
            # Add client to active connections
            self.clients.add(websocket)
            
            # Initialize client session
            self.client_sessions[client_id] = {
                'websocket': websocket,
                'session_id': session_id,
                'connected_at': time.time(),
                'last_activity': time.time(),
                'frames_processed': 0,
                'analysis_results': [],
                'status': 'connected'
            }
            
            # Initialize session in analyzer
            if self.analyzer:
                self.active_sessions[session_id] = {
                    'start_time': time.time(),
                    'client_id': client_id,
                    'status': 'active'
                }
            
            logger.info(f"Client {client_id} connected. Session: {session_id}")
            
            # Send welcome message
            welcome_message = {
                'type': 'connection_established',
                'client_id': client_id,
                'session_id': session_id,
                'server_status': 'ready',
                'analysis_interval': 1.0,
                'features': {
                    'posture_analysis': True,
                    'eye_contact_analysis': True,
                    'gesture_analysis': True,
                    'real_time_feedback': True,
                    'gpt_enhanced_feedback': self.openai_available
                }
            }
            await websocket.send(json.dumps(welcome_message))
            
            # Handle client messages
            async for message in websocket:
                try:
                    await self._handle_client_message(client_id, session_id, message)
                    self.client_sessions[client_id]['last_activity'] = time.time()
                except Exception as e:
                    logger.error(f"Error handling client message: {e}")
                    await self._send_error(websocket, f"Message processing error: {str(e)}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client {client_id} disconnected normally")
        except Exception as e:
            logger.error(f"Error handling client {client_id}: {e}")
            logger.error(traceback.format_exc())
        finally:
            # Cleanup client session
            await self._cleanup_client(client_id, session_id)
    
    async def _handle_client_message(self, client_id: str, session_id: str, message: str):
        """Enhanced client message handler with simplified processing"""
        try:
            data = json.loads(message)
            message_type = data.get('type', 'unknown')
            
            logger.info(f"Received message type: {message_type} from client {client_id}")
            
            if message_type == 'frame_data':
                await self._handle_frame_data(client_id, session_id, data)
            elif message_type == 'start_session':
                await self._handle_start_session(client_id, session_id, data)
            elif message_type == 'end_session':
                await self._handle_end_session(client_id, session_id, data)
            elif message_type == 'ping':
                await self._handle_ping(client_id, session_id, data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON from client {client_id}: {e}")
        except Exception as e:
            logger.error(f"Error processing message from client {client_id}: {e}")
            raise
    
    async def _handle_frame_data(self, client_id: str, session_id: str, data: dict):
        """Handle video frame data with enhanced processing"""
        try:
            # Decode base64 image data
            image_data = base64.b64decode(data.get('frame', ''))
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                logger.warning(f"Invalid frame data from client {client_id}")
                return
            
            # Perform analysis
            if self.analyzer:
                try:
                    result = await self.analyzer.analyze_frame(frame, session_id)
                    
                    if 'error' in result:
                        logger.error(f"Analysis error: {result['error']}")
                        return
                    
                    # Prepare response
                    response = {
                        'type': 'analysis_result',
                        'timestamp': result.get('timestamp', time.time()),
                        'scores': {
                            'overall': result.get('overall_score', 0.0),
                            'posture': result.get('posture_score', 0.0),
                            'eye_contact': result.get('eye_contact_score', 0.0),
                            'gestures': result.get('gesture_score', 0.0)
                        },
                        'feedback': result.get('feedback', []),
                        'confidence': result.get('confidence', 0.0),
                        'session_id': session_id
                    }
                    
                    # Send to client
                    await self._send_to_client(client_id, response)
                    
                    # Update client session
                    if client_id in self.client_sessions:
                        self.client_sessions[client_id]['frames_processed'] += 1
                        self.client_sessions[client_id]['analysis_results'].append(result)
                    
                except Exception as e:
                    logger.error(f"Error in frame analysis: {e}")
                    logger.error(traceback.format_exc())
            
        except Exception as e:
            logger.error(f"Error processing frame data: {e}")
    
    async def _handle_start_session(self, client_id: str, session_id: str, data: dict):
        """Handle session start request"""
        try:
            session_config = data.get('config', {})
            
            # Update session configuration
            if session_id in self.active_sessions:
                self.active_sessions[session_id].update({
                    'config': session_config,
                    'status': 'active'
                })
            
            # Send session confirmation
            response = {
                'type': 'session_started',
                'session_id': session_id,
                'status': 'active',
                'config': session_config
            }
            
            await self._send_to_client(client_id, response)
            logger.info(f"Session {session_id} started for client {client_id}")
            
        except Exception as e:
            logger.error(f"Error starting session: {e}")
    
    async def _handle_end_session(self, client_id: str, session_id: str, data: dict):
        """Handle session end request with comprehensive summary"""
        try:
            # Generate session summary
            summary = {}
            if self.analyzer and session_id in self.active_sessions:
                summary = self.analyzer.get_session_summary(session_id)
            
            # Send session summary
            response = {
                'type': 'session_ended',
                'session_id': session_id,
                'summary': summary,
                'status': 'completed'
            }
            
            await self._send_to_client(client_id, response)
            logger.info(f"Session {session_id} ended for client {client_id}")
            
        except Exception as e:
            logger.error(f"Error ending session: {e}")
    
    async def _handle_ping(self, client_id: str, session_id: str, data: dict):
        """Handle ping message for connection health check"""
        try:
            response = {
                'type': 'pong',
                'timestamp': time.time(),
                'server_status': 'healthy'
            }
            
            await self._send_to_client(client_id, response)
            
        except Exception as e:
            logger.error(f"Error handling ping: {e}")
    
    async def _send_to_client(self, client_id: str, message: dict):
        """Send message to specific client with error handling"""
        try:
            if client_id in self.client_sessions:
                websocket = self.client_sessions[client_id]['websocket']
                await websocket.send(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message to client {client_id}: {e}")
            # Mark client for cleanup
            self.client_sessions[client_id]['status'] = 'error'
    
    async def _send_error(self, websocket, error_message: str):
        """Send error message to client"""
        try:
            error_response = {
                'type': 'error',
                'message': error_message,
                'timestamp': time.time()
            }
            await websocket.send(json.dumps(error_response))
        except Exception as e:
            logger.error(f"Error sending error message: {e}")
    
    async def _cleanup_client(self, client_id: str, session_id: str):
        """Enhanced client cleanup with session summary"""
        try:
            # Generate final session summary
            if self.analyzer and session_id in self.active_sessions:
                summary = self.analyzer.get_session_summary(session_id)
                logger.info(f"Session {session_id} summary: {summary}")
            
            # Remove from active sessions
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            
            # Remove from client sessions
            if client_id in self.client_sessions:
                del self.client_sessions[client_id]
            
            logger.info(f"Client {client_id} cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during client cleanup: {e}")
    
    async def stop(self):
        """Stop the server gracefully"""
        self.running = False
        logger.info("Stopping Enhanced Real-Time Analysis Server")
        
        # Close all client connections
        for client_id in list(self.client_sessions.keys()):
            try:
                websocket = self.client_sessions[client_id]['websocket']
                await websocket.close()
            except Exception as e:
                logger.error(f"Error closing client {client_id}: {e}")
        
        logger.info("Server stopped successfully")

async def main():
    """Main function to run the enhanced real-time server"""
    server = EnhancedRealTimeServer()
    
    try:
        await server.start()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Server error: {e}")
        logger.error(traceback.format_exc())
    finally:
        await server.stop()

if __name__ == "__main__":
    asyncio.run(main()) 