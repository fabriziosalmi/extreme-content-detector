"""
WebSocket server for real-time updates about AntiFa Model analysis.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import datetime
import os
from typing import List, Dict, Any
import time

# List of connected WebSocket clients
connected_clients = []

# Track analysis progress
current_analyses = {}

class AnalysisMonitor:
    """
    Monitors and broadcasts analysis status and results.
    """
    
    def __init__(self):
        self.logs_dir = "logs"
        self.last_check_time = time.time()
        self.processed_files = set()
        
    async def monitor_logs(self):
        """Continuously monitor log files for changes and broadcast updates."""
        while True:
            try:
                # Get all log files
                if not os.path.exists(self.logs_dir):
                    await asyncio.sleep(5)
                    continue
                    
                log_files = [f for f in os.listdir(self.logs_dir) 
                            if f.startswith("analysis_") and f.endswith(".json")]
                
                # Check for new files since last check
                current_time = time.time()
                new_files = []
                
                for filename in log_files:
                    file_path = os.path.join(self.logs_dir, filename)
                    file_mod_time = os.path.getmtime(file_path)
                    
                    # Check if file is new or modified since last check
                    if file_mod_time > self.last_check_time and filename not in self.processed_files:
                        new_files.append(file_path)
                        self.processed_files.add(filename)
                
                # Process new log files
                for file_path in new_files:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            log_data = json.load(f)
                            
                        # Prepare broadcast data
                        broadcast_data = {
                            "type": "new_analysis",
                            "timestamp": datetime.datetime.now().isoformat(),
                            "analysis_id": log_data.get("id"),
                            "input_type": log_data.get("input_type"),
                            "indicators_found": log_data.get("results", {}).get("total_indicators_found", 0),
                            "text_excerpt": log_data.get("text_excerpt", "")[:100] + "..." if log_data.get("text_excerpt") else "",
                        }
                        
                        if "url" in log_data:
                            broadcast_data["url"] = log_data["url"]
                            broadcast_data["domain"] = log_data.get("domain", "unknown")
                            
                        # Broadcast to all connected clients
                        await broadcast_message(broadcast_data)
                    except Exception as e:
                        print(f"Error processing log file {file_path}: {e}")
                
                # Update last check time
                self.last_check_time = current_time
                
                # Sleep for a short time before checking again
                await asyncio.sleep(2)
            except Exception as e:
                print(f"Error in monitor_logs: {e}")
                await asyncio.sleep(5)
    
    async def monitor_stats(self):
        """Periodically broadcast stats updates."""
        while True:
            try:
                # Only broadcast if we have clients
                if connected_clients:
                    stats_file = "logs/analysis_stats.json"
                    if os.path.exists(stats_file):
                        with open(stats_file, 'r', encoding='utf-8') as f:
                            stats_data = json.load(f)
                        
                        # Prepare simplified stats for broadcast
                        broadcast_data = {
                            "type": "stats_update",
                            "timestamp": datetime.datetime.now().isoformat(),
                            "total_analyses": stats_data.get("total_analyses", 0),
                            "total_indicators": sum(stats_data.get("indicators_found", {}).values()),
                            "indicators_today": stats_data.get("analysis_by_date", {})
                                               .get(datetime.datetime.now().strftime("%Y-%m-%d"), {})
                                               .get("indicators_found", 0)
                        }
                        
                        # Broadcast to all connected clients
                        await broadcast_message(broadcast_data)
                        
                # Sleep for a minute before checking again
                await asyncio.sleep(60)
            except Exception as e:
                print(f"Error in monitor_stats: {e}")
                await asyncio.sleep(60)

async def broadcast_message(message: Dict[str, Any]):
    """
    Broadcast a message to all connected WebSocket clients.
    
    Args:
        message: Message to broadcast
    """
    for client in connected_clients:
        try:
            await client.send_json(message)
        except Exception:
            # Client may have disconnected without proper cleanup
            pass

async def register_analysis(analysis_id: str, status: str = "started", progress: int = 0, details: Dict = None):
    """
    Register or update an analysis in progress.
    
    Args:
        analysis_id: Unique ID of the analysis
        status: Current status (started, processing, completed, error)
        progress: Progress percentage (0-100)
        details: Additional details about the current progress
    """
    current_analyses[analysis_id] = {
        "status": status,
        "progress": progress,
        "details": details or {},
        "updated_at": datetime.datetime.now().isoformat()
    }
    
    # Broadcast progress update
    await broadcast_message({
        "type": "analysis_progress",
        "analysis_id": analysis_id,
        "status": status,
        "progress": progress,
        "details": details or {}
    })
    
    # Clean up completed analyses after 1 hour
    now = datetime.datetime.now()
    to_remove = []
    
    for id, analysis in current_analyses.items():
        if analysis["status"] in ["completed", "error"]:
            updated_time = datetime.datetime.fromisoformat(analysis["updated_at"])
            if (now - updated_time).total_seconds() > 3600:  # 1 hour
                to_remove.append(id)
    
    for id in to_remove:
        del current_analyses[id]

def initialize_websocket_routes(app: FastAPI):
    """
    Initialize WebSocket routes for the given FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        connected_clients.append(websocket)
        
        try:
            # Send initial status message
            await websocket.send_json({
                "type": "connection_established",
                "timestamp": datetime.datetime.now().isoformat(),
                "message": "Connected to AntiFa Model WebSocket server",
                "active_analyses": len(current_analyses),
                "clients_connected": len(connected_clients)
            })
            
            # Listen for client messages
            while True:
                data = await websocket.receive_text()
                try:
                    message = json.loads(data)
                    
                    # Handle client messages (subscriptions, requests, etc.)
                    if message.get("type") == "request_analyses":
                        # Send current analyses status
                        await websocket.send_json({
                            "type": "analyses_status",
                            "analyses": current_analyses
                        })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Invalid message format: {str(e)}"
                    })
        except WebSocketDisconnect:
            # Client disconnected
            pass
        except Exception as e:
            print(f"WebSocket error: {e}")
        finally:
            # Remove client from connected list
            if websocket in connected_clients:
                connected_clients.remove(websocket)

# Start background tasks
async def start_background_tasks():
    """Start all background monitoring tasks."""
    monitor = AnalysisMonitor()
    await asyncio.gather(
        monitor.monitor_logs(),
        monitor.monitor_stats()
    )
