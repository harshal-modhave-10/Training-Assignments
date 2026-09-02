---
name: generate-model
description: Generates a new Pydantic domain model and corresponding unit tests for the library system.
---

# Generate Domain Model Skill

When creating a new domain model, follow this exact structure:

1. Create the model in `src/models/<model_name>.py`.
2. Model must inherit from `pydantic.BaseModel`.
3. Model fields must use standard Python types with field descriptions (`Field(..., description=...)`).
4. Include a `.to_dict()` instance method.
5. Create a test file `tests/test_<model_name>.py` testing model instantiation and invalid data validation.