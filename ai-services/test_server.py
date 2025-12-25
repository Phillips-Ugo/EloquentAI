import asyncio
import websockets
import logging
import sys

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

async def echo(websocket):
    async for message in websocket:
        await websocket.send(message)

async def main():
    logger.info("Starting test server on 8765...")
    try:
        async with websockets.serve(echo, "localhost", 8765):
            logger.info("Test server running. Press Ctrl+C to stop.")
            await asyncio.Future()  # run forever
    except Exception as e:
        logger.error(f"Failed to start: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
