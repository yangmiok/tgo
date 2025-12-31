import httpx
from typing import Optional, List, Dict, Any
from app.config import settings

class MainSystemClient:
    def __init__(self):
        self.base_url = settings.MAIN_SYSTEM_URL
        self.headers = {
            "Authorization": f"Bearer {settings.MAIN_SYSTEM_API_KEY}"
        } if settings.MAIN_SYSTEM_API_KEY else {}

    async def get_agent(self, agent_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self.headers) as client:
            response = await client.get(f"/api/agents/{agent_id}")
            response.raise_for_status()
            return response.json()

    async def get_tool(self, tool_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self.headers) as client:
            response = await client.get(f"/api/tools/{tool_id}")
            response.raise_for_status()
            return response.json()

    async def execute_agent(self, agent_id: str, input_text: str) -> str:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self.headers) as client:
            response = await client.post(f"/api/agents/{agent_id}/chat", json={"message": input_text})
            response.raise_for_status()
            return response.json().get("response", "")

    async def execute_tool(self, tool_id: str, arguments: Dict[str, Any]) -> Any:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self.headers) as client:
            response = await client.post(f"/api/tools/{tool_id}/execute", json=arguments)
            response.raise_for_status()
            return response.json().get("result")

