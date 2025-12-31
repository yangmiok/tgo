import httpx
from typing import Optional, List, Dict, Any
from app.config import settings
from app.core.logging import logger
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

class LLMProvider:
    _openai_client: Optional[AsyncOpenAI] = None
    _anthropic_client: Optional[AsyncAnthropic] = None

    @classmethod
    def _get_openai_client(cls) -> AsyncOpenAI:
        if cls._openai_client is None:
            cls._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return cls._openai_client

    @classmethod
    def _get_anthropic_client(cls) -> AsyncAnthropic:
        if cls._anthropic_client is None:
            cls._anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        return cls._anthropic_client

    @staticmethod
    async def chat_completion(
        provider: str,
        model: str,
        user_prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        api_key: Optional[str] = None
    ) -> str:
        logger.info(f"LLM Chat Completion: provider={provider} model={model}")
        
        try:
            if provider == "openai":
                client = LLMProvider._get_openai_client()
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": user_prompt})
                
                response = await client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content
            
            elif provider == "anthropic":
                client = LLMProvider._get_anthropic_client()
                response = await client.messages.create(
                    model=model,
                    system=system_prompt if system_prompt else "",
                    messages=[{"role": "user", "content": user_prompt}],
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return response.content[0].text
            
            else:
                logger.error(f"Unsupported LLM provider: {provider}")
                return f"[Error]: Unsupported provider {provider}"
                
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            raise

