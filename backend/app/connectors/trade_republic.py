import json
from typing import Dict, Any
from cryptography.fernet import Fernet
import base64, hashlib

def _derive_key(secret: str) -> bytes:
    return base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())

def encrypt_token(token: str, secret: str) -> str:
    return Fernet(_derive_key(secret)).encrypt(token.encode()).decode()

def decrypt_token(encrypted: str, secret: str) -> str:
    return Fernet(_derive_key(secret)).decrypt(encrypted.encode()).decode()


class TradeRepublicConnector:
    def __init__(self):
        self._client = None

    async def init_session(self, phone_number: str, pin: str) -> Dict[str, Any]:
        try:
            from pytr.api import TradeRepublicApi
            self._client = TradeRepublicApi(phone_no=phone_number, pin=pin)
            await self._client.inititate_device_reset()
            return {"status": "otp_required", "message": "Vérifiez vos notifications Trade Republic"}
        except ImportError:
            return {"status": "error", "message": "pip install pytr"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def confirm_otp(self, otp: str) -> Dict[str, Any]:
        if not self._client:
            return {"status": "error", "message": "Session non initialisée"}
        try:
            await self._client.complete_device_reset(otp)
            creds = {"phone": self._client.phone_no, "device_id": getattr(self._client, 'device_id', None), "device_token": getattr(self._client, 'device_token', None)}
            return {"status": "success", "credentials": json.dumps(creds)}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def fetch_portfolio(self, credentials_json: str) -> Dict[str, Any]:
        try:
            from pytr.api import TradeRepublicApi
            creds = json.loads(credentials_json)
            client = TradeRepublicApi(phone_no=creds["phone"], pin="")
            if creds.get("device_token"): client.device_token = creds["device_token"]
            if creds.get("device_id"): client.device_id = creds["device_id"]
            await client.login()
            return {"status": "success", "data": await client.get_portfolio()}
        except ImportError:
            return {"status": "error", "message": "pip install pytr"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

_sessions: Dict[int, 'TradeRepublicConnector'] = {}
def get_tr_connector(user_id: int) -> 'TradeRepublicConnector':
    if user_id not in _sessions: _sessions[user_id] = TradeRepublicConnector()
    return _sessions[user_id]
