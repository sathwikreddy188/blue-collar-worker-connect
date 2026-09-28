from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.worker import WorkerListItem


class SavedWorkerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    worker: WorkerListItem
    created_at: datetime
