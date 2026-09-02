"""Publisher domain model."""

from typing import Any, Dict
from pydantic import BaseModel, Field


class Publisher(BaseModel):
    """Represents a book publisher in the library management system.

    Attributes:
        id: Unique identifier for the publisher.
        name: Name of the publishing company or entity.
        address: Physical or mailing address of the publisher.
    """

    id: str = Field(..., description="Unique identifier for the publisher")
    name: str = Field(..., description="Name of the publishing company or entity")
    address: str = Field(..., description="Physical or mailing address of the publisher")

    def to_dict(self) -> Dict[str, Any]:
        """Converts the Publisher model instance to a dictionary.

        Returns:
            A dictionary representation containing id, name, and address.
        """
        if hasattr(self, "model_dump"):
            return self.model_dump()
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
        }

