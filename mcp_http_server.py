#!/usr/bin/env python3
"""
HTTP MCP Server for hackfate.us deployment
Wraps the hive MCP server in HTTP endpoints for Claude.ai integration
"""

import json
import asyncio
import aiohttp
from aiohttp import web
from typing import Dict, Any
import sys
import os

# Import the existing MCP server
sys.path.append('/home/acid')
from hive_mcp_server_main import HiveMCPServer

class HTTPMCPServer:
    def __init__(self):
        self.mcp_server = HiveMCPServer()
        
    async def handle_mcp_request(self, request):
        """Handle HTTP requests and convert to MCP format"""
        try:
            # Get JSON payload
            data = await request.json()
            
            # Convert to MCP request format
            mcp_request = {
                "jsonrpc": "2.0",
                "id": data.get("id", "http-request"),
                "method": data.get("method"),
                "params": data.get("params", {})
            }
            
            # Process through MCP server
            response = await self.mcp_server.handle_request(mcp_request)
            
            # Return JSON response
            return web.json_response(response)
            
        except Exception as e:
            error_response = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32603,
                    "message": f"Server error: {str(e)}"
                }
            }
            return web.json_response(error_response, status=500)
    
    async def handle_tools_list(self, request):
        """Handle tools list endpoint"""
        mcp_request = {
            "jsonrpc": "2.0",
            "id": "tools-list",
            "method": "tools/list",
            "params": {}
        }
        
        response = await self.mcp_server.handle_request(mcp_request)
        return web.json_response(response)
    
    async def handle_tool_call(self, request):
        """Handle tool call endpoint"""
        data = await request.json()
        
        mcp_request = {
            "jsonrpc": "2.0",
            "id": "tool-call",
            "method": "tools/call",
            "params": {
                "name": data.get("tool"),
                "arguments": data.get("arguments", {})
            }
        }
        
        response = await self.mcp_server.handle_request(mcp_request)
        return web.json_response(response)

    async def handle_status(self, request):
        """Health check endpoint"""
        return web.json_response({
            "status": "online",
            "server": "Hive MCP HTTP Bridge",
            "version": "1.0.0",
            "endpoints": {
                "/mcp": "Main MCP endpoint",
                "/tools": "List available tools", 
                "/call": "Call specific tool",
                "/status": "Health check"
            }
        })

def create_app():
    """Create the web application"""
    server = HTTPMCPServer()
    
    app = web.Application()
    
    # Add CORS middleware
    async def cors_middleware(request, handler):
        response = await handler(request)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    app.middlewares.append(cors_middleware)
    
    # Routes
    app.router.add_post('/mcp', server.handle_mcp_request)
    app.router.add_get('/tools', server.handle_tools_list)
    app.router.add_post('/call', server.handle_tool_call)
    app.router.add_get('/status', server.handle_status)
    app.router.add_get('/', server.handle_status)
    
    return app

if __name__ == '__main__':
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=8080)